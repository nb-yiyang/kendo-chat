export type Guid = `${string}-${string}-${string}-${string}-${string}`;

export type ComponentMetadata = {
  type: string;
  inputs: Record<string, unknown>;
};

export type MarkdownMessage = {
  content: string;
  metadata: Record<Guid, ComponentMetadata>;
};

export type ComponentEvent = {
  guid: Guid;
  type: string;
  name: string;
  payload: unknown;
};
