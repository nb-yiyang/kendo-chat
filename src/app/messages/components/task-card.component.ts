import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-task-card',
  standalone: true,
  template: `
    <span class="tc">
      <span class="tc__id">{{ taskId }}</span>
      <span class="tc__title">{{ title }}</span>
      <span class="tc__meta">due {{ dueDate }} · {{ assignee }}</span>
    </span>
  `,
  styles: [`
    :host { display: inline-block; vertical-align: middle; cursor: pointer; }
    :host(:hover) .tc { background: #e0e7ff; border-color: #a5b4fc; }
    .tc { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border: 1px solid #c7d2fe; border-radius: 999px; background: #eef2ff; font-size: 12px; color: #1e293b; transition: background 120ms, border-color 120ms; }
    .tc__id { font-family: ui-monospace, SFMono-Regular, monospace; font-weight: 700; color: #4338ca; }
    .tc__title { font-weight: 600; }
    .tc__meta { color: #64748b; font-size: 11px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  @Input() taskId = '';
  @Input() title = '';
  @Input() dueDate = '';
  @Input() assignee = '';

  @Output() taskClicked = new EventEmitter<string>();

  @HostListener('click') onClick(): void {
    this.taskClicked.emit(this.taskId);
  }
}
