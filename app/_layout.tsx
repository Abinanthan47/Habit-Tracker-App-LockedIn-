// This MUST be the first import to polyfill crypto.getRandomValues for uuid
import "react-native-get-random-values";

import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { AppProvider } from "@/context/AppContext";

// Neo-Brutalism Vibrant Theme
const NeoBrutalVibrantTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#FF7F50",
    background: "#FF7F50",
    card: "#FFFFFF",
    text: "#000000",
    border: "#000000",
    notification: "#C1FF72",
  },
};

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <ThemeProvider value={NeoBrutalVibrantTheme}>
      <AppProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#FFFFFF",
            },
            headerShadowVisible: false,
            headerTitleStyle: {
              fontWeight: "900",
              fontSize: 18,
              color: "#000000",
            },
            headerTintColor: "#000000",
            contentStyle: {
              backgroundColor: "#FF7F50",
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-task"
            options={{
              presentation: "modal",
              title: "NEW HABIT",
              headerStyle: { backgroundColor: "#FDFD96" },
            }}
          />
          <Stack.Screen
            name="add-goal"
            options={{
              presentation: "modal",
              title: "NEW GOAL",
              headerStyle: { backgroundColor: "#FFB1D8" },
            }}
          />
          <Stack.Screen
            name="day-detail"
            options={{
              presentation: "modal",
              title: "DETAILS",
              headerStyle: { backgroundColor: "#C1FF72" },
            }}
          />
        </Stack>
        <StatusBar style="dark" />
      </AppProvider>
    </ThemeProvider>
  );
}
