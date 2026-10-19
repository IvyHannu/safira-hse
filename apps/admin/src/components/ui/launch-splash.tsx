'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { ClipboardText } from '@phosphor-icons/react';
import Image from 'next/image';
import safiraLogo from '../../../../../docs/references/brand/Safira Logo Full.png';

function subscribeToReducedMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function AdminLaunchSplash({
  onBrandReady,
  readyToFinish,
  onFinished,
}: {
  onBrandReady?: () => void;
  readyToFinish: boolean;
  onFinished: () => void;
}) {
  const [brandRendered, setBrandRendered] = useState(false);
  const [progress, setProgress] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const brandNotified = useRef(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    prefersReducedMotion,
    () => false,
  );

  useEffect(() => {
    if (!brandRendered) return;
    const frame = requestAnimationFrame(() => setProgress(94));
    return () => cancelAnimationFrame(frame);
  }, [brandRendered]);

  useEffect(() => {
    if (!readyToFinish || !brandRendered) return;
    const frame = requestAnimationFrame(() => setProgress(100));
    return () => cancelAnimationFrame(frame);
  }, [brandRendered, readyToFinish]);

  useEffect(() => {
    if (readyToFinish && progress === 100 && reducedMotion) onFinished();
  }, [onFinished, progress, readyToFinish, reducedMotion]);

  const brandReady = useCallback(() => {
    if (brandNotified.current) return;
    brandNotified.current = true;
    setBrandRendered(true);
    onBrandReady?.();
  }, [onBrandReady]);

  useEffect(() => {
    if (!imageRef.current?.complete) return;
    const frame = requestAnimationFrame(brandReady);
    return () => cancelAnimationFrame(frame);
  }, [brandReady]);

  const progressDuration = reducedMotion
    ? '0ms'
    : progress === 100
      ? '240ms'
      : '3250ms';

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-deepCharcoal px-4 text-white"
      role="status"
      aria-label="Opening Safira"
    >
      <Image
        ref={imageRef}
        src={safiraLogo}
        alt="Safira"
        width={208}
        height={208}
        priority
        className="h-52 w-52 max-w-[65vw] object-contain"
        onLoad={brandReady}
        onError={brandReady}
      />
      <p className="max-w-72 text-center text-[13px] leading-5 text-white">
        See it. Report it. Know what happened next.
      </p>
      <div className="relative mt-2 w-44" aria-hidden="true">
        <div className="h-0.5 w-full rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-signalYellow transition-[width] ease-linear"
            style={{
              width: `${progress}%`,
              transitionDuration: progressDuration,
            }}
            onTransitionEnd={() => {
              if (progress === 100 && readyToFinish) onFinished();
            }}
          />
        </div>
        <ClipboardText
          size={18}
          weight="bold"
          className="absolute top-1/2 text-signalYellow transition-[left] ease-linear"
          style={{
            left: `${progress}%`,
            transform: 'translate(-50%, -50%)',
            transitionDuration: progressDuration,
          }}
        />
      </div>
    </main>
  );
}
