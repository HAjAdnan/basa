import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isUsingMock, mockSupabase, supabaseReal } from './config/supabase';

// Pages
import { Home } from './pages/Home';
import { Listings } from './pages/Listings';
import { ListingDetails } from './pages/ListingDetails';
import { CreateListing } from './pages/CreateListing';
import { ChatList } from './pages/ChatList';
import { ChatWindow } from './pages/ChatWindow';
import { Profile } from './pages/Profile';

// Components
import { Navigation } from './components/Navigation';
import { Bell, User, MessageCircle } from 'lucide-react';
import './index.css';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [serverVersion, setServerVersion] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');

  const CURRENT_VERSION = '1.0.0';

  // Check for app updates
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`);
        if (!response.ok) return;
        const data = await response.json();
        if (data && data.version && data.version !== CURRENT_VERSION) {
          const updatedVersion = localStorage.getItem('updated_to_version');
          if (updatedVersion === data.version) {
            return;
          }
          const dismissedVersion = sessionStorage.getItem('dismissed_version');
          if (dismissedVersion !== data.version) {
            setServerVersion(data.version);
            setReleaseNotes(data.releaseNotes || 'নতুন উন্নত ডিজাইন এবং স্পিড যুক্ত করা হয়েছে।');
            setShowUpdateModal(true);
          }
        }
      } catch (err) {
        console.error('Error checking version:', err);
      }
    };
    checkVersion();
  }, []);

  const handleUpdateApp = () => {
    if (serverVersion) {
      localStorage.setItem('updated_to_version', serverVersion);
    }
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (let name of names) caches.delete(name);
      });
    }
    window.location.href = window.location.origin + '/?cache_bypass=' + Date.now();
  };

  const handleSkipUpdate = () => {
    if (serverVersion) {
      sessionStorage.setItem('dismissed_version', serverVersion);
    }
    setShowUpdateModal(false);
  };

  // Fetch unread notifications count
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      if (isUsingMock) {
        const { data } = await mockSupabase.getNotifications(user.id);
        const unread = (data || []).filter((n: any) => !n.is_read).length;
        setUnreadNotifications(unread);
      } else if (supabaseReal) {
        const { data } = await supabaseReal
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_read', false);
        setUnreadNotifications(data ? data.length : 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    let unsubscribe: () => void = () => {};

    if (user) {
      if (isUsingMock) {
        unsubscribe = mockSupabase.subscribeNotifications(() => {
          fetchNotifications();
        });
      } else if (supabaseReal) {
        const client = supabaseReal;
        const channel = client
          .channel(`notifications-${user.id}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
            () => {
              fetchNotifications();
            }
          )
          .subscribe();
        unsubscribe = () => {
          client.removeChannel(channel);
        };
      }
    }

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Determine if header/footer should show (e.g. hide bottom nav inside chat windows)
  const isChatRoom = location.pathname.startsWith('/chats/');

  return (
    <>
      {/* Dynamic Header */}
      {!isChatRoom && (
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <span style={{ fontSize: '22px' }}>🏡</span>
            <span style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-title)', color: 'var(--primary)', letterSpacing: '-0.5px' }}>
              বাসা ফাইন্ডার
            </span>
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div 
                onClick={() => navigate('/profile')} 
                style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: 'var(--danger)',
                    color: 'white',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    borderRadius: '50%',
                    width: '14px',
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadNotifications}
                  </span>
                )}
              </div>
              <img 
                src={user.avatar_url} 
                alt="Avatar" 
                onClick={() => navigate('/profile')} 
                style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--primary)', cursor: 'pointer', backgroundColor: 'var(--bg-input)' }}
              />
            </div>
          )}
        </header>
      )}

      {/* Pages Router Switch */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<ListingDetails />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/chats/:id" element={<ChatWindow />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

      {/* Dynamic Navigation */}
      {!isChatRoom && (
        <Navigation unreadNotifsCount={unreadNotifications} />
      )}

      {/* Modern Update Modal */}
      {showUpdateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '28px 24px',
            width: '100%',
            maxWidth: '340px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
            textAlign: 'center'
          }} className="fade-in">
            <span style={{ fontSize: '48px' }}>🚀</span>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>নতুন আপডেট পাওয়া গিয়েছে!</h3>
              <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                Version {serverVersion}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              {releaseNotes}
            </p>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <button 
                onClick={handleUpdateApp}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 20px',
                  width: '100%',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 157, 88, 0.2)'
                }}
              >
                আপডেট করুন
              </button>
              <button 
                onClick={handleSkipUpdate}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                পরে করব
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
