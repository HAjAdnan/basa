import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BedDouble, Bath, Maximize2, MapPin, Phone, MessageCircle, Calendar, ArrowLeft, Heart, Sparkles } from 'lucide-react';
import { isUsingMock, mockSupabase, supabaseReal } from '../config/supabase';
import { bdLocations } from '../data/bd-locations';
import { HouseListing } from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import { ReviewSection } from '../components/ReviewSection';

export const ListingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<HouseListing | null>(null);
  const [owner, setOwner] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchListingAndOwner = async () => {
      setLoading(true);
      try {
        if (isUsingMock) {
          const { data: listings } = await mockSupabase.getListings();
          const found = listings.find((l: any) => l.id === id);
          if (found) {
            setListing(found);
            // Get owner from local users
            const users = JSON.parse(localStorage.getItem('basa_finder_users') || '[]');
            const foundOwner = users.find((u: any) => u.id === found.owner_id);
            setOwner(foundOwner || {
              id: found.owner_id,
              full_name: 'আরিফ রহমান (মালিক)',
              phone_number: '০১৭১১২২৩৩৪৪',
              avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Arif',
              user_type: 'landlord'
            });
          }
        } else if (supabaseReal) {
          const { data, error } = await supabaseReal
            .from('listings')
            .select('*')
            .eq('id', id)
            .single();
          if (!error && data) {
            setListing(data as HouseListing);
            // Fetch owner profile
            const { data: ownerData } = await supabaseReal
              .from('profiles')
              .select('*')
              .eq('id', data.owner_id)
              .single();
            setOwner(ownerData);
          }
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListingAndOwner();
  }, [id]);

  const handleContactLandlord = async () => {
    if (!user) {
      alert('মালিকের সাথে চ্যাট করতে প্রথমে লগইন করুন!');
      navigate('/profile');
      return;
    }
    if (user.id === listing?.owner_id) {
      alert('এটি আপনার নিজেরই টিউন করা বাসা!');
      return;
    }
    try {
      if (isUsingMock) {
        const { data } = await mockSupabase.createConversation(
          listing!.id,
          listing!.owner_id,
          user.id
        );
        navigate(`/chats/${data.id}`);
      } else if (supabaseReal) {
        const { data, error } = await supabaseReal
          .from('conversations')
          .insert([{
            listing_id: listing!.id,
            landlord_id: listing!.owner_id,
            tenant_id: user.id
          }])
          .select()
          .single();
        
        if (error && error.code === '23505') { // Unique constraint violation (already exists)
          const { data: existing } = await supabaseReal
            .from('conversations')
            .select('*')
            .eq('listing_id', listing!.id)
            .eq('landlord_id', listing!.owner_id)
            .eq('tenant_id', user.id)
            .single();
          navigate(`/chats/${existing.id}`);
        } else if (!error && data) {
          navigate(`/chats/${data.id}`);
        }
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }} className="loading-dots">
        <span></span><span></span><span></span>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="app-content" style={{ textAlign: 'center', marginTop: '40px' }}>
        <p>বাসাটি খুঁজে পাওয়া যায়নি!</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>ফিরে যান</button>
      </div>
    );
  }

  const divisionName = bdLocations[listing.division]?.nameBn || listing.division;
  const districtName = bdLocations[listing.division]?.districts[listing.district]?.nameBn || listing.district;

  return (
    <div className="app-content fade-in" style={{ padding: '0 0 100px 0', overflowX: 'hidden' }}>
      
      {/* 1. Header Navigation & Saved Button */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={() => setIsSaved(!isSaved)} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', color: isSaved ? 'var(--danger)' : 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Heart size={20} fill={isSaved ? 'var(--danger)' : 'none'} />
        </button>
      </div>

      {/* 2. Image Carousel (Gallery) */}
      <div style={{ width: '100%', height: '260px', overflow: 'hidden', backgroundColor: 'var(--bg-input)', position: 'relative' }}>
        <img 
          src={listing.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'} 
          alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: 'var(--primary)',
          color: 'white',
          fontWeight: '800',
          fontSize: '18px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-md)'
        }}>
          ৳{listing.rent_amount.toLocaleString('bn-BD')} <span style={{ fontSize: '11px', fontWeight: '400' }}>/মাস</span>
        </div>
      </div>

      {/* 3. Primary Info Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Title & Date */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--primary)', fontWeight: '600', marginBottom: '8px' }}>
            <MapPin size={14} />
            <span>{listing.village_area}, {listing.upazila}, {districtName}</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', lineHeight: '1.4' }}>{listing.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            <Calendar size={12} />
            <span>পোস্ট করা হয়েছে: {new Date(listing.created_at).toLocaleDateString('bn-BD')}</span>
          </div>
        </div>

        {/* Room Metrics Bar */}
        <div style={{ display: 'flex', gap: '1px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <BedDouble size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>বেডরুম</span>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>{listing.bedrooms} টি</span>
          </div>
          <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <Bath size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>বাথরুম</span>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>{listing.bathrooms} টি</span>
          </div>
          <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <Maximize2 size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>আকার</span>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>{listing.size_sqft || '---'} স্কয়ারফিট</span>
          </div>
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700' }}>বিস্তারিত বিবরণ</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {listing.description}
          </p>
        </div>

        {/* Amenities List */}
        {listing.amenities && listing.amenities.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>অন্যান্য সুবিধা</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {listing.amenities.map(amenity => (
                <span key={amenity} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}>
                  <Sparkles size={10} />
                  {amenity === 'Gas' ? 'গ্যাস কানেকশন' :
                   amenity === 'Water' ? '২৪ ঘণ্টা পানি' :
                   amenity === 'Lift' ? 'লিফট ব্যাকআপ' :
                   amenity === 'Generator' ? 'জেনারেটর' :
                   amenity === 'Wifi' ? 'ওয়াইফাই' :
                   amenity === 'Parking' ? 'পার্কিং স্পেস' : amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Owner Details Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
          <img 
            src={owner?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Owner'} 
            alt="Owner Avatar" 
            style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-input)' }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>{owner?.full_name}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>বাসার মালিক (Landlord)</span>
          </div>
          {owner?.phone_number && (
            <a 
              href={`tel:${owner.phone_number}`}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none'
              }}
            >
              <Phone size={18} />
            </a>
          )}
        </div>

        {/* Reviews Section */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>মালিকের রেটিং ও রিভিউ</h3>
          {owner && (
            <ReviewSection revieweeId={owner.id} listingId={listing.id} />
          )}
        </div>

      </div>

      {/* 4. Bottom Sticky Action Panel */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(var(--bg-card), 0.9)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-color)',
        padding: '12px 16px calc(12px + var(--safe-area-bottom)) 16px',
        display: 'flex',
        gap: '12px',
        zIndex: 100
      }}>
        {owner?.phone_number && (
          <a 
            href={`tel:${owner.phone_number}`} 
            className="btn btn-secondary" 
            style={{ flex: 1, borderRadius: 'var(--radius-md)', padding: '12px' }}
          >
            <Phone size={16} />
            <span>কল করুন</span>
          </a>
        )}
        <button 
          onClick={handleContactLandlord} 
          className="btn btn-primary" 
          style={{ flex: owner?.phone_number ? 2 : 1, borderRadius: 'var(--radius-md)', padding: '12px' }}
        >
          <MessageCircle size={16} />
          <span>মেসেজ দিন (চ্যাট)</span>
        </button>
      </div>

    </div>
  );
};
export default ListingDetails;
