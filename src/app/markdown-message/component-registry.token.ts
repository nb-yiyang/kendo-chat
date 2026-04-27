import { InjectionToken, type Provider, type Type } from '@angular/core';

export type MarkdownComponentRegistry = ReadonlyMap<string, Type<unknown>>;

export const MARKDOWN_COMPONENT_REGISTRY = new InjectionToken<MarkdownComponentRegistry>(
  'MARKDOWN_COMPONENT_REGISTRY',
);

export function provideMarkdownComponents(
  components: Record<string, Type<unknown>>,
): Provider {
  return {
    provide: MARKDOWN_COMPONENT_REGISTRY,
    useValue: new Map(Object.entries(components)) as MarkdownComponentRegistry,
  };
}
