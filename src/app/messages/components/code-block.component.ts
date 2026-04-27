import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-code-block',
  standalone: true,
  template: `
    <figure class="cb">
      <figcaption class="cb__head">
        <span class="cb__lang">{{ language }}</span>
        @if (showLineNumbers) {
          <span class="cb__hint">· line numbers</span>
        }
      </figcaption>
      <pre class="cb__pre"><code>{{ code }}</code></pre>
    </figure>
  `,
  styles: [`
    :host { display: block; margin: 8px 0; }
    .cb { margin: 0; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #0f172a; color: #e2e8f0; }
    .cb__head { padding: 6px 12px; background: #1e293b; font-size: 12px; color: #94a3b8; }
    .cb__lang { font-weight: 600; color: #cbd5e1; }
    .cb__hint { margin-left: 6px; }
    .cb__pre { margin: 0; padding: 12px; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 13px; white-space: pre; overflow-x: auto; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlockComponent {
  @Input() language = 'plaintext';
  @Input() code = '';
  @Input() showLineNumbers = false;
}
