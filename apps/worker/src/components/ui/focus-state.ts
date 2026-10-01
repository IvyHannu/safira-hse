import { StyleSheet } from 'react-native';
import { colors } from '@safira/design-tokens';

export const focusState = StyleSheet.create({
  base: {
    outlineWidth: 0,
    outlineStyle: 'solid',
    outlineColor: 'transparent',
  },
  focused: {
    borderWidth: 1,
    borderColor: colors.signalYellow,
    borderBottomColor: colors.signalYellow,
    backgroundColor: colors.coolSurface,
  },
});
