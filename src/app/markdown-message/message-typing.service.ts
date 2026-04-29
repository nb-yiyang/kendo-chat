// Simulated typing flow
//
//  caller: enqueue(messages, message)  — fullContent read from message._md.content
//         │
//         ├─ 1. append message once to the array with liveContent = signal('')
//         │      └─ Kendo renders the new message row (once, never again during typing)
//         │
//         ├─ 2. setInterval every 30 ms
//         │      │
//         │      └─ liveContent.set(fullContent.slice(0, ++charIndex))
//         │             └─ renderer's effect() fires → updates only the mask / partial HTML
//         │                 (messages array is untouched → Kendo does NOT re-render)
//         │
//         └─ 3. when charIndex === fullContent.length  (or flush() is called early)
//                └─ finalize(): messages.update() — swap in full stable content,
//                               drop liveContent from _md
//                                   └─ renderer's ngOnChanges fires → final render + mount

import { Injectable, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import type { LiveMarkdownMessage } from './types';

type WithMd = { _md: LiveMarkdownMessage };

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
    intervalMs = 30,
  ): void {
    this.flush();

    const fullContent = message._md.content;

    // Embed a liveContent signal in _md so the renderer reacts to each character
    // without the messages array changing — prevents Kendo from recreating the component.
    // Clear content so the full text isn't flashed before the animation starts.
    const liveContent = signal('');
    messages.update(current => [...current, {
      ...message,
      _md: { ...message._md, content: '', liveContent },
    } as T]);

    let charIndex = 0;

    const finalize = () => {
      // Swap in the full stable content and drop liveContent so the renderer
      // does a final clean render with all components mounted.
      messages.update(current => {
        const copy = [...current];
        const last = copy[copy.length - 1];
        const { liveContent: _, ...md } = last._md;
        copy[copy.length - 1] = { ...last, _md: { ...md, content: fullContent } };
        return copy;
      });
    };

    this.pendingFlush = finalize;

    this.interval = setInterval(() => {
      charIndex++;
      liveContent.set(fullContent.slice(0, charIndex));
      if (charIndex >= fullContent.length) {
        clearInterval(this.interval!);
        this.interval = null;
        this.pendingFlush = null;
        finalize();
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
