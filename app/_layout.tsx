import React from 'react'; // Import React
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider
import { ThemeProvider } from '../context/ThemeContext'; // Import ThemeProvider
import { StatusBar } from 'expo-status-bar'; // Import StatusBar
import { useTheme } from '../context/ThemeContext'; // Import useTheme hook

// Component to manage StatusBar based on theme
function ThemedStatusBar() {
  const { colors } = useTheme();
  return <StatusBar style={colors.statusBar} />;
}

export default function RootLayout() {
  // Root navigator is now wrapped by AuthProvider and ThemeProvider
  return (
    <AuthProvider>
      <ThemeProvider>
        {/* Add ThemedStatusBar here to ensure it uses the theme context */}
        <ThemedStatusBar />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </AuthProvider>
  );
}
