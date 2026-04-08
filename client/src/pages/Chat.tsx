import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ChevronLeft, MoreHorizontal, Check, CheckCheck, Camera, Mic, Image as ImageIcon, Video } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:5000');

const Chat = () => {
  const { id: matchId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (matchId) {
      socket.emit('join_match', matchId);
      fetchMessages();
      socket.emit('mark_seen', { matchId, userId });
    }

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
      socket.emit('mark_seen', { matchId, userId });
    });

    socket.on('user_typing', (data) => {
      if (data.userId !== userId) setIsTyping(true);
    });

    socket.on('user_stop_typing', (data) => {
      if (data.userId !== userId) setIsTyping(false);
    });

    socket.on('messages_seen', (data) => {
      if (data.matchId === matchId && data.seenBy !== userId) {
        setMessages((prev) => prev.map(m => ({ ...m, status: 'seen' })));
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('messages_seen');
    };
  }, [matchId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    socket.emit('typing', { matchId, userId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { matchId, userId });
    }, 2000);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageData = {
      matchId,
      senderId: userId,
      content: input,
      type: 'text',
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    setMessages((prev) => [...prev, { ...messageData, status: 'sent' }]);
    setInput('');
    socket.emit('stop_typing', { matchId, userId });
  };

  const startVideoCall = () => {
    setMessage(`Video call with ${otherUser?.name || 'partner'} starting soon!`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="container fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0, background: 'white' }}>
      <header style={{ 
        padding: '12px 16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #F0F0F0'
      }}>
        <button onClick={() => navigate('/matches')} style={{ background: '#F5F5F7', padding: '10px', borderRadius: '14px', width: '40px', height: '40px' }}><ChevronLeft size={20} color="var(--text-color)" /></button>
        {otherUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`} style={{ width: '42px', height: '42px', borderRadius: '14px', background: '#F0F0F0' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{otherUser.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isTyping ? 'var(--primary-color)' : '#4ade80' }}></div>
                <p style={{ fontSize: '12px', color: isTyping ? 'var(--primary-color)' : '#999', fontWeight: '700', margin: 0 }}>
                  {isTyping ? 'Typing...' : 'Online now'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1 }}></div>
        )}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={startVideoCall} style={{ background: 'none', padding: '8px', color: 'var(--primary-color)' }}><Video size={22} /></button>
          <button style={{ background: 'none', padding: '8px' }}><MoreHorizontal size={20} color="#BBB" /></button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px', background: '#fff' }}>
        {messages.map((msg, i) => {
          const isMe = msg.senderId === userId;
          const showTime = i === 0 || new Date(msg.timestamp).getTime() - new Date(messages[i-1].timestamp).getTime() > 300000;
          
          return (
            <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', marginBottom: '2px' }}>
              {showTime && (
                <div style={{ textAlign: 'center', margin: '20px 0 12px', fontSize: '11px', fontWeight: '800', color: '#BBB', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{ 
                  background: isMe ? 'var(--primary-gradient)' : '#F2F2F7',
                  color: isMe ? 'white' : 'var(--text-color)',
                  padding: '12px 16px',
                  borderRadius: '22px',
                  borderBottomRightRadius: isMe ? '4px' : '22px',
                  borderBottomLeftRadius: isMe ? '22px' : '4px',
                  fontSize: '15.5px',
                  lineHeight: '1.4',
                  fontWeight: '500',
                  boxShadow: isMe ? '0 4px 12px rgba(230, 30, 77, 0.15)' : 'none'
                }}
              >
                {msg.content}
              </motion.div>
              {isMe && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', marginRight: '4px' }}>
                  {msg.status === 'seen' ? (
                    <CheckCheck size={14} color="#3b82f6" strokeWidth={3} />
                  ) : (
                    <Check size={14} color="#CCC" strokeWidth={3} />
                  )}
                </div>
              )}
            </div>
          );
        })}
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ alignSelf: 'flex-start', background: '#F2F2F7', padding: '12px 18px', borderRadius: '20px', borderBottomLeftRadius: '4px', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', gap: '5px' }}>
                <div style={{ width: '6px', height: '6px', background: '#BBB', borderRadius: '50%', animation: 'bounce 1s infinite 0.1s' }}></div>
                <div style={{ width: '6px', height: '6px', background: '#BBB', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></div>
                <div style={{ width: '6px', height: '6px', background: '#BBB', borderRadius: '50%', animation: 'bounce 1s infinite 0.3s' }}></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} style={{ height: '20px' }} />
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            style={{ 
              position: 'fixed', 
              top: '80px', 
              left: '20px', 
              right: '20px', 
              background: '#333', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '12px', 
              textAlign: 'center', 
              fontWeight: '600', 
              zIndex: 3000,
              fontSize: '14px'
            }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: '16px 16px 32px', background: 'white', borderTop: '1px solid #F0F0F0' }}>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button type="button" style={{ background: '#F5F5F7', padding: 0, width: '44px', height: '44px', borderRadius: '12px', color: '#999' }}>
            <ImageIcon size={20} />
          </button>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              value={input} 
              onChange={handleInputChange}
              placeholder="Type a message..."
              style={{ padding: '14px 48px 14px 20px', borderRadius: '24px', border: 'none', background: '#F5F5F7', fontSize: '15px', fontWeight: '500' }}
            />
            <button type="button" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', padding: '8px', color: '#999' }}>
              <Mic size={20} />
            </button>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '44px', height: '44px', borderRadius: '12px', padding: 0, minWidth: '44px' }} disabled={!input.trim()}>
            <Send size={18} color="white" />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `}</style>
    </div>
  );
};

export default Chat;
