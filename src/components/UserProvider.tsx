"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { MembershipTier } from './TierBadge';

interface Profile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  department_id: string | null;
  district_id: string | null;
  post_id: string | null;
  group_id: string | null;
  membership_tier: MembershipTier;
  user_type: 'STANDARD' | 'GROUP_ADMIN' | 'DEPARTMENT_ADMIN' | 'SUPER_ADMIN';
  avatar_url: string | null;
  bio: string | null;
}

interface UserContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isDepartmentAdmin: boolean;
  isGroupAdmin: boolean;
  hasTierAtLeast: (tier: MembershipTier) => boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  profile: null,
  loading: true,
  isSuperAdmin: false,
  isDepartmentAdmin: false,
  isGroupAdmin: false,
  hasTierAtLeast: () => false,
});


export function UserProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) {
        setProfile(null);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      if (error) {
        console.error('Error loading profile', error);
        return;
      }
      setProfile(data as unknown as Profile);
    };
    fetchProfile();
  }, [session]);

  // Ensure a profile exists for a signed in user
  useEffect(() => {
    const ensureProfile = async () => {
      if (!session?.user || loading) return;
      // Only run if profile has not been loaded yet
      if (profile !== null) return;
      try {
        // Attempt to create a profile if one does not exist
        const defaultDeptCode = process.env.NEXT_PUBLIC_DEFAULT_DEPARTMENT_CODE;
        let departmentId: string | null = null;
        if (defaultDeptCode) {
          const { data: dept } = await supabase
            .from('departments')
            .select('id')
            .eq('code', defaultDeptCode)
            .single();
          departmentId = dept?.id ?? null;
        }
        const { error: insertError } = await supabase.from('profiles').insert({
          user_id: session.user.id,
          email: session.user.email,
          department_id: departmentId,
          membership_tier: 'MEMBER',
          user_type: 'STANDARD',
        });
        if (insertError) {
          // ignore duplicate insertion errors
          console.debug('Profile creation error (expected if already exists):', insertError.message);
        }
        // refetch profile after insertion
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        if (data) setProfile(data as unknown as Profile);
      } catch (err) {
        console.error('Error ensuring profile', err);
      }
    };
    ensureProfile();
  }, [session, profile, loading]);

  // compute derived values
  const userTier = profile?.membership_tier ?? 'MEMBER';
  const tierOrder: MembershipTier[] = ['MEMBER', 'BRONZE', 'SILVER', 'GOLD'];
  const hasTierAtLeast = (tier: MembershipTier) => {
    return tierOrder.indexOf(userTier) >= tierOrder.indexOf(tier);
  };
  const isSuperAdmin = profile?.user_type === 'SUPER_ADMIN';
  const isDepartmentAdmin = profile?.user_type === 'DEPARTMENT_ADMIN';
  const isGroupAdmin = profile?.user_type === 'GROUP_ADMIN';
  const value: UserContextValue = {
    user: session?.user ?? null,
    profile,
    loading,
    isSuperAdmin,
    isDepartmentAdmin,
    isGroupAdmin,
    hasTierAtLeast,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}