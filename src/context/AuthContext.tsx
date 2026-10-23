import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { auth } from '../lib/supabase';

// Define the single universal admin email
export const SUPER_ADMIN_EMAIL = 'webaserver77@gmail.com';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<User | null>;
  loginWithEmail: (email: string, password?: string) => Promise<User | null>;
  registerWithEmail: (name: string, email: string, password?: string) => Promise<User | null>;
  logout: () => Promise<void>;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('netstudio_auth_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) {
            const isMasterAdmin = (parsed.email || '').toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
            return {
              ...parsed,
              role: isMasterAdmin ? 'admin' : 'user'
            };
          }
        }
      }
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Sync state with localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          window.localStorage.setItem('netstudio_auth_user', JSON.stringify(user));
        } else {
          window.localStorage.removeItem('netstudio_auth_user');
        }
      }
    } catch {}
  }, [user]);

  // Listen to Supabase Auth state
  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      const supabaseUser = session?.user;
      if (supabaseUser) {
        const userEmail = (supabaseUser.email || '').toLowerCase();
        // Strict Universal Admin Check:
        const isMasterAdmin = userEmail === SUPER_ADMIN_EMAIL.toLowerCase();

        const appUser: User = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata.full_name || 'User',
          email: supabaseUser.email || '',
          avatar: supabaseUser.user_metadata.avatar_url || undefined,
          role: isMasterAdmin ? 'admin' : 'user', // Locked to ONLY the universal admin email!
          createdAt: supabaseUser.created_at,
          isLoggedIn: true,
          isGuest: false
        };

        setUser(appUser);
      } else {
        // Keep non-supabase user if logged in via custom auth, otherwise null
        setUser((prev) => {
          if (prev && !prev.id.startsWith('supabase_')) {
            return prev;
          }
          return null;
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // When a user logs in via Google on ANY browser:
  const loginWithGoogle = async (): Promise<User | null> => {
    try {
      const { data, error } = await auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      
      // OAuth flow redirects, so we don't return user here. 
      // The onAuthStateChange will handle setting the user.
      return null;
    } catch (error: any) {
      console.warn('[loginWithGoogle] Notice:', error?.message);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password?: string): Promise<User | null> => {
    const userEmail = email.trim().toLowerCase();
    const isMasterAdmin = userEmail === SUPER_ADMIN_EMAIL.toLowerCase();

    if (password && password.length >= 6) {
      try {
        const { data, error } = await auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        
        const supabaseUser = data.user;
        const appUser: User = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata.full_name || email.split('@')[0],
          email: supabaseUser.email || email.trim(),
          role: isMasterAdmin ? 'admin' : 'user',
          createdAt: supabaseUser.created_at,
          isLoggedIn: true,
          isGuest: false
        };
        setUser(appUser);
        return appUser;
      } catch {
        // Fallback through backend / local
      }
    }

    // Single-Admin Enforcement: the Universal Admin identity can NEVER be
    // assumed through the unverified local fallback. It must pass real
    // authentication (Supabase above) or the Master Admin password gate.
    if (isMasterAdmin) {
      throw new Error('Universal Admin must sign in with the correct password.');
    }

    const appUser: User = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email: email.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
      isLoggedIn: true,
      isGuest: false
    };
    setUser(appUser);
    return appUser;
  };

  const registerWithEmail = async (name: string, email: string, password?: string): Promise<User | null> => {
    const userEmail = email.trim().toLowerCase();
    const isMasterAdmin = userEmail === SUPER_ADMIN_EMAIL.toLowerCase();

    // Single-Admin Enforcement: registering can never mint a second admin,
    // not even with the Universal Admin email (that account signs in instead).
    if (isMasterAdmin) {
      throw new Error('This email is reserved for the Universal Admin. Please sign in instead.');
    }

    if (password && password.length >= 6) {
      try {
        const { data, error } = await auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } });
        if (error) throw error;
        
        const supabaseUser = data.user;
        if (!supabaseUser) return null; // Email confirmation required?

        const appUser: User = {
          id: supabaseUser.id,
          name: name.trim() || 'NetStudio Member',
          email: supabaseUser.email || email.trim(),
          role: 'user',
          createdAt: supabaseUser.created_at,
          isLoggedIn: true,
          isGuest: false
        };
        setUser(appUser);
        return appUser;
      } catch {
        // Fallback
      }
    }

    const appUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'NetStudio Member',
      email: email.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
      isLoggedIn: true,
      isGuest: false
    };
    setUser(appUser);
    return appUser;
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch {}
    setUser(null);
  };

  // Helper boolean exported to the entire app:
  const isAdmin = (user?.email || '').toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        loading,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
