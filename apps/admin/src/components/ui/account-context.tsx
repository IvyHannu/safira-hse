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
    <section className="border-t border-coolConcrete pt-1.5">
      <h2 className="text-sm font-semibold text-deepCharcoal">
        Your workspace
      </h2>
      <dl className="mt-1.5 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
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
    </section>
  );
}
