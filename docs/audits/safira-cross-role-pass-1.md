# Safira cross-role audit — pass 1

Source references reviewed: the Worker UI Board, HSE Officer UI Board, both HSE Admin boards, and the Organisation Admin UI Board in `docs/references/`. The current approved Safira logo asset is `docs/references/brand/Safira Logo Full.png`.

## Route coverage

Source inspection and production compilation cover:

- Worker: `/`, `/report`, `/report/details`, `/report/evidence`, `/report/questions`, `/report/review`, `/report/confirmation`, `/report/view`, `/reports`, `/reports/[ref]`, `/safety`, `/safety/[id]`, `/profile`, `/profile/[section]`.
- HSE Officer: `/hse-officer/overview`, `/hse-officer/reports`, `/hse-officer/reports/[id]`, `/hse-officer/checklists`, `/hse-officer/checklists/[id]`, `/hse-officer/profile`.
- HSE Admin: `/hse-admin/overview`, `/hse-admin/reports`, `/hse-admin/reports/[id]`, `/hse-admin/checklists`, `/hse-admin/sites`, `/hse-admin/configuration`, `/hse-admin/insights`, `/hse-admin/profile`.
- Organisation Admin: `/organisation-admin/overview`, `/organisation-admin/users`, `/organisation-admin/sites`, `/organisation-admin/organisation`, `/organisation-admin/access`, `/organisation-admin/settings`, `/organisation-admin/profile`.
- Shared entry and routing: `/` and `/workspace` in Admin.

The Worker web export and Admin production build succeeded. Admin and Worker TypeScript checks succeeded. Both app lint runs completed with no errors; Admin has seven pre-existing warnings in HSE Officer Report Detail and shared Select.

## Shared-system findings

- Logo placements use the approved vertical full-logo asset; admin sidebars use the shared lockup and account-menu pattern.
- Brand and semantic colors come from the shared token set. Blue remains appropriate for information; red, green, and amber are semantic states.
- Admin shared Button, form, SearchInput, Select, Card, metadata, status, and sidebar components cover the main repeated patterns. Worker has its own shared counterparts, as required for React Native.
- Report metadata follows type (quiet), severity (strongest), status (secondary). Status labels remain passive.
- The audit corrected HSE Admin site-tab focus from blue to Signal Yellow and Worker header-back focus from a heavy charcoal border to a thin yellow border.
- Shared empty states now reserve a responsive illustration slot. The 12-key asset map covers Worker guidance and success concepts plus shared empty and offline/error concepts. No art was added.

## Visual review still required

The browser tool blocked direct localhost access, so desktop/mobile layout, off-canvas behavior, overflow, focus visibility, and route interactions were **not** visually verified in this pass. Existing local no-results treatments outside the shared EmptyState component do not yet use illustration slots. Map-only keys for welcome, category, evidence, checklist, and success states are deliberately not mounted into approved screens before artwork and visual review. This pass does not claim visual completion.

The worktree contained substantial unrelated uncommitted role UI work before this pass. Only isolated audit and illustration changes should be staged for this checkpoint.
