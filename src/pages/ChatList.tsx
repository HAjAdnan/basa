import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isUsingMock, mockSupabase, supabaseReal } from '../config/supabase';
import { MessageSquare, Calendar, ChevronRight } from 'lucide-react';

interface Conversation {
  id: string;
  listing_id: string;
  landlord_id: string;
  tenant_id: string;
  created_at: string;
  listing?: {
    title: string;
    images: string[];
    rent_amount: number;
  };
  otherUser?: {
    full_name: string;
    avatar_url: string;
  };
  lastMessage?: string;
}

export const ChatList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/profile');
      return;
    }

    const fetchConversations = async () => {
      setLoading(true);
      try {
        if (isUsingMock) {
          const { data } = await mockSupabase.getConversations(user.id);
          const users = JSON.parse(localStorage.getItem('basa_finder_users') || '[]');
          const listings = JSON.parse(localStorage.getItem('basa_finder_listings') || '[]');
          const messages = JSON.parse(localStorage.getItem('basa_finder_messages') || '[]');

          const processed = (data || []).map((c: any) => {
            const listing = listings.find((l: any) => l.id === c.listing_id);
            const otherUserId = c.landlord_id === user.id ? c.tenant_id : c.landlord_id;
            const otherUser = users.find((u: any) => u.id === otherUserId);
            
            const convMsgs = messages.filter((m: any) => m.conversation_id === c.id);
            const lastMsgObj = convMsgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

            return {
              ...c,
              listing: listing ? {
                title: listing.title,
                images: listing.images,
                rent_amount: listing.rent_amount
              } : {
                title: 'বিজ্ঞাপনটি মুছে ফেলা হয়েছে',
                images: [],
                rent_amount: 0
              },
              otherUser: otherUser ? {
                full_name: otherUser.full_name,
                avatar_url: otherUser.avatar_url
              } : {
                full_name: 'ব্যবহারকারী',
                avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Default'
              },
              lastMessage: lastMsgObj ? lastMsgObj.content : 'মেসেজ দিন...'
            };
          });

          setConversations(processed);
        } else if (supabaseReal) {
          const client = supabaseReal;
          // Real Supabase queries for conversations
          const { data, error } = await client
            .from('conversations')
            .select(`
              *,
              listing:listings(title, images, rent_amount),
              landlord:profiles!conversations_landlord_id_fkey(id, full_name, avatar_url),
              tenant:profiles!conversations_tenant_id_fkey(id, full_name, avatar_url)
            `)
            .or(`landlord_id.eq.${user.id},tenant_id.eq.${user.id}`);

          if (!error && data) {
            const processed = await Promise.all((data as any[]).map(async (c) => {
              const otherUser = c.landlord_id === user.id ? c.tenant : c.tenant_id === user.id ? c.landlord : null;
              
              // Get last message from messages table
              const { data: msgData } = await client
                .from('messages')
                .select('content')
                .eq('conversation_id', c.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              return {
                id: c.id,
                listing_id: c.listing_id,
                landlord_id: c.landlord_id,
                tenant_id: c.tenant_id,
                created_at: c.created_at,
                listing: c.listing,
                otherUser: otherUser ? {
                  full_name: otherUser.full_name,
                  avatar_url: otherUser.avatar_url
                } : undefined,
                lastMessage: msgData ? msgData.content : 'কোনো মেসেজ নেই'
              };
            }));

            setConversations(processed);
          }
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }} className="loading-dots">
        <span></span><span></span><span></span>
      </div>
    );
  }

  return (
    <div className="app-content fade-in" style={{ paddingBottom: '80px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>আপনার মেসেজসমূহ</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>মালিক ও ভাড়াটিয়াদের সাথে সরাসরি চ্যাট</p>
      </div>

      {/* Chat List */}
      {conversations.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', minHeight: '300px', textAlign: 'center' }}>
          <MessageSquare size={48} style={{ color: 'var(--text-tertiary)' }} />
          <h3 style={{ fontSize: '15px', fontWeight: '700' }}>কোনো চ্যাট নেই</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '260px' }}>
            ভাড়া বাসা খুঁজতে বাসাগুলোর বিস্তারিত পেজে গিয়ে "মেসেজ দিন" অপশনে ক্লিক করুন।
          </p>
          <Link to="/listings" className="btn btn-primary" style={{ marginTop: '12px', width: 'auto', padding: '10px 24px' }}>
            বাসা খুঁজুন
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {conversations.map(conv => (
            <Link key={conv.id} to={`/chats/${conv.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card fade-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                
                {/* Avatar of other user */}
                <img 
                  src={conv.otherUser?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Avatar'} 
                  alt="Avatar"
                  style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: 'var(--bg-input)' }}
                />

                {/* Body details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>{conv.otherUser?.full_name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                      {new Date(conv.created_at).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    বাসা: {conv.listing?.title}
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {conv.lastMessage}
                  </p>
                </div>

                {/* Right arrow */}
                <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};
export default ChatList;
