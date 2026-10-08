'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Funnel, Plus, Trash, X } from '@phosphor-icons/react';
import { Button, IconButton } from '@/components/ui/button';
import { ClickableCard } from '@/components/ui/feedback';
import { IllustrationSlot } from '@/components/ui/illustration-slot';
import { Input, SearchInput, Select, Textarea } from '@/components/ui/forms';
import { MetadataLabel } from '@/components/ui/report-metadata';
import {
  checklistDate,
  checklistSubmissions,
  flaggedCount,
  type ChecklistSubmission,
} from '@/data/checklists';
import { reportList } from '@/data/reports';
import './checklist-management.css';

type TemplateStatus = 'draft' | 'active' | 'archived';
type QuestionType =
  'yes_no_na' | 'checkbox' | 'single_select' | 'short_text' | 'photo';
type Question = { id: string; text: string; type: QuestionType };
type Section = { id: string; title: string; questions: Question[] };
type Template = {
  id: string;
  title: string;
  category: string;
  description: string;
  site: string;
  frequency: string;
  status: TemplateStatus;
  sections: Section[];
};
type TemplateValues = Pick<
  Template,
  'title' | 'category' | 'description' | 'site' | 'frequency'
>;
const sites = [
  ...new Set(checklistSubmissions.map((item) => item.site)),
].sort();
const names = [...new Set(checklistSubmissions.map((item) => item.name))];
const initialTemplates: Template[] = names.map((title, index) => {
  const examples = checklistSubmissions.filter((item) => item.name === title);
  return {
    id: `template-${index + 1}`,
    title,
    category: title.includes('Pre-Start')
      ? 'Equipment'
      : title.includes('Hazard')
        ? 'Hazard'
        : 'Site General',
    description: `${title} checklist for site inspections.`,
    site: examples.length > 1 ? 'All sites' : examples[0].site,
    frequency: title.includes('Daily') ? 'Daily' : 'As needed',
    status: 'active',
    sections: [
      {
        id: `section-${index}`,
        title: 'Inspection questions',
        questions: examples[0].responses.map((response) => ({
          id: response.id,
          text: response.question,
          type: response.type,
        })),
      },
    ],
  };
});
const questionTypes: { value: QuestionType; label: string }[] = [
  { value: 'yes_no_na', label: 'Yes / No / N/A' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'single_select', label: 'Single select' },
  { value: 'short_text', label: 'Short text' },
  { value: 'photo', label: 'Photo' },
];
const id = () => globalThis.crypto?.randomUUID?.() || String(Date.now());

function Status({
  value,
}: {
  value: TemplateStatus | 'needs_review' | 'reviewed';
}) {
  return (
    <MetadataLabel
      kind="status"
      tone={
        value === 'active' || value === 'reviewed'
          ? 'success'
          : value === 'needs_review'
            ? 'warning'
            : 'neutral'
      }
      label={
        value === 'needs_review'
          ? 'Needs review'
          : value[0].toUpperCase() + value.slice(1)
      }
    />
  );
}

function TemplateEditor({
  template,
  onChange,
  onClose,
  used,
}: {
  template: Template;
  onChange: (next: Template) => void;
  onClose: () => void;
  used: boolean;
}) {
  const form = useForm<TemplateValues>({
    defaultValues: template,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const changeSection = (sectionId: string, patch: Partial<Section>) =>
    onChange({
      ...template,
      sections: template.sections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section,
      ),
    });
  return (
    <div
      className="admin-checklist-panel admin-checklist-template-editor safira-card-surface"
      data-open="true"
      role="region"
      aria-label={`${template.title} template editor`}
    >
      <div className="admin-checklist-panel-header">
        <div>
          <h2>{template.title}</h2>
          <p className="admin-checklist-muted">
            {template.sections.reduce(
              (total, section) => total + section.questions.length,
              0,
            )}{' '}
            questions · {template.category}
          </p>
        </div>
        <div className="admin-checklist-actions">
          <Status value={template.status} />
          <Button
            variant="tertiary"
            className="admin-checklist-close"
            icon={<X size={18} />}
            aria-label="Close template editor"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
      <form
        onSubmit={form.handleSubmit((values) =>
          onChange({ ...template, ...values, title: values.title.trim() }),
        )}
      >
        <div className="admin-checklist-form-grid">
          <Input
            label="Template title"
            className="safira-builder-control"
            {...form.register('title', {
              validate: (value) => !!value.trim() || 'Enter a template title.',
            })}
            error={form.formState.errors.title?.message}
          />
          <Select
            label="Category"
            className="safira-builder-control"
            {...form.register('category')}
          >
            <option>Site General</option>
            <option>Hazard</option>
            <option>Equipment</option>
            <option>Safety Systems</option>
            <option>Environmental</option>
          </Select>
          <div className="full">
            <Textarea
              label="Description"
              rows={2}
              {...form.register('description')}
            />
          </div>
          <Select
            label="Site / scope"
            className="safira-builder-control"
            {...form.register('site')}
          >
            <option>All sites</option>
            {sites.map((site) => (
              <option key={site}>{site}</option>
            ))}
          </Select>
          <Select
            label="Frequency"
            className="safira-builder-control"
            {...form.register('frequency')}
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>As needed</option>
          </Select>
        </div>
        <div className="admin-checklist-actions">
          <Button type="submit" variant="primary">
            Save template
          </Button>
          {template.status !== 'active' && (
            <Button
              variant="secondary"
              disabled={
                !template.title.trim() ||
                !template.sections.some((section) =>
                  section.questions.some((question) => question.text.trim()),
                )
              }
              onClick={() => onChange({ ...template, status: 'active' })}
            >
              Activate
            </Button>
          )}
          {template.status !== 'archived' && (
            <Button
              variant="secondary"
              onClick={() => onChange({ ...template, status: 'archived' })}
            >
              Archive
            </Button>
          )}
        </div>
        {used && (
          <p className="admin-checklist-muted">
            This template has submissions. Archive it to stop future assignments
            while preserving its history.
          </p>
        )}
      </form>
      <div className="admin-checklist-section admin-checklist-builder">
        <h3>Sections & questions</h3>
        {template.sections.map((section) => (
          <div
            className="admin-checklist-section admin-checklist-builder-section"
            key={section.id}
          >
            <Input
              label="Section name"
              className="safira-builder-control"
              value={section.title}
              onChange={(event) =>
                changeSection(section.id, { title: event.target.value })
              }
            />
            {section.questions.length > 0 && (
              <div className="admin-checklist-question-head" aria-hidden="true">
                <span>Question</span>
                <span>Response type</span>
                <span>Action</span>
              </div>
            )}
            {section.questions.map((question) => (
              <div className="admin-checklist-question" key={question.id}>
                <Input
                  label="Question"
                  className="safira-builder-control"
                  value={question.text}
                  onChange={(event) =>
                    changeSection(section.id, {
                      questions: section.questions.map((item) =>
                        item.id === question.id
                          ? { ...item, text: event.target.value }
                          : item,
                      ),
                    })
                  }
                />
                <Select
                  label="Response type"
                  className="safira-builder-control"
                  value={question.type}
                  onChange={(event) =>
                    changeSection(section.id, {
                      questions: section.questions.map((item) =>
                        item.id === question.id
                          ? {
                              ...item,
                              type: event.target.value as QuestionType,
                            }
                          : item,
                      ),
                    })
                  }
                >
                  {questionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                <IconButton
                  variant="tertiary"
                  label="Remove question"
                  icon={<Trash size={18} />}
                  disabled={used}
                  onClick={() =>
                    changeSection(section.id, {
                      questions: section.questions.filter(
                        (item) => item.id !== question.id,
                      ),
                    })
                  }
                />
              </div>
            ))}
            <Button
              variant="secondary"
              icon={<Plus size={16} />}
              className="admin-checklist-add"
              onClick={() =>
                changeSection(section.id, {
                  questions: [
                    ...section.questions,
                    { id: id(), text: '', type: 'yes_no_na' },
                  ],
                })
              }
            >
              Add question
            </Button>
          </div>
        ))}
        <Button
          variant="secondary"
          icon={<Plus size={16} />}
          className="admin-checklist-add"
          onClick={() =>
            onChange({
              ...template,
              sections: [
                ...template.sections,
                { id: id(), title: 'New section', questions: [] },
              ],
            })
          }
        >
          Add section
        </Button>
      </div>
      {used && (
        <p className="admin-checklist-muted">
          Existing submissions keep their recorded questions and answers.
        </p>
      )}
    </div>
  );
}

function SubmissionReview({
  item,
  reviewed,
  onReview,
  onClose,
}: {
  item: ChecklistSubmission;
  reviewed: boolean;
  onReview: () => void;
  onClose: () => void;
}) {
  const flags = item.responses.filter((response) => response.flagged);
  return (
    <div
      className="admin-checklist-panel admin-checklist-detail safira-card-surface"
      data-open="true"
      role="region"
      aria-label={`${item.id} submission review`}
    >
      <div className="admin-checklist-panel-header">
        <div>
          <p className="admin-checklist-muted">{item.id}</p>
          <h2>{item.name}</h2>
        </div>
        <div className="admin-checklist-actions">
          <Status value={reviewed ? 'reviewed' : 'needs_review'} />
          <Button
            variant="tertiary"
            className="admin-checklist-close"
            icon={<X size={18} />}
            aria-label="Close submission review"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
      <dl>
        <div>
          <dt>Site</dt>
          <dd>{item.site}</dd>
        </div>
        <div>
          <dt>Submitted by</dt>
          <dd>{item.submittedBy}</dd>
        </div>
        <div>
          <dt>Date / time</dt>
          <dd>{checklistDate(item.submittedAt)}</dd>
        </div>
        <div>
          <dt>Flagged issues</dt>
          <dd>{flags.length}</dd>
        </div>
      </dl>
      <section className="admin-checklist-section">
        <h3>Flagged issues</h3>
        {flags.length ? (
          flags.map((response) => (
            <div className="admin-checklist-flag" key={response.id}>
              <strong>{response.question}</strong>
              <p>Response: {response.answer}</p>
              {response.note && <p>Note: {response.note}</p>}
              {response.evidence?.map((file) => (
                <p key={file.name}>
                  Evidence: {file.name}
                  {!file.url && ' · Preview unavailable'}
                </p>
              ))}
              {response.reportId &&
                (reportList.some(
                  (report) => report.id === response.reportId,
                ) ? (
                  <Link href={`/hse-admin/reports/${response.reportId}`}>
                    Linked report {response.reportId}
                  </Link>
                ) : (
                  <p>Linked report {response.reportId} unavailable</p>
                ))}
            </div>
          ))
        ) : (
          <p className="admin-checklist-muted">No flagged issues.</p>
        )}
      </section>
      <section className="admin-checklist-section">
        <h3>All responses</h3>
        {item.responses.map((response) => (
          <div className="admin-checklist-flag" key={response.id}>
            <strong>{response.question}</strong>
            <p>{response.answer}</p>
            {response.note && <p>{response.note}</p>}
          </div>
        ))}
      </section>
      <div className="admin-checklist-actions">
        <Button disabled={reviewed} onClick={onReview}>
          {reviewed ? 'Reviewed' : 'Mark reviewed'}
        </Button>
      </div>
    </div>
  );
}

export function ChecklistManagement() {
  const [tab, setTab] = useState<'templates' | 'submissions'>('templates');
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(
    initialTemplates[0].id,
  );
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null,
  );
  const [mobilePanel, setMobilePanel] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [site, setSite] = useState('all');
  const [reviews, setReviews] = useState<Record<string, boolean>>({});
  const filterTrigger = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!filtersOpen) return;
    const trigger = filterTrigger.current?.querySelector('button');
    const controls = () =>
      Array.from(
        sheet.current?.querySelectorAll<HTMLElement>('button,select') || [],
      );
    controls()[0]?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false);
      if (event.key === 'Tab') {
        const first = controls()[0],
          last = controls().at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const resize = () => {
      if (innerWidth >= 768) setFiltersOpen(false);
    };
    window.addEventListener('keydown', key);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener('resize', resize);
      trigger?.focus();
    };
  }, [filtersOpen]);
  useEffect(() => {
    if (!mobilePanel) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobilePanel(false);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [mobilePanel]);
  const statusOf = (item: ChecklistSubmission) =>
    reviews[item.id] || item.status === 'reviewed'
      ? 'reviewed'
      : 'needs_review';
  const filteredTemplates = templates.filter(
    (item) =>
      `${item.title} ${item.category} ${item.site}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (status === 'all' || item.status === status) &&
      (site === 'all' || item.site === site),
  );
  const filteredSubmissions = checklistSubmissions
    .filter(
      (item) =>
        `${item.id} ${item.name} ${item.site} ${item.submittedBy}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()) &&
        (status === 'all' ||
          (status === 'flagged'
            ? flaggedCount(item) > 0
            : statusOf(item) === status)) &&
        (site === 'all' || item.site === site),
    )
    .sort(
      (a, b) =>
        Number(statusOf(a) === 'reviewed') -
          Number(statusOf(b) === 'reviewed') ||
        flaggedCount(b) - flaggedCount(a) ||
        b.submittedAt.localeCompare(a.submittedAt),
    );
  const activeTemplate = templates.find((item) => item.id === selectedTemplate);
  const activeSubmission = checklistSubmissions.find(
    (item) => item.id === selectedSubmission,
  );
  const updateTemplate = (next: Template) =>
    setTemplates((current) =>
      current.map((item) => (item.id === next.id ? next : item)),
    );
  const create = () => {
    const template: Template = {
      id: id(),
      title: 'New checklist',
      category: 'Site General',
      description: '',
      site: 'All sites',
      frequency: 'As needed',
      status: 'draft',
      sections: [{ id: id(), title: 'Inspection questions', questions: [] }],
    };
    setTemplates((current) => [template, ...current]);
    setSelectedTemplate(template.id);
    setMobilePanel(true);
    setTab('templates');
    setSearch('');
    setStatus('all');
    setSite('all');
  };
  const chooseTab = (next: 'templates' | 'submissions') => {
    setTab(next);
    setStatus('all');
    setSite('all');
    setSearch('');
    setMobilePanel(false);
  };
  const filterFields = (prefix: string) => (
    <>
      <Select
        id={`${prefix}-status`}
        label="Status"
        className={tab === 'templates' ? 'safira-control-compact' : ''}
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <option value="all">All statuses</option>
        {tab === 'templates' ? (
          <>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </>
        ) : (
          <>
            <option value="needs_review">Needs review</option>
            <option value="reviewed">Reviewed</option>
            <option value="flagged">Flagged issues</option>
          </>
        )}
      </Select>
      <Select
        id={`${prefix}-site`}
        label="Site"
        className={tab === 'templates' ? 'safira-control-compact' : ''}
        value={site}
        onChange={(event) => setSite(event.target.value)}
      >
        <option value="all">All sites</option>
        {tab === 'templates' && <option>All sites</option>}
        {sites.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </Select>
    </>
  );
  return (
    <div
      className={`admin-checklists ${tab === 'templates' ? 'admin-checklists-template' : ''}`}
    >
      <header>
        <div>
          <h1>Checklists</h1>
          <p className="admin-checklist-muted">
            Manage templates and review site submissions.
          </p>
        </div>
        {tab === 'templates' && (
          <Button icon={<Plus size={18} />} onClick={create}>
            New template
          </Button>
        )}
      </header>
      <div
        className="admin-checklist-tabs"
        role="tablist"
        aria-label="Checklists"
      >
        <button
          role="tab"
          aria-selected={tab === 'templates'}
          onClick={() => chooseTab('templates')}
        >
          Templates
        </button>
        <button
          role="tab"
          aria-selected={tab === 'submissions'}
          onClick={() => chooseTab('submissions')}
        >
          Submissions
        </button>
      </div>
      <div className="admin-checklist-toolbar">
        <SearchInput
          className={tab === 'templates' ? 'safira-control-compact' : ''}
          label={
            tab === 'templates' ? 'Search templates' : 'Search submissions'
          }
          placeholder={
            tab === 'templates'
              ? 'Checklist or site'
              : 'Checklist, site or submitter'
          }
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="admin-checklist-desktop-filter">
          {filterFields('desktop')}
        </div>
        <div ref={filterTrigger} className="admin-checklist-mobile-filters">
          <Button
            variant="secondary"
            icon={<Funnel size={18} />}
            onClick={() => setFiltersOpen(true)}
          >
            Filters{status !== 'all' || site !== 'all' ? ' · Active' : ''}
          </Button>
        </div>
      </div>
      <p className="admin-checklist-count" role="status">
        {tab === 'templates'
          ? `${filteredTemplates.length} templates`
          : `${filteredSubmissions.length} submissions · Needs review and flagged issues first`}
      </p>
      {tab === 'templates' ? (
        <div className="admin-checklist-workspace">
          <div className="admin-checklist-template-list safira-card-list">
            {filteredTemplates.length ? (
              filteredTemplates.map((item) => (
                <ClickableCard
                  key={item.id}
                  selected={selectedTemplate === item.id}
                  onClick={() => {
                    setSelectedTemplate(item.id);
                    setMobilePanel(true);
                  }}
                >
                  <strong>{item.title}</strong>
                  <small>
                    {item.category} · {item.site} · {item.frequency} ·{' '}
                    {item.status}
                  </small>
                </ClickableCard>
              ))
            ) : (
              <div className="admin-checklist-empty grid gap-3 text-center">
                <IllustrationSlot illustrationKey="empty" decorative />
                <p>No matching templates.</p>
              </div>
            )}
          </div>
          {activeTemplate && (
            <div className={mobilePanel ? 'admin-checklist-mobile-open' : ''}>
              <TemplateEditor
                key={activeTemplate.id}
                template={activeTemplate}
                onChange={updateTemplate}
                onClose={() => setMobilePanel(false)}
                used={checklistSubmissions.some(
                  (item) => item.name === activeTemplate.title,
                )}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          {filteredSubmissions.length ? (
            <>
              <div className="admin-checklist-table-wrap safira-card-surface">
                <table className="admin-checklist-table">
                  <caption className="sr-only">Checklist submissions</caption>
                  <colgroup>
                    <col style={{ width: '28%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '17%' }} />
                    <col style={{ width: '16%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '9%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      {[
                        'Checklist',
                        'Site',
                        'Submitted by',
                        'Date / time',
                        'Status',
                        'Flagged',
                      ].map((label) => (
                        <th scope="col" key={label}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <button
                            className="admin-checklist-link"
                            onClick={() => {
                              setSelectedSubmission(item.id);
                              setMobilePanel(true);
                            }}
                          >
                            {item.name}
                          </button>
                          <p className="admin-checklist-muted">{item.id}</p>
                        </td>
                        <td>{item.site}</td>
                        <td>{item.submittedBy}</td>
                        <td>{checklistDate(item.submittedAt)}</td>
                        <td>
                          <Status value={statusOf(item)} />
                        </td>
                        <td>{flaggedCount(item)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-checklist-cards safira-card-list">
                {filteredSubmissions.map((item) => (
                  <button
                    className="admin-checklist-card safira-card-surface safira-card-action"
                    key={item.id}
                    onClick={() => {
                      setSelectedSubmission(item.id);
                      setMobilePanel(true);
                    }}
                  >
                    <span className="admin-checklist-card-top">
                      <span className="admin-checklist-muted">{item.id}</span>
                      <Status value={statusOf(item)} />
                    </span>
                    <strong className="admin-checklist-link">
                      {item.name}
                    </strong>
                    <span>
                      {item.site} · {item.submittedBy}
                    </span>
                    <span className="admin-checklist-muted">
                      {checklistDate(item.submittedAt)} · {flaggedCount(item)}{' '}
                      flagged
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="admin-checklist-empty grid gap-3 text-center">
              <IllustrationSlot illustrationKey="empty" decorative />
              <p>No matching submissions.</p>
            </div>
          )}
          {activeSubmission && (
            <div className="admin-checklist-workspace">
              <div></div>
              <div className={mobilePanel ? 'admin-checklist-mobile-open' : ''}>
                <SubmissionReview
                  item={activeSubmission}
                  reviewed={statusOf(activeSubmission) === 'reviewed'}
                  onReview={() =>
                    setReviews((current) => ({
                      ...current,
                      [activeSubmission.id]: true,
                    }))
                  }
                  onClose={() => {
                    setSelectedSubmission(null);
                    setMobilePanel(false);
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
      {filtersOpen && (
        <div className="admin-checklist-filter-overlay">
          <button
            className="admin-checklist-filter-backdrop"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <div
            ref={sheet}
            className="admin-checklist-filter-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Checklist filters"
          >
            <header>
              <h2>Filter checklists</h2>
              <Button
                variant="tertiary"
                icon={<X size={20} />}
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
              >
                Close
              </Button>
            </header>
            <div>{filterFields('mobile')}</div>
            <footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setStatus('all');
                  setSite('all');
                }}
              >
                Clear
              </Button>
              <Button onClick={() => setFiltersOpen(false)}>
                Show results
              </Button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
