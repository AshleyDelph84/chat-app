import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define color palettes
const lightColors = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#007bff',
  secondary: '#e5e5ea',
  inputBackground: '#FFFFFF',
  inputBorder: '#ccc',
  inputText: '#000000',
  statusBar: 'dark',
  buttonText: '#FFFFFF',
  headerBackground: '#f8f8f8',
  headerText: '#000000',
  subtleText: '#666',
  bubbleUser: '#007bff',
  bubbleBot: '#e5e5ea',
  textUser: '#FFFFFF',
  textBot: '#000000',
};

const darkColors = {
  background: '#121212',
  text: '#FFFFFF',
  primary: '#0A84FF', // Slightly brighter blue for dark mode
  secondary: '#3A3A3C',
  inputBackground: '#1C1C1E',
  inputBorder: '#3A3A3C',
  inputText: '#FFFFFF',
  statusBar: 'light',
  buttonText: '#FFFFFF',
  headerBackground: '#1C1C1E',
  headerText: '#FFFFFF',
  subtleText: '#8E8E93',
  bubbleUser: '#0A84FF',
  bubbleBot: '#3A3A3C',
  textUser: '#FFFFFF',
  textBot: '#FFFFFF',
};

type Theme = 'light' | 'dark';
type Colors = typeof lightColors;

interface ThemeContextData {
  theme: Theme;
  colors: Colors;
  toggleTheme: () => void;
  isThemeLoading: boolean;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme() ?? 'light'; // Default to light if null
  const [theme, setTheme] = useState<Theme>(systemColorScheme); // Initialize with system theme
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@app_theme') as Theme | null;
        if (storedTheme) {
          setTheme(storedTheme);
        } else {
          // If no stored theme, use system theme
          setTheme(systemColorScheme);
        }
      } catch (e) {
        console.error('Failed to load theme preference:', e);
        setTheme(systemColorScheme); // Fallback to system theme on error
      } finally {
        setIsThemeLoading(false);
      }
    };
    loadThemePreference();
  }, [systemColorScheme]); // Reload if system theme changes and no preference is stored

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('@app_theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  };

  // Determine colors based on the current theme state
  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isThemeLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}
