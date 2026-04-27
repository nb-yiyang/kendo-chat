import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

interface DataPoint {
  month: string;
  value: number;
}

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  template: `
    <div class="rc">
      <div class="rc__head">
        <span class="rc__icon">📈</span>
        <strong>{{ chartType }} chart</strong>
        @if (showLegend) {
          <span class="rc__legend">· legend on</span>
        }
      </div>
      <ul class="rc__rows">
        @for (pt of data; track pt.month) {
          <li>
            <span class="rc__month">{{ pt.month }}</span>
            <span class="rc__value">{{ pt.value.toLocaleString() }}</span>
          </li>
        }
      </ul>
    </div>
  `,
  styles: [`
    :host { display: block; margin: 8px 0; }
    .rc { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; background: #f8fafc; }
    .rc__head { font-size: 14px; margin-bottom: 8px; color: #0f172a; }
    .rc__icon { margin-right: 4px; }
    .rc__legend { color: #64748b; margin-left: 6px; font-size: 12px; }
    .rc__rows { list-style: none; padding: 0; margin: 0; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; }
    .rc__rows li { display: flex; justify-content: space-between; padding: 2px 0; }
    .rc__month { color: #475569; }
    .rc__value { color: #0f172a; font-weight: 600; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenueChartComponent {
  @Input() chartType = 'line';
  @Input() data: DataPoint[] = [];
  @Input() showLegend = false;
}
