import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MessageSquare, Heart, Search, ChevronRight } from 'lucide-react';

const Matches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/profile/matches', {
        headers: { Authorization: token }
      });
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="container" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #F3F3F3', borderTop: '4px solid #E61E4D', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  );

  const filteredMatches = matches.filter(m => m.otherUser.name.toLowerCase().includes(search.toLowerCase()));
  const newMatches = matches.slice(0, 6);

  return (
    <div className="container fade-in" style={{ padding: '0', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '24px 24px 12px', background: 'white' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Messages</h1>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
          <input 
            type="text" 
            placeholder="Search matches..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              paddingLeft: '48px', 
              background: '#F5F5F7', 
              border: 'none',
              height: '48px',
              borderRadius: '14px'
            }}
          />
        </div>
      </header>
      
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
        {/* New Matches Horizontal Scroll */}
        {!search && (
          <section style={{ padding: '20px 0 24px' }}>
            <h3 style={{ padding: '0 24px', marginBottom: '16px', fontSize: '17px', color: 'var(--primary-color)', fontWeight: '800', letterSpacing: '0.5px' }}>NEW MATCHES</h3>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '0 24px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {newMatches.length > 0 ? newMatches.map((match) => (
                <Link to={`/chat/${match._id}`} key={match._id} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ width: '76px', textAlign: 'center' }}
                  >
                    <div style={{ 
                      width: '76px', 
                      height: '76px', 
                      borderRadius: '28px', 
                      padding: '3px',
                      background: 'var(--primary-gradient)',
                      marginBottom: '10px',
                      boxShadow: '0 8px 16px rgba(230, 30, 77, 0.15)'
                    }}>
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.otherUser.name}`} 
                        style={{ width: '100%', height: '100%', borderRadius: '25px', border: '2px solid white', objectFit: 'cover' }}
                      />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-color)' }}>
                      {match.otherUser.name.split(' ')[0]}
                    </p>
                  </motion.div>
                </Link>
              )) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#F9F9F9', borderRadius: '20px', width: '100%', border: '1px dashed #DDD' }}>
                  <Heart size={20} color="#FF385C" />
                  <p style={{ color: '#999', fontSize: '14px', fontWeight: '600' }}>Swipe more to get matches!</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Messages List */}
        <section style={{ padding: '0 16px' }}>
          <h3 style={{ padding: '0 8px', marginBottom: '16px', fontSize: '17px', fontWeight: '800' }}>CONVERSATIONS</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredMatches.length > 0 ? filteredMatches.map((match) => (
              <Link to={`/chat/${match._id}`} key={match._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <motion.div 
                  whileHover={{ background: '#F9F9F9' }}
                  whileTap={{ scale: 0.98 }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    padding: '12px 8px', 
                    borderRadius: '20px',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.otherUser.name}`} 
                      style={{ width: '68px', height: '68px', borderRadius: '22px', objectFit: 'cover', background: '#F0F0F0' }}
                    />
                    <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '14px', height: '14px', background: '#4ade80', border: '2.5px solid white', borderRadius: '50%' }}></div>
                  </div>
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '700' }}>{match.otherUser.name}</h4>
                      <span style={{ fontSize: '12px', color: '#999', fontWeight: '600' }}>2:45 PM</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#777', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: '500' }}>
                        Say something interesting to {match.otherUser.name.split(' ')[0]}...
                      </p>
                      {Math.random() > 0.7 && (
                        <div style={{ background: 'var(--primary-color)', width: '8px', height: '8px', borderRadius: '50%' }}></div>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} color="#EEE" />
                </motion.div>
              </Link>
            )) : (
              <div style={{ textAlign: 'center', marginTop: '60px', padding: '0 40px' }}>
                <div style={{ width: '80px', height: '80px', background: '#F5F5F7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <MessageSquare size={32} color="#CCC" />
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No messages yet</h3>
                <p style={{ color: '#999', fontSize: '15px', lineHeight: '1.5' }}>When you match with someone, your conversations will appear here.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Matches;
