import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, MessageSquare, Bell, User, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  unreadNotifsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ unreadNotifsCount }) => {
  const { user } = useAuth();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home />
        <span>হোম</span>
      </NavLink>

      <NavLink to="/listings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
        <Search />
        <span>খুঁজুন</span>
      </NavLink>

      {user?.user_type === 'landlord' && (
        <NavLink to="/create-listing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <PlusCircle style={{ color: 'var(--primary)' }} />
          <span style={{ color: 'var(--primary)', fontWeight: '600' }}>পোস্ট করুন</span>
        </NavLink>
      )}

      <NavLink to="/chats" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <MessageSquare />
        <span>চ্যাট</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <User />
          {unreadNotifsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: 'var(--danger)',
              color: 'white',
              fontSize: '9px',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '15px',
              height: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadNotifsCount}
            </span>
          )}
        </div>
        <span>প্রোফাইল</span>
      </NavLink>
    </nav>
  );
};
export default Navigation;
