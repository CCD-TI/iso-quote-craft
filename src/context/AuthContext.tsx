import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Advisor } from '@/types/quotation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  advisor: Advisor | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, advisorData: { name: string; phone: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdvisor = async (userId: string) => {
    const { data, error } = await supabase
      .from('advisors')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (data && !error) {
      setAdvisor({
        id: data.id,
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
      });
    } else {
      setAdvisor(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer advisor fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchAdvisor(session.user.id);
          }, 0);
        } else {
          setAdvisor(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchAdvisor(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string,
    password: string,
    advisorData: { name: string; phone: string }
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (authError) {
      return { error: authError as Error };
    }

    if (authData.user) {
      // Create advisor record linked to this user
      const { error: advisorError } = await supabase
        .from('advisors')
        .insert({
          name: advisorData.name,
          email: email,
          phone: advisorData.phone,
          user_id: authData.user.id,
        });

      if (advisorError) {
        return { error: advisorError as Error };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAdvisor(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        advisor,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
