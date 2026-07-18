import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: any): boolean => {
  if (typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

// Check if we should use mock database
export const isUsingMock = 
  !isValidUrl(supabaseUrl) || 
  !supabaseAnonKey || 
  supabaseUrl === 'YOUR_SUPABASE_URL' || 
  supabaseUrl === 'undefined' || 
  supabaseUrl === 'null' ||
  supabaseAnonKey === 'undefined' ||
  supabaseAnonKey === 'null';

// Real Supabase instance
export const supabaseReal = !isUsingMock && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// HIGH-FIDELITY LOCAL MOCK BACKEND
// Saves data to LocalStorage to allow instant out-of-the-box testing without setup
class MockSupabaseService {
  private getStorage<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(`basa_finder_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  }

  private setStorage<T>(key: string, data: T): void {
    localStorage.setItem(`basa_finder_${key}`, JSON.stringify(data));
  }

  // --- Auth & Profile ---
  async signUp(email: string, fullName: string, phone: string, userType: 'landlord' | 'tenant') {
    const users = this.getStorage<any[]>('users', []);
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      full_name: fullName,
      phone_number: phone,
      user_type: userType,
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    this.setStorage('users', users);
    this.setStorage('current_user', newUser);
    return { data: { user: newUser }, error: null };
  }

  async signIn(email: string) {
    const users = this.getStorage<any[]>('users', []);
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found. Please sign up first.');
    }
    this.setStorage('current_user', user);
    return { data: { user }, error: null };
  }

  async signOut() {
    localStorage.removeItem('basa_finder_current_user');
    return { error: null };
  }

  getCurrentUser() {
    return this.getStorage<any | null>('current_user', null);
  }

  // --- Listings ---
  async getListings() {
    const defaultListings = [
      {
        id: '1',
        owner_id: 'owner1',
        title: 'সাজানো ফ্যামিলি বাসা ভাড়া হবে',
        description: '৩ বেড, ২ বাথ, ২ বারান্দা সহ সম্পূর্ণ টাইলস করা বাসা। ২৪ ঘণ্টা পানির ব্যবস্থা ও গ্যাস সিলিন্ডার সংযোগ রয়েছে। লিফট ও জেনারেটর ব্যাকআপ আছে।',
        rent_amount: 18500,
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'Mirpur',
        village_area: 'Mirpur-2, Block-H',
        address_details: 'হাউজ নং ২৪, রোড নং ৩, সেকশন ২, মিরপুর',
        latitude: 23.8041,
        longitude: 90.3644,
        bedrooms: 3,
        bathrooms: 2,
        size_sqft: 1250,
        amenities: ['Gas', 'Water', 'Lift', 'Generator', 'Parking'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'],
        is_available: true,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: '2',
        owner_id: 'owner2',
        title: 'ব্যাচেলর ও চাকুরীজীবীদের জন্য সিঙ্গেল রুম',
        description: '১টি বড় রুম, অ্যাটাচড বাথরুম ও কিচেন কর্নার। নিরিবিলি পরিবেশ। শুধুমাত্র চাকরিজীবী পুরুষদের জন্য প্রযোজ্য। গ্যাস ও বিদ্যুৎ বিল ভাড়ার সাথেই অন্তর্ভুক্ত।',
        rent_amount: 6500,
        division: 'dhaka',
        district: 'dhaka',
        upazila: 'Uttara',
        village_area: 'Sector 4, Road 7',
        address_details: 'হাউজ ১২, সেক্টর ৪, উত্তরা',
        latitude: 23.8759,
        longitude: 90.3795,
        bedrooms: 1,
        bathrooms: 1,
        size_sqft: 400,
        amenities: ['Water', 'Wifi'],
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80'],
        is_available: true,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    const listings = this.getStorage<any[]>('listings', defaultListings);
    return { data: listings, error: null };
  }

  async createListing(listing: any) {
    const listings = this.getStorage<any[]>('listings', []);
    const newListing = {
      ...listing,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    listings.unshift(newListing);
    this.setStorage('listings', listings);
    return { data: newListing, error: null };
  }

  // --- Chats ---
  async getConversations(userId: string) {
    const convs = this.getStorage<any[]>('conversations', []);
    return {
      data: convs.filter(c => c.landlord_id === userId || c.tenant_id === userId),
      error: null
    };
  }

  async getMessages(convId: string) {
    const messages = this.getStorage<any[]>('messages', []);
    return {
      data: messages.filter(m => m.conversation_id === convId).sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      error: null
    };
  }

  async createConversation(listingId: string, landlordId: string, tenantId: string) {
    const convs = this.getStorage<any[]>('conversations', []);
    let conv = convs.find(c => c.listing_id === listingId && c.landlord_id === landlordId && c.tenant_id === tenantId);
    if (!conv) {
      conv = {
        id: Math.random().toString(36).substr(2, 9),
        listing_id: listingId,
        landlord_id: landlordId,
        tenant_id: tenantId,
        created_at: new Date().toISOString()
      };
      convs.push(conv);
      this.setStorage('conversations', convs);
    }
    return { data: conv, error: null };
  }

  async sendMessage(convId: string, senderId: string, content: string) {
    const messages = this.getStorage<any[]>('messages', []);
    const newMsg = {
      id: Math.random().toString(36).substr(2, 9),
      conversation_id: convId,
      sender_id: senderId,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    };
    messages.push(newMsg);
    this.setStorage('messages', messages);
    
    // Trigger callback
    const listeners = this.messageListeners.get(convId) || [];
    listeners.forEach(cb => cb(newMsg));
    
    // Add Notification
    this.addNotification(convId, senderId, content);

    return { data: newMsg, error: null };
  }

  private messageListeners = new Map<string, ((msg: any) => void)[]>();

  subscribeMessages(convId: string, callback: (msg: any) => void) {
    if (!this.messageListeners.has(convId)) {
      this.messageListeners.set(convId, []);
    }
    this.messageListeners.get(convId)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const list = this.messageListeners.get(convId) || [];
      this.messageListeners.set(convId, list.filter(cb => cb !== callback));
    };
  }

  // --- Notifications ---
  private notificationListeners: ((notif: any) => void)[] = [];

  subscribeNotifications(callback: (notif: any) => void) {
    this.notificationListeners.push(callback);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(cb => cb !== callback);
    };
  }

  async getNotifications(userId: string) {
    const notifs = this.getStorage<any[]>('notifications', []);
    return {
      data: notifs.filter(n => n.user_id === userId).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      error: null
    };
  }

  async markNotificationRead(notifId: string) {
    const notifs = this.getStorage<any[]>('notifications', []);
    const index = notifs.findIndex(n => n.id === notifId);
    if (index !== -1) {
      notifs[index].is_read = true;
      this.setStorage('notifications', notifs);
    }
    return { error: null };
  }

  private async addNotification(convId: string, senderId: string, content: string) {
    const convs = this.getStorage<any[]>('conversations', []);
    const conv = convs.find(c => c.id === convId);
    if (!conv) return;

    const targetUserId = conv.landlord_id === senderId ? conv.tenant_id : conv.landlord_id;
    const users = this.getStorage<any[]>('users', []);
    const sender = users.find(u => u.id === senderId);

    const notifs = this.getStorage<any[]>('notifications', []);
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: targetUserId,
      title: sender ? `${sender.full_name} মেসেজ পাঠিয়েছেন` : 'নতুন মেসেজ',
      content: content.length > 50 ? content.substring(0, 47) + '...' : content,
      is_read: false,
      type: 'chat',
      link_id: convId,
      created_at: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    this.setStorage('notifications', notifs);

    // Trigger listeners
    this.notificationListeners.forEach(cb => cb(newNotif));
  }

  // --- Reviews & Ratings ---
  async getReviews(revieweeId: string) {
    const reviews = this.getStorage<any[]>('reviews', []);
    return {
      data: reviews.filter(r => r.reviewee_id === revieweeId),
      error: null
    };
  }

  async getListingReviews(listingId: string) {
    const reviews = this.getStorage<any[]>('reviews', []);
    return {
      data: reviews.filter(r => r.listing_id === listingId),
      error: null
    };
  }

  async createReview(review: any) {
    const reviews = this.getStorage<any[]>('reviews', []);
    const newReview = {
      ...review,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    reviews.unshift(newReview);
    this.setStorage('reviews', reviews);
    return { data: newReview, error: null };
  }
}

export const mockSupabase = new MockSupabaseService();
