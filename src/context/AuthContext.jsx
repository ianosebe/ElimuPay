import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (log in, log out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch the extended profile (role) from our parents table when the user changes
  const [enhancedUser, setEnhancedUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setEnhancedUser(null);
        return;
      }
      
      try {
        // Attempt to fetch from the custom 'parents' table we created
        const { data, error } = await supabase
          .from('parents')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        const fallbackRole = user.email === 'admin@elimupay.com' ? 'admin' : 'parent';

        setEnhancedUser({
          ...user,
          // If the profile exists use its role, otherwise check email, then safely default to 'parent'
          role: data?.role || user.user_metadata?.role || fallbackRole,
          name: data?.full_name || user.user_metadata?.full_name || user.email,
          childrenIds: ['S001', 'S002'] // Mock link for now until we query the students table
        });
      } catch (err) {
        // Fallback if table doesn't exist
        const fallbackRole = user.email === 'admin@elimupay.com' ? 'admin' : 'parent';
        setEnhancedUser({
          ...user,
          role: user.user_metadata?.role || fallbackRole,
          name: user.email,
          childrenIds: ['S001', 'S002']
        });
      }
    };

    fetchProfile();
  }, [user]);

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
