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

  return (
    <nav className="glass" style={{ 
      position: 'fixed', 
      bottom: '20px', 
      left: '50%', 
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '400px',
      height: '70px',
      borderRadius: '35px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000,
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
    }}>
      <Link to="/"><Search color={isActive('/') ? '#ff512f' : '#666'} size={28} /></Link>
      <Link to="/matches"><Heart color={isActive('/matches') ? '#ff512f' : '#666'} size={28} /></Link>
      <Link to="/profile"><UserIcon color={isActive('/profile') ? '#ff512f' : '#666'} size={28} /></Link>
    </nav>
  );
};

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd verify the token with the backend here
      setUser({ id: 'mock-id' }); // Temporary mock user
    }
  }, []);

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
