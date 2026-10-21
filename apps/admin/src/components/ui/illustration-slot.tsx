import Image, { type StaticImageData } from 'next/image';
import { illustrationSlots, type IllustrationKey } from '@safira/design-tokens';
import noResults from '../../../../../docs/references/safira-no-results.png';
import reportObservation from '../../../../../docs/references/safira-report-observation.png';
import safetyChecklist from '../../../../../docs/references/safira-safety-checklist.png';
import siteWorkplace from '../../../../../docs/references/safira-site-workplace.png';

const approvedAssets: Partial<Record<IllustrationKey, StaticImageData>> = {
  noResults,
  reportCategory: reportObservation,
  checklist: safetyChecklist,
  siteWorkplace,
};

/** A restrained, accessible space for future approved Safira illustrations. */
export function IllustrationSlot({
  illustrationKey,
  decorative = false,
  size = 'compact',
  className = '',
}: {
  illustrationKey: IllustrationKey;
  decorative?: boolean;
  size?: 'compact' | 'support' | 'hero';
  className?: string;
}) {
  const slot = illustrationSlots[illustrationKey];
  const asset = approvedAssets[illustrationKey];
  if (!asset) return null;
  return (
    <div
      aria-hidden={decorative ? true : undefined}
      data-illustration-key={slot.assetKey}
      className={`relative mx-auto w-full ${size === 'hero' ? 'aspect-[4/3] max-h-[31dvh] md:aspect-[16/10] md:max-h-[420px]' : size === 'support' ? 'max-w-40' : 'max-w-32'} overflow-hidden rounded-md border border-coolConcrete bg-coolSurface ${className}`}
      style={size === 'hero' ? undefined : { aspectRatio: slot.aspectRatio }}
    >
      <Image
        src={asset}
        alt={decorative ? '' : slot.alt}
        fill
        sizes={
          size === 'hero'
            ? '(max-width: 640px) calc(100vw - 32px), 680px'
            : size === 'support'
              ? '160px'
              : '128px'
        }
        className="object-cover"
      />
    </div>
  );
}
