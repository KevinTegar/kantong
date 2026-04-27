import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({
      session,
      user: session?.user ?? null,
      isInitialized: true,
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
      });
    });
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    set({ isLoading: false });
    return { error: error as Error | null };
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    set({ isLoading: false });
    return { error: error as Error | null };
  },

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ isLoading: false });
  },
}));