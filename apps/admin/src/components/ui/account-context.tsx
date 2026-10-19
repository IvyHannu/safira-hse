import { adminRoleLabels, type AdminRole } from '@/lib/admin-access';

export function AccountContext({
  role,
  organisation,
  site,
}: {
  role: AdminRole;
  organisation: string;
  site?: string;
}) {
  return (
    <dl className="grid gap-2 rounded-md border border-graphite/20 bg-coolSurface p-3 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-xs text-graphite">Organisation</dt>
        <dd className="font-semibold text-deepCharcoal">{organisation}</dd>
      </div>
      <div>
        <dt className="text-xs text-graphite">Assigned access</dt>
        <dd className="font-semibold text-deepCharcoal">
          {adminRoleLabels[role]}
        </dd>
      </div>
      {site && (
        <div className="sm:col-span-2">
          <dt className="text-xs text-graphite">Assigned site</dt>
          <dd className="font-semibold text-deepCharcoal">{site}</dd>
        </div>
      )}
    </dl>
  );
}
