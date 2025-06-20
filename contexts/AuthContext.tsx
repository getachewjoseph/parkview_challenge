import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  email: string;
  userType: 'patient' | 'caretaker';
  caretakerId?: number | null;
  referralCode?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: 'patient' | 'caretaker', referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await api.getToken();
      if (token) {
        const userData = await api.getMe();
        setUser(userData);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await api.login({ email, password });
      const userData = await api.getMe();
      setUser(userData);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, userType: 'patient' | 'caretaker', referralCode?: string) => {
    try {
      setError(null);
      await api.register({ email, password, userType, referralCode });
      const userData = await api.getMe();
      setUser(userData);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await api.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    checkAuth,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 