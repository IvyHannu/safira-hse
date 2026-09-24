import { organisationRoleSchema } from '@safira/validation';
import type { OrganisationRole } from '@safira/types';

export type AuthRole = OrganisationRole;

/** A demo session conveys UI state only; it is not a Supabase identity. */
export interface AuthSession {
  mode: 'demo' | 'supabase';
  role: AuthRole;
  userId: string | null;
  organisationId: string | null;
}

/** App code consumes this contract; the implementation may change later. */
export interface AuthProvider {
  getSession(): Promise<AuthSession | null>;
  signIn(role: AuthRole): Promise<AuthSession>;
  signOut(): Promise<void>;
}

export interface AuthStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const storageKey = 'safira.demo.role.v1';

/** Persists only the selected role. No credentials or Supabase tokens are stored. */
export function createLocalDemoAuthProvider(
  getStorage: () => AuthStorage,
): AuthProvider {
  const sessionFor = (role: AuthRole): AuthSession => ({
    mode: 'demo',
    role,
    userId: null,
    organisationId: null,
  });

  return {
    async getSession() {
      const storage = getStorage();
      const savedRole = storage.getItem(storageKey);
      const parsedRole = organisationRoleSchema.safeParse(savedRole);
      if (parsedRole.success) return sessionFor(parsedRole.data);
      if (savedRole !== null) storage.removeItem(storageKey);
      return null;
    },
    async signIn(role) {
      const parsedRole = organisationRoleSchema.parse(role);
      getStorage().setItem(storageKey, parsedRole);
      return sessionFor(parsedRole);
    },
    async signOut() {
      getStorage().removeItem(storageKey);
    },
  };
}
