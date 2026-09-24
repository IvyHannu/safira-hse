import type { SupabaseClient, User } from '@supabase/supabase-js';
import type {
  Database,
  OrganisationMember,
  OrganisationRole,
} from './database';

export type SafiraClient = SupabaseClient<Database>;

export async function getCurrentUser(
  client: SafiraClient,
): Promise<User | null> {
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session) return null;
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getOrganisationMembership(
  client: SafiraClient,
  organisationId: string,
): Promise<OrganisationMember | null> {
  const user = await getCurrentUser(client);
  if (!user) return null;
  const { data, error } = await client
    .from('organisation_members')
    .select('*')
    .eq('organisation_id', organisationId)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getActiveRole(
  client: SafiraClient,
  organisationId: string,
): Promise<OrganisationRole | null> {
  return (
    (await getOrganisationMembership(client, organisationId))?.role ?? null
  );
}

export async function getPermittedSites(
  client: SafiraClient,
  organisationId: string,
): Promise<string[]> {
  const membership = await getOrganisationMembership(client, organisationId);
  if (!membership) return [];

  if (
    membership.role === 'hse_admin' ||
    membership.role === 'organisation_admin'
  ) {
    const { data, error } = await client
      .from('sites')
      .select('id')
      .eq('organisation_id', organisationId)
      .is('archived_at', null);
    if (error) throw error;
    return data.map((site) => site.id);
  }

  const { data, error } = await client
    .from('member_site_access')
    .select('site_id')
    .eq('organisation_id', organisationId)
    .eq('member_id', membership.id)
    .is('revoked_at', null);
  if (error) throw error;
  const siteIds = data.map((access) => access.site_id);
  if (siteIds.length === 0) return [];
  const { data: sites, error: sitesError } = await client
    .from('sites')
    .select('id')
    .eq('organisation_id', organisationId)
    .in('id', siteIds)
    .is('archived_at', null);
  if (sitesError) throw sitesError;
  return sites.map((site) => site.id);
}
