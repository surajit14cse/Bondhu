import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Info, Sliders } from 'lucide-react';
import axios from 'axios';
import MatchOverlay from '../components/MatchOverlay';

interface UserProfile {
  _id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
}

const SwipeCard = ({ user, onSwipe }: { user: UserProfile; onSwipe: (direction: 'left' | 'right') => void }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        position: 'absolute',
        width: '100%',
        height: '100%',
        cursor: 'grab'
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
    >
      <div className="glass" style={{
        width: '100%',
        height: '100%',
        borderRadius: '30px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'var(--shadow)'
      }}>
        <img 
          src={user.images[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
          alt={user.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          color: 'white'
        }}>
          <h2>{user.name}, {user.age || 25}</h2>
          <p style={{ opacity: 0.8 }}>{user.bio || "No bio yet..."}</p>
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
    maxAge: 50
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
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', targetId: string) => {
    const token = localStorage.getItem('token');
    const endpoint = direction === 'right' ? 'like' : 'dislike';
    
    try {
      const { data } = await axios.post(`http://localhost:5000/api/profile/${endpoint}`, { targetId }, {
        headers: { Authorization: token }
      });
      
      if (data.match) {
        setMatchData({ user: data.target, matchId: data.matchId });
      }
      
      setUsers(users.filter(u => u._id !== targetId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ overflow: 'hidden', paddingBottom: '100px' }}>
      <AnimatePresence>
        {matchData && (
          <MatchOverlay 
            user={matchData.user} 
            matchId={matchData.matchId} 
            onClose={() => setMatchData(null)} 
          />
        )}
      </AnimatePresence>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bondhu</h1>
        <button onClick={() => setShowFilters(!showFilters)} className="glass" style={{ width: '45px', height: '45px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sliders size={20} />
        </button>
      </header>

      {showFilters && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }} 
          animate={{ height: 'auto', opacity: 1 }}
          className="glass" 
          style={{ padding: '20px', borderRadius: '20px', marginBottom: '20px' }}
        >
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>Interested in</label>
            <select 
              value={filters.gender} 
              onChange={(e) => setFilters({...filters, gender: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}
            >
              <option value="all">Everyone</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>Age Range: {filters.minAge} - {filters.maxAge}</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="range" min="18" max="100" value={filters.minAge} 
                onChange={(e) => setFilters({...filters, minAge: parseInt(e.target.value)})}
                style={{ flex: 1 }}
              />
              <input 
                type="range" min="18" max="100" value={filters.maxAge} 
                onChange={(e) => setFilters({...filters, maxAge: parseInt(e.target.value)})}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}><h3>Searching...</h3></div>
      ) : (
        <div style={{ position: 'relative', width: '100%', height: '60vh', marginTop: '10px' }}>
          <AnimatePresence>
            {users.map((user) => (
              <SwipeCard 
                key={user._id} 
                user={user} 
                onSwipe={(dir) => handleSwipe(dir, user._id)} 
              />
            ))}
            {users.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <h3>No more people found!</h3>
                <p>Try adjusting your filters</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
        <button className="glass" style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
          <X color="#666" size={30} />
        </button>
        <button className="btn-primary" style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart color="white" size={40} />
        </button>
        <button className="glass" style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
          <Info color="#666" size={30} />
        </button>
      </div>
    </div>
  );
};

export default Discover;
