import Image, { type StaticImageData } from 'next/image';
import { illustrationSlots, type IllustrationKey } from '@safira/design-tokens';
import noResults from '../../../../../docs/references/safira-no-results.png';
import reportObservation from '../../../../../docs/references/safira-report-observation.png';
import safetyChecklist from '../../../../../docs/references/safira-safety-checklist.png';

const approvedAssets: Partial<Record<IllustrationKey, StaticImageData>> = {
  noResults,
  reportCategory: reportObservation,
  checklist: safetyChecklist,
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
  size?: 'compact' | 'support';
  className?: string;
}) {
  const slot = illustrationSlots[illustrationKey];
  const asset = approvedAssets[illustrationKey];
  if (!asset) return null;
  return (
    <div
      aria-hidden={decorative ? true : undefined}
      data-illustration-key={slot.assetKey}
      className={`relative mx-auto w-full ${size === 'support' ? 'max-w-40' : 'max-w-32'} overflow-hidden rounded-md border border-coolConcrete bg-coolSurface ${className}`}
      style={{ aspectRatio: slot.aspectRatio }}
    >
      <Image
        src={asset}
        alt={decorative ? '' : slot.alt}
        fill
        sizes={size === 'support' ? '160px' : '128px'}
        className="object-cover"
      />
    </div>
  );
}
