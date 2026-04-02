import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const Matches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><h3>Loading matches...</h3></div>;

  // For prototype, we'll treat first 4 as "New Matches"
  const newMatches = matches.slice(0, 4);
  const allMatches = matches;

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      <h1 style={{ marginBottom: '25px', fontSize: '2rem' }}>Messages</h1>
      
      {/* New Matches Horizontal Scroll */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#ff512f' }}>New Matches</h3>
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
          {newMatches.map((match) => (
            <Link to={`/chat/${match._id}`} key={match._id} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                style={{ width: '80px', textAlign: 'center' }}
              >
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  padding: '3px',
                  background: 'var(--primary-gradient)',
                  marginBottom: '8px'
                }}>
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.otherUser.name}`} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid white', objectFit: 'cover' }}
                  />
                </div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {match.otherUser.name}
                </p>
              </motion.div>
            </Link>
          ))}
          {newMatches.length === 0 && <p style={{ color: '#999', fontSize: '0.9rem' }}>No new matches yet.</p>}
        </div>
      </section>

      {/* Messages List */}
      <section>
        <h3 style={{ marginBottom: '15px' }}>Conversations</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {allMatches.map((match) => (
            <Link to={`/chat/${match._id}`} key={match._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="glass"
                style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', borderRadius: '20px' }}
              >
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.otherUser.name}`} 
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{match.otherUser.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Tap to send a message...</p>
                </div>
              </motion.div>
            </Link>
          ))}
          {allMatches.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
              <p>Your conversations will appear here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Matches;
