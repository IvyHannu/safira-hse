import {
  Buildings,
  Clock,
  MapPin,
  ShieldCheck,
  Users,
  Warning,
} from '@phosphor-icons/react/dist/ssr';
import { PageHeader } from '@/components/ui/shell';
import { Card, InfoCard } from '@/components/ui/feedback';
import { StatusLabel } from '@/components/ui/status-label';
import { organisationOverview } from '@/data/organisation-overview';

const metrics = [
  {
    label: 'Active users',
    value: organisationOverview.activeUsers,
    detail: 'Across the organisation',
    icon: Users,
  },
  {
    label: 'Active sites',
    value: organisationOverview.activeSites,
    detail: 'Available work locations',
    icon: MapPin,
  },
  {
    label: 'Pending invites',
    value: organisationOverview.pendingInvitations,
    detail: 'Awaiting acceptance',
    icon: Clock,
  },
  {
    label: 'Access issues',
    value: organisationOverview.accessIssues,
    detail: 'Need a decision',
    icon: ShieldCheck,
  },
];

export function OrganisationOverview() {
  return (
    <div className="organisation-overview">
      <PageHeader
        title="Overview"
        description="Organisation health and administration across all sites."
      />
      <Card className="organisation-status">
        <div className="organisation-status-heading">
          <Buildings size={22} aria-hidden="true" />
          <div>
            <span>Organisation</span>
            <h2>{organisationOverview.name}</h2>
          </div>
        </div>
        <StatusLabel label={organisationOverview.status} tone="success" />
      </Card>
      <div className="organisation-metrics" aria-label="Organisation summary">
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <Card key={label}>
            <div>
              <span>{label}</span>
              <Icon size={21} aria-hidden="true" />
            </div>
            <strong>{value}</strong>
            <small>{detail}</small>
          </Card>
        ))}
      </div>
      <div className="organisation-overview-grid">
        <Card className="organisation-panel">
          <div className="organisation-panel-heading">
            <h2>
              Needs attention{' '}
              <span>{organisationOverview.attention.length}</span>
            </h2>
            <p>Site and access administration to follow up.</p>
          </div>
          <ul className="organisation-attention">
            {organisationOverview.attention.map((item) => (
              <li key={item.id}>
                <span
                  className={`organisation-attention-icon tone-${item.tone}`}
                >
                  <Warning size={18} aria-hidden="true" />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="organisation-panel">
          <div className="organisation-panel-heading">
            <h2>Recent activity</h2>
            <p>Organisation and access changes.</p>
          </div>
          <ul className="organisation-activity">
            {organisationOverview.activity.map((item) => (
              <li key={item.id}>
                <span className="organisation-activity-icon">
                  <Clock size={18} aria-hidden="true" />
                </span>
                <div>
                  <strong>{item.action}</strong>
                  <small>{item.detail}</small>
                </div>
                <time>{item.when}</time>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <InfoCard title="Administration scope" variant="neutral">
        <p>
          {organisationOverview.hseAdmins} HSE admins are recorded in this
          organisation. Organisation Admin manages people, roles, site access
          and defaults; HSE assessments remain in the HSE workspaces.
        </p>
      </InfoCard>
    </div>
  );
}
