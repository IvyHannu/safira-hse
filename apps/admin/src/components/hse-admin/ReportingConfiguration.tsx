'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, Plus, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { MetadataLabel } from '@/components/ui/report-metadata';
import { Input, Select, Textarea } from '@/components/ui/forms';
import { siteOptions, type ReportType } from '@/data/reports';
import './reporting-configuration.css';

type CategoryKey = ReportType;
type QuestionKind = 'yes_no_not_sure' | 'short_text' | 'single_select';
type CustomQuestion = {
  id: string;
  label: string;
  kind: QuestionKind;
  required: boolean;
  options: string[];
};
type Category = {
  key: CategoryKey;
  label: string;
  explanation: string;
  enabled: boolean;
  sites: string[];
  questions: CustomQuestion[];
};
type Configuration = Record<CategoryKey, Category>;
type CategoryFields = { label: string; explanation: string };
const order: CategoryKey[] = [
  'hazard',
  'near_miss',
  'incident',
  'environmental_concern',
];
const initial: Configuration = {
  hazard: {
    key: 'hazard',
    label: 'Something unsafe',
    explanation: 'A condition or behaviour that could cause harm.',
    enabled: true,
    sites: [],
    questions: [],
  },
  near_miss: {
    key: 'near_miss',
    label: 'Something almost happened',
    explanation: 'Something went wrong, but no one was hurt.',
    enabled: true,
    sites: [],
    questions: [],
  },
  incident: {
    key: 'incident',
    label: 'Something happened',
    explanation: 'Someone was hurt, or something was damaged.',
    enabled: true,
    sites: [],
    questions: [],
  },
  environmental_concern: {
    key: 'environmental_concern',
    label: 'Something could harm the environment',
    explanation: 'A spill, leak, waste issue, or similar concern.',
    enabled: true,
    sites: [],
    questions: [],
  },
};
const storageKey = 'safira.hseAdmin.reportingConfiguration.v1';
const questionKinds: { value: QuestionKind; label: string }[] = [
  { value: 'yes_no_not_sure', label: 'Yes / No / Not sure' },
  { value: 'short_text', label: 'Short text' },
  { value: 'single_select', label: 'Single select' },
];
const makeId = () => globalThis.crypto?.randomUUID?.() || String(Date.now());
const validKind = (value: unknown): value is QuestionKind =>
  questionKinds.some((kind) => kind.value === value);
function storedConfiguration(value: unknown): Configuration | null {
  if (!value || typeof value !== 'object') return null;
  const source = value as Record<string, unknown>;
  const result = { ...initial };
  for (const key of order) {
    const item = source[key];
    if (!item || typeof item !== 'object') return null;
    const category = item as Partial<Category>;
    if (
      typeof category.label !== 'string' ||
      typeof category.explanation !== 'string' ||
      typeof category.enabled !== 'boolean' ||
      !Array.isArray(category.sites) ||
      !Array.isArray(category.questions)
    )
      return null;
    result[key] = {
      key,
      label: category.label,
      explanation: category.explanation,
      enabled: category.enabled,
      sites: category.sites.filter(
        (site): site is string =>
          typeof site === 'string' &&
          siteOptions.some((option) => option.value === site),
      ),
      questions: category.questions
        .filter(
          (question): question is CustomQuestion =>
            !!question &&
            typeof question === 'object' &&
            typeof question.id === 'string' &&
            typeof question.label === 'string' &&
            validKind(question.kind) &&
            typeof question.required === 'boolean' &&
            Array.isArray(question.options),
        )
        .map((question) => ({
          ...question,
          options: question.options.filter(
            (option): option is string => typeof option === 'string',
          ),
        })),
    };
  }
  return result;
}
function CategoryEditor({
  category,
  onChange,
}: {
  category: Category;
  onChange: (next: Category) => void;
}) {
  const form = useForm<CategoryFields>({
    defaultValues: { label: category.label, explanation: category.explanation },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const labelField = form.register('label', {
    validate: (value) => !!value.trim() || 'Enter a label.',
  });
  const explanationField = form.register('explanation', {
    validate: (value) => !!value.trim() || 'Enter a short explanation.',
  });
  const updateQuestion = (id: string, patch: Partial<CustomQuestion>) =>
    onChange({
      ...category,
      questions: category.questions.map((question) =>
        question.id === id ? { ...question, ...patch } : question,
      ),
    });
  const addQuestion = () =>
    onChange({
      ...category,
      questions: [
        ...category.questions,
        {
          id: makeId(),
          label: '',
          kind: 'yes_no_not_sure',
          required: false,
          options: [],
        },
      ],
    });
  const allSites = category.sites.length === 0;
  return (
    <div className="admin-config-editor safira-card-surface">
      <div className="admin-config-editor-head">
        <div>
          <p className="admin-config-eyebrow">Worker report type</p>
          <h2>{category.label || 'Untitled report type'}</h2>
        </div>
        <MetadataLabel
          kind="status"
          tone={category.enabled ? 'success' : 'neutral'}
          label={category.enabled ? 'Enabled' : 'Disabled'}
        />
      </div>
      <div className="admin-config-tabs" aria-label="Configuration sections">
        <a href="#config-type">Report type</a>
        <a href="#config-questions">Questions</a>
        <a href="#config-scope">Site scope</a>
        <a href="#config-preview">Preview</a>
      </div>
      <section id="config-type" className="admin-config-section">
        <div className="admin-config-section-heading">
          <h3>Worker-facing report type</h3>
          <p>
            Plain language appears in the Worker report flow. Formal
            classification stays fixed.
          </p>
        </div>
        <div className="admin-config-type-fields">
          <div className="admin-config-form-grid">
            <Input
              label="Worker-facing label"
              {...labelField}
              onChange={(event) => {
                void labelField.onChange(event);
                onChange({ ...category, label: event.target.value });
              }}
              error={form.formState.errors.label?.message}
            />
            <div className="admin-config-readonly">
              <span>HSE classification</span>
              <strong>{category.key.replaceAll('_', ' ')}</strong>
            </div>
            <div className="admin-config-span">
              <Textarea
                label="Short explanation"
                rows={2}
                {...explanationField}
                onChange={(event) => {
                  void explanationField.onChange(event);
                  onChange({ ...category, explanation: event.target.value });
                }}
                error={form.formState.errors.explanation?.message}
              />
            </div>
          </div>
          <div className="admin-config-actions">
            <label className="admin-config-toggle">
              <input
                type="checkbox"
                checked={category.enabled}
                onChange={(event) =>
                  onChange({ ...category, enabled: event.target.checked })
                }
              />
              Enabled for reporting
            </label>
          </div>
        </div>
      </section>
      <section id="config-questions" className="admin-config-section">
        <div className="admin-config-section-heading">
          <h3>Additional questions</h3>
          <p>
            Keep questions short. Workers can share what they know without HSE
            terminology.
          </p>
        </div>
        {category.questions.map((question, index) => (
          <div className="admin-config-question" key={question.id}>
            <span className="admin-config-number">{index + 1}</span>
            <Input
              label="Question"
              value={question.label}
              onChange={(event) =>
                updateQuestion(question.id, { label: event.target.value })
              }
            />
            <Select
              label="Answer type"
              value={question.kind}
              onChange={(event) =>
                updateQuestion(question.id, {
                  kind: event.target.value as QuestionKind,
                  options:
                    event.target.value === 'single_select'
                      ? question.options
                      : [],
                })
              }
            >
              {questionKinds.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </Select>
            <label className="admin-config-required">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(event) =>
                  updateQuestion(question.id, {
                    required: event.target.checked,
                  })
                }
              />
              Required
            </label>
            <Button
              variant="tertiary"
              icon={<X size={16} />}
              aria-label={`Remove question ${index + 1}`}
              onClick={() =>
                onChange({
                  ...category,
                  questions: category.questions.filter(
                    (item) => item.id !== question.id,
                  ),
                })
              }
            >
              Remove
            </Button>
            {question.kind === 'single_select' && (
              <div className="admin-config-option">
                <Textarea
                  label="Choices (one per line)"
                  rows={3}
                  value={question.options.join('\n')}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      options: event.target.value.split('\n'),
                    })
                  }
                  helperText="At least two choices for single select."
                />
              </div>
            )}
          </div>
        ))}
        <Button
          variant="secondary"
          icon={<Plus size={16} />}
          onClick={addQuestion}
        >
          Add question
        </Button>
      </section>
      <section id="config-scope" className="admin-config-section">
        <div className="admin-config-section-heading">
          <h3>Site availability</h3>
          <p>Choose where workers can select this report type.</p>
        </div>
        <label className="admin-config-site">
          <input
            type="checkbox"
            checked={allSites}
            onChange={() => onChange({ ...category, sites: [] })}
          />
          All sites
        </label>
        <div className="admin-config-sites">
          {siteOptions.map((site) => (
            <label key={site.value} className="admin-config-site">
              <input
                type="checkbox"
                checked={allSites || category.sites.includes(site.value)}
                onChange={() => {
                  const next = allSites
                    ? siteOptions
                        .map((option) => option.value)
                        .filter((value) => value !== site.value)
                    : category.sites.includes(site.value)
                      ? category.sites.filter((value) => value !== site.value)
                      : [...category.sites, site.value];
                  onChange({
                    ...category,
                    sites: next.length === siteOptions.length ? [] : next,
                  });
                }}
              />
              {site.label}
            </label>
          ))}
        </div>
      </section>
      <section id="config-preview" className="admin-config-section">
        <div className="admin-config-section-heading">
          <h3>
            <Eye size={17} aria-hidden="true" />
            Worker preview
          </h3>
          <p>Preview of this report choice and additional questions.</p>
        </div>
        <div className="admin-config-preview">
          <p className="admin-config-preview-kicker">
            What would you like to report?
          </p>
          <div className="admin-config-preview-choice">
            <span aria-hidden="true">○</span>
            <div>
              <strong>{category.label || 'Worker-facing label'}</strong>
              <p>{category.explanation || 'Short explanation'}</p>
            </div>
          </div>
          {category.questions.map((question) => (
            <div className="admin-config-preview-question" key={question.id}>
              <strong>
                {question.label || 'New question'}
                {question.required ? ' *' : ''}
              </strong>
              {question.kind === 'yes_no_not_sure' ? (
                <div className="admin-config-preview-options">
                  <span>Yes</span>
                  <span>No</span>
                  <span>Not sure</span>
                </div>
              ) : question.kind === 'single_select' ? (
                <div className="admin-config-preview-select">
                  {question.options.filter(Boolean).join(' / ') ||
                    'Choose an answer'}
                </div>
              ) : (
                <div className="admin-config-preview-select">
                  Write a short answer
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="admin-config-hint">
          Classification and severity are assessed later by HSE and never appear
          as Worker questions.
        </p>
      </section>
    </div>
  );
}

export function ReportingConfiguration() {
  const [config, setConfig] = useState<Configuration>(initial);
  const [selected, setSelected] = useState<CategoryKey>('hazard');
  const [message, setMessage] = useState('');
  const [published, setPublished] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const saved = JSON.parse(raw) as {
            config?: unknown;
            published?: boolean;
          };
          const valid = storedConfiguration(saved.config);
          if (valid) {
            setConfig(valid);
            setPublished(!!saved.published);
          }
        }
      } catch {
        setMessage('Saved configuration could not be restored.');
      }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);
  const current = config[selected];
  const update = (next: Category) => {
    setConfig((value) => ({ ...value, [selected]: next }));
    setPublished(false);
    setMessage('Unsaved changes.');
  };
  const errors: string[] = [];
  for (const key of order) {
    const category = config[key];
    if (!category.enabled) continue;
    if (!category.label.trim())
      errors.push('Every enabled report type needs a worker-facing label.');
    if (!category.explanation.trim())
      errors.push('Every enabled report type needs a short explanation.');
    for (const question of category.questions) {
      if (!question.label.trim())
        errors.push('Additional questions need wording.');
      if (
        question.kind === 'single_select' &&
        question.options.filter((option) => option.trim()).length < 2
      )
        errors.push('Single-select questions need at least two choices.');
    }
  }
  const enabled = order.filter((key) => config[key].enabled);
  if (!enabled.length)
    errors.push('Enable at least one report type before publishing.');
  const long = enabled.some(
    (key) =>
      config[key].questions.length > 2 ||
      config[key].questions.filter((question) => question.required).length > 1,
  );
  const save = (publish: boolean) => {
    if (publish && errors.length) {
      setMessage(errors[0]);
      return;
    }
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ config, published: publish }),
      );
      setPublished(publish);
      setMessage(publish ? 'Configuration published.' : 'Draft saved.');
    } catch {
      setMessage('Could not save configuration. Please try again.');
    }
  };
  return (
    <div className="admin-config">
      <header className="admin-config-header">
        <div>
          <h1>Reporting Configuration</h1>
          <p>
            Set worker-facing report choices, questions and site availability.
          </p>
        </div>
        <div className="admin-config-actions">
          <MetadataLabel
            kind="status"
            tone={published ? 'success' : 'neutral'}
            label={published ? 'Published' : 'Draft'}
          />
          <Button
            variant="secondary"
            disabled={!loaded}
            onClick={() => save(false)}
          >
            Save Draft
          </Button>
          <Button disabled={!loaded} onClick={() => save(true)}>
            Publish
          </Button>
        </div>
      </header>
      {message && (
        <p role="status" className="admin-config-message">
          {message}
        </p>
      )}
      {long && (
        <p className="admin-config-warning" role="note">
          Frontline reporting may feel too long. This setup adds more than two
          questions or more than one required question to a report type.
        </p>
      )}
      {errors.length > 0 && (
        <p className="admin-config-warning" role="note">
          {errors[0]}
        </p>
      )}
      <div className="admin-config-layout">
        <aside
          className="admin-config-list safira-card-list"
          aria-label="Report types"
        >
          <div className="admin-config-list-heading">
            <h2>Report types</h2>
            <p>Four fixed core categories</p>
          </div>
          {order.map((key) => (
            <button
              key={key}
              className={`safira-card-surface safira-card-action ${selected === key ? 'is-selected' : ''}`}
              aria-current={selected === key}
              onClick={() => setSelected(key)}
            >
              <span>
                <strong>{config[key].label || 'Untitled report type'}</strong>
                <small>{config[key].explanation || 'Add an explanation'}</small>
              </span>
              <MetadataLabel
                kind="status"
                tone={config[key].enabled ? 'success' : 'neutral'}
                label={config[key].enabled ? 'On' : 'Off'}
              />
            </button>
          ))}
        </aside>
        {loaded && (
          <CategoryEditor key={selected} category={current} onChange={update} />
        )}
      </div>
    </div>
  );
}
