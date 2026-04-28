export type Guid = `${string}-${string}-${string}-${string}-${string}`;

export type ComponentMetadata = {
  type: string;
  inputs: Record<string, unknown>;
};

export type MarkdownMessage = {
  content: string;
  metadata: Record<Guid, ComponentMetadata>;
};

// Internal to this folder — not re-exported from index.ts.
// Used by the typing service (producer) and renderer (consumer) only.
import type { Signal } from '@angular/core';
export type LiveMarkdownMessage = MarkdownMessage & { liveContent?: Signal<string> };

/**
 * Emitted by `MessageRendererComponent` whenever a dynamically mounted component fires an output.
 * Use `componentType` + `outputName` to route the event, and `guid` to identify the specific instance.
 */
export type ComponentEvent = {
  /** The GUID of the placeholder in the markdown — identifies which instance fired. */
  guid: Guid;
  /** The component class name, e.g. `"TaskCardComponent"`. */
  componentType: string;
  /** The `@Output()` property name on the component, e.g. `"taskIdClicked"`. */
  outputName: string;
  /** The value emitted by the `EventEmitter`, e.g. a task ID string or a full task object. */
  outputData: unknown;
};
