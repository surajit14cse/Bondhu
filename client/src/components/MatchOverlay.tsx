import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchOverlayProps {
  user: any;
  matchId: string;
  onClose: () => void;
}

const MatchOverlay = ({ user, matchId, onClose }: MatchOverlayProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}
    >
      <motion.button 
        onClick={onClose}
        style={{ position: 'absolute', top: '40px', right: '30px', background: 'none', color: 'white' }}
      >
        <X size={32} />
      </motion.button>

      <motion.h1
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 12 }}
        style={{ 
          fontSize: '3.5rem', 
          marginBottom: '10px',
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 900
        }}
      >
        It's a Match!
      </motion.h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: 0.8 }}>
        You and {user.name} have liked each other.
      </p>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '50px' }}>
        <motion.div
          initial={{ x: -100, rotate: -15, opacity: 0 }}
          animate={{ x: 0, rotate: -5, opacity: 1 }}
          style={{ width: '140px', height: '180px', borderRadius: '20px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 0 20px rgba(255,255,255,0.3)' }}
        >
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </motion.div>
        <motion.div
          initial={{ x: 100, rotate: 15, opacity: 0 }}
          animate={{ x: 0, rotate: 5, opacity: 1 }}
          style={{ width: '140px', height: '180px', borderRadius: '20px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 0 20px rgba(255,255,255,0.3)' }}
        >
          <img src={user.images[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </motion.div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(`/chat/${matchId}`)}
        className="btn-primary"
        style={{ padding: '18px 40px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <MessageCircle size={22} /> Send a Message
      </motion.button>
      
      <button 
        onClick={onClose}
        style={{ marginTop: '20px', background: 'none', color: 'white', opacity: 0.6, fontWeight: 600 }}
      >
        Keep Swiping
      </button>
    </motion.div>
  );
};

export default MatchOverlay;
