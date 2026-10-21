import type { ReactNode } from 'react';
import { Card } from './feedback';
import { SafiraSidebarLockup } from './safira-sidebar-lockup';

export function AccountBrandHeader({
  context,
  compact = false,
}: {
  context: string;
  compact?: boolean;
}) {
  return (
    <header
      className={`flex items-center justify-center rounded-lg bg-deepCharcoal p-2 ${compact ? 'min-h-[96px] [&_img]:!size-20' : 'min-h-[116px]'}`}
    >
      <SafiraSidebarLockup context={context} />
    </header>
  );
}

function ProgressSegments({
  phase,
  step,
  totalSteps,
}: {
  phase: string;
  step: number;
  totalSteps: number;
}) {
  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-label={`${phase} progress`}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={step}
    >
      {Array.from({ length: totalSteps }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 flex-1 rounded-full ${index < step ? 'bg-signalYellow' : 'bg-coolConcrete'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function AccountFlowShell({
  context,
  title,
  description,
  step,
  totalSteps,
  phase = 'Introduction',
  presentation = 'default',
  contentSurface = 'card',
  children,
  actions,
}: {
  context: string;
  title: string;
  description: string;
  step: number;
  totalSteps: number;
  phase?: string;
  presentation?: 'default' | 'onboarding';
  contentSurface?: 'card' | 'plain';
  children: ReactNode;
  actions: ReactNode;
}) {
  const onboarding = presentation === 'onboarding';
  const illustrationLed = onboarding && contentSurface === 'plain';
  return (
    <div className="flex min-h-dvh flex-col bg-coolSurface px-2 py-2 text-deepCharcoal sm:px-3 sm:py-3">
      <div className="mx-auto my-auto w-full max-w-[680px]">
        <AccountBrandHeader context={context} compact />
        <main className="pt-3 sm:pt-3.5">
          <div className="mb-2.5 grid gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-xs font-semibold text-graphite">
              <span>{phase}</span>
              <span className="font-mono tabular-nums">
                {String(step).padStart(2, '0')} /{' '}
                {String(totalSteps).padStart(2, '0')}
              </span>
            </div>
            <ProgressSegments
              phase={phase}
              step={step}
              totalSteps={totalSteps}
            />
          </div>
          <h1 className="text-[26px] font-bold leading-8 sm:text-[30px] sm:leading-9">
            {title}
          </h1>
          <p className="mt-1 max-w-[58ch] text-sm leading-6 text-graphite sm:text-[15px]">
            {description}
          </p>
          {illustrationLed ? (
            <div className="mt-3 grid gap-2">{children}</div>
          ) : (
            <Card className="mt-3 gap-2 p-2.5">{children}</Card>
          )}
          <div
            className={
              onboarding
                ? 'mt-3 flex gap-2 [&>button]:min-w-0 [&>button:first-child:not(:last-child)]:basis-[32%] [&>button:last-child]:flex-1 sm:justify-end sm:[&>button]:flex-none'
                : 'mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end'
            }
          >
            {actions}
          </div>
        </main>
      </div>
    </div>
  );
}
