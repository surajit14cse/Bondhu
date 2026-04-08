import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Lock, User, ArrowRight, Phone, Eye, EyeOff } from 'lucide-react';

const Signup = ({ setUser }: { setUser: any }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Sending name, phone and password to backend
      const { data } = await axios.post('http://localhost:5000/api/auth/signup', { name, phone, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      setUser(data.user);
      navigate('/profile'); // Redirect to profile for completion
    } catch (err: any) {
      console.error('Signup Request Failed:', err);
      setError(err.response?.data?.error || 'Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in" style={{ justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ 
          fontSize: '36px', 
          marginBottom: '16px',
          color: 'var(--primary-color)',
          fontWeight: '900'
        }}>Bondhu</h1>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-color)' }}>Create Account</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '300px', margin: '0 auto' }}>
          Join Bondhu today and start connecting with people around you.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <div style={{ 
            background: '#FFF0F3', 
            color: '#FF385C', 
            padding: '16px', 
            borderRadius: '16px', 
            fontSize: '14px',
            border: '1px solid #FFE0E6',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ position: 'relative' }}>
          <User size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0', zIndex: 1 }} />
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={{ paddingLeft: '54px', height: '60px' }}
            required
          />
        </div>

        <div style={{ position: 'relative' }}>
          <Phone size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0', zIndex: 1 }} />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            style={{ paddingLeft: '54px', height: '60px' }}
            required
          />
        </div>

        <div style={{ position: 'relative' }}>
          <Lock size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0', zIndex: 1 }} />
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Create Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ paddingLeft: '54px', paddingRight: '54px', height: '60px' }}
            required
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            style={{ 
              position: 'absolute', 
              right: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              background: 'none', 
              padding: '10px',
              color: '#B0B0B0'
            }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          style={{ marginTop: '12px', height: '60px', fontSize: '18px' }}
          disabled={loading}
        >
          {loading ? 'Creating account...' : <><UserPlus size={22} /> Sign Up</>}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Already have an account? <Link to="/login" style={{ 
            color: 'var(--primary-color)', 
            fontWeight: '800', 
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: '6px'
          }}>Log in <ArrowRight size={14} /></Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
