import { useState, type ReactNode } from 'react';
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
      {items.map((item) => (
        <BottomNavigationButton
          key={item.key}
          item={item}
          selected={item.key === selectedKey}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

function BottomNavigationButton({
  item,
  selected,
  onSelect,
}: {
  item: BottomNavigationItem;
  selected: boolean;
  onSelect(key: string): void;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected, disabled: !!item.disabled }}
      disabled={item.disabled}
      onPress={() => onSelect(item.key)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.navigationItem,
        selected && styles.navigationSelected,
        hovered && !item.disabled && styles.navigationHover,
        pressed && !item.disabled && styles.navigationPressed,
        focused && styles.navigationFocused,
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
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.coolSurface },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: spacing[2],
    gap: spacing[2],
    flexGrow: 1,
  },
  navigation: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: colors.coolConcrete,
    backgroundColor: colors.white,
    shadowColor: colors.deepCharcoal,
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  navigationItem: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderTopWidth: 3,
    borderTopColor: 'transparent',
  },
  navigationSelected: { borderTopColor: colors.signalYellow },
  navigationHover: { backgroundColor: colors.coolSurface },
  navigationPressed: { backgroundColor: colors.coolConcrete },
  navigationFocused: { borderTopColor: colors.deepCharcoal },
  navigationDisabled: { opacity: 0.45 },
  navigationLabel: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
    fontSize: 12,
  },
  navigationLabelSelected: { color: colors.deepCharcoal, fontWeight: '700' },
});
