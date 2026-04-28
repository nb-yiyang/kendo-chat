import type { MarkdownMessage } from '../markdown-message';

export const MOCK_FEATURE_Y_EXTRA_MESSAGE: MarkdownMessage = {
  content:
    'New assignment: {55555555-5555-5555-5555-555555555555}',
  metadata: {
    '55555555-5555-5555-5555-555555555555': {
      type: 'TaskCardComponent',
      inputs: {
        taskId: 'Y-005',
        title: 'Review Q2 budget proposal',
        dueDate: '2026-05-07',
        assignee: 'finance@example.com',
      },
    },
  },
};

export const MOCK_FEATURE_Y_MESSAGES: MarkdownMessage[] = [
  {
    content:
      "**Today's tasks**\n\n" +
      '- {11111111-1111-1111-1111-111111111111}\n' +
      '- {22222222-2222-2222-2222-222222222222}\n' +
      '- {33333333-3333-3333-3333-333333333333}\n',
    metadata: {
      '11111111-1111-1111-1111-111111111111': {
        type: 'TaskCardComponent',
        inputs: {
          taskId: 'Y-001',
          title: 'Approve PO #4421',
          dueDate: '2026-04-30',
          assignee: 'finance@example.com',
        },
      },
      '22222222-2222-2222-2222-222222222222': {
        type: 'TaskCardComponent',
        inputs: {
          taskId: 'Y-002',
          title: 'Review onboarding deck',
          dueDate: '2026-05-01',
          assignee: 'pm@example.com',
        },
      },
      '33333333-3333-3333-3333-333333333333': {
        type: 'TaskCardComponent',
        inputs: {
          taskId: 'Y-003',
          title: 'Sign vendor MSA',
          dueDate: '2026-05-03',
          assignee: 'legal@example.com',
        },
      },
    },
  },
  {
    content: 'Reminder: {44444444-4444-4444-4444-444444444444}',
    metadata: {
      '44444444-4444-4444-4444-444444444444': {
        type: 'TaskCardComponent',
        inputs: {
          taskId: 'Y-004',
          title: 'Submit Q1 expense report',
          dueDate: '2026-05-02',
          assignee: 'you@example.com',
        },
      },
    },
  },
];
