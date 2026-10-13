import { createSSEParser, safeChatUrl } from './ChatbotService';
jest.mock('./UserService', () => ({ getStoredAccessToken: () => '' }));
test('buffers incomplete events and CRLF boundaries', () => {
  const events = [];
  const parse = createSSEParser((event, data) => events.push([event, data]));
  parse('event: delta\r\ndata: {"text":"áo ');
  expect(events).toHaveLength(0);
  parse('đen"}\r\n\r\nevent: done\ndata: {"status":"OK"}\n\n');
  expect(events).toEqual([['delta', { text: 'áo đen' }], ['done', { status: 'OK' }]]);
});
test('never allows executable link schemes', () => {
  expect(safeChatUrl('javascript:alert(1)')).toBe('');
  expect(safeChatUrl('data:text/html,<script>')).toBe('');
  expect(safeChatUrl('/product-details/123')).toContain('/product-details/123');
});
