import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

interface AuthContextData {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  user: string | null; // For now, just storing a boolean as a string
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments(); // Gets the current route segments

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user_logged_in');
        setUser(storedUser);
      } catch (e) {
        console.error('Failed to load auth data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  useEffect(() => {
    if (isLoading) return; // Don't redirect until loading is complete

    const inAuthGroup = segments[0] === '(app)';

    if (!user && inAuthGroup) {
      // Redirect to the login page if the user is not authenticated
      // and is trying to access a protected route.
      router.replace('/');
    } else if (user && !inAuthGroup) {
      // Redirect to the main app screen (chat) if the user is authenticated
      // and is currently on a page outside the '(app)' group (e.g., the login page).
      router.replace('/(app)/chat');
    }
  }, [user, segments, isLoading, router]);

  const signIn = async () => {
    // In a real app, verify credentials first
    try {
      await AsyncStorage.setItem('@user_logged_in', 'true');
      setUser('true');
      // Navigation is handled by the useEffect hook now
      // router.replace('/(app)/chat');
    } catch (e) {
      console.error('Failed to sign in:', e);
      // Handle sign-in error (e.g., show an alert)
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@user_logged_in');
      setUser(null);
      // Navigation is handled by the useEffect hook now
      // router.replace('/');
    } catch (e) {
      console.error('Failed to sign out:', e);
      // Handle sign-out error
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
