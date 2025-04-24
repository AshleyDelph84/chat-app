import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const { signIn } = useAuth();
  const { colors, isThemeLoading } = useTheme();

  const styles = createLoginStyles(colors);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Login Failed', 'Please enter a username.');
      return;
    }
    // TODO: In a real app, you'd likely pass username/password to signIn
    await signIn();
    // Navigation is handled automatically by the AuthProvider's useEffect
  };

  if (isThemeLoading) {
    return null; // Or a loading indicator
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor={colors.subtleText}
      />
      <Button title="Login" onPress={handleLogin} color={colors.primary} />
    </View>
  );
}

const createLoginStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: colors.inputBackground,
    color: colors.inputText,
  },
});
