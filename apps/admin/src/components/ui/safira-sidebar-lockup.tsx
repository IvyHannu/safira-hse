import Image from 'next/image';
import safiraMark from '../../../../../docs/references/brand/Safira Mark.png';
import safiraLogo from '../../../../../docs/references/brand/Safira Logo Full.png';

export function SafiraSidebarLockup() {
  return (
    <span
      className="flex shrink-0 items-center gap-1"
      role="img"
      aria-label="Safira"
    >
      <Image src={safiraMark} alt="" width={38} height={38} priority />
      <span
        className="relative block h-6 w-[115px] overflow-hidden"
        aria-hidden="true"
      >
        <Image
          src={safiraLogo}
          alt=""
          width={115}
          height={115}
          priority
          className="absolute left-0 top-[-82px] max-w-none"
        />
      </span>
    </span>
  );
}
