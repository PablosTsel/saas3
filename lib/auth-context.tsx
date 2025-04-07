"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, onAuthStateChange, loginUser, registerUser, logoutUser } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signup: (email: string, password: string, name: string) => Promise<{ user: User | null; error: string | null }>;
  logout: () => Promise<{ success: boolean; error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChange((user) => {
        setUser(user);
        setLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error("Error in auth state change:", error);
      setLoading(false);
      return () => {};
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      return await loginUser(email, password);
    } catch (error) {
      console.error("Login error:", error);
      return { user: null, error: "An unexpected error occurred" };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      return await registerUser(email, password, name);
    } catch (error) {
      console.error("Signup error:", error);
      return { user: null, error: "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      return await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 