import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChatModule, type Message, type User } from '@progress/kendo-angular-conversational-ui';
import {
  MessageRendererComponent,
  type ComponentEvent,
  type MarkdownMessage,
} from '../markdown-message';
import { CodeBlockComponent } from '../messages/components/code-block.component';
import { ProductCardComponent } from '../messages/components/product-card.component';
import { RevenueChartComponent } from '../messages/components/revenue-chart.component';
import { TaskCardComponent } from '../messages/components/task-card.component';
import { MOCK_FEATURE_X_MESSAGES } from './feature-x.messages';

type ChatMessage = Message & { _md: MarkdownMessage };

@Component({
  selector: 'app-feature-x',
  standalone: true,
  imports: [ChatModule, MessageRendererComponent],
  template: `
    <section class="feature">
      <header class="feature__head">
        <h2>Feature X — full toolkit</h2>
        <p class="feature__hint">Registry: chart · code-block · product-card · task-card</p>
      </header>
      <kendo-chat
        messageWidthMode="full"
        [messages]="messages"
        [authorId]="user.id"
        [height]="640"
        [width]="'100%'"
      >
        <ng-template kendoChatMessageTemplate let-message>
          <app-message-renderer
            [message]="message._md"
            [components]="components"
            (componentEvent)="onComponentEvent($event)"
          />
        </ng-template>
      </kendo-chat>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
      .feature {
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: 100%;
      }
      .feature__head h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      .feature__hint {
        margin: 2px 0 0;
        font-size: 12px;
        color: #64748b;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureXComponent {
  protected readonly components = { RevenueChartComponent, CodeBlockComponent, ProductCardComponent, TaskCardComponent };

  protected readonly user: User = { id: 1, name: 'You' };
  protected readonly bot: User = { id: 2, name: 'X-Assistant' };

  protected readonly messages: ChatMessage[] = MOCK_FEATURE_X_MESSAGES.map((m, i) => ({
    id: `x-${i}`,
    author: this.bot,
    text: m.content,
    timestamp: new Date(Date.now() - (MOCK_FEATURE_X_MESSAGES.length - i) * 60_000),
    _md: m,
  }));

  protected onComponentEvent(e: ComponentEvent): void {
    console.log('[FeatureX]', e);
  }
}
