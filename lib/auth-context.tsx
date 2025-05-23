"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  onAuthStateChange, 
  loginUser, 
  registerUser, 
  logoutUser,
  signInWithGoogle,
  handleRedirectResult 
} from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signup: (email: string, password: string, name: string) => Promise<{ user: User | null; error: string | null }>;
  loginWithGoogle: () => Promise<{ user: User | null; error: string | null }>;
  logout: () => Promise<{ success: boolean; error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Check for Google redirect result
      const checkRedirectResult = async () => {
        try {
          const { user: redirectUser, error } = await handleRedirectResult();
          if (error) {
            console.error("Redirect error:", error);
          }
        } catch (error) {
          console.error("Failed to handle redirect result:", error);
        }
      };

      checkRedirectResult();

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
      // Clear any stale Firebase auth data from browser storage
      if (typeof window !== 'undefined') {
        // Clear local/session storage items related to Firebase
        const keysToRemove = Object.keys(localStorage).filter(
          key => key.startsWith('firebase:') || key.includes('firebaseui:')
        );
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        console.log("Cleared stale Firebase auth data from browser storage");
      }
      
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

  const loginWithGoogle = async () => {
    try {
      return await signInWithGoogle();
    } catch (error) {
      console.error("Google login error:", error);
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
    loginWithGoogle,
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