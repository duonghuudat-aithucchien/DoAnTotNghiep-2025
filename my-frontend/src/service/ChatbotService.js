import { getStoredAccessToken } from './UserService';
const BASE_URL = (process.env.REACT_APP_CHATBOT_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');

export function safeChatUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

export function newChatId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  if (!window.crypto?.getRandomValues) throw new Error('Trình duyệt thiếu Web Crypto. Vui lòng dùng HTTPS hoặc localhost.');
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function chatHeaders(user) {
  if (user?.id) {
    const token = getStoredAccessToken() || user.access_token;
    if (!token) throw new Error('Vui lòng đăng nhập lại để tiếp tục.');
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  }
  let session = localStorage.getItem('fashionChatSession');
  if (!session) { session = newChatId(); localStorage.setItem('fashionChatSession', session); }
  return { 'Content-Type': 'application/json', 'X-Chat-Session': session };
}

export async function chatRequest(path, user, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers: chatHeaders(user) });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Không thể kết nối trợ lý. Vui lòng thử lại.');
    error.code = data.code;
    throw error;
  }
  return data;
}

export function createSSEParser(onEvent) {
  let buffer = '';
  return (chunk) => {
    buffer += chunk;
    let boundary;
    while ((boundary = buffer.search(/\r?\n\r?\n/)) !== -1) {
      const separator = buffer.slice(boundary).match(/^\r?\n\r?\n/)[0];
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + separator.length);
      let event = 'message';
      const lines = [];
      block.split(/\r?\n/).forEach((line) => {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) lines.push(line.slice(5).trimStart());
      });
      if (lines.length) onEvent(event, JSON.parse(lines.join('\n')));
    }
  };
}

export async function streamChat(payload, user, signal, onEvent) {
  const response = await fetch(`${BASE_URL}/api/chat/stream`, { method: 'POST', headers: chatHeaders(user), body: JSON.stringify(payload), signal });
  if (!response.ok) {
    const data = await response.json();
    const error = new Error(data.message || 'Trợ lý chưa sẵn sàng. Vui lòng thử lại.');
    error.code = data.code;
    throw error;
  }
  if (!response.body) throw new Error('Trình duyệt chưa hỗ trợ trả lời trực tiếp.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let doneReceived = false;
  const parse = createSSEParser((event, data) => {
    if (event === 'error') throw new Error(data.message || 'Có lỗi khi trả lời.');
    if (event === 'done') doneReceived = true;
    onEvent(event, data);
  });
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) { parse(decoder.decode()); break; }
      parse(decoder.decode(value, { stream: true }));
    }
    if (!doneReceived) throw new Error('Kết nối bị gián đoạn. Bạn có thể thử gửi lại.');
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
