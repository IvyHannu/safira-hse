'use client';

import { PageHeader } from '@/components/ui/shell';
import { Card, EmptyState } from '@/components/ui';
import { Button } from '@/components/ui';

export default function ProfilePage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Profile"
        description="Manage your HSE Officer profile and preferences."
      />
      <Card>
        <EmptyState
          title="Profile coming soon"
          description="The profile management view is not yet implemented."
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