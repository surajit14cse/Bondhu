import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = ({ setUser }: { setUser: any }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/signup', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      setUser(data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '3rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Join Bondhu</h1>
        <p style={{ color: '#666' }}>Create your profile to start matching</p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '15px', borderRadius: '15px', border: '1px solid #ddd', fontSize: '1rem' }}
          required
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '15px', borderRadius: '15px', border: '1px solid #ddd', fontSize: '1rem' }}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '15px', borderRadius: '15px', border: '1px solid #ddd', fontSize: '1rem' }}
          required
        />
        <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '15px' }}>Create Account</button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Already have an account? <Link to="/login" style={{ color: '#ff512f', fontWeight: 'bold', textDecoration: 'none' }}>Login</Link>
      </p>
    </div>
  );
};

export default Signup;
