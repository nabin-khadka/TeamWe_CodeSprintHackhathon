import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../services/api';

interface User {
  name: string;
  phone: string;
  userType: 'buyer' | 'seller';
  profileImage?: string;
  address?: string;
  buyerProfile?: any;
  sellerProfile?: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  setUser: (userData: any) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await storage.getUserData();
      const userToken = await storage.getUserToken();
      
      if (userData && userToken) {
        setUserState(userData.user);
        setToken(userToken);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setUser = async (userData: any) => {
    try {
      await storage.saveUserData(userData);
      setUserState(userData.user);
      setToken(userData.token);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const logout = async () => {
    try {
      await storage.clearUserData();
      setUserState(null);
      setToken(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    isAuthenticated: !!user && !!token,
    user,
    token,
    setUser,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
