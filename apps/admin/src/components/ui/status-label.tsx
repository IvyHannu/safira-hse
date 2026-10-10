import { MetadataLabel } from './report-metadata';

interface StatusLabelProps {
  label: string;
  tone: 'critical' | 'success' | 'warning' | 'information' | 'neutral';
}

export function StatusLabel({ label, tone }: StatusLabelProps) {
  return <MetadataLabel kind="status" label={label} tone={tone} />;
}
