import { Marked } from 'marked';

const GUID_BODY = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
const PLACEHOLDER_GLOBAL = new RegExp(`\\{${GUID_BODY}\\}`);
const PLACEHOLDER_ANCHOR = new RegExp(`^\\{(${GUID_BODY})\\}`);
// Matches an incomplete {guid token at the end of the string (streaming in progress).
const PARTIAL_PLACEHOLDER = /\{[0-9a-fA-F-]*$/;

interface PlaceholderToken {
  type: 'componentPlaceholder';
  raw: string;
  guid: string;
}

const marked = new Marked({
  gfm: true,
  breaks: false,
});

marked.use({
  extensions: [
    {
      name: 'componentPlaceholder',
      level: 'inline',
      start(src: string) {
        const m = PLACEHOLDER_GLOBAL.exec(src);
        return m ? m.index : undefined;
      },
      tokenizer(src: string): PlaceholderToken | undefined {
        const m = PLACEHOLDER_ANCHOR.exec(src);
        if (!m) return undefined;
        return { type: 'componentPlaceholder', raw: m[0], guid: m[1] };
      },
      renderer(token) {
        const t = token as PlaceholderToken;
        return `<span class="cmp-host cmp-id-${t.guid}"></span>`;
      },
    },
  ],
});

export function splitAtPartial(content: string): { stable: string; hasPartial: boolean } {
  const stable = content.replace(PARTIAL_PLACEHOLDER, '');
  return { stable, hasPartial: stable.length !== content.length };
}

export function renderMarkdown(content: string): string {
  return marked.parse(content) as string;
}
