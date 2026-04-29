// ┌─────────────────────────────────────────────────────────────────────┐
// │  @Input() message                                                   │
// │  ├─ content   : raw markdown with {guid} tokens                     │
// │  └─ metadata  : guid → { type: string, inputs: Record<string,any> } │
// └───────────────────────┬─────────────────────────────────────────────┘
//                         │
//                         ▼
// ┌─────────────────────────────────────────────────────────────────────┐
// │  renderMarkdown(content)                                            │
// │  marked + custom inline extension:                                  │
// │    {guid}  →  <span class="cmp-host cmp-id-{guid}"></span>          │
// │  everything else → standard HTML (p, ul, h1 …)                     │
// └───────────────────────┬─────────────────────────────────────────────┘
//                         │ sanitized HTML string
//                         ▼
// ┌─────────────────────────────────────────────────────────────────────┐
// │  [innerHTML] bound to host <div>                                    │
// │  DOM now contains real HTML + empty <span> placeholders             │
// └───────────────────────┬─────────────────────────────────────────────┘
//                         │ afterNextRender
//                         ▼
// ┌─────────────────────────────────────────────────────────────────────┐
// │  mountComponents()                                                  │
// │  for each .cmp-host span:                                           │
// │    guid ← cmp-id-* class                                            │
// │    meta ← metadata[guid]          (type + inputs)                   │
// │    cls  ← components[meta.type]   (@Input() component map)          │
// │    ref  ← createComponent(cls)                                      │
// │    setInput(key, value) for each key in meta.inputs  ≡ [key]="val"  │
// │    span.replaceWith(ref.location.nativeElement)                     │
// └───────────────────────┬─────────────────────────────────────────────┘
//                         │ subscribe to every EventEmitter on instance
//                         ▼
// ┌─────────────────────────────────────────────────────────────────────┐
// │  @Output() componentEvent                                           │
// │  emits: { guid, componentType, outputName, outputData }             │
// │    guid          → which instance fired                             │
// │    componentType → component class name (e.g. "TaskCardComponent") │
// │    outputName    → @Output() prop name  (e.g. "taskIdClicked")     │
// │    outputData    → emitted value                                    │
// └─────────────────────────────────────────────────────────────────────┘

import {
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  type EffectRef,
  type Type,
  OnDestroy,
  Output,
  SecurityContext,
  SimpleChanges,
  ViewChild,
  afterNextRender,
  createComponent,
  effect,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { Subscription } from 'rxjs';
import { renderMarkdown, splitAtPartial } from './markdown-renderer';
import type { ComponentEvent, Guid, LiveMarkdownMessage } from './types';

@Component({
  selector: 'app-message-renderer',
  standalone: true,
  template: `<div #host class="md" [innerHTML]="safeHtml"></div>`,
  styles: [
    `
      :host {
        display: block;
      }
      .md {
        line-height: 1.5;
        color: #0f172a;
      }
      .md > :first-child {
        margin-top: 0;
      }
      .md > :last-child {
        margin-bottom: 0;
      }
      .md h1,
      .md h2,
      .md h3,
      .md h4 {
        margin: 12px 0 6px;
        line-height: 1.25;
      }
      .md h1 {
        font-size: 1.4em;
      }
      .md h2 {
        font-size: 1.25em;
      }
      .md h3 {
        font-size: 1.1em;
      }
      .md p {
        margin: 6px 0;
      }
      .md ul,
      .md ol {
        padding-left: 1.4em;
        margin: 6px 0;
      }
      .md li {
        margin: 2px 0;
      }
      .md blockquote {
        border-left: 3px solid #cbd5e1;
        margin: 8px 0;
        padding: 2px 12px;
        color: #475569;
        background: #f8fafc;
      }
      .md code:not(pre code) {
        background: #f1f5f9;
        padding: 1px 4px;
        border-radius: 3px;
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-size: 0.9em;
      }
      .md .cmp-host {
        display: contents;
      }
      .cmp-mask {
        display: inline-block;
        vertical-align: middle;
        width: 72px;
        height: 0.875em;
        border-radius: 999px;
        background: #e2e8f0;
        animation: cmp-pulse 1s ease-in-out infinite;
      }
      @keyframes cmp-pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageRendererComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) message!: LiveMarkdownMessage;
  @Output() componentEvent = new EventEmitter<ComponentEvent>();

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLElement>;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);
  private readonly appRef = inject(ApplicationRef);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) components!: Record<string, Type<unknown>>;

  protected safeHtml: string | null = null;
  private mounted: ComponentRef<unknown>[] = [];
  private subs: Subscription[] = [];
  private lastStableContent: string | null = null;
  private maskEl: HTMLSpanElement | null = null;
  private liveContentEffect: EffectRef | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['message']) return;

    // Tear down any previous liveContent watcher.
    this.liveContentEffect?.destroy();
    this.liveContentEffect = null;

    if (this.message.liveContent) {
      // Typing mode: watch the signal directly so the messages array (and Kendo's
      // rendering) stays untouched on each tick — the component is never recreated.
      this.liveContentEffect = effect(() => this.handleContentChange(this.message.liveContent!()), {
        injector: this.injector,
      });
    } else {
      // Static mode: render once from the stable content string.
      this.handleContentChange(this.message.content);
    }
  }

  ngOnDestroy(): void {
    this.destroyMounted();
    this.removeMask();
    this.liveContentEffect?.destroy();
  }

  private handleContentChange(content: string): void {
    const { stable, hasPartial } = splitAtPartial(content);

    if (stable === this.lastStableContent) {
      // Only the trailing partial guid changed — skip re-render, just toggle the mask.
      if (hasPartial) this.showMask();
      else this.removeMask();
    } else {
      // Stable content changed — full re-render and remount.
      this.lastStableContent = stable;
      this.destroyMounted();
      this.removeMask();
      const html = renderMarkdown(stable);
      this.safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, html);
      this.cdr.markForCheck();
      afterNextRender(
        () => {
          this.mountComponents();
          if (hasPartial) this.showMask();
        },
        { injector: this.injector },
      );
    }
  }

  private showMask(): void {
    if (this.maskEl?.isConnected) return;
    const host = this.hostRef?.nativeElement;
    if (!host) return;
    if (!this.maskEl) {
      this.maskEl = document.createElement('span');
      this.maskEl.className = 'cmp-mask';
    }
    (host.lastElementChild ?? host).appendChild(this.maskEl);
  }

  private removeMask(): void {
    this.maskEl?.remove();
    this.maskEl = null;
  }

  private mountComponents(): void {
    const host = this.hostRef?.nativeElement;
    if (!host) return;

    // Find every placeholder span injected by the markdown renderer.
    // Each span has class "cmp-host cmp-id-<guid>".
    const placeholders = host.querySelectorAll<HTMLElement>('.cmp-host');
    for (const ph of Array.from(placeholders)) {
      // Recover the guid from the "cmp-id-*" class so we can look up metadata.
      const idClass = Array.from(ph.classList).find((c) => c.startsWith('cmp-id-'));
      if (!idClass) continue;
      const guid = idClass.slice('cmp-id-'.length) as Guid;

      // metadata[guid] carries the component type name and its input values.
      const meta = this.message.metadata[guid];
      if (!meta) {
        ph.textContent = `[missing metadata: ${guid}]`;
        continue;
      }

      // Resolve the Angular component class from the registry provided via
      // provideMarkdownComponents(). Unknown types render an inline error.
      const cmpClass = this.components[meta.type];
      if (!cmpClass) {
        ph.textContent = `[unknown component: ${meta.type}]`;
        continue;
      }

      // Dynamically create the component outside any template.
      // environmentInjector gives it access to app-level providers (router, http, etc.).
      const ref = createComponent(cmpClass, {
        environmentInjector: this.envInjector,
      });

      // Set each declared @Input() — equivalent to writing [key]="value" in a template.
      for (const [key, value] of Object.entries(meta.inputs)) {
        ref.setInput(key, value);
      }

      // Subscribe to every EventEmitter on the instance.
      // Re-emit each event upward as a single unified ComponentEvent output:
      //   guid          — identifies the placeholder instance in the markdown (which card/widget fired)
      //   componentType — the component class name, e.g. "TaskCardComponent"
      //   outputName    — the @Output() property name on the component, e.g. "taskIdClicked"
      //   outputData    — whatever value the EventEmitter emitted, e.g. a taskId string or a TaskPayload object
      for (const propName of Object.keys(ref.instance as object)) {
        const prop = (ref.instance as Record<string, unknown>)[propName];
        if (prop instanceof EventEmitter) {
          const sub = (prop as EventEmitter<unknown>).subscribe((outputData) =>
            this.componentEvent.emit({
              guid,
              componentType: meta.type,
              outputName: propName,
              outputData,
            }),
          );
          this.subs.push(sub);
        }
      }

      // Swap the empty placeholder span with the component's real DOM node.
      ph.replaceWith(ref.location.nativeElement);
      // attachView registers the component with Angular's change detection tree.
      this.appRef.attachView(ref.hostView);
      this.mounted.push(ref);
    }
  }

  private destroyMounted(): void {
    for (const sub of this.subs) sub.unsubscribe();
    this.subs = [];
    for (const ref of this.mounted) ref.destroy();
    this.mounted = [];
  }
}
