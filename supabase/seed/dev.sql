-- Local development only. These Auth rows are placeholders without login credentials.
-- Create login-capable users through the local Auth admin API or Studio when needed.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-000000000101', 'worker@safira.example.test', '{"name":"Demo Worker"}'::jsonb),
  ('00000000-0000-4000-8000-000000000102', 'officer@safira.example.test', '{"name":"Demo HSE Officer"}'::jsonb),
  ('00000000-0000-4000-8000-000000000103', 'hse-admin@safira.example.test', '{"name":"Demo HSE Admin"}'::jsonb),
  ('00000000-0000-4000-8000-000000000104', 'org-admin@safira.example.test', '{"name":"Demo Organisation Admin"}'::jsonb);

insert into public.organisations (id, name, slug) values
  ('00000000-0000-4000-8000-000000000001', 'Safira Demo Organisation', 'safira-demo');

insert into public.organisation_members (id, organisation_id, user_id, role) values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000101', 'worker'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000102', 'hse_officer'),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000103', 'hse_admin'),
  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000104', 'organisation_admin');

insert into public.sites (id, organisation_id, name, code) values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000001', 'Demo Site', 'DEMO-01');

insert into public.work_areas (organisation_id, site_id, name) values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000301', 'Operations Yard'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000301', 'Workshop'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000301', 'Warehouse');

insert into public.member_site_access (organisation_id, member_id, site_id) values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000301'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000301');

insert into public.reporting_configurations (organisation_id, category_key, category_label, sort_order) values
  ('00000000-0000-4000-8000-000000000001', 'safety_observation', 'Safety observation', 1),
  ('00000000-0000-4000-8000-000000000001', 'equipment_concern', 'Equipment concern', 2),
  ('00000000-0000-4000-8000-000000000001', 'environmental_observation', 'Environmental observation', 3);
