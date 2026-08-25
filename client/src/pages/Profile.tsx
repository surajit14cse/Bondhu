import { useState, useEffect } from 'react';
import { Camera, Save, X, LogOut, Settings, Shield, HelpCircle, ChevronRight, Star, Bell, Edit3 } from 'lucide-react';
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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
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
    setActiveModal(label);
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
    <div className="container fade-in" style={{ padding: '0 0 120px', background: '#F7F8FA', minHeight: '100vh' }}>
      {/* Top Header Card */}
      <div style={{ background: 'white', padding: '24px 20px 28px', borderRadius: '0 0 32px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '16px' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ fontSize: '26px', margin: 0 }}>My Profile</h1>
          <button onClick={handleLogout} style={{ background: '#F5F5F7', padding: '10px', borderRadius: '12px', color: '#666' }} title="Log out">
            <LogOut size={18} />
          </button>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '32px', overflow: 'hidden', border: '3px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
              <img 
                src={formData.images[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <input 
              type="file" 
              id="photo-upload" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const base64String = await compressImage(file);
                  const updatedImages = [base64String, ...formData.images.slice(1)];
                  setFormData(prev => ({ ...prev, images: updatedImages }));
                  
                  try {
                    const token = localStorage.getItem('token');
                    await axios.put('http://localhost:5000/api/profile/update', { images: updatedImages }, {
                      headers: { Authorization: token }
                    });
                    setMessage('Profile photo updated!');
                    setTimeout(() => setMessage(''), 3000);
                  } catch (err) {
                    console.error(err);
                  }
                }
              }}
            />
            <button 
              onClick={() => document.getElementById('photo-upload')?.click()}
              style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--primary-gradient)', border: '3px solid white', borderRadius: '14px', width: '40px', height: '40px', padding: 0, cursor: 'pointer' }}
              title="Change Profile Photo"
            >
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
              style={{ marginTop: '20px', width: '100%', height: '52px', borderRadius: '16px' }}
            >
              <Edit3 size={20} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <AnimatePresence>
          {isEditing && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '16px', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Update Profile</h3>
                <button onClick={() => setIsEditing(false)} style={{ background: 'none', padding: 0 }}><X size={20} color="#999" /></button>
              </div>
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#999', marginBottom: '8px', display: 'block' }}>PHOTOS</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                    {[0, 1, 2].map((index) => (
                      <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', background: '#F5F5F7', border: '1px dashed #DDD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {formData.images[index] ? (
                          <>
                            <img src={formData.images[index]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button 
                              type="button" 
                              onClick={() => {
                                const newImgs = formData.images.filter((_, i) => i !== index);
                                setFormData({ ...formData, images: newImgs });
                              }}
                              style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', padding: 0, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#AAA' }}>
                            <Camera size={20} />
                            <span style={{ fontSize: '11px', fontWeight: '600' }}>Add</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const base64 = await compressImage(file);
                                  const newImgs = [...formData.images];
                                  newImgs[index] = base64;
                                  setFormData({ ...formData, images: newImgs });
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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
      <section style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: '20px' }}>
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
        {activeModal && (
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
              background: 'rgba(0,0,0,0.6)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center'
            }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                background: 'white',
                width: '100%',
                maxWidth: '480px',
                borderTopLeftRadius: '32px',
                borderTopRightRadius: '32px',
                padding: '28px 24px 40px',
                maxHeight: '85vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', margin: 0 }}>{activeModal}</h2>
                <button onClick={() => setActiveModal(null)} style={{ background: '#F5F5F7', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={20} color="#666" />
                </button>
              </div>

              {activeModal === 'Get Premium' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE899 100%)', padding: '24px', borderRadius: '24px', marginBottom: '24px' }}>
                    <Star size={48} color="#FFB800" fill="#FFB800" style={{ marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '20px', color: '#B38200', marginBottom: '8px' }}>Bondhu Gold</h3>
                    <p style={{ color: '#805C00', fontSize: '14px' }}>Unlock unlimited swipes, profile boosts, and see who liked you!</p>
                  </div>
                  <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0, marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: '600' }}>⚡ Unlimited Swipes & Undo</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: '600' }}>👀 See Who Liked Your Profile</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: '600' }}>🚀 1 Free Profile Boost per month</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: '600' }}>📍 Passport to swipe anywhere</li>
                  </ul>
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', height: '56px', borderRadius: '16px', fontSize: '16px', background: 'linear-gradient(135deg, #FFB800 0%, #FF8C00 100%)' }}
                    onClick={() => {
                      setMessage('Premium subscription activated!');
                      setActiveModal(null);
                      setTimeout(() => setMessage(''), 3000);
                    }}
                  >
                    Upgrade for ৳499/mo
                  </button>
                </div>
              )}

              {activeModal === 'Notifications' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { title: 'New Matches', desc: 'Notify when someone matches with you' },
                    { title: 'Messages', desc: 'Notify when you receive a message' },
                    { title: 'Super Likes', desc: 'Notify when someone super likes you' },
                    { title: 'App Updates', desc: 'Receive feature announcements' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#F9F9F9', borderRadius: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>{item.title}</div>
                        <div style={{ color: '#888', fontSize: '13px' }}>{item.desc}</div>
                      </div>
                      <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }} />
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'Safety & Privacy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#F9F9F9', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>Incognito Mode</div>
                      <div style={{ color: '#888', fontSize: '13px' }}>Only show profile to people you liked</div>
                    </div>
                    <input type="checkbox" style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }} />
                  </div>
                  <div style={{ padding: '16px', background: '#F9F9F9', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>Screenshot Protection</div>
                      <div style={{ color: '#888', fontSize: '13px' }}>Prevent screenshotting in private chats</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }} />
                  </div>
                  <button className="btn-secondary" style={{ width: '100%', height: '52px', borderRadius: '14px', marginTop: '8px' }}>
                    View Blocked Users
                  </button>
                </div>
              )}

              {activeModal === 'Settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#999', marginBottom: '8px', display: 'block' }}>APP LANGUAGE</label>
                    <select defaultValue="en" style={{ borderRadius: '14px' }}>
                      <option value="en">English</option>
                      <option value="bn">বাংলা (Bengali)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#999', marginBottom: '8px', display: 'block' }}>MAX DISCOVERY DISTANCE</label>
                    <input type="range" min="5" max="100" defaultValue="50" style={{ width: '100%' }} />
                  </div>
                  <button className="btn-secondary" style={{ width: '100%', height: '52px', borderRadius: '14px', color: '#FF385C' }}>
                    Delete Account
                  </button>
                </div>
              )}

              {activeModal === 'Help Center' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#F9F9F9', borderRadius: '16px' }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>How does matching work?</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>When both users swipe right on each other, a match is created!</div>
                  </div>
                  <div style={{ padding: '16px', background: '#F9F9F9', borderRadius: '16px' }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>How to report an abusive user?</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>Tap on user profile options in chat and click 'Report User'.</div>
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', height: '52px', borderRadius: '14px' }}
                    onClick={() => {
                      setMessage('Contact request sent to support team.');
                      setActiveModal(null);
                      setTimeout(() => setMessage(''), 3000);
                    }}
                  >
                    Contact Customer Support
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              zIndex: 3500
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
