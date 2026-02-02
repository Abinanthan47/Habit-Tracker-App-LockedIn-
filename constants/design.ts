// Design System - Cyber Lime Dark Theme
// A minimalistic, clean, and gamified design system

export const Colors = {
  // Cyber Lime Accent
  cyberLime: "#CDFF00",
  cyberLimeLight: "rgba(205, 255, 0, 0.15)",
  cyberLimeMuted: "rgba(205, 255, 0, 0.6)",

  // Background Hierarchy (Dark Theme)
  background: "#0A0A0A",
  surface: "#121212",
  surfaceElevated: "#1A1A1A",
  surfaceHover: "#252525",

  // Text Colors
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted: "#606060",
  textAccent: "#CDFF00",

  // Border Colors
  borderDefault: "#2A2A2A",
  borderActive: "#CDFF00",
  borderMuted: "#1F1F1F",

  // Status Colors
  success: "#37eb5eff",
  warning: "#FFB800",
  error: "#FF4444",
  info: "#00B4FF",

  // Heatmap Colors (Cyber Lime gradient)
  heatmap: {
    empty: "#1A1A1A",
    level1: "rgba(205, 255, 0, 0.2)",
    level2: "rgba(205, 255, 0, 0.4)",
    level3: "rgba(205, 255, 0, 0.7)",
    level4: "#CDFF00",
  },

  // Streak Colors
  streak: {
    cold: "#3B82F6",
    warm: "#F59E0B",
    hot: "#EF4444",
    fire: "#CDFF00",
  },

  // Category Colors
  category: {
    health: "#00FF88",
    fitness: "#FF6B6B",
    mindfulness: "#A78BFA",
    learning: "#3B82F6",
    work: "#F59E0B",
    personal: "#EC4899",
  },
} as const;

// Font Families
// Syne - for headings (display font)
// Inter - for body text, labels, descriptions
// Acme - for numbers, stats, counters
export const Typography = {
  fonts: {
    // Headings - Syne (bold, display)
    heading: "Syne_700Bold",
    headingLight: "Syne_600SemiBold",
    headingHeavy: "Syne_800ExtraBold",

    // Body - Inter (readable, clean)
    body: "Inter_400Regular",
    bodyMedium: "Inter_500Medium",
    bodySemibold: "Inter_600SemiBold",
    bodyBold: "Inter_700Bold",

    // Numbers/Stats - Acme (fun, bold)
    number: "Acme_400Regular",
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    black: "800" as const,
  },
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    "2xl": 22,
    "3xl": 28,
    "4xl": 36,
    "5xl": 48,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,
  "5xl": 64,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 6,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: Colors.cyberLime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const Animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
} as const;

export const Layout = {
  screenPadding: 16,
  cardPadding: 16,
  headerHeight: 56,
  tabBarHeight: 70,
  tabBarMarginBottom: 16,
  tabBarMarginHorizontal: 16,
} as const;

// Chart Colors
export const ChartColors = {
  primary: Colors.cyberLime,
  secondary: Colors.info,
  tertiary: Colors.success,
  quaternary: Colors.warning,
  gradient: ["#CDFF00", "#00FF88", "#00B4FF"],
} as const;

// Heatmap Configuration
export const HeatmapConfig = {
  cellSize: 28, // Reduced from dynamic calculation
  cellGap: 3,
  cellRadius: 4,
} as const;

// Helper function to get heatmap color based on activity level
export const getHeatmapColor = (level: number): string => {
  if (level <= 0) return Colors.heatmap.empty;
  if (level < 0.25) return Colors.heatmap.level1;
  if (level < 0.5) return Colors.heatmap.level2;
  if (level < 0.8) return Colors.heatmap.level3;
  return Colors.heatmap.level4;
};

// Get streak color based on streak length
export const getStreakColor = (streak: number): string => {
  if (streak <= 3) return Colors.streak.cold;
  if (streak <= 7) return Colors.streak.warm;
  if (streak <= 21) return Colors.streak.hot;
  return Colors.streak.fire;
};

// Helper function to get category color
export const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = Colors.category;
  return categoryColors[category] || Colors.cyberLime;
};

// Day labels for calendar/heatmap
export const DayLabels = ["S", "M", "T", "W", "T", "F", "S"];
export const DayLabelsFull = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MonthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const MonthLabelsFull = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Frequency options
export const FrequencyOptions = [
  { key: "daily", label: "Daily", icon: "today-outline" },
  { key: "weekly", label: "Weekly", icon: "calendar-outline" },
  { key: "monthly", label: "Monthly", icon: "calendar-number-outline" },
] as const;
