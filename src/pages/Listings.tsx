import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isUsingMock, mockSupabase, supabaseReal } from '../config/supabase';
import { bdLocations } from '../data/bd-locations';
import { ListingCard, HouseListing } from '../components/ListingCard';
import { Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';

export const Listings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<HouseListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<HouseListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [division, setDivision] = useState(searchParams.get('division') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [upazila, setUpazila] = useState(searchParams.get('upazila') || '');
  const [maxRent, setMaxRent] = useState(searchParams.get('maxRent') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [hasLift, setHasLift] = useState(searchParams.get('hasLift') === 'true');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        if (isUsingMock) {
          const { data } = await mockSupabase.getListings();
          setListings(data || []);
        } else if (supabaseReal) {
          const { data, error } = await supabaseReal
            .from('listings')
            .select('*')
            .eq('is_available', true)
            .order('created_at', { ascending: false });
          if (!error && data) {
            setListings(data as HouseListing[]);
          }
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...listings];

    if (division) {
      result = result.filter(item => item.division.toLowerCase() === division.toLowerCase());
    }
    if (district) {
      result = result.filter(item => item.district.toLowerCase() === district.toLowerCase());
    }
    if (upazila) {
      result = result.filter(item => item.upazila.toLowerCase() === upazila.toLowerCase());
    }
    if (maxRent) {
      result = result.filter(item => item.rent_amount <= parseInt(maxRent));
    }
    if (bedrooms) {
      result = result.filter(item => item.bedrooms === parseInt(bedrooms));
    }
    if (hasLift) {
      result = result.filter(item => item.amenities.includes('Lift'));
    }

    setFilteredListings(result);
  }, [listings, division, district, upazila, maxRent, bedrooms, hasLift]);

  const handleResetFilters = () => {
    setDivision('');
    setDistrict('');
    setUpazila('');
    setMaxRent('');
    setBedrooms('');
    setHasLift(false);
    setSearchParams({});
  };

  const currentDivisionData = bdLocations[division];
  const districtList = currentDivisionData ? Object.keys(currentDivisionData.districts) : [];
  const currentDistrictData = district && currentDivisionData ? currentDivisionData.districts[district] : null;
  const upazilaList = currentDistrictData ? currentDistrictData.upazilas : [];

  return (
    <div className="app-content fade-in" style={{ paddingBottom: '80px' }}>
      
      {/* 1. Header with Filters Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800' }}>ভাড়া বাসার তালিকা</h2>
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: showFilters ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <SlidersHorizontal size={16} />
          <span>ফিল্টার</span>
        </button>
      </div>

      {/* 2. Collapsible Filters Section */}
      {showFilters && (
        <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-app)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '11px' }}>বিভাগ</label>
              <select className="form-select" style={{ padding: '8px 12px' }} value={division} onChange={(e) => { setDivision(e.target.value); setDistrict(''); setUpazila(''); }}>
                <option value="">সব বিভাগ</option>
                {Object.keys(bdLocations).map(key => (
                  <option key={key} value={key}>{bdLocations[key].nameBn}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '11px' }}>জেলা</label>
              <select className="form-select" style={{ padding: '8px 12px' }} value={district} onChange={(e) => { setDistrict(e.target.value); setUpazila(''); }} disabled={!division}>
                <option value="">সব জেলা</option>
                {districtList.map(key => (
                  <option key={key} value={key}>{bdLocations[division].districts[key].nameBn}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '11px' }}>উপজেলা</label>
              <select className="form-select" style={{ padding: '8px 12px' }} value={upazila} onChange={(e) => setUpazila(e.target.value)} disabled={!district}>
                <option value="">সব উপজেলা</option>
                {upazilaList.map(up => (
                  <option key={up.nameEn} value={up.nameEn}>{up.nameBn}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '11px' }}>বেডরুম সংখ্যা</label>
              <select className="form-select" style={{ padding: '8px 12px' }} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                <option value="">যেকোনো</option>
                <option value="1">১ বেড</option>
                <option value="2">২ বেড</option>
                <option value="3">৩ বেড</option>
                <option value="4">৪+ বেড</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
              <span>সর্বোচ্চ বাজেট (টাকা)</span>
              {maxRent && <span style={{ color: 'var(--primary)', fontWeight: '700' }}>৳{parseInt(maxRent).toLocaleString('bn-BD')}</span>}
            </label>
            <input 
              type="range" 
              min="2000" 
              max="50000" 
              step="1000" 
              value={maxRent || '50000'} 
              onChange={(e) => setMaxRent(e.target.value)}
              style={{ accentColor: 'var(--primary)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="lift" 
              checked={hasLift} 
              onChange={(e) => setHasLift(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="lift" style={{ fontSize: '13px', fontWeight: '500' }}>লিফটের ব্যবস্থা থাকতে হবে</label>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleResetFilters}
            style={{ padding: '8px', fontSize: '12px' }}
          >
            <RefreshCw size={12} />
            <span>সব রিসেট করুন</span>
          </button>
        </div>
      )}

      {/* 3. Listings Grid */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }} className="loading-dots">
          <span></span><span></span><span></span>
        </div>
      ) : filteredListings.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', minHeight: '300px', textAlign: 'center' }}>
          <span style={{ fontSize: '48px' }}>🏚️</span>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>কোনো বাসা পাওয়া যায়নি</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
            আপনার সার্চ ফিল্টারটি পরিবর্তন করুন অথবা অন্য জেলা/উপজেলা সিলেক্ট করুন।
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

    </div>
  );
};
export default Listings;
