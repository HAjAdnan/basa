import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Building, Users, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { isUsingMock, mockSupabase, supabaseReal } from '../config/supabase';
import { bdLocations } from '../data/bd-locations';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [stats, setStats] = useState({ listingsCount: 0, usersCount: 0, reviewsCount: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isUsingMock) {
          const { data: listings } = await mockSupabase.getListings();
          const users = JSON.parse(localStorage.getItem('basa_finder_users') || '[]');
          const reviews = JSON.parse(localStorage.getItem('basa_finder_reviews') || '[]');
          setStats({
            listingsCount: (listings || []).length,
            usersCount: Math.max(users.length, 12),
            reviewsCount: Math.max(reviews.length, 8)
          });
        } else if (supabaseReal) {
          const { count: listingsCount } = await supabaseReal.from('listings').select('*', { count: 'exact', head: true });
          const { count: usersCount } = await supabaseReal.from('profiles').select('*', { count: 'exact', head: true });
          const { count: reviewsCount } = await supabaseReal.from('reviews').select('*', { count: 'exact', head: true });
          setStats({
            listingsCount: listingsCount || 0,
            usersCount: usersCount || 0,
            reviewsCount: reviewsCount || 0
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (selectedDivision) queryParams.set('division', selectedDivision);
    if (selectedDistrict) queryParams.set('district', selectedDistrict);
    navigate(`/listings?${queryParams.toString()}`);
  };

  const currentDivisionData = bdLocations[selectedDivision];
  const districtList = currentDivisionData ? Object.keys(currentDivisionData.districts) : [];

  return (
    <div className="app-content fade-in" style={{ paddingBottom: '80px' }}>
      
      {/* 1. Welcoming Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), #11b164)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 20px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(15, 157, 88, 0.25)'
      }}>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, transform: 'scale(1.5)' }}>
          <Building size={160} />
        </div>
        
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>
          বাসা খুঁজুন ঝামেলা ছাড়াই
        </h2>
        <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: '1.4', maxWidth: '80%' }}>
          আপনার বাজেট ও চাহিদামতো বাংলাদেশের যেকোনো প্রান্তের ভাড়া বাসা খুঁজে নিন মাত্র কয়েকটি ক্লিকে।
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: 'var(--radius-full)', width: 'fit-content' }}>
          <ShieldCheck size={14} />
          <span>১০০% নিরাপদ ও সরাসরি চ্যাট সুবিধা</span>
        </div>
      </div>

      {/* 2. Fast Location Search Form */}
      <form onSubmit={handleSearchSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>তাড়াতাড়ি খুঁজুন</h3>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }} className="form-group">
            <select 
              className="form-select" 
              value={selectedDivision} 
              onChange={(e) => { setSelectedDivision(e.target.value); setSelectedDistrict(''); }}
            >
              <option value="">সব বিভাগ</option>
              {Object.keys(bdLocations).map(key => (
                <option key={key} value={key}>{bdLocations[key].nameBn}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }} className="form-group">
            <select 
              className="form-select" 
              value={selectedDistrict} 
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedDivision}
            >
              <option value="">সব জেলা</option>
              {districtList.map(key => (
                <option key={key} value={key}>{bdLocations[selectedDivision].districts[key].nameBn}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>
          <Search size={16} />
          <span>সার্চ করুন</span>
        </button>
      </form>

      {/* 3. Popular Categories Shortcuts */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>জনপ্রিয় ক্যাটাগরি</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <Link to="/listings?bedrooms=1" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '20px' }}>🧔</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>ব্যাচেলর রুম</span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>১ বেডরুম বাসা</span>
            </div>
          </Link>

          <Link to="/listings?maxRent=15000" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>বাজেট বাসা</span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>১৫,০০০৳ এর নিচে</span>
            </div>
          </Link>

          <Link to="/listings?bedrooms=3" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '20px' }}>👨‍👩‍👧‍👦</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>ফ্যামিলি বাসা</span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>৩+ বেডরুম বাসা</span>
            </div>
          </Link>

          <Link to="/listings?hasLift=true" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '20px' }}>🛗</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>লিফট ব্যাকআপ</span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>আধুনিক সুযোগ-সুবিধা</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Real-time Platform Statistics */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-around', padding: '16px 0', borderStyle: 'dashed' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Building size={20} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
          <span style={{ fontWeight: '800', fontSize: '16px' }}>{stats.listingsCount.toLocaleString('bn-BD')}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>মোট বাসা</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', padding: '0 24px' }}>
          <Users size={20} style={{ color: 'var(--secondary)', marginBottom: '4px' }} />
          <span style={{ fontWeight: '800', fontSize: '16px' }}>{stats.usersCount.toLocaleString('bn-BD')}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>সদস্য সংখ্যা</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Star size={20} style={{ color: 'var(--accent)', marginBottom: '4px' }} />
          <span style={{ fontWeight: '800', fontSize: '16px' }}>{stats.reviewsCount.toLocaleString('bn-BD')}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>রিভিউ ও রেটিং</span>
        </div>
      </div>

      {/* 5. CTA banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700' }}>আপনি কি বাসা ভাড়া দিতে চান?</h4>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>কয়েক মিনিটে ছবি ও লোকেশন দিয়ে ফ্রী পোস্ট করুন।</p>
        </div>
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
          <ArrowRight size={18} />
        </Link>
      </div>

    </div>
  );
};
export default Home;
