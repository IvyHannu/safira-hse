# Documentation

Project documentation will live here. The apps include minimal demo access controls but no product features or production authentication flows.

## Database foundation

Production schema and RLS policies live in `supabase/migrations/`. Local development data lives only in `supabase/seed/dev.sql` and is loaded by `supabase/config.toml`; do not run that seed against a production project. The seeded Auth users are placeholder records without passwords or identities. They are not used by the demo auth provider.

Worker report categories come from `reporting_configurations`; formal classification and severity are separate HSE assessment fields. The database trigger assigns the reporter, initial status, and per-organisation human-facing report reference. Direct client privileges exclude severity and classification on insert, and RLS restricts subsequent updates to HSE roles. Internal notes and worker-visible updates are separate tables with separate policies.

The shared auth contract and local demo adapter live in `packages/auth/src/`. Each app has its own React context and role controls. The adapter stores only a validated role in local storage; the session deliberately has no user or organisation ID. The Worker app uses Expo SQLite's local storage implementation. This is prototype UI state, not proof of identity or a production security boundary. It cannot pass the database RLS policies. To connect real user data later, replace the adapter with Supabase Auth and test membership and site permissions; do not turn demo roles into database privileges.

Shared database row types and future Supabase Auth helpers (`getCurrentUser`, `getOrganisationMembership`, `getActiveRole`, `getPermittedSites`) remain in `packages/types/src/`. Both app clients use those database types. The current app client configuration does not persist Supabase Auth sessions.

Run `pnpm db:verify` to apply the migrations and development seed in embedded PostgreSQL and exercise the core RLS boundaries. When Docker and the Supabase CLI are available, run `supabase start` and `supabase db reset` to validate against the complete Supabase stack. The embedded check supplies a minimal `auth.users` and `auth.uid()` fixture; it does not test the Auth service itself.
