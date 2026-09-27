import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [enhancedUser, setEnhancedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (sessionUser) => {
      if (!sessionUser) {
        if (mounted) {
          setEnhancedUser(null);
          setLoading(false);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('parents')
          .select('role, full_name')
          .eq('id', sessionUser.id)
          .single();

        const fallbackRole = sessionUser.email === 'admin@elimupay.com' ? 'admin' : 'parent';

        if (mounted) {
          setEnhancedUser({
            ...sessionUser,
            role: data?.role || sessionUser.user_metadata?.role || fallbackRole,
            name: data?.full_name || sessionUser.user_metadata?.full_name || sessionUser.email,
            childrenIds: ['S001', 'S002']
          });
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          const fallbackRole = sessionUser.email === 'admin@elimupay.com' ? 'admin' : 'parent';
          setEnhancedUser({
            ...sessionUser,
            role: sessionUser.user_metadata?.role || fallbackRole,
            name: sessionUser.email,
            childrenIds: ['S001', 'S002']
          });
          setLoading(false);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Ensure we stay in loading state if the user changes and we need to fetch again
      if (session?.user && enhancedUser?.id !== session.user.id) {
        setLoading(true);
      }
      fetchProfile(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Standard Email/Password Login
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        return { success: false, message: error.message };
      }
      
      return { success: true, data };
    } catch (err) {
      return { success: false, message: 'An unexpected error occurred during login.' };
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'parent',
            full_name: fullName
          }
        }
      });
      
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, message: 'An unexpected error occurred during sign up.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user: enhancedUser, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
