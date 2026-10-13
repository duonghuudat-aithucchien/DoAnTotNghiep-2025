import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ChatbotWidget from './ChatbotWidget';
import { streamChat, chatRequest } from '../../service/ChatbotService';

let mockUser = {};
jest.mock('react-redux', () => ({ useSelector: () => mockUser }));
jest.mock('../../service/ChatbotService', () => ({
  streamChat: jest.fn(), chatRequest: jest.fn(), safeChatUrl: (value) => value || '',
  newChatId: () => 'test-unique-message-id',
}));

let container, root;
beforeEach(async () => {
  mockUser = {};
  localStorage.clear();
  streamChat.mockReset(); chatRequest.mockReset();
  chatRequest.mockResolvedValue({ data: [] });
  global.IS_REACT_ACT_ENVIRONMENT = true;
  Element.prototype.scrollIntoView = jest.fn();
  Object.defineProperty(window, 'crypto', { configurable: true, value: { randomUUID: () => 'test-unique-message-id' } });
  container = document.createElement('div'); document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<ChatbotWidget />));
  await act(async () => container.querySelector('.fashion-chat-launcher').click());
});
afterEach(async () => { await act(async () => root?.unmount()); container?.remove(); });

test('renders streamed cards and stores only conversation ID', async () => {
  streamChat.mockImplementation(async (payload, user, signal, emit) => {
    emit('meta', { conversation_id: 'conversation-1' });
    emit('delta', { text: 'Đang tìm mẫu phù hợp.' });
    emit('done', { message_id: 'message-1', response: 'Mẫu phù hợp ở bên dưới.', products: [{ id: 'p1', name: 'Áo sơ mi', salePrice: 300000, price: 400000, sizes: ['L'], colors: ['đen'], countInStock: 2, link: '/product-details/p1' }], filters: { size: 'L' }, sources: [], suggestions: [] });
  });
  await act(async () => container.querySelector('.fashion-chat-suggestions button').click());
  expect(container.textContent).toContain('Mẫu phù hợp ở bên dưới.');
  expect(container.querySelector('.fashion-chat-product').textContent).toContain('Áo sơ mi');
  expect(container.querySelector('input').disabled).toBe(false);
  expect(localStorage.getItem('fashionChatConversation:guest')).toBe('conversation-1');
  expect(localStorage.getItem('chatbotMessages_guest')).toBeNull();
});

test('stop cancels stream and offers retry', async () => {
  streamChat.mockImplementation((payload, user, signal) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')));
  }));
  await act(async () => container.querySelector('.fashion-chat-suggestions button').click());
  expect(container.querySelector('input').disabled).toBe(true);
  await act(async () => container.querySelector('form button').click());
  expect(container.textContent).toContain('Đã dừng trả lời');
  expect(container.textContent).toContain('Thử lại');
  expect(container.querySelector('input').disabled).toBe(false);
});

test('identity change cancels old stream and rejects late updates', async () => {
  let callback;
  streamChat.mockImplementation((payload, user, signal, emit) => new Promise((resolve, reject) => {
    callback = emit;
    signal.addEventListener('abort', () => reject(new Error('aborted')));
  }));
  await act(async () => container.querySelector('.fashion-chat-suggestions button').click());
  mockUser = { id: 'another-user', access_token: 'test-token' };
  await act(async () => root.render(<ChatbotWidget />));
  await act(async () => callback('delta', { text: 'Tin của tài khoản cũ' }));
  expect(container.textContent).not.toContain('Tin của tài khoản cũ');
  expect(container.querySelector('input').disabled).toBe(false);
});
