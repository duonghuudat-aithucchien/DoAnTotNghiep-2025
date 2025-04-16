import { useState, useEffect, useRef } from "react";
import { styles } from "./style";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem("chatbotMessages")) || [];
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chatbotMessages", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!input) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await fetch("http://127.0.0.1:5000/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      const botMessage = { sender: "bot", text: data.response };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
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
                <div style={styles.messageBubble(msg.sender)}>{msg.text}</div>
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
