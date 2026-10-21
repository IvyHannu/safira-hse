import type { ReactNode } from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import type { IllustrationKey } from '@safira/design-tokens';
import { IllustrationSlot } from './illustration-slot';

export function OnboardingStepContent({
  points,
  illustrationKey,
  leading,
}: {
  points: readonly string[];
  illustrationKey?: IllustrationKey | null;
  leading?: ReactNode;
}) {
  return (
    <div className={`grid ${illustrationKey ? 'gap-4' : 'gap-2.5'}`}>
      {illustrationKey && (
        <IllustrationSlot
          illustrationKey={illustrationKey}
          decorative
          size="hero"
        />
      )}
      {leading}
      <ul
        className={`divide-y divide-graphite/10 ${illustrationKey ? 'px-1' : ''}`}
      >
        {points.map((point) => (
          <li
            key={point}
            className="flex items-start gap-3 py-2 text-sm leading-5 text-graphite first:pt-0 last:pb-0"
          >
            <CheckCircle
              size={18}
              weight="bold"
              className="mt-0.5 shrink-0 text-deepCharcoal"
              aria-hidden="true"
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
