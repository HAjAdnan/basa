import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isUsingMock, mockSupabase, supabaseReal } from '../config/supabase';
import { LocationSelector } from '../components/LocationSelector';
import { Plus, X, UploadCloud, Info } from 'lucide-react';

export const CreateListing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [size, setSize] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Location Selector values
  const [location, setLocation] = useState({
    division: '',
    district: '',
    upazila: '',
    villageArea: '',
    latitude: 23.8103,
    longitude: 90.4125
  });

  const handleAmenityToggle = (val: string) => {
    setAmenities(prev => 
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleAddImageUrl = () => {
    if (imageInput.trim()) {
      setImages(prev => [...prev, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('টিউন করতে প্রথমে লগইন করুন!');
      navigate('/profile');
      return;
    }
    if (!location.division || !location.district || !location.upazila || !location.villageArea) {
      alert('অনুগ্রহ করে বিভাগ, জেলা, উপজেলা এবং এলাকার নাম দিন!');
      return;
    }
    setSubmitting(true);

    try {
      // Auto-assign sample image if empty
      const finalImages = images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'
      ];

      const listingData = {
        owner_id: user.id,
        title,
        description,
        rent_amount: parseFloat(rent),
        division: location.division,
        district: location.district,
        upazila: location.upazila,
        village_area: location.villageArea,
        latitude: location.latitude,
        longitude: location.longitude,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        size_sqft: size ? parseInt(size) : null,
        amenities,
        images: finalImages,
        is_available: true
      };

      if (isUsingMock) {
        await mockSupabase.createListing(listingData);
      } else if (supabaseReal) {
        const { error } = await supabaseReal.from('listings').insert([listingData]);
        if (error) throw error;
      }

      alert('আপনার বাসা ভাড়া বিজ্ঞাপনটি সফলভাবে টিউন করা হয়েছে!');
      navigate('/listings');
    } catch (err: any) {
      alert(err.message || 'বিজ্ঞাপন পোস্ট করতে ত্রুটি দেখা দিয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const amenityOptions = ['Gas', 'Water', 'Lift', 'Generator', 'Wifi', 'Parking'];

  return (
    <div className="app-content fade-in" style={{ paddingBottom: '100px' }}>
      
      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>বাসার বিজ্ঞাপন দিন</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>সঠিক তথ্য দিয়ে দ্রুত ভাড়াটিয়া খুঁজে নিন</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Section 1: Core Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>বাসার সাধারণ বিবরণ</h3>
          
          <div className="form-group">
            <label className="form-label">বিজ্ঞাপনের শিরোনাম *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="উদাঃ ২ বেডরুমের ফ্যামিলি বাসা ভাড়া হবে" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">বিস্তারিত বিবরণ *</label>
            <textarea 
              className="form-textarea" 
              placeholder="বাসার পরিবেশ, গ্যাস কানেকশন, লিফটের সুবিধা, ভাড়া দেওয়ার শর্তাবলী এবং কোন কোন বিষয়গুলো প্রযোজ্য তা বিস্তারিত লিখুন..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">ভাড়া পরিমাণ (৳/মাস) *</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="১৫০০০" 
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">আকার (স্কয়ার ফিট)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="১২৫০" 
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">বেডরুম সংখ্যা *</label>
              <select className="form-select" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                <option value="1">১ টি</option>
                <option value="2">২ টি</option>
                <option value="3">৩ টি</option>
                <option value="4">৪ টি</option>
                <option value="5">৫+ টি</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">বাথরুম সংখ্যা *</label>
              <select className="form-select" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)}>
                <option value="1">১ টি</option>
                <option value="2">২ টি</option>
                <option value="3">৩ টি</option>
                <option value="4">৪+ টি</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Photos */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>বাসার ছবি যুক্ত করুন</h3>
          
          <div className="form-group">
            <label className="form-label">ছবির URL যুক্ত করুন</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://example.com/image.jpg" 
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
              />
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: 'auto', padding: '12px' }}
                onClick={handleAddImageUrl}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
              {images.map((url, index) => (
                <div key={index} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={url} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: 'var(--text-tertiary)', background: 'var(--bg-app)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <Info size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <span>কোনো ছবি দেওয়া না থাকলে স্বয়ংক্রিয়ভাবে একটি আকর্ষণীয় নমুনা ছবি নিয়ে নেওয়া হবে।</span>
          </div>
        </div>

        {/* Section 3: Location Dropdowns & Map */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>বাসার সঠিক ঠিকানা</h3>
          
          <LocationSelector 
            division={location.division}
            district={location.district}
            upazila={location.upazila}
            villageArea={location.villageArea}
            latitude={location.latitude}
            longitude={location.longitude}
            onChange={(val) => setLocation(val)}
          />
        </div>

        {/* Section 4: Amenities */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>সুযোগ-সুবিধা</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {amenityOptions.map(opt => (
              <div 
                key={opt}
                onClick={() => handleAmenityToggle(opt)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: amenities.includes(opt) ? 'var(--primary)' : 'var(--border-color)',
                  backgroundColor: amenities.includes(opt) ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: amenities.includes(opt) ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '13px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {opt === 'Gas' ? '🔥 গ্যাস সংযোগ' :
                 opt === 'Water' ? '💧 ২৪ ঘণ্টা পানি' :
                 opt === 'Lift' ? '🛗 লিফট ব্যাকআপ' :
                 opt === 'Generator' ? '⚡ জেনারেটর' :
                 opt === 'Wifi' ? '📶 ওয়াইফাই' :
                 opt === 'Parking' ? '🚗 পার্কিং এরিয়া' : opt}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={submitting} 
          style={{ padding: '14px', borderRadius: 'var(--radius-md)' }}
        >
          {submitting ? (
            <span className="loading-dots"><span></span><span></span><span></span></span>
          ) : (
            <span>বিজ্ঞাপনটি টিউন করুন</span>
          )}
        </button>

      </form>
    </div>
  );
};
export default CreateListing;
