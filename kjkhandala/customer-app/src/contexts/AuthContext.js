import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const authListener = supabase.auth.onAuthStateChange(async (event, sess) => {
      console.log('Auth state changed:', event);
      
      // Don't reload profile during sign-in - it's handled in signIn function
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        return;
      }
      
      if (sess?.user && !isLoadingProfile) {
        await loadUserProfile(sess.user);
      } else if (!sess?.user) {
        setUser(null);
        setSession(null);
        setUserRoles([]);
      }
    });

    return () => {
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, [isLoadingProfile]);

  const checkAuth = async () => {
    try {
      const response = await supabase.auth.getSession();
      if (response.error) throw response.error;
      if (response.data?.session?.user) {
        await loadUserProfile(response.data.session.user);
      }
    } catch (e) {
      console.error('Auth check failed:', e);
      setUser(null);
      setSession(null);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (sbUser) => {
    try {
      console.log('Loading profile for user:', sbUser.id);
      
      // Fetch profile
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .single();
      
      if (pErr) {
        console.error('Profile fetch error:', pErr);
        throw pErr;
      }
      
      // Fetch roles
      const { data: rolesData, error: rErr } = await supabase
        .from('user_roles')
        .select('role, role_level, is_active')
        .eq('user_id', sbUser.id)
        .eq('is_active', true);
      
      if (rErr) {
        console.error('Roles fetch error:', rErr);
      }
      
      const roles = rolesData?.map((r) => r.role) || [];
      
      const mapped = {
        id: sbUser.id,
        email: sbUser.email || '',
        profile: {
          fullName: profile?.full_name || '',
          phone: profile?.phone,
        },
        userRoles: rolesData?.map((r) => ({ role: r.role, roleLevel: r.role_level })) || [],
      };
      
      setUser(mapped);
      setSession({ user: mapped });
      setUserRoles(roles);
      console.log('User profile loaded successfully');
    } catch (e) {
      console.error('Failed to load profile:', e);
      // Set minimal user info
      const minimalUser = {
        id: sbUser.id,
        email: sbUser.email || '',
        profile: {
          fullName: sbUser.email || '',
          phone: undefined,
        },
        userRoles: [],
      };
      setUser(minimalUser);
      setSession({ user: minimalUser });
      setUserRoles([]);
    }
  };

  const signUp = async (email, password, fullName, phone) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
        },
      });
      
      if (error) throw error;
      if (!data.user) throw new Error('Signup failed');
      
      // Wait for triggers to create profile and role
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load the user profile (created by trigger)
      if (data.session?.user) {
        try {
          await loadUserProfile(data.session.user);
        } catch (profileError) {
          console.error('Profile loading error:', profileError);
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error.message || error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('Sign in started for:', email);
      setLoading(true);
      setIsLoadingProfile(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }
      if (!data.user) {
        throw new Error('Login failed');
      }
      
      console.log('Authentication successful, user:', data.user.id);
      
      // Load user profile with timeout
      try {
        const profilePromise = loadUserProfile(data.user);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile loading timeout')), 10000)
        );
        
        await Promise.race([profilePromise, timeoutPromise]);
      } catch (profileError) {
        console.error('Profile loading error:', profileError);
      }
      
      return { error: null, user };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error.message || error, user: null };
    } finally {
      setLoading(false);
      setIsLoadingProfile(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRoles([]);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    userRoles,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
