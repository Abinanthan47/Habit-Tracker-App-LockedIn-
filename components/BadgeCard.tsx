import { BADGE_RARITY_COLORS } from '@/lib/badges';
import type { Badge } from '@/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

// Neu Soft-Brutalism Colors
const COLORS = {
  card: '#FFFFFF',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#1F2937',
};

interface BadgeCardProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export function BadgeCard({ badge, size = 'medium', showDetails = true }: BadgeCardProps) {
  const isUnlocked = !!badge.unlockedAt;
  const rarityColor = BADGE_RARITY_COLORS[badge.rarity];
  
  const scale = useSharedValue(1);
  
  React.useEffect(() => {
    if (isUnlocked) {
      scale.value = withSpring(1.1, { damping: 10 }, () => {
        scale.value = withSpring(1, { damping: 15 });
      });
    }
  }, [isUnlocked, scale]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const sizeStyles = {
    small: { iconSize: 20, containerSize: 48 },
    medium: { iconSize: 28, containerSize: 64 },
    large: { iconSize: 40, containerSize: 88 },
  };
  
  const currentSize = sizeStyles[size];
  
  if (!showDetails) {
    return (
      <Animated.View 
        style={[
          styles.iconOnly,
          { 
            width: currentSize.containerSize, 
            height: currentSize.containerSize,
            backgroundColor: isUnlocked ? rarityColor + '25' : '#F3F4F6',
            opacity: isUnlocked ? 1 : 0.5,
          },
          animatedStyle,
        ]}
      >
        <Text style={{ fontSize: currentSize.iconSize }}>
          {badge.icon}
        </Text>
      </Animated.View>
    );
  }
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: isUnlocked ? rarityColor + '15' : '#F9FAFB',
          opacity: isUnlocked ? 1 : 0.6,
        },
        animatedStyle,
      ]}
    >
      <View style={[
        styles.iconContainer,
        { 
          width: currentSize.containerSize, 
          height: currentSize.containerSize,
          backgroundColor: isUnlocked ? rarityColor + '30' : '#F3F4F6',
        }
      ]}>
        <Text style={{ fontSize: currentSize.iconSize }}>
          {badge.icon}
        </Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.name}>{badge.name}</Text>
        <Text style={styles.description}>{badge.description}</Text>
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '30' }]}>
          <Text style={[styles.rarityText, { color: rarityColor }]}>
            {badge.rarity.toUpperCase()}
          </Text>
        </View>
      </View>
      
      {!isUnlocked && (
        <View style={styles.lockOverlay}>
          <Ionicons name="lock-closed" size={18} color={COLORS.muted} />
        </View>
      )}
    </Animated.View>
  );
}

interface BadgeGridProps {
  badges: Badge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  const unlockedCount = badges.filter(b => b.unlockedAt).length;
  
  return (
    <View style={styles.gridContainer}>
      <View style={styles.gridHeader}>
        <Text style={styles.gridTitle}>ACHIEVEMENTS</Text>
        <Text style={styles.gridCount}>{unlockedCount}/{badges.length}</Text>
      </View>
      
      <View style={styles.grid}>
        {badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} size="small" showDetails={false} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  iconOnly: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  iconContainer: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lockOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  gridContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2.5,
    borderColor: '#1F2937',
    shadowColor: '#1F2937',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1,
  },
  gridCount: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
});
