import Image, { type StaticImageData } from 'next/image';
import { illustrationSlots, type IllustrationKey } from '@safira/design-tokens';

const approvedAssets: Partial<Record<IllustrationKey, StaticImageData>> = {};

/** A restrained, accessible space for future approved Safira illustrations. */
export function IllustrationSlot({
  illustrationKey,
  decorative = false,
  className = '',
}: {
  illustrationKey: IllustrationKey;
  decorative?: boolean;
  className?: string;
}) {
  const slot = illustrationSlots[illustrationKey];
  const asset = approvedAssets[illustrationKey];
  return (
    <div
      aria-hidden={!asset || decorative ? true : undefined}
      data-illustration-key={slot.assetKey}
      className={`relative mx-auto w-full max-w-32 overflow-hidden rounded-md border border-coolConcrete bg-coolSurface ${className}`}
      style={{ aspectRatio: slot.aspectRatio }}
    >
      {asset && (
        <Image
          src={asset}
          alt={decorative ? '' : slot.alt}
          fill
          sizes="128px"
          className="object-contain"
        />
      )}
    </div>
  );
}
