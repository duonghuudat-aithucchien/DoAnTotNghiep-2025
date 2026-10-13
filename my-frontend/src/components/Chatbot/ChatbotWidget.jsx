import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { chatRequest, streamChat, safeChatUrl, newChatId } from '../../service/ChatbotService';
import './chatbot.css';

const STARTERS = ['Tìm áo sơ mi dưới 500k', 'Gợi ý đồ đi làm', 'Chính sách đổi trả'];
const money = (value) => Number(value || 0).toLocaleString('vi-VN') + ' ₫';
const labels = { category: 'Loại', size: 'Size', color: 'Màu', gender: 'Đối tượng', min_price: 'Từ', max_price: 'Đến', occasion: 'Dịp' };
const restored = (turns) => turns.flatMap((turn) => [
  { id: `${turn.id}:user`, sender: 'user', text: turn.message },
  { id: turn.id, sender: 'bot', text: turn.response, products: turn.products, sources: turn.sources, complete: true },
]);

export default function ChatbotWidget() {
  const user = useSelector((state) => state.user);
  const identity = user?.id || 'guest';
  const [isOpen, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState('');
  const [suggestions, setSuggestions] = useState(STARTERS);
  const endRef = useRef(null);
  const controller = useRef(null);
  const generation = useRef(0);
  const userRef = useRef(user);
  userRef.current = user;
  const storageKey = `fashionChatConversation:${identity}`;

  useEffect(() => {
    const version = ++generation.current;
    controller.current?.abort();
    setMessages([]); setHistory([]); setBusy(false); setError(''); setRetry(''); setInput('');
    setSuggestions(STARTERS); setStatus(''); setShowHistory(false);
    const id = localStorage.getItem(storageKey);
    setConversationId(id || null);
    const abort = new AbortController();
    if (id) {
      setBusy(true);
      chatRequest(`/api/conversations/${id}`, userRef.current, { signal: abort.signal })
        .then(({ data }) => { if (version === generation.current) setMessages(restored(data.turns)); })
        .catch((err) => {
          if (abort.signal.aborted || version !== generation.current) return;
          if (err.code === 'CONVERSATION_NOT_FOUND') { localStorage.removeItem(storageKey); setConversationId(null); }
          else setError(err.message);
        }).finally(() => { if (!abort.signal.aborted && version === generation.current) setBusy(false); });
    }
    return () => { abort.abort(); controller.current?.abort(); };
  }, [identity, storageKey]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);

  const send = async (value = input) => {
    const message = value.trim();
    if (!message || busy) return;
    const version = generation.current;
    let id;
    try { id = newChatId(); } catch (err) { setError(err.message); return; }
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true); setError(''); setRetry(''); setInput(''); setStatus('Đang tìm thông tin…');
    setMessages((prev) => [...prev, { id: `${id}:user`, sender: 'user', text: message }, { id, sender: 'bot', text: '', products: [] }]);
    const update = (change) => setMessages((prev) => prev.map((item) => item.id === id ? change(item) : item));
    try {
      await streamChat({ message, conversation_id: conversationId }, userRef.current, abort.signal, (event, data) => {
        if (generation.current !== version) return;
        if (event === 'meta') { setConversationId(data.conversation_id); localStorage.setItem(storageKey, data.conversation_id); }
        if (event === 'status') setStatus(data.message);
        if (event === 'delta') update((item) => ({ ...item, text: item.text + data.text }));
        if (event === 'reset') update((item) => ({ ...item, text: '' }));
        if (event === 'done') {
          update((item) => ({ ...item, id: data.message_id, text: data.response, products: data.products, sources: data.sources, filters: data.filters, complete: true }));
          setSuggestions(data.suggestions || STARTERS);
        }
      });
    } catch (err) {
      if (generation.current !== version) return;
      update((item) => ({ ...item, interrupted: true }));
      setError(abort.signal.aborted ? 'Đã dừng trả lời. Bạn có thể gửi lại câu hỏi.' : err.message);
      setRetry(message);
    } finally { if (generation.current === version) { setBusy(false); setStatus(''); controller.current = null; } }
  };

  const loadHistory = async () => {
    setError(''); setBusy(true);
    const version = generation.current;
    try {
      const { data } = await chatRequest('/api/conversations', userRef.current);
      if (version === generation.current) { setHistory(data); setShowHistory(true); }
    } catch (err) { if (version === generation.current) setError(err.message); }
    finally { if (version === generation.current) setBusy(false); }
  };
  const selectHistory = async (id) => {
    const version = generation.current;
    setBusy(true);
    try {
      const { data } = await chatRequest(`/api/conversations/${id}`, userRef.current);
      if (version !== generation.current) return;
      setConversationId(id); localStorage.setItem(storageKey, id);
      setMessages(restored(data.turns)); setShowHistory(false); setError(''); setRetry('');
    } catch (err) { if (version === generation.current) setError(err.message); }
    finally { if (version === generation.current) setBusy(false); }
  };
  const newChat = () => {
    setConversationId(null); setMessages([]); setSuggestions(STARTERS); setError(''); setRetry(''); setShowHistory(false);
    localStorage.removeItem(storageKey);
  };
  const deleteChat = async (id) => {
    if (!window.confirm('Xóa cuộc trò chuyện và phản hồi liên quan?')) return;
    const version = generation.current;
    setBusy(true);
    try {
      await chatRequest(`/api/conversations/${id}`, userRef.current, { method: 'DELETE' });
      if (version !== generation.current) return;
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (id === conversationId) newChat();
    } catch (err) { if (version === generation.current) setError(err.message); }
    finally { if (version === generation.current) setBusy(false); }
  };
  const feedback = async (item, rating) => {
    const version = generation.current;
    try {
      await chatRequest('/api/feedback', userRef.current, { method: 'POST', body: JSON.stringify({ conversation_id: conversationId, message_id: item.id, rating }) });
      if (version === generation.current && rating !== 2) setMessages((prev) => prev.map((row) => row.id === item.id ? { ...row, rating } : row));
    } catch (err) { if (version === generation.current) setError(err.message); }
  };

  return <div className="fashion-chat">
    <button className="fashion-chat-launcher" onClick={() => setOpen(!isOpen)} aria-label={isOpen ? 'Đóng trợ lý' : 'Mở trợ lý mua sắm'} aria-expanded={isOpen}>✦</button>
    {isOpen && <section className="fashion-chat-panel" aria-label="Trợ lý mua sắm FashionStyle">
      <header><div><strong>FashionStyle Assistant</strong><small>Tìm đúng mẫu · Chọn đúng phong cách</small></div><button onClick={() => setOpen(false)} aria-label="Đóng">×</button></header>
      <nav aria-label="Cuộc trò chuyện"><button disabled={busy} onClick={newChat}>＋ Cuộc trò chuyện mới</button><button disabled={busy} onClick={loadHistory}>Lịch sử</button>{conversationId && <button disabled={busy} onClick={() => deleteChat(conversationId)}>Xóa</button>}</nav>
      {showHistory ? <div className="fashion-chat-messages"><button onClick={() => setShowHistory(false)}>← Quay lại</button>{!history.length && <p>Chưa có cuộc trò chuyện.</p>}{history.map((item) => <div className="fashion-chat-history" key={item.id}><button disabled={busy} onClick={() => selectHistory(item.id)}>{item.title}<small>{new Date(item.updatedAt).toLocaleString('vi-VN')}</small></button><button disabled={busy} onClick={() => deleteChat(item.id)} aria-label={`Xóa ${item.title}`}>×</button></div>)}</div>
        : <div className="fashion-chat-messages" role="log" aria-live="polite" aria-relevant="additions text">
          {!messages.length && <div className="fashion-chat-welcome"><span>✦</span><h3>Hôm nay bạn muốn mặc gì?</h3><p>Mình giúp bạn tìm mẫu theo ngân sách, size, màu và kiểm tra đơn hàng sau khi đăng nhập.</p></div>}
          {messages.map((item) => <article key={item.id} className={`fashion-chat-message ${item.sender}`}>
            {item.text && <div className="fashion-chat-bubble">{item.text}</div>}
            {item.interrupted && <small>Phản hồi chưa hoàn tất</small>}
            {item.filters && !!Object.keys(item.filters).length && <div className="fashion-chat-filters">{Object.entries(item.filters).map(([key, value]) => <span key={key}>{labels[key] || key}: {key.includes('price') ? money(value) : value}</span>)}</div>}
            {!!item.products?.length && <div className="fashion-chat-products">{item.products.map((product) => <a className="fashion-chat-product" key={product.id} href={safeChatUrl(product.link) || '#'} onClick={() => feedback(item, 2)}>
              {safeChatUrl(product.image) && product.image && <img loading="lazy" src={safeChatUrl(product.image)} alt={product.name} />}
              <div><strong>{product.name}</strong><b>{money(product.salePrice ?? product.price)}</b>{product.salePrice < product.price && <del>{money(product.price)}</del>}<small>Size: {product.sizes?.join(', ') || 'Xem chi tiết'}</small><small>Màu: {product.colors?.join(', ') || 'Xem chi tiết'} · Còn {product.countInStock}</small><span>Xem sản phẩm ↗</span></div>
            </a>)}</div>}
            {!!item.sources?.length && <div className="fashion-chat-sources">Nguồn: {item.sources.map((source) => safeChatUrl(source.url) && source.url ? <a key={source.id} href={safeChatUrl(source.url)}>{source.title}</a> : <span key={source.id}>{source.title}</span>)}</div>}
            {item.sender === 'bot' && item.complete && <div className="fashion-chat-feedback"><span>Câu trả lời có hữu ích?</span><button disabled={busy} aria-label="Hữu ích" aria-pressed={item.rating === 1} onClick={() => feedback(item, 1)}>👍</button><button disabled={busy} aria-label="Chưa hữu ích" aria-pressed={item.rating === -1} onClick={() => feedback(item, -1)}>👎</button></div>}
          </article>)}
          {busy && <p className="fashion-chat-status" role="status">{status || 'Đang trả lời…'}</p>}<div ref={endRef} />
        </div>}
      {error && <div className="fashion-chat-error" role="alert">{error} {retry && !busy && <button onClick={() => send(retry)}>Thử lại</button>}</div>}
      {!showHistory && <div className="fashion-chat-suggestions">{suggestions.map((text) => <button key={text} disabled={busy} onClick={() => send(text)}>{text}</button>)}</div>}
      <form onSubmit={(event) => { event.preventDefault(); send(); }}><input aria-label="Tin nhắn cho trợ lý" placeholder="Ví dụ: áo đen size L dưới 500k" value={input} maxLength={2000} disabled={busy || showHistory} onChange={(event) => setInput(event.target.value)} />{busy ? <button type="button" disabled={!controller.current} onClick={() => controller.current?.abort()}>Dừng</button> : <button disabled={!input.trim() || showHistory}>Gửi ↑</button>}</form>
      <footer>AI có thể nhầm. Giá và tồn kho được kiểm tra khi đặt hàng. Không gửi thông tin nhạy cảm.</footer>
    </section>}
  </div>;
}
