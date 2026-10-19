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
  children: ReactNode;
  actions: ReactNode;
}) {
  const onboarding = presentation === 'onboarding';
  return (
    <div className="min-h-dvh bg-coolSurface px-4 py-4 text-deepCharcoal sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[680px] flex-col sm:min-h-[calc(100dvh-4rem)]">
        <AccountBrandHeader context={context} compact={onboarding} />
        <main className="flex flex-1 items-center py-4 sm:py-8">
          <div className="w-full">
            {onboarding ? (
              <div className="mb-4 grid gap-2.5">
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
            ) : (
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-graphite">
                {phase} · {step} of {totalSteps}
              </p>
            )}
            <h1
              className={`${onboarding ? 'mt-0' : 'mt-2'} text-[26px] font-bold leading-8 sm:text-[30px] sm:leading-9`}
            >
              {title}
            </h1>
            <p className="mt-2 max-w-[58ch] text-sm leading-6 text-graphite sm:text-[15px]">
              {description}
            </p>
            <Card className={onboarding ? 'mt-3 gap-3 p-4' : 'mt-5 gap-3'}>
              {children}
            </Card>
            {!onboarding && (
              <div className="mt-5">
                <ProgressSegments
                  phase={phase}
                  step={step}
                  totalSteps={totalSteps}
                />
              </div>
            )}
            <div
              className={
                onboarding
                  ? 'mt-3 flex gap-2 [&>button]:min-w-0 [&>button:first-child:not(:last-child)]:basis-[32%] [&>button:last-child]:flex-1 sm:justify-end sm:[&>button]:flex-none'
                  : 'mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end'
              }
            >
              {actions}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
