const fs = require('node:fs');
const assert = require('node:assert/strict');
const { PGlite } = require('@electric-sql/pglite');

const org = '00000000-0000-4000-8000-000000000001';
const site = '00000000-0000-4000-8000-000000000301';
const worker = '00000000-0000-4000-8000-000000000101';
const officer = '00000000-0000-4000-8000-000000000102';
const hseAdmin = '00000000-0000-4000-8000-000000000103';
const orgAdmin = '00000000-0000-4000-8000-000000000104';
const otherWorker = '00000000-0000-4000-8000-000000000105';
const otherSite = '00000000-0000-4000-8000-000000000302';

async function main() {
  const db = new PGlite();
  await db.exec(`
    create schema auth;
    create schema extensions;
    create role anon;
    create role authenticated;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid() to authenticated;
  `);

  for (const name of [
    '20260924000100_foundation_schema.sql',
    '20260924000200_foundation_rls.sql',
  ]) {
    let sql = fs.readFileSync(`supabase/migrations/${name}`, 'utf8');
    sql = sql.replace(
      'create extension if not exists pgcrypto with schema extensions;',
      '',
    );
    await db.exec(sql);
    console.log(`Applied ${name}`);
  }
  await db.exec(fs.readFileSync('supabase/seed/dev.sql', 'utf8'));

  const tables = await db.query(
    `select count(*)::int as count from pg_tables where schemaname = 'public'`,
  );
  assert.equal(tables.rows[0].count, 23);
  const rls = await db.query(
    `select count(*)::int as count from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity`,
  );
  assert.equal(rls.rows[0].count, 23);

  await db.exec(`
    insert into auth.users (id, email) values ('${otherWorker}', 'other-worker@safira.example.test');
    insert into public.organisation_members (organisation_id, user_id, role) values ('${org}', '${otherWorker}', 'worker');
    insert into public.member_site_access (organisation_id, member_id, site_id)
      select '${org}', id, '${site}' from public.organisation_members where user_id = '${otherWorker}';
  `);

  async function asUser(userId, fn) {
    await db.exec(
      `set role authenticated; set request.jwt.claim.sub = '${userId}'`,
    );
    try {
      return await fn();
    } finally {
      await db.exec('reset role; reset request.jwt.claim.sub');
    }
  }
  async function insertReport(userId) {
    return asUser(userId, async () => {
      const result =
        await db.query(`insert into public.reports (organisation_id, site_id, category, description)
        values ('${org}', '${site}', 'safety_observation', 'Verification report') returning id, reference, status, severity, classification, reporter_user_id`);
      return result.rows[0];
    });
  }

  const own = await insertReport(worker);
  const other = await insertReport(otherWorker);
  assert.equal(own.reference, 'RPT-000001');
  assert.equal(other.reference, 'RPT-000002');
  assert.equal(own.reporter_user_id, worker);
  assert.equal(own.status, 'submitted');
  assert.equal(own.severity, null);
  assert.equal(own.classification, null);

  await asUser(worker, async () => {
    const visible = await db.query('select id from public.reports');
    assert.deepEqual(
      visible.rows.map((row) => row.id),
      [own.id],
    );
    const internal = await db.query(
      'select id from public.report_internal_notes',
    );
    assert.equal(internal.rows.length, 0);
    const history = await db.query(
      `select to_status from public.report_status_history where report_id = '${own.id}'`,
    );
    assert.equal(history.rows.length, 1);
    const update = await db.query(
      `update public.reports set severity = 'critical' where id = '${own.id}' returning id`,
    );
    assert.equal(update.rows.length, 0);
    await assert.rejects(
      db.exec(`insert into public.report_internal_notes (organisation_id, report_id, author_user_id, body)
      values ('${org}', '${own.id}', '${worker}', 'Should be denied')`),
    );
    await assert.rejects(
      db.exec(`insert into public.reports (organisation_id, site_id, category, description, severity)
      values ('${org}', '${site}', 'safety_observation', 'Should be denied', 'critical')`),
    );
  });

  await asUser(officer, async () => {
    const visible = await db.query('select id from public.reports');
    assert.equal(visible.rows.length, 2);
    await db.exec(
      `update public.reports set severity = 'high', status = 'under_review' where id = '${own.id}'`,
    );
    await db.exec(`insert into public.report_internal_notes (organisation_id, report_id, author_user_id, body)
      values ('${org}', '${own.id}', '${officer}', 'Internal assessment')`);
    await db.exec(`insert into public.report_updates (organisation_id, report_id, author_user_id, body)
      values ('${org}', '${own.id}', '${officer}', 'We are reviewing this report')`);
  });

  await asUser(worker, async () => {
    const history = await db.query(
      `select to_status from public.report_status_history where report_id = '${own.id}' order by created_at`,
    );
    assert.equal(history.rows.length, 2);
    const updates = await db.query(
      `select body from public.report_updates where report_id = '${own.id}'`,
    );
    assert.equal(updates.rows.length, 1);
    const notes = await db.query(
      `select body from public.report_internal_notes where report_id = '${own.id}'`,
    );
    assert.equal(notes.rows.length, 0);
  });

  await asUser(hseAdmin, async () => {
    const reports = await db.query('select id from public.reports');
    assert.equal(reports.rows.length, 2);
  });
  await asUser(orgAdmin, async () => {
    const reports = await db.query('select id from public.reports');
    assert.equal(reports.rows.length, 0);
    const sites = await db.query('select id from public.sites');
    assert.equal(sites.rows.length, 1);
  });

  await db.exec(`insert into public.sites (id, organisation_id, name, code)
    values ('${otherSite}', '${org}', 'Other Site', 'DEMO-02')`);
  await asUser(officer, async () => {
    await assert.rejects(
      db.exec(`insert into public.reports (organisation_id, site_id, category, description)
      values ('${org}', '${otherSite}', 'safety_observation', 'Should be denied')`),
    );
  });
  await asUser(hseAdmin, async () => {
    await db.exec(`insert into public.reports (organisation_id, site_id, category, description)
      values ('${org}', '${otherSite}', 'safety_observation', 'Second site report')`);
  });
  await asUser(officer, async () => {
    const visible = await db.query('select id from public.reports');
    assert.equal(visible.rows.length, 2);
  });

  const checklist = await asUser(hseAdmin, async () => {
    const result =
      await db.query(`insert into public.checklists (organisation_id, site_id, title, status, created_by)
      values ('${org}', '${site}', 'Demo checklist', 'active', '${hseAdmin}') returning id`);
    return result.rows[0].id;
  });
  await asUser(hseAdmin, async () => {
    await db.exec(`insert into public.checklist_items (organisation_id, checklist_id, prompt, answer_type)
      values ('${org}', '${checklist}', 'Is the area clear?', 'boolean')`);
    await db.exec(`insert into public.checklist_assignments (organisation_id, checklist_id, member_id, assigned_by)
      values ('${org}', '${checklist}', '00000000-0000-4000-8000-000000000201', '${hseAdmin}')`);
    await db.exec(`insert into public.checklists (organisation_id, title, status, created_by)
      values ('${org}', 'Unassigned checklist', 'active', '${hseAdmin}')`);
  });
  await asUser(worker, async () => {
    const visible = await db.query('select id from public.checklists');
    assert.deepEqual(
      visible.rows.map((row) => row.id),
      [checklist],
    );
    const assignment = await db.query(
      `select id from public.checklist_assignments where checklist_id = '${checklist}'`,
    );
    assert.equal(assignment.rows.length, 1);
    const submission =
      await db.query(`insert into public.checklist_submissions (organisation_id, assignment_id, submitted_by)
      values ('${org}', '${assignment.rows[0].id}', '${worker}') returning id`);
    const item = await db.query(
      `select id from public.checklist_items where checklist_id = '${checklist}'`,
    );
    await db.exec(`insert into public.checklist_responses (organisation_id, submission_id, item_id, answer)
      values ('${org}', '${submission.rows[0].id}', '${item.rows[0].id}', 'true'::jsonb)`);
  });
  await asUser(officer, async () => {
    assert.equal(
      (await db.query('select id from public.checklists')).rows.length,
      1,
    );
    assert.equal(
      (await db.query('select id from public.checklist_assignments')).rows
        .length,
      1,
    );
    assert.equal(
      (await db.query('select id from public.checklist_submissions')).rows
        .length,
      1,
    );
    assert.equal(
      (await db.query('select id from public.checklist_responses')).rows.length,
      1,
    );
  });

  await db.exec(
    `update public.organisations set next_report_number = 1000000 where id = '${org}'`,
  );
  const largeReference = await insertReport(worker);
  assert.equal(largeReference.reference, 'RPT-1000000');
  await asUser(orgAdmin, async () => {
    const audit = await db.query(
      `select count(*)::int as count from public.audit_logs where organisation_id = '${org}'`,
    );
    assert.ok(audit.rows[0].count > 0);
    const checklists = await db.query('select id from public.checklists');
    assert.equal(checklists.rows.length, 0);
  });

  console.log('Embedded PostgreSQL schema, seed, grants and RLS checks passed');
  await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
