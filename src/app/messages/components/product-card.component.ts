import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  template: `
    <div class="pc">
      <div class="pc__thumb" aria-hidden="true">🎧</div>
      <div class="pc__body">
        <div class="pc__title">{{ title }}</div>
        <div class="pc__sku">{{ productId }}</div>
        <div class="pc__price">{{ price.toFixed(2) }} {{ currency }}</div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; margin: 8px 0; }
    .pc { display: flex; gap: 12px; align-items: center; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #ffffff; max-width: 360px; }
    .pc__thumb { width: 48px; height: 48px; display: grid; place-items: center; font-size: 28px; background: #f1f5f9; border-radius: 6px; }
    .pc__title { font-weight: 600; color: #0f172a; }
    .pc__sku { font-size: 11px; color: #64748b; font-family: ui-monospace, SFMono-Regular, monospace; }
    .pc__price { font-size: 13px; color: #0369a1; font-weight: 600; margin-top: 2px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() productId = '';
  @Input() title = '';
  @Input() price = 0;
  @Input() currency = 'USD';
  @Input() imageUrl = '';
}
