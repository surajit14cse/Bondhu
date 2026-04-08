import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Info, Sliders, MapPin, Star, User } from 'lucide-react';
import axios from 'axios';
import MatchOverlay from '../components/MatchOverlay';

interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
}

const SwipeCard = ({ user, onSwipe }: { user: UserProfile; onSwipe: (direction: 'left' | 'right' | 'up') => void }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);
  const superLikeOpacity = useTransform(y, [-50, -150], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    } else if (info.offset.y < -100) {
      onSwipe('up');
    }
  };

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        opacity,
        position: 'absolute',
        width: '100%',
        height: '100%',
        cursor: 'grab',
        touchAction: 'none',
        zIndex: 1
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '32px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'var(--shadow-lg)',
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <img 
          src={user.images && user.images[0] ? user.images[0] : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
          alt={user.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        />
        
        {/* Indicators */}
        <motion.div style={{ opacity: likeOpacity, position: 'absolute', top: '40px', left: '40px', border: '6px solid #4ade80', padding: '10px 24px', borderRadius: '12px', transform: 'rotate(-20deg)', color: '#4ade80', fontWeight: '900', fontSize: '42px', zIndex: 10, pointerEvents: 'none', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
          LIKE
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity, position: 'absolute', top: '40px', right: '40px', border: '6px solid #f87171', padding: '10px 24px', borderRadius: '12px', transform: 'rotate(20deg)', color: '#f87171', fontWeight: '900', fontSize: '42px', zIndex: 10, pointerEvents: 'none', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
          NOPE
        </motion.div>
        <motion.div style={{ opacity: superLikeOpacity, position: 'absolute', bottom: '180px', left: '50%', x: '-50%', border: '6px solid #3b82f6', padding: '10px 24px', borderRadius: '12px', color: '#3b82f6', fontWeight: '900', fontSize: '32px', zIndex: 10, pointerEvents: 'none', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
          SUPER LIKE
        </motion.div>

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '60px 24px 32px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', margin: 0, color: 'white' }}>{user.name}</h2>
            <span style={{ fontSize: '28px', fontWeight: '400', opacity: 0.9 }}>{user.age || 22}</span>
            {Math.random() > 0.5 && (
              <div style={{ background: '#4ade80', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white' }}></div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8, fontSize: '15px', fontWeight: '600' }}>
            <MapPin size={16} /> <span>{(Math.random() * 10).toFixed(1)} miles away</span>
          </div>
          <p style={{ marginTop: '16px', opacity: 0.9, fontSize: '17px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: '500' }}>
            {user.bio || "No bio yet. Tap info to see more."}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const Discover = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [filters, setFilters] = useState({
    gender: 'all',
    minAge: 18,
    maxAge: 50,
    distance: 50
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/profile/discovery', {
        headers: { Authorization: token },
        params: filters
      });
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'up', targetId: string) => {
    const token = localStorage.getItem('token');
    let type: 'like' | 'dislike' | 'super_like';
    
    if (direction === 'right') type = 'like';
    else if (direction === 'left') type = 'dislike';
    else type = 'super_like';
    
    try {
      const { data } = await axios.post(`http://localhost:5000/api/profile/swipe`, { targetId, type }, {
        headers: { Authorization: token }
      });
      
      if (data.match) {
        setMatchData({ user: data.target, matchId: data.matchId });
      }
      
      setUsers(prev => prev.filter(u => u.id !== targetId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ padding: '0', background: '#F7F8FA', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence>
        {matchData && (
          <MatchOverlay 
            user={matchData.user} 
            matchId={matchData.matchId} 
            onClose={() => setMatchData(null)} 
          />
        )}
      </AnimatePresence>

      <header style={{ 
        padding: '20px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        zIndex: 100,
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary-gradient)', borderRadius: '8px' }}></div>
          <h1 style={{ 
            fontSize: '24px', 
            margin: 0,
            background: 'var(--primary-gradient)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
          }}>Bondhu</h1>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ 
          background: '#F5F5F7', 
          width: '44px', 
          height: '44px', 
          borderRadius: '14px', 
          padding: 0,
          color: showFilters ? 'var(--primary-color)' : '#666'
        }}>
          <Sliders size={20} />
        </button>
      </header>

      <div style={{ position: 'relative', flex: 1, padding: '16px' }}>
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              style={{ 
                position: 'absolute',
                top: '16px',
                left: '16px',
                right: '16px',
                zIndex: 100,
                background: 'white', 
                padding: '24px', 
                borderRadius: '24px', 
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid #F0F0F0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Filters</h3>
                <button onClick={() => setShowFilters(false)} style={{ background: 'none', padding: 0 }}><X size={20} color="#999" /></button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '700', color: '#666' }}>Interested in</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['all', 'male', 'female'].map(g => (
                    <button 
                      key={g}
                      onClick={() => setFilters({...filters, gender: g})}
                      style={{ 
                        flex: 1, 
                        fontSize: '13px', 
                        padding: '10px',
                        background: filters.gender === g ? 'var(--primary-color)' : '#F5F5F7',
                        color: filters.gender === g ? 'white' : '#666',
                        borderRadius: '12px'
                      }}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: '#666' }}>Maximum Distance</label>
                  <span style={{ color: 'var(--primary-color)', fontWeight: '800' }}>{filters.distance} miles</span>
                </div>
                <input 
                  type="range" min="1" max="100" value={filters.distance} 
                  onChange={(e) => setFilters({...filters, distance: parseInt(e.target.value)})}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {loading && users.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
              <div style={{ width: '48px', height: '48px', border: '4px solid #F3F3F3', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ color: '#999', fontWeight: '600', fontSize: '16px' }}>Searching for matches...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {users.length > 0 ? (
                users.map((user, i) => (
                  <SwipeCard 
                    key={user.id} 
                    user={user} 
                    onSwipe={(dir) => handleSwipe(dir, user.id)} 
                  />
                ))
              ) : !loading && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', marginTop: '120px', padding: '0 48px' }}
                >
                  <div style={{ background: 'white', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: 'var(--shadow)' }}>
                    <MapPin size={40} color="#EEE" />
                  </div>
                  <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>You've seen everyone!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.6' }}>Expand your filters or check back later for new people in your area.</p>
                  <button onClick={() => setFilters({gender: 'all', minAge: 18, maxAge: 80, distance: 100})} className="btn-primary" style={{ marginTop: '32px', width: '100%' }}>Reset Filters</button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '24px 0 110px', background: 'white' }}>
        <button 
          className="glass" 
          style={{ width: '56px', height: '56px', borderRadius: '50%', color: '#f87171' }} 
          onClick={() => users.length > 0 && handleSwipe('left', users[users.length-1].id)}
        >
          <X size={28} strokeWidth={3} />
        </button>
        <button 
          className="glass" 
          style={{ width: '52px', height: '52px', borderRadius: '50%', color: '#3b82f6' }} 
          onClick={() => users.length > 0 && handleSwipe('up', users[users.length-1].id)}
        >
          <Star size={24} fill="currentColor" />
        </button>
        <button 
          className="btn-primary" 
          style={{ width: '76px', height: '72px', borderRadius: '50%', padding: 0 }} 
          onClick={() => users.length > 0 && handleSwipe('right', users[users.length-1].id)}
        >
          <Heart size={32} fill="white" />
        </button>
        <button className="glass" style={{ width: '56px', height: '56px', borderRadius: '50%', color: '#00A699' }}>
          <Info size={28} strokeWidth={3} />
        </button>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        input[type=range] { -webkit-appearance: none; background: #F0F0F0; height: 6px; border-radius: 3px; flex: 1; outline: none; padding: 0; border: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 24px; width: 24px; border-radius: 50%; background: white; cursor: pointer; border: 2px solid var(--primary-color); box-shadow: 0 2px 6px rgba(0,0,0,0.1); margin-top: -9px; }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 6px; cursor: pointer; background: #F0F0F0; border-radius: 3px; }
      `}</style>
    </div>
  );
};

export default Discover;
