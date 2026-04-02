import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ChevronLeft } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

const Chat = () => {
  const { id: matchId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (matchId) {
      socket.emit('join_match', matchId);
      fetchMessages();
    }

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [matchId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:5000/api/chat/${matchId}`, {
        headers: { Authorization: token }
      });
      setMessages(data.messages);
      setOtherUser(data.otherUser);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const token = localStorage.getItem('token');
    const messageData = {
      matchId,
      content: input,
      sender: 'me', // backend will handle proper sender id
    };

    try {
      const { data } = await axios.post(`http://localhost:5000/api/chat/${matchId}`, { content: input }, {
        headers: { Authorization: token }
      });
      socket.emit('send_message', data);
      setMessages((prev) => [...prev, data]);
      setInput('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      <header className="glass" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/matches')} style={{ background: 'none', padding: 0 }}><ChevronLeft size={28} /></button>
        {otherUser && (
          <>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <h3>{otherUser.name}</h3>
          </>
        )}
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((msg, i) => {
          const isMe = msg.senderId === localStorage.getItem('userId');
          return (
            <div key={i} style={{ 
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              background: isMe ? 'var(--primary-gradient)' : '#eee',
              color: isMe ? 'white' : 'black',
              padding: '10px 15px',
              borderRadius: '18px',
              maxWidth: '80%',
              borderBottomRightRadius: isMe ? '4px' : '18px',
              borderBottomLeftRadius: isMe ? '18px' : '4px'
            }}>
              {msg.content}
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #ddd' }}
        />
        <button type="submit" className="btn-primary" style={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={20} color="white" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
