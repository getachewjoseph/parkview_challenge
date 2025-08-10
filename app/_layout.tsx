import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { TextSizeProvider } from '../contexts/TextSizeContext';
import { Inter_400Regular, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_800ExtraBold,
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <TextSizeProvider>
        <RootLayoutNav />
      </TextSizeProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      if (user.userType === 'caretaker') {
        router.replace('/(tabs)/caretaker-dashboard');
      } else {
        router.replace('/(tabs)/screening');
      }
    } else if (!user && !inAuthGroup) {
      router.replace('/login');
    }
  }, [user, loading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: Platform.OS === 'ios' ? 'default' : 'none'
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{
            animation: 'none'
          }}
        />
        <Stack.Screen 
          name="(auth)" 
          options={{
            animation: 'none'
          }}
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{
            animation: 'none'
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
