import { useState, useEffect } from 'react';
import { Camera, Save, Plus, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    gender: '',
    interests: [] as string[],
    images: [] as string[],
  });
  const [newInterest, setNewInterest] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/profile/me', {
        headers: { Authorization: token }
      });
      setFormData({
        name: data.name || '',
        age: data.age || '',
        bio: data.bio || '',
        gender: data.gender || '',
        interests: data.interests || [],
        images: data.images || [],
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/profile/update', formData, {
        headers: { Authorization: token }
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Update failed.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const removeInterest = (tag: string) => {
    setFormData({ ...formData, interests: formData.interests.filter(i => i !== tag) });
  };

  if (loading) return <div className="container"><h3>Loading...</h3></div>;

  return (
    <div className="container" style={{ paddingBottom: '120px' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center', position: 'relative' }}>
        <button 
          onClick={handleLogout}
          style={{ position: 'absolute', top: 0, right: 0, background: 'none', color: '#666', padding: '10px' }}
        >
          <LogOut size={24} />
        </button>
        <h1 style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Profile</h1>
        <p style={{ color: '#666' }}>Show the world who you are</p>
      </header>

      {message && <p style={{ textAlign: 'center', color: 'green', marginBottom: '20px' }}>{message}</p>}

      {/* Image Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr', gap: '10px', height: '300px', marginBottom: '30px' }}>
        <div className="glass" style={{ gridRow: 'span 2', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', background: '#eee' }}>
          {formData.images[0] ? (
            <img src={formData.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Camera size={40} color="#666" />
          )}
          <button style={{ position: 'absolute', bottom: '10px', right: '10px', width: '40px', height: '40px', padding: 0 }} className="btn-primary"><Plus size={20} /></button>
        </div>
        <div className="glass" style={{ borderRadius: '20px', background: '#eee' }}></div>
        <div className="glass" style={{ borderRadius: '20px', background: '#eee' }}></div>
      </div>

      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Name</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Age</label>
            <input 
              type="number" 
              value={formData.age} 
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Gender</label>
            <select 
              value={formData.gender} 
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Bio</label>
          <textarea 
            rows={4}
            value={formData.bio} 
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', resize: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Interests</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {formData.interests.map(tag => (
              <span key={tag} style={{ background: '#eee', padding: '5px 12px', borderRadius: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {tag} <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeInterest(tag)} />
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add interest..."
              style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #ddd' }}
            />
            <button type="button" onClick={addInterest} className="glass" style={{ padding: '10px 20px' }}>Add</button>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '20px', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Save size={20} /> Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
