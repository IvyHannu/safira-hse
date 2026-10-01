import type { ReactNode } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import ArrowRight from 'phosphor-react-native/src/icons/ArrowRight';
import Info from 'phosphor-react-native/src/icons/Info';
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { PressableCard } from './feedback';
import { PrimaryButton } from './actions';
import { ProfileAvatar } from './profile-avatar';

const fullLogo = require('../../../../../docs/references/brand/Safira Logo Full.png');
const guidanceIllustration = require('../../../../../docs/references/safira-oil-leak-hazard-illustration.png');

export function WorkerHomeHeader({
  siteName,
  area,
  firstName,
  photoUri,
}: {
  siteName: string;
  area: string;
  firstName: string;
  photoUri?: string | null;
}) {
  return (
    <View style={styles.header}>
      <Image
        source={fullLogo}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Safira"
      />
      <View style={styles.headerContext}>
        <View style={styles.siteContext}>
          <Text style={styles.headerSite} numberOfLines={1}>
            {siteName}
          </Text>
          <Text style={styles.headerArea} numberOfLines={1}>
            {area}
          </Text>
        </View>
        <ProfileAvatar name={firstName} photoUri={photoUri} variant="header" />
      </View>
    </View>
  );
}

export function HeroActionCard({ onReport }: { onReport(): void }) {
  return (
    <View style={styles.hero}>
      <Text style={styles.heroTitle}>A safer workplace starts with you.</Text>
      <Text style={styles.heroMessage}>See something? Report it.</Text>
      <PrimaryButton
        label="Report something"
        trailingIcon={
          <ArrowRight size={20} weight="bold" color={colors.deepCharcoal} />
        }
        onPress={onReport}
      />
    </View>
  );
}

export function DraftStatusCard({ onContinue }: { onContinue(): void }) {
  return (
    <PressableCard
      label="Continue report in progress"
      onPress={onContinue}
      style={styles.draft}
    >
      <View style={styles.draftAccent} accessibilityElementsHidden />
      <View style={styles.draftCopy}>
        <Text style={styles.draftTitle}>Report in progress</Text>
        <Text style={styles.draftMessage}>
          Your draft is saved on this device. Choose Report something to
          continue.
        </Text>
      </View>
      <ArrowRight size={18} color={colors.deepCharcoal} />
    </PressableCard>
  );
}

export function QuickAccessCard({
  label,
  description,
  detail,
  icon,
  onPress,
}: {
  label: string;
  description: string;
  detail: string;
  icon: ReactNode;
  onPress(): void;
}) {
  return (
    <PressableCard
      label={label}
      onPress={onPress}
      style={[styles.homeCardElevation, styles.quickCard]}
    >
      <View style={styles.quickIcon}>{icon}</View>
      <Text style={styles.quickTitle} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.quickDescription} numberOfLines={2}>
        {description}
      </Text>
      <Text style={styles.quickDetail} numberOfLines={2}>
        {detail}
      </Text>
    </PressableCard>
  );
}

export function GuidanceCard() {
  const { width } = useWindowDimensions();
  const narrow = width <= 340;
  return (
    <View
      style={[
        styles.homeCardElevation,
        styles.guidance,
        narrow && styles.guidanceNarrow,
      ]}
    >
      <View style={styles.guidanceCopy}>
        <Text style={styles.guidanceTitle}>Keep our workplace safe</Text>
        <Text style={styles.guidanceMessage}>
          Your awareness helps prevent incidents and protects our people, our
          environment and our communities.
        </Text>
      </View>
      <Image
        source={guidanceIllustration}
        style={[styles.guidanceImage, narrow && styles.guidanceImageNarrow]}
        resizeMode="cover"
        accessibilityLabel="Worker checking an oil leak at industrial pipework"
      />
    </View>
  );
}

export function NoticeCard({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View
      accessibilityLabel={`Site update: ${title}. ${message}`}
      style={[styles.homeCardElevation, styles.notice]}
    >
      <View style={styles.noticeCopy}>
        <View style={styles.noticeHeading}>
          <Info size={16} color={colors.graphite} weight="bold" />
          <Text style={styles.noticeLabel}>SITE UPDATE</Text>
        </View>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text style={styles.noticeMessage}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  homeCardElevation: {
    borderRadius: radius.lg,
    shadowColor: colors.deepCharcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 1,
  },
  header: {
    minHeight: 80,
    paddingHorizontal: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[1],
    backgroundColor: colors.deepCharcoal,
  },
  logo: { width: 72, height: 72 },
  headerContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    minWidth: 0,
    flexShrink: 1,
  },
  siteContext: { alignItems: 'flex-end', flexShrink: 1, minWidth: 0 },
  headerSite: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  headerArea: {
    color: colors.coolConcrete,
    fontFamily: typography.fontFamily,
    fontSize: 10,
  },
  hero: {
    gap: spacing[1],
    padding: spacing[2],
    borderRadius: radius.lg,
    backgroundColor: colors.deepCharcoal,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 29,
    maxWidth: 320,
  },
  heroMessage: {
    color: colors.coolConcrete,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing[1],
  },
  draft: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    padding: spacing[1],
    borderColor: colors.signalYellow,
  },
  draftAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: colors.signalYellow,
  },
  draftCopy: { flex: 1, minWidth: 0, gap: 3 },
  draftTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  draftMessage: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  quickCard: { flex: 1, minWidth: 0, minHeight: 138, gap: 4, padding: 12 },
  quickIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.coolSurface,
  },
  quickTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  quickDescription: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  quickDetail: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    lineHeight: 15,
  },
  guidance: {
    minHeight: 176,
    flexDirection: 'row',
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    overflow: 'hidden',
  },
  guidanceNarrow: { flexDirection: 'column' },
  guidanceCopy: { flex: 1, minWidth: 0, gap: spacing[1], padding: 12 },
  guidanceTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  guidanceMessage: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  guidanceImage: { width: '38%', height: 176 },
  guidanceImageNarrow: {
    width: '100%',
    height: 112,
    minHeight: 112,
  },
  notice: {
    minHeight: 64,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderLeftWidth: 4,
    borderLeftColor: colors.signalYellow,
    backgroundColor: colors.white,
  },
  noticeCopy: { gap: 3 },
  noticeHeading: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  noticeLabel: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  noticeTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  noticeMessage: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
});
