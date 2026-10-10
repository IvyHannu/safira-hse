import Image from 'next/image';
import safiraLogo from '../../../../../docs/references/brand/Safira Logo Full.png';

export function SafiraSidebarLockup({ context }: { context?: string }) {
  return (
    <span className="flex min-w-0 flex-col items-center gap-0.5">
      <Image src={safiraLogo} alt="Safira" width={104} height={104} priority />
      {context && (
        <small className="text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white/65">
          {context}
        </small>
      )}
    </span>
  );
}
