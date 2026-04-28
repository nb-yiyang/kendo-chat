import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

type TaskPayload = { taskId: string; title: string; dueDate: string; assignee: string };

@Component({
  selector: 'app-task-card',
  standalone: true,
  template: `
    <span class="tc">
      <span class="tc__id"    (click)="onIdClick($event)">{{ taskId }}</span>
      <span class="tc__title">{{ title }}</span>
      <span class="tc__meta">due {{ dueDate }} · <span class="tc__assignee" (click)="onAssigneeClick($event)">{{ assignee }}</span></span>
    </span>
  `,
  styles: [`
    :host { display: inline-block; vertical-align: middle; cursor: pointer; }
    :host(:hover) .tc { background: #e0e7ff; border-color: #a5b4fc; }
    .tc { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border: 1px solid #c7d2fe; border-radius: 999px; background: #eef2ff; font-size: 12px; color: #1e293b; transition: background 120ms, border-color 120ms; }
    .tc__id { font-family: ui-monospace, SFMono-Regular, monospace; font-weight: 700; color: #4338ca; text-decoration: underline dotted; }
    .tc__title { font-weight: 600; }
    .tc__meta { color: #64748b; font-size: 11px; }
    .tc__assignee { text-decoration: underline dotted; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  @Input() taskId = '';
  @Input() title = '';
  @Input() dueDate = '';
  @Input() assignee = '';

  @Output() taskIdClicked   = new EventEmitter<string>();
  @Output() assigneeClicked = new EventEmitter<string>();
  @Output() taskClicked     = new EventEmitter<TaskPayload>();

  @HostListener('click') onClick(): void {
    this.taskClicked.emit({ taskId: this.taskId, title: this.title, dueDate: this.dueDate, assignee: this.assignee });
  }

  onIdClick(e: MouseEvent): void {
    e.stopPropagation();
    this.taskIdClicked.emit(this.taskId);
  }

  onAssigneeClick(e: MouseEvent): void {
    e.stopPropagation();
    this.assigneeClicked.emit(this.assignee);
  }
}
