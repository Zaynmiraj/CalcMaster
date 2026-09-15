import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInAnonymouslyIfNeeded,
  subscribeToAuthState,
  getCurrentUser,
  User,
} from '@/utils/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAnonymous: boolean;
  userId: string | null;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAnonymous: true,
  userId: null,
  refreshAuth: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    try {
      setIsLoading(true);
      const currentUser = await signInAnonymouslyIfNeeded();
      setUser(currentUser);
    } catch (err) {
      console.warn('[AuthProvider] Failed to init anonymous auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
    const unsubscribe = subscribeToAuthState((newUser) => {
      setUser(newUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAnonymous: user?.isAnonymous ?? true,
        userId: user?.uid ?? null,
        refreshAuth: initAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
