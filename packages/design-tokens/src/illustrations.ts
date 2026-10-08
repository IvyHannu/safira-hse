/** Asset slots only. No artwork is bundled until an approved asset is supplied. */
export const illustrationSlots = {
  welcome: {
    assetKey: 'worker/welcome',
    aspectRatio: 4 / 3,
    alt: 'Welcome to Safira',
  },
  reportCategory: {
    assetKey: 'worker/report-category',
    aspectRatio: 4 / 3,
    alt: 'Choose what to report',
  },
  hazard: {
    assetKey: 'worker/hazard',
    aspectRatio: 4 / 3,
    alt: 'Workplace hazard',
  },
  nearMiss: {
    assetKey: 'worker/near-miss',
    aspectRatio: 4 / 3,
    alt: 'Near miss at work',
  },
  incident: {
    assetKey: 'worker/incident',
    aspectRatio: 4 / 3,
    alt: 'Workplace incident',
  },
  environmental: {
    assetKey: 'worker/environmental',
    aspectRatio: 4 / 3,
    alt: 'Environmental concern',
  },
  evidence: {
    assetKey: 'worker/evidence',
    aspectRatio: 4 / 3,
    alt: 'Add evidence to a report',
  },
  checklist: {
    assetKey: 'worker/checklist',
    aspectRatio: 4 / 3,
    alt: 'Complete a safety checklist',
  },
  submissionSuccess: {
    assetKey: 'worker/submission-success',
    aspectRatio: 4 / 3,
    alt: 'Report submitted',
  },
  resolutionSuccess: {
    assetKey: 'worker/resolution-success',
    aspectRatio: 4 / 3,
    alt: 'Report resolved',
  },
  empty: {
    assetKey: 'shared/empty',
    aspectRatio: 3 / 2,
    alt: 'No results yet',
  },
  offlineError: {
    assetKey: 'shared/offline-error',
    aspectRatio: 3 / 2,
    alt: 'Connection unavailable',
  },
} as const;

export type IllustrationKey = keyof typeof illustrationSlots;
