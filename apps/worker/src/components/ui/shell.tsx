import { useState, type ReactNode } from 'react';
import { colors, spacing, typography } from '@safira/design-tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface ScreenContainerProps {
  children: ReactNode;
  bottomNavigation?: ReactNode;
  fullWidth?: boolean;
}

export function ScreenContainer({
  children,
  bottomNavigation,
  fullWidth = false,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          fullWidth && styles.fullWidthContent,
        ]}
      >
        {children}
      </ScrollView>
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

interface WorkerBottomNavProps {
  items: BottomNavigationItem[];
  selectedKey: string;
  onSelect(key: string): void;
}

export function WorkerBottomNav({
  items,
  selectedKey,
  onSelect,
}: WorkerBottomNavProps) {
  return (
    <View style={styles.navigationInset}>
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
        item.key === 'report' && styles.navigationReport,
        hovered && !selected && !item.disabled && styles.navigationHover,
        selected && item.key !== 'report' && styles.navigationSelected,
        pressed && !item.disabled && styles.navigationPressed,
        pressed &&
          selected &&
          item.key !== 'report' &&
          styles.navigationSelectedPressed,
        focused && styles.navigationFocused,
        focused &&
          selected &&
          item.key !== 'report' &&
          styles.navigationSelectedFocused,
        item.disabled && styles.navigationDisabled,
      ]}
    >
      {selected && item.key !== 'report' && (
        <View accessibilityElementsHidden style={styles.activeIndicator} />
      )}
      {item.icon}
      <Text
        style={[
          styles.navigationLabel,
          selected && styles.navigationLabelSelected,
          item.key === 'report' && styles.navigationReportLabel,
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
  fullWidthContent: { maxWidth: 1200, padding: 0 },
  navigationInset: {
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: colors.coolSurface,
  },
  navigation: {
    width: '100%',
    maxWidth: 576,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 76,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: colors.deepCharcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  navigationItem: {
    flex: 1,
    minWidth: 48,
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    borderRadius: 15,
    outlineWidth: 0,
  },
  navigationReport: { minHeight: 70 },
  navigationSelected: { backgroundColor: colors.deepCharcoal },
  navigationSelectedPressed: { backgroundColor: colors.graphite },
  activeIndicator: {
    position: 'absolute',
    top: 3,
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.signalYellow,
  },
  navigationHover: { backgroundColor: colors.coolSurface },
  navigationPressed: {
    backgroundColor: colors.coolConcrete,
    transform: [{ scale: 0.97 }],
  },
  navigationFocused: { backgroundColor: colors.coolConcrete },
  navigationSelectedFocused: { backgroundColor: colors.graphite },
  navigationDisabled: { opacity: 0.45 },
  navigationLabel: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
    fontSize: 11,
  },
  navigationLabelSelected: { color: colors.white, fontWeight: '700' },
  navigationReportLabel: { color: colors.deepCharcoal, fontWeight: '700' },
});
