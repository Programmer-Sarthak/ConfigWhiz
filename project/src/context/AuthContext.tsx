import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  signInWithCustomToken,
  signOut
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

declare global {
  interface Window {
    __firebase_config: any;
    __app_id: any;
    __initial_auth_token: any;
  }
}

const firebaseConfig = typeof window !== 'undefined' && (window as any).__firebase_config 
  ? JSON.parse((window as any).__firebase_config) 
  : {}; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  signUp: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const initialToken = (window as any).__initial_auth_token;
      try {
        if (initialToken) {
          await signInWithCustomToken(auth, initialToken);
        }
      } catch (error) {
        console.error("Auth Initialization Error:", error);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {};
  const signUp = async () => {};
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthReady, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}