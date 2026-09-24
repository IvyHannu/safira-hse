import type { Json } from './index';

export type OrganisationRole =
  'worker' | 'hse_officer' | 'hse_admin' | 'organisation_admin';
export type ReportStatus =
  'submitted' | 'under_review' | 'action_required' | 'resolved' | 'closed';
export type ReportSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type HseClassification =
  'hazard' | 'near_miss' | 'incident' | 'environmental_concern';
export type ChecklistStatus = 'draft' | 'active' | 'archived';

type Id = string;
type DateTime = string;
type Base = { id: Id; created_at: DateTime };
type Updated = Base & { updated_at: DateTime };
type Scope = { organisation_id: Id };
type InsertRow<
  Row,
  Required extends keyof Row,
  Generated extends keyof Row = never,
> = Pick<Row, Required> & Partial<Omit<Row, Required | Generated>>;
type DbTable<
  Row,
  Required extends keyof Row,
  Generated extends keyof Row = never,
> = {
  Row: Row;
  Insert: InsertRow<Row, Required, Generated>;
  Update: Partial<Omit<Row, Generated>>;
  Relationships: [];
};

export type Organisation = Updated & {
  name: string;
  slug: string;
  next_report_number: number;
  archived_at: DateTime | null;
};
export type OrganisationMember = Updated &
  Scope & { user_id: Id; role: OrganisationRole; is_active: boolean };
export type Site = Updated &
  Scope & { name: string; code: string; archived_at: DateTime | null };
export type WorkArea = Updated &
  Scope & { site_id: Id; name: string; archived_at: DateTime | null };
export type MemberSiteAccess = Base &
  Scope & { member_id: Id; site_id: Id; revoked_at: DateTime | null };
export type Report = Updated &
  Scope & {
    site_id: Id;
    work_area_id: Id | null;
    reporter_user_id: Id;
    report_number: number;
    reference: string;
    category: string;
    description: string;
    occurred_at: DateTime | null;
    classification: HseClassification | null;
    severity: ReportSeverity | null;
    status: ReportStatus;
    closed_at: DateTime | null;
  };
export type ReportAnswer = Updated &
  Scope & { report_id: Id; question_id: Id; answer: Json };
export type ReportEvidence = Base &
  Scope & {
    report_id: Id;
    storage_path: string;
    file_name: string;
    mime_type: string | null;
    uploaded_by: Id;
    worker_visible: boolean;
    archived_at: DateTime | null;
  };
export type ReportStatusHistory = Base &
  Scope & {
    report_id: Id;
    from_status: ReportStatus | null;
    to_status: ReportStatus;
    changed_by: Id | null;
  };
export type ReportInternalNote = Updated &
  Scope & {
    report_id: Id;
    author_user_id: Id;
    body: string;
    archived_at: DateTime | null;
  };
export type ReportUpdate = Updated &
  Scope & {
    report_id: Id;
    author_user_id: Id;
    body: string;
    archived_at: DateTime | null;
  };
export type ReportAction = Updated &
  Scope & {
    report_id: Id;
    title: string;
    description: string | null;
    assignee_user_id: Id | null;
    due_at: DateTime | null;
    completed_at: DateTime | null;
    created_by: Id;
    archived_at: DateTime | null;
  };
export type ReportResolution = Updated &
  Scope & {
    report_id: Id;
    summary: string;
    resolved_by: Id;
    archived_at: DateTime | null;
  };
export type Checklist = Updated &
  Scope & {
    site_id: Id | null;
    title: string;
    description: string | null;
    status: ChecklistStatus;
    created_by: Id;
  };
export type ChecklistItem = Updated &
  Scope & {
    checklist_id: Id;
    prompt: string;
    answer_type:
      'text' | 'number' | 'boolean' | 'single_choice' | 'multi_choice';
    options: Json;
    is_required: boolean;
    sort_order: number;
  };
export type ChecklistAssignment = Scope & {
  id: Id;
  checklist_id: Id;
  member_id: Id;
  due_at: DateTime | null;
  assigned_by: Id;
  created_at: DateTime;
  assigned_at: DateTime;
  revoked_at: DateTime | null;
};
export type ChecklistSubmission = Base &
  Scope & { assignment_id: Id; submitted_by: Id; submitted_at: DateTime };
export type ChecklistResponse = Updated &
  Scope & { submission_id: Id; item_id: Id; answer: Json };
export type Notification = Base &
  Scope & {
    recipient_user_id: Id;
    title: string;
    body: string;
    report_id: Id | null;
    read_at: DateTime | null;
    archived_at: DateTime | null;
  };
export type PushToken = Updated &
  Scope & {
    user_id: Id;
    token: string;
    platform: 'ios' | 'android' | 'web';
    is_active: boolean;
  };
export type ReportingConfiguration = Updated &
  Scope & {
    site_id: Id | null;
    category_key: string;
    category_label: string;
    is_active: boolean;
    sort_order: number;
  };
export type CustomReportQuestion = Updated &
  Scope & {
    reporting_configuration_id: Id;
    question_key: string;
    label: string;
    answer_type:
      'text' | 'number' | 'boolean' | 'date' | 'single_choice' | 'multi_choice';
    options: Json;
    is_required: boolean;
    is_active: boolean;
    sort_order: number;
  };
export type AuditLog = Base &
  Scope & {
    table_name: string;
    record_id: Id;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    actor_user_id: Id | null;
  };

export type Database = {
  public: {
    Tables: {
      organisations: DbTable<
        Organisation,
        'name' | 'slug',
        'next_report_number'
      >;
      organisation_members: DbTable<
        OrganisationMember,
        'organisation_id' | 'user_id' | 'role'
      >;
      sites: DbTable<Site, 'organisation_id' | 'name' | 'code'>;
      work_areas: DbTable<WorkArea, 'organisation_id' | 'site_id' | 'name'>;
      member_site_access: DbTable<
        MemberSiteAccess,
        'organisation_id' | 'member_id' | 'site_id'
      >;
      reports: DbTable<
        Report,
        'organisation_id' | 'site_id' | 'category' | 'description',
        | 'reporter_user_id'
        | 'report_number'
        | 'reference'
        | 'classification'
        | 'severity'
        | 'status'
      >;
      report_answers: DbTable<
        ReportAnswer,
        'organisation_id' | 'report_id' | 'question_id' | 'answer'
      >;
      report_evidence: DbTable<
        ReportEvidence,
        | 'organisation_id'
        | 'report_id'
        | 'storage_path'
        | 'file_name'
        | 'uploaded_by'
      >;
      report_status_history: DbTable<
        ReportStatusHistory,
        'organisation_id' | 'report_id' | 'to_status'
      >;
      report_internal_notes: DbTable<
        ReportInternalNote,
        'organisation_id' | 'report_id' | 'author_user_id' | 'body'
      >;
      report_updates: DbTable<
        ReportUpdate,
        'organisation_id' | 'report_id' | 'author_user_id' | 'body'
      >;
      report_actions: DbTable<
        ReportAction,
        'organisation_id' | 'report_id' | 'title' | 'created_by'
      >;
      report_resolutions: DbTable<
        ReportResolution,
        'organisation_id' | 'report_id' | 'summary' | 'resolved_by'
      >;
      checklists: DbTable<
        Checklist,
        'organisation_id' | 'title' | 'created_by'
      >;
      checklist_items: DbTable<
        ChecklistItem,
        'organisation_id' | 'checklist_id' | 'prompt' | 'answer_type'
      >;
      checklist_assignments: DbTable<
        ChecklistAssignment,
        'organisation_id' | 'checklist_id' | 'member_id' | 'assigned_by'
      >;
      checklist_submissions: DbTable<
        ChecklistSubmission,
        'organisation_id' | 'assignment_id' | 'submitted_by'
      >;
      checklist_responses: DbTable<
        ChecklistResponse,
        'organisation_id' | 'submission_id' | 'item_id' | 'answer'
      >;
      notifications: DbTable<
        Notification,
        'organisation_id' | 'recipient_user_id' | 'title' | 'body'
      >;
      push_tokens: DbTable<
        PushToken,
        'organisation_id' | 'user_id' | 'token' | 'platform'
      >;
      reporting_configurations: DbTable<
        ReportingConfiguration,
        'organisation_id' | 'category_key' | 'category_label'
      >;
      custom_report_questions: DbTable<
        CustomReportQuestion,
        | 'organisation_id'
        | 'reporting_configuration_id'
        | 'question_key'
        | 'label'
        | 'answer_type'
      >;
      audit_logs: DbTable<
        AuditLog,
        'organisation_id' | 'table_name' | 'record_id' | 'operation'
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      organisation_role: OrganisationRole;
      report_status: ReportStatus;
      report_severity: ReportSeverity;
      hse_classification: HseClassification;
      checklist_status: ChecklistStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
