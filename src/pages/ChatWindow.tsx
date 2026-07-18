import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isUsingMock, mockSupabase, supabaseReal } from '../config/supabase';
import { Send, ArrowLeft, Phone, Building } from 'lucide-react';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const ChatWindow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [conversation, setConversation] = useState<any | null>(null);
  const [otherUser, setOtherUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user || !id) {
      navigate('/profile');
      return;
    }

    const fetchChatDetails = async () => {
      setLoading(true);
      try {
        if (isUsingMock) {
          // Fetch from mock
          const convs = JSON.parse(localStorage.getItem('basa_finder_conversations') || '[]');
          const currentConv = convs.find((c: any) => c.id === id);
          if (currentConv) {
            setConversation(currentConv);
            
            // Get listing info
            const listings = JSON.parse(localStorage.getItem('basa_finder_listings') || '[]');
            const listing = listings.find((l: any) => l.id === currentConv.listing_id);
            currentConv.listing = listing;

            // Get other user info
            const otherUserId = currentConv.landlord_id === user.id ? currentConv.tenant_id : currentConv.landlord_id;
            const users = JSON.parse(localStorage.getItem('basa_finder_users') || '[]');
            const other = users.find((u: any) => u.id === otherUserId) || {
              full_name: 'ব্যবহারকারী',
              phone_number: '০১৭০০০০০০০০',
              avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Default',
              user_type: 'landlord'
            };
            setOtherUser(other);

            // Get messages list
            const { data: msgList } = await mockSupabase.getMessages(id);
            setMessages(msgList || []);
          }
        } else if (supabaseReal) {
          // Fetch conversation
          const { data: convData, error: convErr } = await supabaseReal
            .from('conversations')
            .select(`
              *,
              listing:listings(title, rent_amount),
              landlord:profiles!conversations_landlord_id_fkey(id, full_name, phone_number, avatar_url),
              tenant:profiles!conversations_tenant_id_fkey(id, full_name, phone_number, avatar_url)
            `)
            .eq('id', id)
            .single();

          if (!convErr && convData) {
            setConversation(convData);
            const other = convData.landlord_id === user.id ? convData.tenant : convData.tenant_id === user.id ? convData.landlord : null;
            setOtherUser(other);

            // Fetch messages
            const { data: msgs, error: msgsErr } = await supabaseReal
              .from('messages')
              .select('*')
              .eq('conversation_id', id)
              .order('created_at', { ascending: true });

            if (!msgsErr && msgs) {
              setMessages(msgs as Message[]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching chat window details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatDetails();
  }, [id, user]);

  // Real-time listener for messages
  useEffect(() => {
    if (!id) return;

    let unsubscribe: () => void = () => {};

    if (isUsingMock) {
      // Mock listener
      unsubscribe = mockSupabase.subscribeMessages(id, (newMsg) => {
        setMessages(prev => {
          // Avoid duplicate additions
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });
    } else if (supabaseReal) {
      const client = supabaseReal;
      // Supabase Postgres Realtime Subscription
      const channel = client
        .channel(`chat-room-${id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages(prev => {
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        )
        .subscribe();

      unsubscribe = () => {
        client.removeChannel(channel);
      };
    }

    return () => {
      unsubscribe();
    };
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !id) return;
    
    const textToSend = inputText.trim();
    setInputText('');

    try {
      if (isUsingMock) {
        await mockSupabase.sendMessage(id, user.id, textToSend);
      } else if (supabaseReal) {
        const client = supabaseReal;
        const { error } = await client
          .from('messages')
          .insert([{
            conversation_id: id,
            sender_id: user.id,
            content: textToSend
          }]);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }} className="loading-dots">
        <span></span><span></span><span></span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* 1. Header with other user details */}
      <div style={{
        height: '60px',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: 'var(--bg-card)'
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}>
          <ArrowLeft size={20} />
        </button>

        <img 
          src={otherUser?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Receiver'} 
          alt="Receiver" 
          style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-input)' }}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {otherUser?.full_name}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Building size={10} />
            {conversation?.listing?.title || 'বাসা ভাড়ার চ্যাট'}
          </span>
        </div>

        {otherUser?.phone_number && (
          <a href={`tel:${otherUser.phone_number}`} style={{ color: 'var(--primary)', padding: '6px' }}>
            <Phone size={18} />
          </a>
        )}
      </div>

      {/* 2. Messages Bubble Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: 'var(--bg-app)',
        paddingBottom: '80px'
      }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '12px', textAlign: 'center', padding: '40px' }}>
            কথোপকথন শুরু করতে নিচে মেসেজ লিখে পাঠান। ম্যাপ লোকেশন ও ভাড়া নিয়ে সরাসরি আলোচনা করুন।
          </div>
        ) : (
          messages.map(msg => {
            const isOutgoing = msg.sender_id === user?.id;
            return (
              <div 
                key={msg.id}
                style={{
                  alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOutgoing ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  padding: '10px 14px',
                  borderRadius: isOutgoing ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: isOutgoing ? 'var(--primary)' : 'var(--bg-card)',
                  color: isOutgoing ? 'white' : 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '4px', padding: '0 4px' }}>
                  {new Date(msg.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Bottom Sticky Typing Input */}
      <form 
        onSubmit={handleSendMessage}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '70px',
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          padding: '10px 16px calc(10px + var(--safe-area-bottom)) 16px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          zIndex: 100
        }}
      >
        <input 
          type="text" 
          className="form-input" 
          placeholder="মেসেজ লিখুন..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ flex: 1, borderRadius: 'var(--radius-full)', padding: '10px 18px', backgroundColor: 'var(--bg-app)' }}
        />
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={!inputText.trim()}
          style={{ width: '42px', height: '42px', borderRadius: '50%', padding: '0', flexShrink: 0 }}
        >
          <Send size={16} />
        </button>
      </form>

    </div>
  );
};
export default ChatWindow;
