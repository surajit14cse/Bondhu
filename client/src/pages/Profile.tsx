import { useState, useEffect } from 'react';
import { Camera, Save, X, LogOut, Settings, Shield, HelpCircle, ChevronRight, AlertCircle, RefreshCw, Star, CreditCard, Bell, Edit3, Video } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    bio: '',
    gender: '',
    interests: [] as string[],
    images: [] as string[],
  });
  const [newInterest, setNewInterest] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const { data } = await axios.get('http://localhost:5000/api/profile/me', {
        headers: { Authorization: token }
      });
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        age: data.age || '',
        bio: data.bio || '',
        gender: data.gender || '',
        interests: data.interests || [],
        images: data.images || [],
      });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/profile/update', formData, {
        headers: { Authorization: token }
      });
      setMessage('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletion = () => {
    const fields = ['name', 'age', 'bio', 'gender', 'phone'];
    let filled = fields.filter(f => formData[f as keyof typeof formData]).length;
    if (formData.interests.length > 0) filled++;
    if (formData.images.length > 0) filled++;
    return Math.round((filled / 7) * 100);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const handleMenuClick = (label: string) => {
    setMessage(`${label} feature coming soon!`);
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading) return (
    <div className="container" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', minHeight: '80vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #F3F3F3', borderTop: '4px solid #E61E4D', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#999', fontWeight: '600' }}>Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="container fade-in" style={{ padding: '0 0 140px', background: '#F7F8FA', minHeight: '100vh' }}>
      <div style={{ background: 'white', padding: '24px 24px 32px', borderRadius: '0 0 32px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{ fontSize: '28px', margin: 0 }}>My Profile</h1>
          <button onClick={handleLogout} style={{ background: '#F5F5F7', padding: '12px', borderRadius: '14px', color: '#666' }}>
            <LogOut size={20} />
          </button>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '40px', overflow: 'hidden', border: '4px solid white', boxShadow: 'var(--shadow-lg)' }}>
              <img 
                src={formData.images[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <button style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--primary-gradient)', border: '3px solid white', borderRadius: '14px', width: '40px', height: '40px', padding: 0 }}>
              <Camera size={18} color="white" />
            </button>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '4px' }}>{formData.name}</h2>
          <p style={{ color: '#999', fontSize: '15px', fontWeight: '600' }}>{formData.phone || formData.email}</p>
          
          <div style={{ width: '100%', marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#666' }}>PROFILE COMPLETION</span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary-color)' }}>{calculateCompletion()}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#F0F0F0', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${calculateCompletion()}%` }}
                style={{ height: '100%', background: 'var(--primary-gradient)' }}
              />
            </div>
          </div>

          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn-primary" 
              style={{ marginTop: '24px', width: '100%', height: '56px', borderRadius: '16px' }}
            >
              <Edit3 size={20} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <AnimatePresence>
          {isEditing && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '20px', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Update Profile</h3>
                <button onClick={() => setIsEditing(false)} style={{ background: 'none', padding: 0 }}><X size={20} color="#999" /></button>
              </div>
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#999', marginBottom: '8px', display: 'block' }}>AGE</label>
                    <input 
                      type="number" 
                      value={formData.age} 
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="22"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#999', marginBottom: '8px', display: 'block' }}>GENDER</label>
                    <select 
                      value={formData.gender} 
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#999', marginBottom: '8px', display: 'block' }}>PHONE</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Your phone number"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#999', marginBottom: '8px', display: 'block' }}>BIO</label>
                  <textarea 
                    rows={3}
                    value={formData.bio} 
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell people about yourself..."
                    style={{ borderRadius: '16px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#999', marginBottom: '12px', display: 'block' }}>INTERESTS</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {formData.interests.map(tag => (
                      <span key={tag} style={{ background: '#F5F5F7', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#555' }}>
                        {tag} <X size={14} style={{ cursor: 'pointer', color: '#BBB' }} onClick={() => setFormData({...formData, interests: formData.interests.filter(i => i !== tag)})} />
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add interest..."
                      style={{ flex: 1, borderRadius: '12px' }}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    />
                    <button type="button" onClick={addInterest} className="btn-secondary" style={{ borderRadius: '12px', padding: '0 16px' }}>Add</button>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ height: '56px', borderRadius: '16px' }} disabled={saving}>
                  {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
              </form>
            </motion.section>
          )}
        </AnimatePresence>

        <section style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {[
            { icon: Star, label: 'Get Premium', color: '#FFB800', bg: '#FFF9E6' },
            { icon: Bell, label: 'Notifications', color: '#FF385C', bg: '#FFF0F3' },
            { icon: Shield, label: 'Safety & Privacy', color: '#00A699', bg: '#E6F6F5' },
            { icon: Settings, label: 'Settings', color: '#666', bg: '#F5F5F7' },
            { icon: HelpCircle, label: 'Help Center', color: '#3b82f6', bg: '#EBF2FF' }
          ].map((item, i) => (
            <div 
              key={i} 
              onClick={() => handleMenuClick(item.label)}
              style={{ 
                padding: '18px 20px', 
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                borderBottom: i === 4 ? 'none' : '1px solid #F5F5F7'
              }}
            >
              <div style={{ background: item.bg, padding: '10px', borderRadius: '12px' }}>
                <item.icon size={20} color={item.color} />
              </div>
              <span style={{ flex: 1, fontWeight: '700', fontSize: '16px' }}>{item.label}</span>
              <ChevronRight size={18} color="#DDD" />
            </div>
          ))}
        </section>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }} 
            style={{ 
              position: 'fixed', 
              bottom: '120px', 
              left: '20px', 
              right: '20px', 
              background: '#333', 
              color: 'white', 
              padding: '16px', 
              borderRadius: '16px', 
              textAlign: 'center', 
              fontWeight: '600', 
              boxShadow: 'var(--shadow-lg)',
              zIndex: 3000
            }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Profile;
