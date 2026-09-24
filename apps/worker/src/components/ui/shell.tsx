import type { ReactNode } from 'react';
import { colors, spacing, typography } from '@safira/design-tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface ScreenContainerProps {
  children: ReactNode;
  bottomNavigation?: ReactNode;
}

export function ScreenContainer({
  children,
  bottomNavigation,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      {bottomNavigation}
    </SafeAreaView>
  );
}

export interface BottomNavigationItem {
  key: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}

interface BottomNavigationShellProps {
  items: BottomNavigationItem[];
  selectedKey: string;
  onSelect(key: string): void;
}

export function BottomNavigationShell({
  items,
  selectedKey,
  onSelect,
}: BottomNavigationShellProps) {
  return (
    <View accessibilityLabel="Bottom navigation" style={styles.navigation}>
      {items.map((item) => {
        const selected = item.key === selectedKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected, disabled: !!item.disabled }}
            disabled={item.disabled}
            onPress={() => onSelect(item.key)}
            style={[
              styles.navigationItem,
              selected && styles.navigationSelected,
              item.disabled && styles.navigationDisabled,
            ]}
          >
            {item.icon}
            <Text
              style={[
                styles.navigationLabel,
                selected && styles.navigationLabelSelected,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.warmBone },
  content: { padding: spacing[3], gap: spacing[3], flexGrow: 1 },
  navigation: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: colors.graphite,
    backgroundColor: colors.white,
  },
  navigationItem: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  navigationSelected: { borderTopWidth: 3, borderColor: colors.saffron },
  navigationDisabled: { opacity: 0.45 },
  navigationLabel: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
    fontSize: 12,
  },
  navigationLabelSelected: { fontWeight: '700' },
});
