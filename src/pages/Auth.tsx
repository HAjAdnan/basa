import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, UserCheck, Mail, Phone, User, Key } from 'lucide-react';

export const Auth: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'landlord' | 'tenant'>('tenant');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, fullName, phone, userType);
      } else {
        await signIn(email);
      }
    } catch (err: any) {
      alert(err.message || 'অথেন্টিকেশন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-content fade-in" style={{ justifyContent: 'center', height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px', marginBottom: '24px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, var(--primary), #11b164)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px var(--primary-glow)'
        }}>
          <Home size={32} color="white" />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>
          বাসা ফাইন্ডার
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          সহজে বাসা খুঁজুন এবং সরাসরি মালিকদের সাথে যোগাযোগ করুন
        </p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
          <button
            onClick={() => setIsSignUp(false)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              padding: '12px',
              fontWeight: '600',
              fontSize: '15px',
              color: !isSignUp ? 'var(--primary)' : 'var(--text-tertiary)',
              borderBottom: !isSignUp ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer'
            }}
          >
            লগইন করুন
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              padding: '12px',
              fontWeight: '600',
              fontSize: '15px',
              color: isSignUp ? 'var(--primary)' : 'var(--text-tertiary)',
              borderBottom: isSignUp ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer'
            }}
          >
            অ্যাকাউন্ট খুলুন
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* User Type Selection (only during Signup) */}
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">আমি একজন:</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setUserType('tenant')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: userType === 'tenant' ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: userType === 'tenant' ? 'var(--primary-light)' : 'var(--bg-app)',
                    color: userType === 'tenant' ? 'var(--primary)' : 'var(--text-primary)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <User size={20} />
                  <span>ভাড়াটিয়া (Tenant)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('landlord')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: userType === 'landlord' ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: userType === 'landlord' ? 'var(--primary-light)' : 'var(--bg-app)',
                    color: userType === 'landlord' ? 'var(--primary)' : 'var(--text-primary)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <UserCheck size={20} />
                  <span>মালিক (Landlord)</span>
                </button>
              </div>
            </div>
          )}

          {/* Full Name (only during Signup) */}
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">পূর্ণ নাম *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="উদাঃ আদনান চৌধুরী"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-tertiary)' }} />
              </div>
            </div>
          )}

          {/* Phone (only during Signup) */}
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">মোবাইল নম্বর *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="উদাঃ ০১৭xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <Phone size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-tertiary)' }} />
              </div>
            </div>
          )}

          {/* Email (Always needed) */}
          <div className="form-group">
            <label className="form-label">ইমেইল ঠিকানা *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="উদাঃ user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-tertiary)' }} />
            </div>
          </div>

          {/* Submit button */}
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
            {loading ? (
              <span className="loading-dots"><span></span><span></span><span></span></span>
            ) : (
              <span>{isSignUp ? 'রেজিস্ট্রেশন করুন' : 'লগইন করুন'}</span>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
export default Auth;
