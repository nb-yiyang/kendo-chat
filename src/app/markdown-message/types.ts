export type Guid = `${string}-${string}-${string}-${string}-${string}`;

export interface ComponentMetadata {
  type: string;
  inputs: Record<string, unknown>;
}

export interface MarkdownMessage {
  content: string;
  metadata: Record<Guid, ComponentMetadata>;
}

export interface ComponentEvent {
  guid: Guid;
  type: string;
  name: string;
  payload: unknown;
}
