import { useEffect, useState } from 'react';
import { colors } from '@safira/design-tokens';
import ClipboardText from 'phosphor-react-native/src/icons/ClipboardText';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const safiraLogo = require('../../../../../docs/references/brand/Safira Logo Full.png');

export function WorkerLaunchSplash({
  onBrandReady,
  readyToFinish,
  onFinished,
}: {
  onBrandReady?: () => void;
  readyToFinish: boolean;
  onFinished: () => void;
}) {
  const [progress] = useState(() => new Animated.Value(0));
  const [reducedMotion, setReducedMotion] = useState(false);
  const [brandRendered, setBrandRendered] = useState(false);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReducedMotion(enabled);
    });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (!brandRendered) return;
    if (reducedMotion) {
      progress.setValue(0.94);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 0.94,
      duration: 3250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [brandRendered, progress, reducedMotion]);
  useEffect(() => {
    if (!readyToFinish) return;
    progress.stopAnimation(() => {
      Animated.timing(progress, {
        toValue: 1,
        duration: reducedMotion ? 0 : 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) onFinished();
      });
    });
  }, [onFinished, progress, readyToFinish, reducedMotion]);
  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const iconLeft = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 186],
  });
  return (
    <View
      style={styles.screen}
      accessibilityRole="progressbar"
      accessibilityLabel="Opening Safira"
    >
      <Image
        source={safiraLogo}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Safira"
        onLoadEnd={() => {
          setBrandRendered(true);
          onBrandReady?.();
        }}
      />
      <Text style={styles.line}>
        See it. Report it. Know what happened next.
      </Text>
      <View style={styles.progressArea} accessibilityElementsHidden>
        <View style={styles.track}>
          <Animated.View style={[styles.signal, { width: fillWidth }]} />
        </View>
        <Animated.View style={[styles.inspectionIcon, { left: iconLeft }]}>
          <ClipboardText size={17} weight="bold" color={colors.signalYellow} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: colors.deepCharcoal,
  },
  logo: { width: 208, height: 208, maxWidth: '65%' },
  line: {
    maxWidth: 280,
    color: colors.white,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  progressArea: {
    width: 196,
    height: 28,
    justifyContent: 'center',
  },
  track: {
    marginHorizontal: 10,
    height: 3,
    overflow: 'hidden',
    backgroundColor: colors.graphite,
    borderRadius: 2,
  },
  signal: { height: 3, backgroundColor: colors.signalYellow },
  inspectionIcon: {
    position: 'absolute',
    top: 5,
    width: 20,
    height: 20,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.deepCharcoal,
  },
});
