import React from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Bath, Maximize2, MapPin, Star } from 'lucide-react';
import { bdLocations } from '../data/bd-locations';

export interface HouseListing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  rent_amount: number;
  division: string;
  district: string;
  upazila: string;
  village_area: string;
  address_details?: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  size_sqft?: number;
  amenities: string[];
  images: string[];
  is_available: boolean;
  created_at: string;
}

interface ListingCardProps {
  listing: HouseListing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  // Convert division and district codes to Bengali names
  const divisionName = bdLocations[listing.division]?.nameBn || listing.division;
  const districtName = bdLocations[listing.division]?.districts[listing.district]?.nameBn || listing.district;

  return (
    <Link to={`/listings/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card fade-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* House Image Header */}
        <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden', backgroundColor: 'var(--bg-input)' }}>
          <img 
            src={listing.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'} 
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            className="listing-card-image"
          />
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            fontWeight: '700',
            fontSize: '14px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'baseline',
            gap: '2px'
          }}>
            <span>৳{listing.rent_amount.toLocaleString('bn-BD')}</span>
            <span style={{ fontSize: '10px', fontWeight: '400' }}>/মাস</span>
          </div>
          
          {!listing.is_available && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '16px',
              letterSpacing: '1px'
            }}>
              ভাড়া হয়ে গেছে
            </div>
          )}
        </div>

        {/* Info Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Location details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
            <MapPin size={12} />
            <span>{listing.village_area}, {listing.upazila}, {districtName}</span>
          </div>

          {/* Title */}
          <h3 style={{ fontSize: '16px', fontWeight: '700', lineHeight: '1.3', color: 'var(--text-primary)', height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {listing.title}
          </h3>

          {/* Amenities & size details */}
          <div style={{ display: 'flex', gap: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BedDouble size={14} style={{ color: 'var(--text-tertiary)' }} />
              <span>{listing.bedrooms} বেড</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Bath size={14} style={{ color: 'var(--text-tertiary)' }} />
              <span>{listing.bathrooms} বাথ</span>
            </div>
            {listing.size_sqft && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Maximize2 size={14} style={{ color: 'var(--text-tertiary)' }} />
                <span>{listing.size_sqft} স্কয়ারফিট</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </Link>
  );
};
export default ListingCard;
