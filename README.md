# Safira

pnpm workspace with an Expo worker app, Next.js admin app, shared tokens, types, and validation.

```sh
pnpm install
pnpm dev:worker
pnpm dev:admin
```

The current sign-in is a local demo role switcher; no environment variables or Supabase project are needed to try it. Select any of the four roles in either app, switch roles at any time, or sign out. Only the selected role is saved locally. Demo roles do not authenticate database requests or grant access through RLS.

Copy each app's `.env.example` to `.env.local` only when connecting a Supabase project later. The database foundation remains in `supabase/migrations/`; Supabase Auth is paused for the initial build.

```sh
pnpm db:verify
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```
