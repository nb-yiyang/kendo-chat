import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SecurityContext,
  SimpleChanges,
  ViewChild,
  afterNextRender,
  createComponent,
  inject,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { Subscription } from 'rxjs';
import { MARKDOWN_COMPONENT_REGISTRY } from './component-registry.token';
import { renderMarkdown } from './markdown-renderer';
import type { ComponentEvent, Guid, MarkdownMessage } from './types';

@Component({
  selector: 'app-message-renderer',
  standalone: true,
  template: `<div #host class="md" [innerHTML]="safeHtml"></div>`,
  styles: [`
    :host { display: block; }
    .md { line-height: 1.5; color: #0f172a; }
    .md > :first-child { margin-top: 0; }
    .md > :last-child { margin-bottom: 0; }
    .md h1, .md h2, .md h3, .md h4 { margin: 12px 0 6px; line-height: 1.25; }
    .md h1 { font-size: 1.4em; }
    .md h2 { font-size: 1.25em; }
    .md h3 { font-size: 1.1em; }
    .md p { margin: 6px 0; }
    .md ul, .md ol { padding-left: 1.4em; margin: 6px 0; }
    .md li { margin: 2px 0; }
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
    .md .cmp-host { display: contents; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageRendererComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) message!: MarkdownMessage;
  @Output() componentEvent = new EventEmitter<ComponentEvent>();

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLElement>;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);
  private readonly appRef = inject(ApplicationRef);
  private readonly registry = inject(MARKDOWN_COMPONENT_REGISTRY);

  protected safeHtml: string | null = null;
  private mounted: ComponentRef<unknown>[] = [];
  private subs: Subscription[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['message']) return;
    this.destroyMounted();
    const html = renderMarkdown(this.message.content);
    this.safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, html);
    afterNextRender(() => this.mountComponents(), { injector: this.injector });
  }

  ngOnDestroy(): void {
    this.destroyMounted();
  }

  private mountComponents(): void {
    const host = this.hostRef?.nativeElement;
    if (!host) return;
    const placeholders = host.querySelectorAll<HTMLElement>('.cmp-host');
    for (const ph of Array.from(placeholders)) {
      const idClass = Array.from(ph.classList).find((c) => c.startsWith('cmp-id-'));
      if (!idClass) continue;
      const guid = idClass.slice('cmp-id-'.length) as Guid;
      const meta = this.message.metadata[guid];
      if (!meta) {
        ph.textContent = `[missing metadata: ${guid}]`;
        continue;
      }
      const cmpClass = this.registry.get(meta.type);
      if (!cmpClass) {
        ph.textContent = `[unknown component: ${meta.type}]`;
        continue;
      }
      const ref = createComponent(cmpClass, {
        environmentInjector: this.envInjector,
      });
      for (const [key, value] of Object.entries(meta.inputs)) {
        ref.setInput(key, value);
      }
      for (const propName of Object.keys(ref.instance as object)) {
        const prop = (ref.instance as Record<string, unknown>)[propName];
        if (prop instanceof EventEmitter) {
          const sub = (prop as EventEmitter<unknown>).subscribe((payload) =>
            this.componentEvent.emit({ guid, type: meta.type, name: propName, payload }),
          );
          this.subs.push(sub);
        }
      }
      ph.replaceWith(ref.location.nativeElement);
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
