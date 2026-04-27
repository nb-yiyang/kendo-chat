import type { MarkdownMessage } from '../markdown-message';

export const featureXMessages: MarkdownMessage[] = [
  // 1. Plain markdown, no components
  {
    content:
      '# Welcome\n\nHere is a quick **introduction** to your dashboard. ' +
      'Use the sidebar to navigate between sections.',
    metadata: {},
  },

  // 2. Single chart embedded in markdown
  {
    content:
      '## Q3 Revenue\n\nRevenue grew steadily across all regions:\n\n' +
      '{b7ea5a1c-a0fe-42b8-943c-0461687e106d}\n\n' +
      '> Source: internal finance report.',
    metadata: {
      'b7ea5a1c-a0fe-42b8-943c-0461687e106d': {
        type: 'RevenueChartComponent',
        inputs: {
          chartType: 'line',
          data: [
            { month: 'Jul', value: 120_000 },
            { month: 'Aug', value: 145_000 },
            { month: 'Sep', value: 162_500 },
          ],
          showLegend: true,
        },
      },
    },
  },

  // 3. Multiple components interleaved (code block + product card)
  {
    content:
      "Here's the snippet you asked for:\n\n" +
      '{2f1d4e9a-3b77-4c2d-9e0a-1c5f6a8b2d11}\n\n' +
      'And the product it configures:\n\n' +
      '{c4a9b3e2-7d18-4f5b-8a23-9e6f0d1c2b34}\n\n' +
      'Let me know if you want me to tweak either one.',
    metadata: {
      '2f1d4e9a-3b77-4c2d-9e0a-1c5f6a8b2d11': {
        type: 'CodeBlockComponent',
        inputs: {
          language: 'typescript',
          code: 'const greet = (name: string) => `Hello, ${name}!`;',
          showLineNumbers: true,
        },
      },
      'c4a9b3e2-7d18-4f5b-8a23-9e6f0d1c2b34': {
        type: 'ProductCardComponent',
        inputs: {
          productId: 'SKU-1042',
          title: 'Wireless Headphones',
          price: 199.99,
          currency: 'USD',
          imageUrl: 'https://example.com/img/headphones.jpg',
        },
      },
    },
  },

  // 4. List with an inline component per item
  {
    content:
      '### Action items\n\n' +
      '- Review the budget: {a1111111-2222-3333-4444-555555555555}Trailing text.\n' +
      '- Approve the design: {b2222222-3333-4444-5555-666666666666}Trailing text.\n',
    metadata: {
      'a1111111-2222-3333-4444-555555555555': {
        type: 'TaskCardComponent',
        inputs: {
          taskId: 'T-001',
          title: 'Review Q4 budget',
          dueDate: '2026-05-10',
          assignee: 'yi@example.com',
        },
      },
      'b2222222-3333-4444-5555-666666666666': {
        type: 'TaskCardComponent',
        inputs: {
          taskId: 'T-002',
          title: 'Approve homepage design',
          dueDate: '2026-05-12',
          assignee: 'a@example.com',
        },
      },
    },
  },
];
