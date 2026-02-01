// This MUST be the first import to polyfill crypto.getRandomValues for uuid
import "react-native-get-random-values";

import {
  Acme_400Regular,
  useFonts as useAcmeFonts,
} from "@expo-google-fonts/acme";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from "@expo-google-fonts/inter";
import {
  Syne_400Regular,
  Syne_500Medium,
  Syne_600SemiBold,
  Syne_700Bold,
  Syne_800ExtraBold,
  useFonts as useSyneFonts,
} from "@expo-google-fonts/syne";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import "../global.css";

import { Colors } from "@/constants/design";
import { AppProvider } from "@/context/AppContext";

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

// Cyber Lime Dark Theme
const CyberLimeDarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.cyberLime,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.borderDefault,
    notification: Colors.cyberLime,
  },
};

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [syneFontsLoaded] = useSyneFonts({
    Syne_400Regular,
    Syne_500Medium,
    Syne_600SemiBold,
    Syne_700Bold,
    Syne_800ExtraBold,
  });

  const [interFontsLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [acmeFontsLoaded] = useAcmeFonts({
    Acme_400Regular,
  });

  const fontsLoaded = syneFontsLoaded && interFontsLoaded && acmeFontsLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.cyberLime} />
      </View>
    );
  }

  return (
    <ThemeProvider value={CyberLimeDarkTheme}>
      <AppProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.background,
            },
            headerShadowVisible: false,
            headerTitleStyle: {
              fontFamily: "Syne_700Bold",
              fontSize: 18,
              color: Colors.textPrimary,
            },
            headerTintColor: Colors.textPrimary,
            contentStyle: {
              backgroundColor: Colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-task"
            options={{
              presentation: "modal",
              title: "New Habit",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="add-goal"
            options={{
              presentation: "modal",
              title: "New Goal",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="goal-detail"
            options={{
              presentation: "modal",
              title: "Goal Details",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="day-detail"
            options={{
              presentation: "modal",
              title: "Details",
              headerStyle: { backgroundColor: Colors.background },
            }}
          />
          <Stack.Screen
            name="achievements"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </AppProvider>
    </ThemeProvider>
  );
}
