import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Award } from 'lucide-react';
import { isUsingMock, mockSupabase, supabaseReal } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

interface Review {
  id: string;
  listing_id?: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: {
    full_name: string;
    avatar_url: string;
    user_type: string;
  };
}

interface ReviewSectionProps {
  revieweeId: string;
  listingId?: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ revieweeId, listingId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      if (isUsingMock) {
        const { data } = await mockSupabase.getReviews(revieweeId);
        // Map reviewer details from mock database
        const users = JSON.parse(localStorage.getItem('basa_finder_users') || '[]');
        const reviewsWithDetails = (data || []).map((r: any) => {
          const reviewer = users.find((u: any) => u.id === r.reviewer_id);
          return {
            ...r,
            reviewer: reviewer ? {
              full_name: reviewer.full_name,
              avatar_url: reviewer.avatar_url,
              user_type: reviewer.user_type
            } : {
              full_name: 'অজানা ব্যবহারকারী',
              avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Unknown',
              user_type: 'tenant'
            }
          };
        });
        setReviews(reviewsWithDetails);
      } else if (supabaseReal) {
        let query = supabaseReal
          .from('reviews')
          .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url, user_type)')
          .eq('reviewee_id', revieweeId);
        const { data, error } = await query;
        if (!error && data) {
          setReviews(data as any[]);
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [revieweeId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('রিভিউ দিতে প্রথমে লগইন করুন!');
      return;
    }
    if (user.id === revieweeId) {
      alert('আপনি নিজেকে নিজে রিভিউ দিতে পারবেন না!');
      return;
    }
    setSubmitting(true);
    try {
      const newReview = {
        listing_id: listingId || null,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating,
        comment,
      };

      if (isUsingMock) {
        await mockSupabase.createReview(newReview);
      } else if (supabaseReal) {
        const { error } = await supabaseReal.from('reviews').insert([newReview]);
        if (error) throw error;
      }

      setComment('');
      setRating(5);
      await fetchReviews();
    } catch (err: any) {
      alert(err.message || 'রিভিউ যোগ করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate Average Rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '০.০';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. Review Summary Panel */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--primary-light)', borderColor: 'var(--primary-glow)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-title)', color: 'var(--primary)' }}>
            {avgRating}
          </span>
          <div style={{ display: 'flex', gap: '2px', margin: '4px 0' }}>
            {[1,2,3,4,5].map(star => (
              <Star 
                key={star} 
                size={14} 
                fill={star <= Math.round(parseFloat(avgRating) || 0) ? 'var(--accent)' : 'none'} 
                color="var(--accent)" 
              />
            ))}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {reviews.length} টি রিভিউ
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <Award size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: '600' }}>নিরাপদ এবং বিশ্বস্ত কমিউনিটি</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            মালিক এবং ভাড়াটিয়া উভয়ই পরস্পরকে রেটিং দিতে পারেন, যা নিরাপদ ভাড়া চুক্তিতে সিদ্ধান্ত নিতে সাহায্য করে।
          </p>
        </div>
      </div>

      {/* 2. Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          ব্যবহারকারীদের মতামত
        </h4>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '16px' }} className="loading-dots">
            <span></span><span></span><span></span>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '13px' }}>
            এখনো কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি আপনি দিন!
          </div>
        ) : (
          reviews.map(rev => (
            <div key={rev.id} className="fade-in" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <img 
                src={rev.reviewer?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Reviewer'} 
                alt="Reviewer" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-input)' }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{rev.reviewer?.full_name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                      ({rev.reviewer?.user_type === 'landlord' ? 'মালিক' : 'ভাড়াটিয়া'})
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1px' }}>
                    {[1,2,3,4,5].map(star => (
                      <Star 
                        key={star} 
                        size={11} 
                        fill={star <= rev.rating ? 'var(--accent)' : 'none'} 
                        color="var(--accent)" 
                      />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {rev.comment}
                </p>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                  {new Date(rev.created_at).toLocaleDateString('bn-BD')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Add Review Form (Only for other users) */}
      {user && user.id !== revieweeId && (
        <form onSubmit={handleSubmitReview} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700' }}>রিভিউ লিখুন</h4>
          
          {/* Star selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>আপনার রেটিং:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1,2,3,4,5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                >
                  <Star 
                    size={22} 
                    fill={star <= rating ? 'var(--accent)' : 'none'} 
                    color="var(--accent)" 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment text area */}
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="আপনার অভিজ্ঞতা শেয়ার করুন (উদাঃ বাসার পরিবেশ, মালিকের আচরণ বা সময়মতো ভাড়া পরিশোধ ইত্যাদি)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              style={{ fontSize: '13px' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting || !comment.trim()}
            style={{ padding: '10px', fontSize: '13px' }}
          >
            <Send size={14} />
            <span>রিভিউ সাবমিট করুন</span>
          </button>
        </form>
      )}

    </div>
  );
};
export default ReviewSection;
