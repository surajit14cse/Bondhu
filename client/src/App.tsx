import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Heart, MessageCircle, User as UserIcon, Search } from 'lucide-react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Don't show navbar on login/signup
  if (location.pathname === '/login' || location.pathname === '/signup') return null;

  return (
    <nav className="glass" style={{ 
      position: 'fixed', 
      bottom: '30px', 
      left: '50%', 
      transform: 'translateX(-50%)',
      width: 'calc(100% - 48px)',
      maxWidth: '400px',
      height: '72px',
      borderRadius: '36px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 2000,
      padding: '0 20px',
      border: '1px solid rgba(255,255,255,0.5)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.18)'
    }}>
      <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', transition: 'all 0.2s', padding: '8px' }}>
        <Search color={isActive('/') ? '#FF385C' : '#999'} size={24} strokeWidth={isActive('/') ? 3 : 2} />
        <span style={{ fontSize: '12px', fontWeight: '800', color: isActive('/') ? '#FF385C' : '#999' }}>Discover</span>
      </Link>
      <Link to="/matches" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', transition: 'all 0.2s', padding: '8px' }}>
        <Heart color={isActive('/matches') ? '#FF385C' : '#999'} fill={isActive('/matches') ? '#FF385C' : 'none'} size={24} strokeWidth={isActive('/matches') ? 3 : 2} />
        <span style={{ fontSize: '12px', fontWeight: '800', color: isActive('/matches') ? '#FF385C' : '#999' }}>Matches</span>
      </Link>
      <Link to="/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none', transition: 'all 0.2s', padding: '8px' }}>
        <UserIcon color={isActive('/profile') ? '#FF385C' : '#999'} size={24} strokeWidth={isActive('/profile') ? 3 : 2} />
        <span style={{ fontSize: '12px', fontWeight: '800', color: isActive('/profile') ? '#FF385C' : '#999' }}>Profile</span>
      </Link>
    </nav>
  );
};

function App() {
  const [user, setUser] = useState<any>(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    return token ? { id: userId || 'stored-user' } : null;
  });

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/" element={user ? <><Discover /><Navbar /></> : <Navigate to="/login" />} />
        <Route path="/matches" element={user ? <><Matches /><Navbar /></> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <><Profile /><Navbar /></> : <Navigate to="/login" />} />
        <Route path="/chat/:id" element={user ? <><Chat /><Navbar /></> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
