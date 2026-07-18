import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isUsingMock, mockSupabase, supabaseReal } from '../config/supabase';
import { Auth } from './Auth';
import { LogOut, Phone, Mail, User, ShieldAlert, Award, Star, Trash2 } from 'lucide-react';
import { HouseListing } from '../components/ListingCard';

export const Profile: React.FC = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [myListings, setMyListings] = useState<HouseListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchMyData = async () => {
      setLoadingListings(true);
      try {
        if (isUsingMock) {
          const { data: listings } = await mockSupabase.getListings();
          setMyListings(listings.filter((l: any) => l.owner_id === user.id));

          // Fetch reviews on this user
          const { data: revs } = await mockSupabase.getReviews(user.id);
          setReviews(revs || []);
        } else if (supabaseReal) {
          // Fetch owned listings
          const { data: listings } = await supabaseReal
            .from('listings')
            .select('*')
            .eq('owner_id', user.id);
          setMyListings((listings as HouseListing[]) || []);

          // Fetch owned reviews
          const { data: revs } = await supabaseReal
            .from('reviews')
            .select('*')
            .eq('reviewee_id', user.id);
          setReviews(revs || []);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoadingListings(false);
      }
    };

    fetchMyData();
  }, [user]);

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই বাসাটি বিজ্ঞাপন তালিকা থেকে মুছে ফেলতে চান?')) return;
    try {
      if (isUsingMock) {
        const listings = JSON.parse(localStorage.getItem('basa_finder_listings') || '[]');
        const updated = listings.filter((l: any) => l.id !== listingId);
        localStorage.setItem('basa_finder_listings', JSON.stringify(updated));
        setMyListings(prev => prev.filter(l => l.id !== listingId));
      } else if (supabaseReal) {
        const { error } = await supabaseReal.from('listings').delete().eq('id', listingId);
        if (error) throw error;
        setMyListings(prev => prev.filter(l => l.id !== listingId));
      }
      alert('সফলভাবে মুছে ফেলা হয়েছে!');
    } catch (err) {
      alert('বিজ্ঞাপনটি মুছতে ত্রুটি হয়েছে');
    }
  };

  if (authLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }} className="loading-dots">
        <span></span><span></span><span></span>
      </div>
    );
  }

  // Not logged in: Redirect to authentication interface
  if (!user) {
    return <Auth />;
  }

  // Calculate Average Rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '০.০';

  return (
    <div className="app-content fade-in" style={{ paddingBottom: '100px' }}>
      
      {/* 1. Header Profile details */}
      <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', position: 'relative' }}>
        <img 
          src={user.avatar_url} 
          alt="User Profile" 
          style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', padding: '4px', border: '2px solid var(--primary)' }}
        />
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{user.full_name}</h2>
          <span className={`badge ${user.user_type === 'landlord' ? 'badge-primary' : 'badge-secondary'}`} style={{ marginTop: '4px' }}>
            {user.user_type === 'landlord' ? 'বাসার মালিক (Landlord)' : 'ভাড়াটিয়া (Tenant)'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={14} style={{ color: 'var(--primary)' }} />
            <span>{user.phone_number}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={14} style={{ color: 'var(--primary)' }} />
            <span>{user.email}</span>
          </div>
        </div>
      </div>

      {/* 2. Owner listings list or tenant statistics */}
      {user.user_type === 'landlord' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700' }}>আপনার টিউন করা বাসাগুলো ({myListings.length})</h3>
          
          {loadingListings ? (
            <div className="loading-dots" style={{ textAlign: 'center', padding: '20px' }}>
              <span></span><span></span><span></span>
            </div>
          ) : myListings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
              আপনি এখনো কোনো বাসার বিজ্ঞাপন পোস্ট করেননি।
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myListings.map(listing => (
                <div key={listing.id} className="card fade-in" style={{ display: 'flex', gap: '12px', padding: '10px', alignItems: 'center' }}>
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title} 
                    style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {listing.title}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>
                      ভাড়া: ৳{listing.rent_amount.toLocaleString('bn-BD')}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteListing(listing.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      padding: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Landlord Rating stats */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--accent-light)', borderColor: 'rgba(244, 180, 0, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={20} fill="var(--accent)" color="var(--accent)" />
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700' }}>আপনার মালিক রেটিং</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ভাড়াটিয়াদের মূল্যায়নের গড় স্কোর</p>
              </div>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {avgRating} / ৫
            </span>
          </div>
        </div>
      ) : (
        // Tenant view
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>নিরাপদ বাসা চুক্তির নির্দেশনাবলী:</h4>
            <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>যেকোনো আর্থিক লেনদেনের পূর্বে বাসাটি সশরীরে পরিদর্শন করুন।</li>
              <li>মালিকের জাতীয় পরিচয়পত্র ও মালিকানা সংক্রান্ত তথ্য যাচাই করে নিন।</li>
              <li>বাসা চ্যাট ফিচারের মাধ্যমে আপনার প্রয়োজনীয় চুক্তিপত্র নিয়ে আলোচনা শেষ করুন।</li>
              <li>বাসা ভাড়া নেওয়া শেষে মালিকের আচরণ এবং বাসার বিবরণ নিয়ে রেটিং দিতে ভুলবেন না।</li>
            </ul>
          </div>
          
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-light)', borderColor: 'var(--primary-glow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} style={{ color: 'var(--primary)' }} />
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700' }}>ভাড়াটিয়া প্রোফাইল ভেরিফাইড</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>আপনি যেকোনো মালিককে মেসেজ পাঠাতে পারেন</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Log Out Action Button */}
      <button 
        onClick={signOut} 
        className="btn btn-secondary" 
        style={{ display: 'flex', gap: '8px', padding: '12px', marginTop: '12px', color: 'var(--danger)', borderColor: 'rgba(234, 67, 53, 0.2)', backgroundColor: 'var(--danger-light)' }}
      >
        <LogOut size={16} />
        <span>লগআউট করুন</span>
      </button>

    </div>
  );
};
export default Profile;
