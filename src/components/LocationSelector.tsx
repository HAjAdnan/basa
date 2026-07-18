import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { bdLocations } from '../data/bd-locations';
import { MapPin, Globe } from 'lucide-react';

interface LocationSelectorProps {
  division: string;
  district: string;
  upazila: string;
  villageArea: string;
  latitude: number;
  longitude: number;
  onChange: (data: {
    division: string;
    district: string;
    upazila: string;
    villageArea: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  division,
  district,
  upazila,
  villageArea,
  latitude,
  longitude,
  onChange,
}) => {
  const [selectedDivision, setSelectedDivision] = useState(division);
  const [selectedDistrict, setSelectedDistrict] = useState(district);
  const [selectedUpazila, setSelectedUpazila] = useState(upazila);
  const [localVillage, setLocalVillage] = useState(villageArea);
  const [markerPosition, setMarkerPosition] = useState({ lat: latitude, lng: longitude });

  // Default center: Dhaka coordinates
  const mapCenter = { lat: 23.8103, lng: 90.4125 };

  // Google Maps Loader
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
  });

  // Keep internal state updated when props change
  useEffect(() => {
    setSelectedDivision(division);
    setSelectedDistrict(district);
    setSelectedUpazila(upazila);
    setLocalVillage(villageArea);
    setMarkerPosition({ lat: latitude, lng: longitude });
  }, [division, district, upazila, villageArea, latitude, longitude]);

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDivision(val);
    setSelectedDistrict('');
    setSelectedUpazila('');
    onChange({
      division: val,
      district: '',
      upazila: '',
      villageArea: localVillage,
      latitude: markerPosition.lat,
      longitude: markerPosition.lng,
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDistrict(val);
    setSelectedUpazila('');
    onChange({
      division: selectedDivision,
      district: val,
      upazila: '',
      villageArea: localVillage,
      latitude: markerPosition.lat,
      longitude: markerPosition.lng,
    });
  };

  const handleUpazilaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUpazila(val);
    onChange({
      division: selectedDivision,
      district: selectedDistrict,
      upazila: val,
      villageArea: localVillage,
      latitude: markerPosition.lat,
      longitude: markerPosition.lng,
    });
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalVillage(val);
    onChange({
      division: selectedDivision,
      district: selectedDistrict,
      upazila: selectedUpazila,
      villageArea: val,
      latitude: markerPosition.lat,
      longitude: markerPosition.lng,
    });
  };

  const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      onChange({
        division: selectedDivision,
        district: selectedDistrict,
        upazila: selectedUpazila,
        villageArea: localVillage,
        latitude: lat,
        longitude: lng,
      });
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '240px',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    marginTop: '12px',
  };

  // Mock Map interactive visualizer in case Google Maps key is missing
  const renderMockMap = () => {
    return (
      <div style={{
        ...mapContainerStyle,
        background: 'linear-gradient(135deg, #1E1F22, #18191B)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        padding: '20px',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Visual elements mimicking map */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.15,
          backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />
        <Globe size={48} style={{ color: 'var(--primary)', marginBottom: '12px', zIndex: 1 }} />
        <h4 style={{ zIndex: 1, marginBottom: '6px' }}>ম্যাপ মোড: লোকাল সিমুলেশন</h4>
        <p style={{ zIndex: 1, fontSize: '12px', maxWidth: '320px', color: 'var(--text-tertiary)' }}>
          গুগল ম্যাপস API কী সেট করা নেই। আপনি লোকাল ভেরিয়েবল পরিবর্তন করে অবস্থান নির্ধারণ করতে পারেন।
        </p>
        <div style={{ zIndex: 1, display: 'flex', gap: '12px', marginTop: '16px', width: '100%', maxWidth: '300px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>অক্ষাংশ (Lat)</label>
            <input 
              type="number" 
              step="0.0001" 
              value={markerPosition.lat}
              onChange={(e) => {
                const lat = parseFloat(e.target.value) || 23.8103;
                setMarkerPosition(prev => ({ ...prev, lat }));
                onChange({ division: selectedDivision, district: selectedDistrict, upazila: selectedUpazila, villageArea: localVillage, latitude: lat, longitude: markerPosition.lng });
              }}
              style={{ padding: '6px', fontSize: '12px', width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>দ্রাঘিমাংশ (Lng)</label>
            <input 
              type="number" 
              step="0.0001" 
              value={markerPosition.lng}
              onChange={(e) => {
                const lng = parseFloat(e.target.value) || 90.4125;
                setMarkerPosition(prev => ({ ...prev, lng }));
                onChange({ division: selectedDivision, district: selectedDistrict, upazila: selectedUpazila, villageArea: localVillage, latitude: markerPosition.lat, longitude: lng });
              }}
              style={{ padding: '6px', fontSize: '12px', width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px' }}
            />
          </div>
        </div>
      </div>
    );
  };

  const currentDivisionData = bdLocations[selectedDivision];
  const districtList = currentDivisionData ? Object.keys(currentDivisionData.districts) : [];
  const currentDistrictData = selectedDistrict && currentDivisionData ? currentDivisionData.districts[selectedDistrict] : null;
  const upazilaList = currentDistrictData ? currentDistrictData.upazilas : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      
      {/* 1. Division Dropdown */}
      <div className="form-group">
        <label className="form-label">বিভাগ (Division) *</label>
        <select className="form-select" value={selectedDivision} onChange={handleDivisionChange} required>
          <option value="">বিভাগ সিলেক্ট করুন</option>
          {Object.keys(bdLocations).map(key => (
            <option key={key} value={key}>
              {bdLocations[key].nameBn} ({bdLocations[key].nameEn})
            </option>
          ))}
        </select>
      </div>

      {/* 2. District Dropdown */}
      <div className="form-group">
        <label className="form-label">জেলা (District) *</label>
        <select className="form-select" value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedDivision} required>
          <option value="">জেলা সিলেক্ট করুন</option>
          {districtList.map(key => {
            const dist = bdLocations[selectedDivision].districts[key];
            return (
              <option key={key} value={key}>
                {dist.nameBn} ({dist.nameEn})
              </option>
            );
          })}
        </select>
      </div>

      {/* 3. Upazila Dropdown */}
      <div className="form-group">
        <label className="form-label">উপজেলা (Upazila) *</label>
        <select className="form-select" value={selectedUpazila} onChange={handleUpazilaChange} disabled={!selectedDistrict} required>
          <option value="">উপজেলা সিলেক্ট করুন</option>
          {upazilaList.map(up => (
            <option key={up.nameEn} value={up.nameEn}>
              {up.nameBn} ({up.nameEn})
            </option>
          ))}
        </select>
      </div>

      {/* 4. Village/Area Text Input */}
      <div className="form-group">
        <label className="form-label">গ্রাম / এলাকা (Village / Area) *</label>
        <input
          type="text"
          className="form-input"
          placeholder="উদাঃ সেনপাড়া পর্বতা, মমিনপুর বা রোড নং ৫"
          value={localVillage}
          onChange={handleVillageChange}
          required
        />
      </div>

      {/* 5. Google Maps / Mock Map Pin */}
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
          <MapPin size={16} style={{ color: 'var(--primary)' }} />
          <span>মানচিত্রে বাসার সঠিক অবস্থান সিলেক্ট করুন</span>
        </div>
        
        {GOOGLE_MAPS_API_KEY && isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={markerPosition.lat ? markerPosition : mapCenter}
            zoom={13}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            <MarkerF
              position={markerPosition}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
            />
          </GoogleMap>
        ) : renderMockMap()}
      </div>

    </div>
  );
};
export default LocationSelector;
