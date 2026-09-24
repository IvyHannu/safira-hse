# Safira AGENTS.md

## Project

Safira is a working multi-organisation HSE platform.

It has two product surfaces:

- Worker Mobile App
- HSE Admin Portal

Safira is not a Figma-only concept. Build production-oriented functionality incrementally.

The product principle is:

**See it. Report it. Know what happened next.**

---

## Product Roles

### Worker

Workers can:

- report workplace concerns
- add evidence
- view their own reports
- track report progress
- view worker-facing updates
- complete assigned checklists
- report issues discovered during checklists

Workers do not:

- set severity
- perform formal HSE classification
- read internal HSE notes
- resolve reports
- manage organisation configuration

### HSE Officer

HSE Officers can:

- review reports for permitted sites
- confirm classification
- set severity
- update report status
- add internal notes
- publish worker-facing updates
- record actions
- resolve reports
- review checklist submissions

### HSE Admin

HSE Admins can also:

- manage checklists
- manage reporting configuration
- manage HSE-related organisation configuration

### Organisation Admin

Organisation Admins manage:

- organisation details
- users and roles
- sites
- work areas
- organisation-wide configuration

Do not treat all admin roles as equivalent.

---

## Multi-Organisation Architecture

Safira is not built for one company.

Never hard-code Riverside or any sample organisation into production logic.

Operational data must be scoped by organisation where appropriate.

Access control must consider:

- organisation
- role
- site access
- record ownership where relevant

Do not rely on UI hiding for security.

Use Supabase Row Level Security.

---

## Reporting Model

Keep these concepts separate:

### Worker-facing category

Plain-language worker selection.

Examples:

- Something unsafe
- Something almost happened
- Something happened
- Something could harm the environment

### HSE classification

Formal classification:

- hazard
- near_miss
- incident
- environmental_concern

### Severity

Set only by HSE:

- low
- moderate
- high
- critical

Do not ask workers to set severity.

---

## Report Lifecycle

Internal lifecycle:

- submitted
- under_review
- action_required
- resolved
- closed

Worker-facing language may differ when it improves comprehension.

Do not create competing status systems without a product reason.

---

## Internal vs Worker-Facing Content

Internal HSE notes and worker-visible updates must remain separate.

Never expose internal notes to workers.

Do not implement them as one field with a visibility toggle unless explicitly approved.

Preferred separation:

- report_internal_notes
- report_updates

---

## Product UX Principles

Prioritise:

- plain language
- minimal typing
- large touch targets
- strong hierarchy
- clear feedback
- accessibility
- fast reporting
- realistic worksite use
- status transparency
- error recovery

Workers should not need HSE expertise to report something.

If information can reasonably be assessed later by HSE, do not force the worker to provide it.

---

## Emergency Behaviour

Safira is not an emergency-response replacement.

If the interface handles urgent situations, clearly direct users to follow site emergency procedures first.

Do not imply that completing a Safira report is the correct first response to immediate danger.

---

## Design Direction

Safira visual style:

**Neo-Industrial + Humanist Utility**

Core principle:

**Industrial in structure. Human in interaction.**

Worker App:

- more spacious
- more visual
- more guidance
- plain language

Admin Portal:

- denser
- operational
- structured
- data-first

---

## Brand Tokens

Primary:

- Graphite `#242522`
- Soft Black `#171816`
- Safira Saffron `#D8A617`
- Warm Bone `#F4F1E9`
- White `#FFFFFF`

Keep semantic colours separate from brand colour.

Use semantic tokens for:

- success
- warning
- critical
- information

Do not make Saffron automatically mean warning.

---

## Typography

Use Inter unless explicitly changed.

Use the shared design-token package.

Do not introduce new typefaces casually.

---

## Iconography

Use Phosphor Icons unless explicitly changed.

Do not mix icon families.

---

## Illustration

Illustration must support:

- comprehension
- orientation
- guidance
- reassurance

Do not use illustration as decoration.

Avoid:

- cartoon mascots
- glossy 3D
- childish characters
- generic corporate blob people
- unnecessary decorative scenes

Illustrate the situation, not the interface.

---

## Motion

Use functional motion only.

Motion may support:

- selection
- navigation
- progress
- state change
- submission feedback
- drawers/modals
- timelines

Avoid decorative looping animation.

Respect reduced-motion preferences.

---

## Accessibility

Accessibility is part of implementation, not a later audit.

Support:

- sufficient contrast
- large touch targets
- visible focus states
- semantic labels
- keyboard navigation on web
- status beyond colour
- readable type
- reduced motion
- screen-reader-friendly controls

Do not use colour as the only status indicator.

---

## Offline Strategy

The Worker App should remain compatible with an offline-first architecture.

PowerSync will be introduced deliberately, not prematurely.

Do not make architectural choices that block:

- local report drafts
- local checklist completion
- queued writes
- queued evidence uploads
- later synchronisation

Do not add PowerSync unless the current task explicitly asks for it.

---

## Shared Code Rules

Share only what is truly cross-platform:

- design tokens
- TypeScript types
- validation schemas
- configuration

Do not force mobile and web to share UI components.

Worker and Admin UI implementations may differ.

---

## Validation

Use:

- React Hook Form
- Zod

Keep validation schemas centralised where practical.

Avoid duplicating domain validation across apps.

---

## Dependencies

Do not add a library unless:

- the current stack cannot solve the problem cleanly
- the dependency materially improves reliability or maintainability

Do not add libraries because they are fashionable.

Prefer stable releases.

Do not use beta dependencies unless explicitly approved.

---

## Code Quality

Use:

- TypeScript strict mode
- clear component boundaries
- descriptive naming
- small focused modules
- reusable domain logic
- consistent imports

Avoid:

- giant components
- unnecessary abstraction
- premature generalisation
- duplicate validation
- hard-coded organisation data

---

## Naming

Use semantic names.

Good:

- `ReportStatusBadge`
- `WorkerReportCard`
- `reportStatusSchema`

Bad:

- `Card2`
- `YellowButton`
- `FinalComponent`

---

## Database

Use UUIDs internally.

Do not expose raw database IDs where a human-readable reference should be used.

Reports should support human-facing references such as:

`SF-2048`

Every important operational record should clearly belong to its organisation.

Use foreign keys and indexes intentionally.

Preserve operational history.

Prefer archive/inactive states over destructive deletion when historical records depend on the entity.

---

## Security

Never trust client-provided role or organisation information by itself.

Enforce permissions using:

- Supabase Auth
- organisation membership
- site access
- Row Level Security

Do not bypass RLS for convenience.

If elevated server access is required, keep it explicit and minimal.

---

## Seed Data

Demo data must remain clearly isolated from production behaviour.

Do not hard-code seed organisations into app logic.

---

## Implementation Workflow

Work incrementally.

Do not build the entire product in one task.

For each task:

1. inspect existing architecture
2. implement only the requested scope
3. reuse existing tokens/types/schemas
4. run checks
5. fix issues introduced by the task
6. report only meaningful results

Do not redesign unrelated code unless necessary.

---

## Verification

Before completing implementation tasks, run relevant:

- formatting
- lint
- TypeScript checks
- tests
- build/export checks

Do not claim success if checks fail.

State unresolved issues clearly.

---

## Codex Behaviour

Do not invent product requirements.

Do not add features outside the requested scope.

Do not silently change architecture.

Do not replace approved Safira decisions with generic defaults.

If a requirement conflicts with the existing codebase, prefer the established Safira architecture and flag the conflict.

---

## Build Philosophy

Safira should feel like one coherent product system.

The Worker App helps someone communicate a safety concern.

The Admin Portal helps the organisation understand, act, and close the loop.

Every implementation decision should support that system.
