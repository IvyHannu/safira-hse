'use client';

import { useState } from 'react';
import { GearSix, SquaresFour } from '@phosphor-icons/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  EmptyState,
  FilterControl,
  Input,
  LoadingState,
  PageHeader,
  Radio,
  Select,
  SidebarShell,
  StatusBadge,
  TableFoundation,
  Textarea,
  TopbarShell,
} from '@/components/ui';

interface ExampleRow {
  label: string;
  state: string;
  owner: string;
}

const rows: ExampleRow[] = [
  { label: 'Sample A', state: 'In progress', owner: 'Person A' },
  { label: 'Sample B', state: 'Complete', owner: 'Person B' },
  { label: 'Sample C', state: 'Needs attention', owner: 'Person C' },
];

const columns: ColumnDef<ExampleRow, unknown>[] = [
  { accessorKey: 'label', header: 'Name' },
  { accessorKey: 'state', header: 'State' },
  { accessorKey: 'owner', header: 'Owner' },
];

export function DesignSystemShowcase() {
  const [filter, setFilter] = useState('');
  const [checked, setChecked] = useState(false);
  const [radio, setRadio] = useState('one');
  const filteredRows = rows.filter((row) =>
    row.label.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-coolSurface text-graphite">
      <TopbarShell
        brand="Safira / Design system"
        actions={<Button variant="tertiary">Example action</Button>}
      />
      <div className="md:flex">
        <SidebarShell
          title="Showcase sections"
          items={[
            {
              href: '#actions',
              label: 'Actions',
              icon: <SquaresFour aria-hidden="true" size={16} />,
              active: true,
            },
            {
              href: '#forms',
              label: 'Forms',
              icon: <GearSix aria-hidden="true" size={16} />,
            },
            { href: '#data', label: 'Data' },
          ]}
        />
        <main className="mx-auto grid w-full min-w-0 max-w-[1120px] flex-1 gap-6 px-4 py-6">
          <PageHeader
            title="Admin design system"
            description="Development showcase. Generic examples only."
            actions={<Button>Header action</Button>}
          />

          <section id="actions" className="grid gap-3">
            <h2 className="text-base font-semibold leading-6 text-deepCharcoal">
              Buttons
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="tertiary">Tertiary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button loading>Working</Button>
              <Button disabled>Disabled</Button>
            </div>
          </section>

          <section id="forms" className="grid gap-3">
            <h2 className="text-base font-semibold leading-6 text-deepCharcoal">
              Form controls
            </h2>
            <Card>
              <div className="grid items-start gap-4 md:grid-cols-2">
                <Input
                  label="Text input"
                  helperText="A short description helps."
                  placeholder="Type here"
                />
                <Input
                  label="Input error"
                  error="This value is required."
                  aria-required="true"
                />
                <Input
                  label="Disabled input"
                  disabled
                  value="Unavailable"
                  readOnly
                />
                <Select
                  label="Select"
                  helperText="Choose one option."
                  defaultValue="one"
                >
                  <option value="one">Option one</option>
                  <option value="two">Option two</option>
                </Select>
                <Textarea
                  label="Textarea"
                  helperText="Use plain language."
                  placeholder="Write a note"
                />
                <div className="grid content-start gap-1">
                  <Checkbox
                    label="Checkbox"
                    checked={checked}
                    onChange={(event) => setChecked(event.target.checked)}
                  />
                  <Checkbox label="Disabled checkbox" disabled />
                  <Radio
                    label="First radio option"
                    name="showcase-choice"
                    value="one"
                    checked={radio === 'one'}
                    onChange={() => setRadio('one')}
                  />
                  <Radio
                    label="Second radio option"
                    name="showcase-choice"
                    value="two"
                    checked={radio === 'two'}
                    onChange={() => setRadio('two')}
                  />
                </div>
              </div>
            </Card>
          </section>

          <section className="grid gap-3">
            <h2 className="text-base font-semibold leading-6 text-deepCharcoal">
              Status and feedback
            </h2>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="success" label="Complete" />
              <StatusBadge tone="warning" label="Needs attention" />
              <StatusBadge tone="critical" label="Critical" />
              <StatusBadge tone="information" label="In progress" />
            </div>
            <div className="grid items-start gap-4 md:grid-cols-2">
              <Alert tone="success" title="Success">
                The example action completed.
              </Alert>
              <Alert tone="warning" title="Warning">
                Review this example.
              </Alert>
              <Alert tone="critical" title="Critical">
                Action is needed.
              </Alert>
              <Alert tone="information" title="Information">
                An update is available.
              </Alert>
            </div>
            <LoadingState label="Loading example data…" />
            <EmptyState
              title="No items yet"
              description="This explains the empty state."
              action={<Button variant="secondary">Example action</Button>}
            />
          </section>

          <section id="data" className="grid gap-3">
            <h2 className="text-base font-semibold leading-6 text-deepCharcoal">
              Table and filter
            </h2>
            <FilterControl value={filter} onChange={setFilter} />
            <TableFoundation
              caption="Generic example records"
              columns={columns}
              data={filteredRows}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
