import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { BorderRadius, Colors, Layout, Spacing } from "@/constants/design";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const TAB_BAR_HEIGHT = Layout.tabBarHeight;
  const BOTTOM_PADDING = Platform.OS === "ios" ? Math.max(insets.bottom, 8) : 8;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.cyberLime,
          tabBarInactiveTintColor: Colors.textMuted,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: Colors.surface,
            height: TAB_BAR_HEIGHT + BOTTOM_PADDING,
            paddingBottom: BOTTOM_PADDING,
            paddingTop: Spacing.sm,
            paddingHorizontal: Spacing.md,
            borderTopWidth: 1,
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            borderTopColor: Colors.cyberLime,
          },
          tabBarItemStyle: {
            height: TAB_BAR_HEIGHT - Spacing.sm,
            paddingVertical: 0,
            justifyContent: "center",
            alignItems: "center",
          },
          tabBarShowLabel:false,
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
                  color={focused ? Colors.background : color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: "Habits",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.tabIconContainer,
                  focused && styles.tabIconActive,
                ]}
              >
                <Ionicons
                  name={focused ? "checkbox" : "checkbox-outline"}
                  size={22}
                  color={focused ? Colors.background : color}
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
                  color={focused ? Colors.background : color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Stats",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.tabIconContainer,
                  focused && styles.tabIconActive,
                ]}
              >
                <Ionicons
                  name={focused ? "stats-chart" : "stats-chart-outline"}
                  size={22}
                  color={focused ? Colors.background : color}
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
    </View>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIconActive: {
    backgroundColor: Colors.cyberLime,
  },
});
