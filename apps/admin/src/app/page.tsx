'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Buildings,
  CaretRight,
  ClipboardText,
  ShieldCheck,
  UsersThree,
} from '@phosphor-icons/react';
import type { AuthRole } from '@safira/auth';
import safiraLogo from '../../../../docs/references/brand/Safira Logo Full.png';
import { SignOutButton } from '@/components/ui/sign-out-button';
import { useAuth } from '@/lib/demo-auth';

const roles = [
  {
    value: 'worker',
    label: 'Worker',
    detail: 'Report issues, follow updates and complete safety checks',
    icon: ClipboardText,
  },
  {
    value: 'hse_officer',
    label: 'HSE Officer',
    detail: 'Review reports, assess risk and manage actions',
    icon: ShieldCheck,
  },
  {
    value: 'hse_admin',
    label: 'HSE Admin',
    detail: 'Manage HSE operations, configuration and oversight',
    icon: Buildings,
  },
  {
    value: 'organisation_admin',
    label: 'Organisation Admin',
    detail: 'Manage people, sites and organisation access',
    icon: UsersThree,
  },
] as const;

export default function Home() {
  const router = useRouter();
  const { loading, error, signIn, signOut } = useAuth();

  async function chooseRole(role: AuthRole) {
    if (role === 'worker') {
      if (!(await signIn(role))) return;
      const base =
        process.env.NEXT_PUBLIC_WORKER_DEMO_URL || 'http://localhost:8081';
      window.open(`${base.replace(/\/$/, '')}/?workspaceRole=worker`, '_self');
      return;
    }
    if (await signIn(role)) router.push('/workspace');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-coolSurface text-graphite md:px-8 md:py-8">
      <section className="grid w-full max-w-[1200px] overflow-hidden bg-coolSurface md:min-h-[680px] md:grid-cols-[42%_58%] md:rounded-xl md:border md:border-coolConcrete">
        <div className="flex min-h-[290px] flex-col gap-8 bg-[#121412] px-6 py-7 text-white md:p-10">
          <Image
            src={safiraLogo}
            alt="Safira"
            width={120}
            height={120}
            priority
            className="h-[120px] w-[120px] object-contain"
          />
          <div className="pl-4 md:my-auto">
            <h2 className="text-[30px] font-bold leading-9">
              Safer reporting.
              <br />
              Clearer action.
            </h2>
            <p className="mt-4 max-w-[320px] text-[15px] leading-[22px] text-coolConcrete">
              See it. Report it. Know what happened next.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-6 px-6 py-7 md:p-10">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-graphite">
              WELCOME TO SAFIRA
            </p>
            <h1 className="mt-2 text-[28px] font-bold leading-[34px] text-deepCharcoal">
              Choose your workspace
            </h1>
            <p className="mt-2 text-[15px] leading-[22px]">
              Continue as the role that matches your work.
            </p>
          </div>
          {loading ? (
            <p role="status">Opening Safira…</p>
          ) : (
            <div className="grid gap-3">
              {roles.map(({ value, label, detail, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => void chooseRole(value)}
                  className="flex min-h-[84px] w-full items-center gap-4 rounded-md border border-coolConcrete bg-white px-4 py-2 text-left shadow-sm transition-[background-color,border-color,transform,box-shadow] hover:border-signalYellow hover:bg-coolSurface hover:shadow-md active:scale-[0.99] active:border-signalYellow active:bg-[#FFD21A]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow motion-reduce:transition-none"
                >
                  <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-sm bg-signalYellow text-deepCharcoal">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold text-deepCharcoal">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-[18px] text-graphite">
                      {detail}
                    </span>
                  </span>
                  <CaretRight
                    size={20}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                </button>
              ))}
              <SignOutButton
                onClick={() => void signOut()}
                className="mt-2 justify-self-start"
              />
            </div>
          )}
          {error && (
            <p className="text-sm font-semibold text-critical" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
