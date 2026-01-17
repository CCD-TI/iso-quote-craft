import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Advisor } from '@/types/quotation';
import { supabase } from '@/integrations/supabase/client';

interface AdvisorSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  advisor: AdvisorSession | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'advisor_session';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [advisor, setAdvisor] = useState<AdvisorSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem(STORAGE_KEY);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setAdvisor(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.functions.invoke('advisor-auth', {
        body: { action: 'login', username, password },
      });

      if (error) {
        return { error: 'Error de conexión. Intente nuevamente.' };
      }

      if (!data.success) {
        return { error: data.message || 'Error de autenticación' };
      }

      // Save session
      setAdvisor(data.advisor);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.advisor));
      
      return { error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: 'Error inesperado. Intente nuevamente.' };
    }
  };

  const signOut = () => {
    setAdvisor(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        advisor,
        loading,
        signIn,
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
