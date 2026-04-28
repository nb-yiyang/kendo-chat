import { Injectable } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import type { MarkdownMessage } from './types';

type WithMd = { _md: MarkdownMessage };

@Injectable({ providedIn: 'root' })
export class MessageTypingService {
  private interval: ReturnType<typeof setInterval> | null = null;
  private pendingFlush: (() => void) | null = null;

  private flush(): void {
    if (this.interval === null) return;
    clearInterval(this.interval);
    this.interval = null;
    this.pendingFlush?.();
    this.pendingFlush = null;
  }

  enqueue<T extends WithMd>(
    messages: WritableSignal<T[]>,
    message: T,
    fullContent: string,
    intervalMs = 30,
  ): void {
    this.flush();

    messages.update(current => [...current, message]);

    let charIndex = 0;

    this.pendingFlush = () => {
      messages.update(current => {
        const copy = [...current];
        const last = copy[copy.length - 1];
        copy[copy.length - 1] = { ...last, _md: { ...last._md, content: fullContent } };
        return copy;
      });
    };

    this.interval = setInterval(() => {
      charIndex++;
      messages.update(current => {
        const copy = [...current];
        const last = copy[copy.length - 1];
        copy[copy.length - 1] = {
          ...last,
          _md: { ...last._md, content: fullContent.slice(0, charIndex) },
        };
        return copy;
      });
      if (charIndex >= fullContent.length) {
        clearInterval(this.interval!);
        this.interval = null;
        this.pendingFlush = null;
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.pendingFlush = null;
  }
}
