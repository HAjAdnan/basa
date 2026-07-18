import React, { createContext, useContext, useState, useEffect } from 'react';
import { isUsingMock, mockSupabase, supabaseReal } from '../config/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  user_type: 'landlord' | 'tenant';
  avatar_url: string;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (email: string, fullName: string, phone: string, userType: 'landlord' | 'tenant') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isUsingMock) {
          const u = mockSupabase.getCurrentUser();
          setUser(u);
        } else if (supabaseReal) {
          const { data: { session } } = await supabaseReal.auth.getSession();
          if (session?.user) {
            const { data } = await supabaseReal
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setUser(data);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const signIn = async (email: string) => {
    setLoading(true);
    try {
      if (isUsingMock) {
        const { data, error } = await mockSupabase.signIn(email);
        if (error) throw error;
        setUser(data.user);
      } else if (supabaseReal) {
        const { error } = await supabaseReal.auth.signInWithOtp({ email });
        if (error) throw error;
        alert('কোড বা লিঙ্ক পেতে আপনার ইমেইল চেক করুন!');
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, fullName: string, phone: string, userType: 'landlord' | 'tenant') => {
    setLoading(true);
    try {
      if (isUsingMock) {
        const { data, error } = await mockSupabase.signUp(email, fullName, phone, userType);
        if (error) throw error;
        setUser(data.user);
      } else if (supabaseReal) {
        // Authenticate with email/password (or OTP) and insert profile
        const { data, error } = await supabaseReal.auth.signUp({ email, password: 'password123' });
        if (error) throw error;
        if (data.user) {
          const newProfile = {
            id: data.user.id,
            full_name: fullName,
            phone_number: phone,
            user_type: userType,
            avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`
          };
          const { error: profileError } = await supabaseReal
            .from('profiles')
            .insert([newProfile]);
          if (profileError) throw profileError;
          setUser({ ...newProfile, email, created_at: new Date().toISOString() });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (isUsingMock) {
        await mockSupabase.signOut();
      } else if (supabaseReal) {
        await supabaseReal.auth.signOut();
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
