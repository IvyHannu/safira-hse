'use client';

import { PageHeader } from '@/components/ui/shell';
import { Card, EmptyState } from '@/components/ui';
import { Button } from '@/components/ui';

export default function ChecklistsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Checklists"
        description="Review checklist submissions for your permitted sites."
      />
      <Card>
        <EmptyState
          title="Checklists coming soon"
          description="The checklists list and review views are not yet implemented."
          action={
            <Button variant="secondary" onClick={() => window.history.back()}>
              Back to Overview
            </Button>
          }
        />
      </Card>
    </div>
  );
}