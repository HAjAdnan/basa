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
