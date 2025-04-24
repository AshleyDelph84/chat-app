import React from 'react';
import { Stack } from 'expo-router';

// Auth check and redirection are now handled by the AuthProvider in the root layout
// No need for explicit checks or redirects here anymore.

export default function AppLayout() {
  // This layout can be deferred till the user is authenticated
  return <Stack screenOptions={{ headerShown: false }} />;
}
