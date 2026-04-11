# Build a Real-time Chat UI

## Requirements
- Send and receive messages in real-time
- Show message list (scroll to latest), typing indicator
- Online/offline status, timestamps
- WebSocket or polling for real-time updates

## Data Model
```javascript
const message = {
  id: 'msg-1',
  senderId: 'user-1',
  text: 'Hello!',
  timestamp: Date.now(),
  status: 'sent' // sent | delivered | read
};
```

## Core Implementation

```javascript
function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  // WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080/chat');
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'typing') {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    };
    return () => ws.current.close();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { id: Date.now(), senderId: 'me', text: input, timestamp: Date.now() };
    ws.current.send(JSON.stringify({ type: 'message', message: msg }));
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={msg.senderId === 'me' ? 'sent' : 'received'}>
            <p>{msg.text}</p>
            <span className="time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
        {isTyping && <div className="typing">User is typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input value={input} onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
```

## Key Patterns
- **WebSocket** for real-time bidirectional communication
- **Optimistic UI**: Show sent message immediately, update status on server ack
- **Auto-scroll**: ScrollIntoView on new message
- **Typing indicator**: Debounced typing event

## Interview Tips
- Discuss WebSocket vs polling vs SSE trade-offs
- Handle reconnection on WebSocket disconnect
- Message ordering and deduplication
- Virtualize message list for long conversations
