import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Tabs } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";

// Neo-Brutalism Vibrant Colors
const COLORS = {
  primary: "#FF7F50",
  pastelGreen: "#C1FF72",
  pastelPink: "#FFB1D8",
  pastelPurple: "#C5B4E3",
  pastelYellow: "#FDFD96",
  white: "#FFFFFF",
  black: "#000000",
  muted: "rgba(255,255,255,0.5)",
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Fixed tab bar dimensions
  const TAB_BAR_HEIGHT = 64;
  const BOTTOM_MARGIN =
    Platform.OS === "ios" ? Math.max(insets.bottom - 10, 12) : 12;
  const HORIZONTAL_MARGIN = 20;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.black,
          tabBarInactiveTintColor: COLORS.muted,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            position: "absolute",
            bottom: BOTTOM_MARGIN,
            left: HORIZONTAL_MARGIN,
            right: HORIZONTAL_MARGIN,
            backgroundColor: COLORS.black,
            borderRadius: TAB_BAR_HEIGHT / 2,
            height: TAB_BAR_HEIGHT,
            paddingBottom: 0,
            paddingTop: 0,
            paddingHorizontal: 8,
            borderWidth: 0,
            shadowColor: COLORS.black,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 15,
          },
          tabBarItemStyle: {
            height: TAB_BAR_HEIGHT,
            paddingVertical: 0,
            justifyContent: "center",
            alignItems: "center",
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.tabIconContainer,
                  focused && styles.tabIconActive,
                ]}
              >
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={22}
                  color={focused ? COLORS.black : color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: "Tasks",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.tabIconContainer,
                  focused && styles.tabIconActive,
                ]}
              >
                <Ionicons
                  name={focused ? "list" : "list-outline"}
                  size={22}
                  color={focused ? COLORS.black : color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: "Goals",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.tabIconContainer,
                  focused && styles.tabIconActive,
                ]}
              >
                <Ionicons
                  name={focused ? "trophy" : "trophy-outline"}
                  size={22}
                  color={focused ? COLORS.black : color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.tabIconContainer,
                  focused && styles.tabIconActive,
                ]}
              >
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={22}
                  color={focused ? COLORS.black : color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Floating Add Button */}
      <Pressable
        style={[styles.fab, { bottom: TAB_BAR_HEIGHT + BOTTOM_MARGIN + 12 }]}
        onPress={() => router.push("/add-task")}
      >
        <Ionicons name="add" size={28} color={COLORS.black} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIconActive: {
    backgroundColor: COLORS.white,
  },
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    zIndex: 100,
  },
});
