create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.has_role(p_organisation_id uuid, p_roles public.organisation_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organisation_members m
    where m.organisation_id = p_organisation_id and m.user_id = auth.uid()
      and m.is_active and m.role = any(p_roles)
  );
$$;

create function private.is_member(p_organisation_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.has_role(p_organisation_id, array['worker','hse_officer','hse_admin','organisation_admin']::public.organisation_role[]);
$$;

create function private.can_use_site(p_organisation_id uuid, p_site_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.sites s
    join public.organisations o on o.id = s.organisation_id
    where s.organisation_id = p_organisation_id and s.id = p_site_id
      and s.archived_at is null and o.archived_at is null
      and (
        private.has_role(p_organisation_id, array['hse_admin','organisation_admin']::public.organisation_role[])
        or exists (
          select 1 from public.member_site_access a
          join public.organisation_members m on m.organisation_id = a.organisation_id and m.id = a.member_id
          where a.organisation_id = p_organisation_id and a.site_id = p_site_id
            and a.revoked_at is null and m.user_id = auth.uid() and m.is_active
        )
      )
  );
$$;

create function private.can_manage_report(p_report_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.reports r
    where r.id = p_report_id and (
      private.has_role(r.organisation_id, array['hse_admin']::public.organisation_role[])
      or (private.has_role(r.organisation_id, array['hse_officer']::public.organisation_role[])
          and private.can_use_site(r.organisation_id, r.site_id))
    )
  );
$$;

create function private.is_report_owner(p_report_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.reports r
    where r.id = p_report_id and r.reporter_user_id = auth.uid() and private.is_member(r.organisation_id)
  );
$$;

create function private.can_read_report(p_report_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_report_owner(p_report_id) or private.can_manage_report(p_report_id);
$$;

create function private.valid_report_category(p_organisation_id uuid, p_site_id uuid, p_category text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.reporting_configurations c
    where c.organisation_id = p_organisation_id and c.is_active and c.category_key = p_category
      and (c.site_id is null or c.site_id = p_site_id)
  );
$$;

create function private.valid_report_answer(p_report_id uuid, p_question_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.reports r
    join public.custom_report_questions q on q.organisation_id = r.organisation_id and q.id = p_question_id
    join public.reporting_configurations c on c.organisation_id = q.organisation_id and c.id = q.reporting_configuration_id
    where r.id = p_report_id and q.is_active and c.is_active and c.category_key = r.category
      and (c.site_id is null or c.site_id = r.site_id)
  );
$$;

create function private.is_assigned_checklist(p_checklist_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.checklists c
    join public.organisations o on o.id = c.organisation_id
    join public.checklist_assignments a on a.organisation_id = c.organisation_id and a.checklist_id = c.id
    join public.organisation_members m on m.organisation_id = a.organisation_id and m.id = a.member_id
    where c.id = p_checklist_id and c.status = 'active' and o.archived_at is null and a.revoked_at is null
      and m.user_id = auth.uid() and m.is_active
      and (c.site_id is null or private.can_use_site(c.organisation_id, c.site_id))
      and private.is_member(c.organisation_id)
  );
$$;

create function private.is_assignment_owner(p_assignment_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.checklist_assignments a
    join public.organisation_members m on m.organisation_id = a.organisation_id and m.id = a.member_id
    where a.id = p_assignment_id and a.revoked_at is null and m.user_id = auth.uid() and m.is_active
      and private.is_assigned_checklist(a.checklist_id)
  );
$$;

create function private.valid_checklist_assignment(p_checklist_id uuid, p_member_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.checklists c
    join public.organisation_members m on m.organisation_id = c.organisation_id and m.id = p_member_id
    where c.id = p_checklist_id and m.is_active
      and (c.site_id is null or exists (
        select 1 from public.member_site_access a
        where a.organisation_id = c.organisation_id and a.site_id = c.site_id
          and a.member_id = m.id and a.revoked_at is null
      ))
  );
$$;

create function private.can_read_checklist(p_checklist_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.checklists c where c.id = p_checklist_id
      and (private.has_role(c.organisation_id, array['hse_admin']::public.organisation_role[])
           or private.is_assigned_checklist(c.id)
           or (c.site_id is not null
               and private.has_role(c.organisation_id, array['hse_officer']::public.organisation_role[])
               and private.can_use_site(c.organisation_id, c.site_id)))
  );
$$;

create function private.can_review_checklist_assignment(p_assignment_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.checklist_assignments a
    join public.checklists c on c.organisation_id = a.organisation_id and c.id = a.checklist_id
    where a.id = p_assignment_id and c.site_id is not null
      and private.has_role(c.organisation_id, array['hse_officer']::public.organisation_role[])
      and private.can_use_site(c.organisation_id, c.site_id)
  );
$$;

create function private.can_review_checklist_submission(p_submission_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.checklist_submissions s
    where s.id = p_submission_id and private.can_review_checklist_assignment(s.assignment_id)
  );
$$;

create function private.is_submission_owner(p_submission_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.checklist_submissions s
    where s.id = p_submission_id and s.submitted_by = auth.uid()
      and private.is_member(s.organisation_id)
  );
$$;

create function private.valid_checklist_response(p_submission_id uuid, p_item_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.checklist_submissions s
    join public.checklist_assignments a on a.organisation_id = s.organisation_id and a.id = s.assignment_id
    join public.checklist_items i on i.organisation_id = s.organisation_id and i.id = p_item_id
    where s.id = p_submission_id and i.checklist_id = a.checklist_id
  );
$$;

revoke all on function private.has_role(uuid, public.organisation_role[]) from public;
revoke all on function private.is_member(uuid) from public;
revoke all on function private.can_use_site(uuid, uuid) from public;
revoke all on function private.can_manage_report(uuid) from public;
revoke all on function private.is_report_owner(uuid) from public;
revoke all on function private.can_read_report(uuid) from public;
revoke all on function private.valid_report_category(uuid, uuid, text) from public;
revoke all on function private.valid_report_answer(uuid, uuid) from public;
revoke all on function private.is_assigned_checklist(uuid) from public;
revoke all on function private.is_assignment_owner(uuid) from public;
revoke all on function private.valid_checklist_assignment(uuid, uuid) from public;
revoke all on function private.can_read_checklist(uuid) from public;
revoke all on function private.can_review_checklist_assignment(uuid) from public;
revoke all on function private.can_review_checklist_submission(uuid) from public;
revoke all on function private.is_submission_owner(uuid) from public;
revoke all on function private.valid_checklist_response(uuid, uuid) from public;
grant execute on all functions in schema private to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'organisations','organisation_members','sites','work_areas','member_site_access','reports',
    'report_answers','report_evidence','report_status_history','report_internal_notes','report_updates',
    'report_actions','report_resolutions','checklists','checklist_items','checklist_assignments',
    'checklist_submissions','checklist_responses','notifications','push_tokens',
    'reporting_configurations','custom_report_questions','audit_logs'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select on public.%I to authenticated', table_name);
  end loop;
end $$;

-- Organisation administration
create policy organisations_read on public.organisations for select to authenticated using (private.is_member(id));
create policy organisations_admin_update on public.organisations for update to authenticated
  using (private.has_role(id, array['organisation_admin']::public.organisation_role[]))
  with check (private.has_role(id, array['organisation_admin']::public.organisation_role[]));
grant update (name, slug, archived_at) on public.organisations to authenticated;

create policy members_read on public.organisation_members for select to authenticated
  using ((user_id = auth.uid() and private.is_member(organisation_id))
    or private.has_role(organisation_id, array['hse_admin','organisation_admin']::public.organisation_role[]));
create policy members_admin_insert on public.organisation_members for insert to authenticated
  with check (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[]));
create policy members_admin_update on public.organisation_members for update to authenticated
  using (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[]))
  with check (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[]));
grant insert (organisation_id, user_id, role, is_active) on public.organisation_members to authenticated;
grant update (role, is_active) on public.organisation_members to authenticated;

create policy sites_read on public.sites for select to authenticated
  using (private.has_role(organisation_id, array['hse_admin','organisation_admin']::public.organisation_role[])
    or private.can_use_site(organisation_id, id));
create policy sites_admin_insert on public.sites for insert to authenticated
  with check (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[]));
create policy sites_admin_update on public.sites for update to authenticated
  using (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[]))
  with check (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[]));
grant insert (organisation_id, name, code) on public.sites to authenticated;
grant update (name, code, archived_at) on public.sites to authenticated;

create policy work_areas_read on public.work_areas for select to authenticated
  using (private.can_use_site(organisation_id, site_id));
create policy work_areas_admin_insert on public.work_areas for insert to authenticated
  with check (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[]));
create policy work_areas_admin_update on public.work_areas for update to authenticated
  using (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[]))
  with check (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[]));
grant insert (organisation_id, site_id, name) on public.work_areas to authenticated;
grant update (name, archived_at) on public.work_areas to authenticated;

create policy member_site_access_read on public.member_site_access for select to authenticated
  using (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[])
    or exists (select 1 from public.organisation_members m where m.id = member_id and m.user_id = auth.uid() and m.is_active));
create policy member_site_access_admin_insert on public.member_site_access for insert to authenticated
  with check (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[]));
create policy member_site_access_admin_update on public.member_site_access for update to authenticated
  using (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[]))
  with check (private.has_role(organisation_id, array['organisation_admin']::public.organisation_role[]));
grant insert (organisation_id, member_id, site_id) on public.member_site_access to authenticated;
grant update (revoked_at) on public.member_site_access to authenticated;

-- Reports: a worker may supply only intake fields. A trigger owns reporter, number, status and assessment defaults.
create policy reports_read on public.reports for select to authenticated
  using ((reporter_user_id = auth.uid() and private.is_member(organisation_id)) or private.can_manage_report(id));
create policy reports_create on public.reports for insert to authenticated
  with check (reporter_user_id = auth.uid() and private.can_use_site(organisation_id, site_id)
    and private.valid_report_category(organisation_id, site_id, category)
    and (work_area_id is null or exists (
      select 1 from public.work_areas w where w.id = reports.work_area_id and w.organisation_id = reports.organisation_id
        and w.site_id = reports.site_id and w.archived_at is null
    )));
create policy reports_hse_update on public.reports for update to authenticated
  using (private.can_manage_report(id)) with check (private.can_manage_report(id));
grant insert (organisation_id, site_id, work_area_id, category, description, occurred_at) on public.reports to authenticated;
grant update (classification, severity, status, closed_at) on public.reports to authenticated;

create policy report_answers_read on public.report_answers for select to authenticated using (private.can_read_report(report_id));
create policy report_answers_create on public.report_answers for insert to authenticated
  with check (private.is_report_owner(report_id) and private.valid_report_answer(report_id, question_id));
grant insert (organisation_id, report_id, question_id, answer) on public.report_answers to authenticated;

create policy report_evidence_read on public.report_evidence for select to authenticated
  using (private.can_manage_report(report_id) or (worker_visible and private.is_report_owner(report_id)));
create policy report_evidence_create on public.report_evidence for insert to authenticated
  with check (uploaded_by = auth.uid() and (private.can_manage_report(report_id) or private.is_report_owner(report_id)));
create policy report_evidence_hse_update on public.report_evidence for update to authenticated
  using (private.can_manage_report(report_id)) with check (private.can_manage_report(report_id));
grant insert (organisation_id, report_id, storage_path, file_name, mime_type, uploaded_by, worker_visible) on public.report_evidence to authenticated;
grant update (worker_visible, archived_at) on public.report_evidence to authenticated;

create policy report_status_history_read on public.report_status_history for select to authenticated
  using (private.can_read_report(report_id));

create policy report_internal_notes_hse_read on public.report_internal_notes for select to authenticated
  using (private.can_manage_report(report_id));
create policy report_internal_notes_hse_insert on public.report_internal_notes for insert to authenticated
  with check (author_user_id = auth.uid() and private.can_manage_report(report_id));
create policy report_internal_notes_hse_update on public.report_internal_notes for update to authenticated
  using (private.can_manage_report(report_id)) with check (private.can_manage_report(report_id));
grant insert (organisation_id, report_id, author_user_id, body) on public.report_internal_notes to authenticated;
grant update (body, archived_at) on public.report_internal_notes to authenticated;

create policy report_updates_read on public.report_updates for select to authenticated
  using (private.can_read_report(report_id));
create policy report_updates_hse_insert on public.report_updates for insert to authenticated
  with check (author_user_id = auth.uid() and private.can_manage_report(report_id));
create policy report_updates_hse_update on public.report_updates for update to authenticated
  using (private.can_manage_report(report_id)) with check (private.can_manage_report(report_id));
grant insert (organisation_id, report_id, author_user_id, body) on public.report_updates to authenticated;
grant update (body, archived_at) on public.report_updates to authenticated;

create policy report_actions_hse_read on public.report_actions for select to authenticated
  using (private.can_manage_report(report_id));
create policy report_actions_hse_insert on public.report_actions for insert to authenticated
  with check (created_by = auth.uid() and private.can_manage_report(report_id));
create policy report_actions_hse_update on public.report_actions for update to authenticated
  using (private.can_manage_report(report_id)) with check (private.can_manage_report(report_id));
grant insert (organisation_id, report_id, title, description, assignee_user_id, due_at, created_by) on public.report_actions to authenticated;
grant update (title, description, assignee_user_id, due_at, completed_at, archived_at) on public.report_actions to authenticated;

create policy report_resolutions_hse_read on public.report_resolutions for select to authenticated
  using (private.can_manage_report(report_id));
create policy report_resolutions_hse_insert on public.report_resolutions for insert to authenticated
  with check (resolved_by = auth.uid() and private.can_manage_report(report_id));
create policy report_resolutions_hse_update on public.report_resolutions for update to authenticated
  using (private.can_manage_report(report_id)) with check (private.can_manage_report(report_id));
grant insert (organisation_id, report_id, summary, resolved_by) on public.report_resolutions to authenticated;
grant update (summary, archived_at) on public.report_resolutions to authenticated;

-- Checklist administration and worker assignments
create policy checklists_read on public.checklists for select to authenticated
  using (private.has_role(organisation_id, array['hse_admin']::public.organisation_role[])
    or private.is_assigned_checklist(id)
    or (site_id is not null
      and private.has_role(organisation_id, array['hse_officer']::public.organisation_role[])
      and private.can_use_site(organisation_id, site_id)));
create policy checklists_admin_insert on public.checklists for insert to authenticated
  with check (created_by = auth.uid() and private.has_role(organisation_id, array['hse_admin']::public.organisation_role[]));
create policy checklists_admin_update on public.checklists for update to authenticated
  using (private.has_role(organisation_id, array['hse_admin']::public.organisation_role[]))
  with check (private.has_role(organisation_id, array['hse_admin']::public.organisation_role[]));
grant insert (organisation_id, site_id, title, description, status, created_by) on public.checklists to authenticated;
grant update (title, description, status) on public.checklists to authenticated;

create policy checklist_items_read on public.checklist_items for select to authenticated
  using (private.can_read_checklist(checklist_id));
create policy checklist_items_admin_insert on public.checklist_items for insert to authenticated
  with check (private.has_role(organisation_id, array['hse_admin']::public.organisation_role[]));
create policy checklist_items_admin_update on public.checklist_items for update to authenticated
  using (private.has_role(organisation_id, array['hse_admin']::public.organisation_role[]))
  with check (private.has_role(organisation_id, array['hse_admin']::public.organisation_role[]));
grant insert (organisation_id, checklist_id, prompt, answer_type, options, is_required, sort_order) on public.checklist_items to authenticated;
grant update (prompt, answer_type, options, is_required, sort_order) on public.checklist_items to authenticated;

create policy checklist_assignments_read on public.checklist_assignments for select to authenticated
  using (private.has_role(organisation_id, array['hse_admin']::public.organisation_role[])
    or private.is_assignment_owner(id) or private.can_review_checklist_assignment(id));
create policy checklist_assignments_admin_insert on public.checklist_assignments for insert to authenticated
  with check (assigned_by = auth.uid() and private.has_role(organisation_id, array['hse_admin']::public.organisation_role[])
    and private.valid_checklist_assignment(checklist_id, member_id));
create policy checklist_assignments_admin_update on public.checklist_assignments for update to authenticated
  using (private.has_role(organisation_id, array['hse_admin']::public.organisation_role[]))
  with check (private.has_role(organisation_id, array['hse_admin']::public.organisation_role[]));
grant insert (organisation_id, checklist_id, member_id, due_at, assigned_by) on public.checklist_assignments to authenticated;
grant update (due_at, revoked_at) on public.checklist_assignments to authenticated;

create policy checklist_submissions_read on public.checklist_submissions for select to authenticated
  using ((submitted_by = auth.uid() and private.is_member(organisation_id))
    or private.has_role(organisation_id, array['hse_admin']::public.organisation_role[])
    or private.can_review_checklist_assignment(assignment_id));
create policy checklist_submissions_create on public.checklist_submissions for insert to authenticated
  with check (submitted_by = auth.uid() and private.is_assignment_owner(assignment_id));
grant insert (organisation_id, assignment_id, submitted_by) on public.checklist_submissions to authenticated;

create policy checklist_responses_read on public.checklist_responses for select to authenticated
  using (private.is_submission_owner(submission_id)
    or private.has_role(organisation_id, array['hse_admin']::public.organisation_role[])
    or private.can_review_checklist_submission(submission_id));
create policy checklist_responses_create on public.checklist_responses for insert to authenticated
  with check (private.is_submission_owner(submission_id) and private.valid_checklist_response(submission_id, item_id));
grant insert (organisation_id, submission_id, item_id, answer) on public.checklist_responses to authenticated;

-- Notifications are produced by trusted server processes; recipients may mark them read or archived.
create policy notifications_recipient_read on public.notifications for select to authenticated
  using (recipient_user_id = auth.uid() and private.is_member(organisation_id));
create policy notifications_recipient_update on public.notifications for update to authenticated
  using (recipient_user_id = auth.uid() and private.is_member(organisation_id))
  with check (recipient_user_id = auth.uid() and private.is_member(organisation_id));
grant update (read_at, archived_at) on public.notifications to authenticated;

create policy push_tokens_owner_read on public.push_tokens for select to authenticated
  using (user_id = auth.uid() and private.is_member(organisation_id));
create policy push_tokens_owner_insert on public.push_tokens for insert to authenticated
  with check (user_id = auth.uid() and private.is_member(organisation_id));
create policy push_tokens_owner_update on public.push_tokens for update to authenticated
  using (user_id = auth.uid() and private.is_member(organisation_id))
  with check (user_id = auth.uid() and private.is_member(organisation_id));
grant insert (organisation_id, user_id, token, platform) on public.push_tokens to authenticated;
grant update (token, platform, is_active) on public.push_tokens to authenticated;

create policy reporting_configurations_read on public.reporting_configurations for select to authenticated
  using (private.has_role(organisation_id, array['hse_admin','organisation_admin']::public.organisation_role[])
    or (is_active and private.is_member(organisation_id)
      and (site_id is null or private.can_use_site(organisation_id, site_id))));
create policy reporting_configurations_admin_insert on public.reporting_configurations for insert to authenticated
  with check (private.has_role(organisation_id, array['hse_admin','organisation_admin']::public.organisation_role[]));
create policy reporting_configurations_admin_update on public.reporting_configurations for update to authenticated
  using (private.has_role(organisation_id, array['hse_admin','organisation_admin']::public.organisation_role[]))
  with check (private.has_role(organisation_id, array['hse_admin','organisation_admin']::public.organisation_role[]));
grant insert (organisation_id, site_id, category_key, category_label, is_active, sort_order) on public.reporting_configurations to authenticated;
grant update (category_label, is_active, sort_order) on public.reporting_configurations to authenticated;

create policy custom_report_questions_read on public.custom_report_questions for select to authenticated
  using (private.has_role(organisation_id, array['hse_admin','organisation_admin']::public.organisation_role[])
    or (is_active and exists (
      select 1 from public.reporting_configurations c where c.id = reporting_configuration_id
        and c.is_active and private.is_member(c.organisation_id)
        and (c.site_id is null or private.can_use_site(c.organisation_id, c.site_id))
    )));
create policy custom_report_questions_admin_insert on public.custom_report_questions for insert to authenticated
  with check (private.has_role(organisation_id, array['hse_admin','organisation_admin']::public.organisation_role[]));
create policy custom_report_questions_admin_update on public.custom_report_questions for update to authenticated
  using (private.has_role(organisation_id, array['hse_admin','organisation_admin']::public.organisation_role[]))
  with check (private.has_role(organisation_id, array['hse_admin','organisation_admin']::public.organisation_role[]));
grant insert (organisation_id, reporting_configuration_id, question_key, label, answer_type, options, is_required, is_active, sort_order) on public.custom_report_questions to authenticated;
grant update (label, answer_type, options, is_required, is_active, sort_order) on public.custom_report_questions to authenticated;

create policy audit_logs_admin_read on public.audit_logs for select to authenticated
  using (private.has_role(organisation_id, array['hse_admin','organisation_admin']::public.organisation_role[]));

revoke all on function public.prepare_report() from public, anon, authenticated;
revoke all on function public.record_report_status() from public, anon, authenticated;
revoke all on function public.record_audit() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
