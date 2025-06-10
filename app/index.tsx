import { Redirect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      // Use setTimeout to ensure navigation happens after the initial render
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 0);
    }
  }, []);

  if (Platform.OS !== 'ios') {
    return <Redirect href="/(auth)/login" />;
  }

  return null;
} 