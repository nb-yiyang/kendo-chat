import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ChatModule, type Message, type User } from '@progress/kendo-angular-conversational-ui';
import {
  MessageRendererComponent,
  MessageTypingService,
  type ComponentEvent,
  type MarkdownMessage,
} from '../markdown-message';
import { TaskCardComponent } from '../messages/components/task-card.component';
import { MOCK_FEATURE_Y_MESSAGES, MOCK_FEATURE_Y_EXTRA_MESSAGE } from './feature-y.messages';

type ChatMessage = Message & { _md: MarkdownMessage };

@Component({
  selector: 'app-feature-y',
  standalone: true,
  imports: [ChatModule, MessageRendererComponent],
  template: `
    <section class="feature">
      <header class="feature__head">
        <h2>Feature Y — tasks only</h2>
        <p class="feature__hint">Registry: task-card</p>
      </header>
      <kendo-chat
        messageWidthMode="full"
        [messages]="messages()"
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
      <button class="feature__load-btn" (click)="loadNextMessage()">
        Simulate server push
      </button>
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
      .feature__load-btn {
        padding: 4px 12px;
        font-size: 12px;
        cursor: pointer;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureYComponent {
  protected readonly components = { TaskCardComponent };

  protected readonly user: User = { id: 1, name: 'You' };
  protected readonly bot: User = { id: 2, name: 'Y-Assistant' };

  protected readonly messages = signal<ChatMessage[]>(
    MOCK_FEATURE_Y_MESSAGES.map((m, i) => ({
      id: `y-${i}`,
      author: this.bot,
      text: m.content,
      timestamp: new Date(Date.now() - (MOCK_FEATURE_Y_MESSAGES.length - i) * 60_000),
      _md: m,
    }))
  );

  private readonly typing = inject(MessageTypingService);

  protected loadNextMessage(): void {
    const { content, metadata } = MOCK_FEATURE_Y_EXTRA_MESSAGE;
    const current = this.messages();
    this.typing.enqueue(
      this.messages,
      {
        id: `y-${current.length}`,
        author: this.bot,
        text: content,
        timestamp: new Date(),
        _md: { content: '', metadata },
      },
      content,
    );
  }

  protected onComponentEvent(e: ComponentEvent): void {
    console.log('[FeatureY]', e);
  }
}
