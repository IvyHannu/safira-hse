import { useState } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { isVisibleKeyboardFocus } from './actions';

interface FilterTab<Key extends string> {
  key: Key;
  label: string;
}

interface FilterTabsProps<Key extends string> {
  items: readonly FilterTab<Key>[];
  selectedKey: Key;
  onSelect(key: Key): void;
  accessibilityLabel: string;
}

export function FilterTabs<Key extends string>({
  items,
  selectedKey,
  onSelect,
  accessibilityLabel,
}: FilterTabsProps<Key>) {
  const [hoveredKey, setHoveredKey] = useState<Key | null>(null);
  const [focusedKey, setFocusedKey] = useState<Key | null>(null);

  return (
    <View
      style={styles.tabs}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="tab"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: selectedKey === item.key }}
          onPress={() => onSelect(item.key)}
          onHoverIn={() => setHoveredKey(item.key)}
          onHoverOut={() => setHoveredKey(null)}
          onFocus={(event) =>
            setFocusedKey(
              isVisibleKeyboardFocus(event.target) ? item.key : null,
            )
          }
          onBlur={() => setFocusedKey(null)}
          style={({ pressed }) => [
            styles.tab,
            hoveredKey === item.key &&
              selectedKey !== item.key &&
              styles.tabHover,
            selectedKey === item.key && styles.tabSelected,
            pressed && styles.tabPressed,
            focusedKey === item.key && styles.tabFocused,
          ]}
        >
          <Text
            style={[
              styles.label,
              selectedKey === item.key && styles.labelSelected,
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing[1] },
  tab: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing[2],
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.sm,
  },
  tabSelected: {
    backgroundColor: colors.coolConcrete,
    borderColor: colors.coolConcrete,
  },
  tabHover: { backgroundColor: colors.coolSurface },
  tabPressed: { backgroundColor: colors.coolConcrete },
  tabFocused: { borderColor: colors.signalYellow },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.graphite,
  },
  labelSelected: { color: colors.deepCharcoal, fontWeight: '700' },
});
