import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = ({ setUser }: { setUser: any }) => {
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
      // Login with phone and password
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { phone, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      setUser(data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in" style={{ justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <h1 style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          color: 'var(--primary-color)',
          fontWeight: '900',
          letterSpacing: '-2px'
        }}>Bondhu</h1>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-color)' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Log in to your account</p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            placeholder="Password" 
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
          {loading ? 'Logging in...' : <><LogIn size={22} /> Sign In</>}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          New to Bondhu? <Link to="/signup" style={{ 
            color: 'var(--primary-color)', 
            fontWeight: '800', 
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: '6px'
          }}>Create account <ArrowRight size={14} /></Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
