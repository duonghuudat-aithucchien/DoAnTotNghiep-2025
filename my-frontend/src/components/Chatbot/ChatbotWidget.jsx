import { useState, useEffect, useRef } from "react";
import { styles } from "./style";
import { useSelector } from "react-redux";

const CHATBOT_URL = process.env.REACT_APP_CHATBOT_URL || "http://127.0.0.1:5000";

const getStoredAccessToken = () => {
  try {
    return JSON.parse(localStorage.getItem('access_token')) || '';
  } catch {
    return '';
  }
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.user);
  const userKey = user?.id || "guest"; // fallback nếu chưa đăng nhập
  // 👉 Load lịch sử từ localStorage theo user
  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem(`chatbotMessages_${userKey}`)) || [];
  });

  useEffect(() => {
    localStorage.setItem(`chatbotMessages_${userKey}`, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, userKey]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // const sendMessage = async () => {
  //   if (!input) return;
  //   const userMessage = { sender: "user", text: input };
  //   setMessages((prevMessages) => [...prevMessages, userMessage]);

  //   try {
  //     const response = await fetch("http://127.0.0.1:5000/get", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ message: input }),
  //     });
  //     const data = await response.json();
  //     const botMessage = { sender: "bot", text: data.response };
  //     setMessages((prevMessages) => [...prevMessages, botMessage]);
  //     setInput("");
  //   } catch (error) {
  //     console.error("Lỗi khi gọi API chatbot:", error);
  //   }
  // };

 useEffect(() => {
  const fetchHistory = async () => {
    if (!user?.id) {
      setMessages([]); // 🧹 Xóa UI nếu không có user
      return;
    }

    try {
      const res = await fetch(`${CHATBOT_URL}/get-conversations`, {
        headers: { Authorization: `Bearer ${getStoredAccessToken() || user?.access_token}` },
      });
      if (!res.ok) throw new Error('Không thể tải lịch sử trò chuyện');
      const data = await res.json();

      if (Array.isArray(data.conversations)) {
        const restoredMessages = [];

        data.conversations.reverse().forEach(item => {
          restoredMessages.push({ sender: "user", type: "text", text: item.message });
          restoredMessages.push({ sender: "bot", type: "text", text: item.response });
        });

        setMessages(restoredMessages);
      }
    } catch (err) {
      console.error("Không thể tải lịch sử chatbot:", err);
    }
  };

  fetchHistory();
}, [user?.id, user?.access_token]);

  const sendMessage = async () => {
  if (!input) return;
    const userMessage = { sender: "user", type: "text", text: input };
  setMessages((prev) => [...prev, userMessage]);

  try {
    const response = await fetch(`${CHATBOT_URL}/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(user?.id ? { Authorization: `Bearer ${getStoredAccessToken() || user?.access_token}` } : {}),
      },
      body: JSON.stringify({
        message: input,
      }),
    });

    const data = await response.json();

    // Thêm phản hồi văn bản từ Gemini
    const botTextMessage = { sender: "bot", type: "text", text: data.response };
    const newMessages = [botTextMessage];

    // Nếu có gợi ý sản phẩm
    if (Array.isArray(data.products)) {
      data.products.forEach((p) => {
        newMessages.push({
          sender: "bot",
          type: "product",
          product: p,
        });
      });
    }

    setMessages((prev) => [...prev, ...newMessages]);
    setInput("");
  } catch (error) {
    console.error("Lỗi khi gọi API chatbot:", error);
  }
};



  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div>
      <button onClick={toggleChat} style={styles.chatButton}>💬</button>
      {isOpen && (
        <div style={styles.chatContainer}>
          <div style={styles.chatHeader}>
            Chatbot Hỗ trợ
            <button onClick={toggleChat} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>✖</button>
          </div>
          <div style={styles.messageList}>
            {messages.map((msg, i) => (
              <div key={i} style={styles.message(msg.sender)}>
                {msg.type === "text" && (
                  <div style={styles.messageBubble(msg.sender)}>{msg.text}</div>
                )}  

                {msg.type === "product" && (
                  <div style={styles.productCard}>
                    <img src={msg.product.image} alt={msg.product.name} style={{ width: "100px", borderRadius: "8px" }} />
                    <div>
                      <strong>{msg.product.name}</strong><br />
                      Giá: {msg.product.price} VND <br />
                      Đánh giá: {msg.product.rating}/5 <br />
                      <a href={msg.product.link} target="_blank" rel="noopener noreferrer">🔗 Xem chi tiết</a>
                    </div>
                  </div>
                )}

              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={styles.inputContainer}>
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={handleKeyPress}
              style={styles.input} 
              placeholder="Nhập tin nhắn..." 
            />
            <button onClick={sendMessage} style={styles.sendButton}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
