create extension if not exists pgcrypto with schema extensions;

create type public.organisation_role as enum ('worker', 'hse_officer', 'hse_admin', 'organisation_admin');
create type public.report_status as enum ('submitted', 'under_review', 'action_required', 'resolved', 'closed');
create type public.report_severity as enum ('low', 'moderate', 'high', 'critical');
create type public.hse_classification as enum ('hazard', 'near_miss', 'incident', 'environmental_concern');
create type public.checklist_status as enum ('draft', 'active', 'archived');

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  next_report_number bigint not null default 1 check (next_report_number > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.organisation_members (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  user_id uuid not null references auth.users(id),
  role public.organisation_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, id),
  unique (organisation_id, user_id)
);

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  name text not null check (length(trim(name)) > 0),
  code text not null check (length(trim(code)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (organisation_id, id),
  unique (organisation_id, code)
);

create table public.work_areas (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  site_id uuid not null,
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (organisation_id, id),
  unique (organisation_id, site_id, id),
  unique (organisation_id, site_id, name),
  foreign key (organisation_id, site_id) references public.sites(organisation_id, id)
);

create table public.member_site_access (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  member_id uuid not null,
  site_id uuid not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (organisation_id, member_id, site_id),
  foreign key (organisation_id, member_id) references public.organisation_members(organisation_id, id),
  foreign key (organisation_id, site_id) references public.sites(organisation_id, id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  site_id uuid not null,
  work_area_id uuid,
  reporter_user_id uuid not null references auth.users(id),
  report_number bigint not null check (report_number > 0),
  reference text generated always as ('RPT-' || lpad(report_number::text, greatest(length(report_number::text), 6), '0')) stored,
  category text not null check (length(trim(category)) > 0),
  description text not null check (length(trim(description)) > 0),
  occurred_at timestamptz,
  classification public.hse_classification,
  severity public.report_severity,
  status public.report_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  check ((status = 'closed') = (closed_at is not null)),
  unique (organisation_id, id),
  unique (organisation_id, report_number),
  unique (organisation_id, reference),
  foreign key (organisation_id, reporter_user_id) references public.organisation_members(organisation_id, user_id),
  foreign key (organisation_id, site_id) references public.sites(organisation_id, id),
  foreign key (organisation_id, site_id, work_area_id) references public.work_areas(organisation_id, site_id, id)
);

create table public.reporting_configurations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  site_id uuid,
  category_key text not null check (category_key ~ '^[a-z0-9_]+$'),
  category_label text not null check (length(trim(category_label)) > 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, id),
  foreign key (organisation_id, site_id) references public.sites(organisation_id, id)
);
create unique index reporting_configurations_scope_key on public.reporting_configurations (organisation_id, coalesce(site_id, '00000000-0000-0000-0000-000000000000'::uuid), category_key);

create table public.custom_report_questions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  reporting_configuration_id uuid not null,
  question_key text not null check (question_key ~ '^[a-z0-9_]+$'),
  label text not null check (length(trim(label)) > 0),
  answer_type text not null check (answer_type in ('text', 'number', 'boolean', 'date', 'single_choice', 'multi_choice')),
  options jsonb not null default '[]'::jsonb check (jsonb_typeof(options) = 'array'),
  is_required boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, id),
  unique (organisation_id, reporting_configuration_id, question_key),
  foreign key (organisation_id, reporting_configuration_id) references public.reporting_configurations(organisation_id, id)
);

create table public.report_answers (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  report_id uuid not null,
  question_id uuid not null,
  answer jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, report_id, question_id),
  foreign key (organisation_id, report_id) references public.reports(organisation_id, id),
  foreign key (organisation_id, question_id) references public.custom_report_questions(organisation_id, id)
);

create table public.report_evidence (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  report_id uuid not null,
  storage_path text not null check (length(trim(storage_path)) > 0),
  file_name text not null check (length(trim(file_name)) > 0),
  mime_type text,
  uploaded_by uuid not null references auth.users(id),
  worker_visible boolean not null default true,
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  foreign key (organisation_id, uploaded_by) references public.organisation_members(organisation_id, user_id),
  foreign key (organisation_id, report_id) references public.reports(organisation_id, id)
);

create table public.report_status_history (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  report_id uuid not null,
  from_status public.report_status,
  to_status public.report_status not null,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  foreign key (organisation_id, changed_by) references public.organisation_members(organisation_id, user_id),
  foreign key (organisation_id, report_id) references public.reports(organisation_id, id)
);

create table public.report_internal_notes (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  report_id uuid not null,
  author_user_id uuid not null references auth.users(id),
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  foreign key (organisation_id, author_user_id) references public.organisation_members(organisation_id, user_id),
  foreign key (organisation_id, report_id) references public.reports(organisation_id, id)
);

create table public.report_updates (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  report_id uuid not null,
  author_user_id uuid not null references auth.users(id),
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  foreign key (organisation_id, author_user_id) references public.organisation_members(organisation_id, user_id),
  foreign key (organisation_id, report_id) references public.reports(organisation_id, id)
);

create table public.report_actions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  report_id uuid not null,
  title text not null check (length(trim(title)) > 0),
  description text,
  assignee_user_id uuid references auth.users(id),
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  foreign key (organisation_id, assignee_user_id) references public.organisation_members(organisation_id, user_id),
  foreign key (organisation_id, created_by) references public.organisation_members(organisation_id, user_id),
  foreign key (organisation_id, report_id) references public.reports(organisation_id, id)
);

create table public.report_resolutions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  report_id uuid not null,
  summary text not null check (length(trim(summary)) > 0),
  resolved_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  foreign key (organisation_id, resolved_by) references public.organisation_members(organisation_id, user_id),
  foreign key (organisation_id, report_id) references public.reports(organisation_id, id)
);

create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  site_id uuid,
  title text not null check (length(trim(title)) > 0),
  description text,
  status public.checklist_status not null default 'draft',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, id),
  foreign key (organisation_id, created_by) references public.organisation_members(organisation_id, user_id),
  foreign key (organisation_id, site_id) references public.sites(organisation_id, id)
);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  checklist_id uuid not null,
  prompt text not null check (length(trim(prompt)) > 0),
  answer_type text not null check (answer_type in ('text', 'number', 'boolean', 'single_choice', 'multi_choice')),
  options jsonb not null default '[]'::jsonb check (jsonb_typeof(options) = 'array'),
  is_required boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, id),
  foreign key (organisation_id, checklist_id) references public.checklists(organisation_id, id)
);

create table public.checklist_assignments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  checklist_id uuid not null,
  member_id uuid not null,
  due_at timestamptz,
  assigned_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (organisation_id, id),
  unique (organisation_id, checklist_id, member_id),
  foreign key (organisation_id, assigned_by) references public.organisation_members(organisation_id, user_id),
  foreign key (organisation_id, checklist_id) references public.checklists(organisation_id, id),
  foreign key (organisation_id, member_id) references public.organisation_members(organisation_id, id)
);

create table public.checklist_submissions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  assignment_id uuid not null,
  submitted_by uuid not null references auth.users(id),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organisation_id, id),
  unique (organisation_id, assignment_id),
  foreign key (organisation_id, submitted_by) references public.organisation_members(organisation_id, user_id),
  foreign key (organisation_id, assignment_id) references public.checklist_assignments(organisation_id, id)
);

create table public.checklist_responses (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  submission_id uuid not null,
  item_id uuid not null,
  answer jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, submission_id, item_id),
  foreign key (organisation_id, submission_id) references public.checklist_submissions(organisation_id, id),
  foreign key (organisation_id, item_id) references public.checklist_items(organisation_id, id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  recipient_user_id uuid not null references auth.users(id),
  title text not null check (length(trim(title)) > 0),
  body text not null,
  report_id uuid,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  archived_at timestamptz,
  foreign key (organisation_id, recipient_user_id) references public.organisation_members(organisation_id, user_id),
  foreign key (organisation_id, report_id) references public.reports(organisation_id, id)
);

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  user_id uuid not null references auth.users(id),
  token text not null check (length(trim(token)) > 0),
  platform text not null check (platform in ('ios', 'android', 'web')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, user_id, token),
  foreign key (organisation_id, user_id) references public.organisation_members(organisation_id, user_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  table_name text not null,
  record_id uuid not null,
  operation text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  actor_user_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create function public.prepare_report() returns trigger language plpgsql security definer set search_path = '' as $$
declare next_number bigint;
begin
  if auth.uid() is null then
    raise exception 'A signed-in user is required';
  end if;
  update public.organisations set next_report_number = next_report_number + 1
    where id = new.organisation_id returning next_report_number - 1 into next_number;
  if next_number is null then raise exception 'Organisation not found'; end if;
  new.report_number := next_number;
  new.reporter_user_id := auth.uid();
  new.status := 'submitted';
  new.classification := null;
  new.severity := null;
  new.closed_at := null;
  return new;
end;
$$;
create trigger prepare_report_before_insert before insert on public.reports for each row execute function public.prepare_report();

create function public.record_report_status() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.report_status_history (organisation_id, report_id, from_status, to_status, changed_by)
    values (new.organisation_id, new.id, null, new.status, auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.report_status_history (organisation_id, report_id, from_status, to_status, changed_by)
    values (new.organisation_id, new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;
create trigger record_report_status_after_insert after insert on public.reports for each row execute function public.record_report_status();
create trigger record_report_status_after_update after update of status on public.reports for each row execute function public.record_report_status();

create function public.record_audit() returns trigger language plpgsql security definer set search_path = '' as $$
declare source_row record;
begin
  if tg_op = 'DELETE' then source_row := old; else source_row := new; end if;
  insert into public.audit_logs (organisation_id, table_name, record_id, operation, actor_user_id)
  values (source_row.organisation_id, tg_table_name, source_row.id, tg_op, auth.uid());
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'organisation_members','sites','work_areas','member_site_access','reports','report_answers',
    'report_evidence','report_status_history','report_internal_notes','report_updates',
    'report_actions','report_resolutions','checklists','checklist_items','checklist_assignments',
    'checklist_submissions','checklist_responses','notifications','push_tokens',
    'reporting_configurations','custom_report_questions'
  ] loop
    execute format('create trigger audit_change after insert or update or delete on public.%I for each row execute function public.record_audit()', table_name);
  end loop;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array['organisations','organisation_members','sites','work_areas','reports','report_answers','report_internal_notes','report_updates','report_actions','report_resolutions','checklists','checklist_items','checklist_responses','reporting_configurations','custom_report_questions','push_tokens'] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name);
  end loop;
end $$;

create index organisation_members_user_idx on public.organisation_members (user_id, organisation_id) where is_active;
create index member_site_access_site_idx on public.member_site_access (organisation_id, site_id) where revoked_at is null;
create index work_areas_site_idx on public.work_areas (organisation_id, site_id) where archived_at is null;
create index reports_site_status_idx on public.reports (organisation_id, site_id, status, created_at desc);
create index reports_reporter_idx on public.reports (reporter_user_id, created_at desc);
create index report_answers_report_idx on public.report_answers (organisation_id, report_id);
create index report_evidence_report_idx on public.report_evidence (organisation_id, report_id);
create index report_status_history_report_idx on public.report_status_history (organisation_id, report_id, created_at desc);
create index report_internal_notes_report_idx on public.report_internal_notes (organisation_id, report_id, created_at desc);
create index report_updates_report_idx on public.report_updates (organisation_id, report_id, created_at desc);
create index report_actions_report_idx on public.report_actions (organisation_id, report_id);
create index report_resolutions_report_idx on public.report_resolutions (organisation_id, report_id);
create index checklist_items_checklist_idx on public.checklist_items (organisation_id, checklist_id, sort_order);
create index checklist_assignments_member_idx on public.checklist_assignments (organisation_id, member_id) where revoked_at is null;
create index checklist_submissions_user_idx on public.checklist_submissions (submitted_by, submitted_at desc);
create index checklist_responses_submission_idx on public.checklist_responses (organisation_id, submission_id);
create index notifications_recipient_idx on public.notifications (recipient_user_id, created_at desc) where archived_at is null;
create index push_tokens_user_idx on public.push_tokens (user_id) where is_active;
create index custom_report_questions_config_idx on public.custom_report_questions (organisation_id, reporting_configuration_id, sort_order) where is_active;
create index audit_logs_scope_idx on public.audit_logs (organisation_id, created_at desc);
