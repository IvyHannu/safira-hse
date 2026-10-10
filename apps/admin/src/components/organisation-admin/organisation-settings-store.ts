'use client';

import { useMemo, useSyncExternalStore } from 'react';
import {
  initialOrganisationSettings,
  type OrganisationSettingsData,
} from '@/data/organisation-settings';

const key = 'safira.organisation.settings.v1';
const eventName = 'safira-organisation-settings';
const fallback = JSON.stringify(initialOrganisationSettings);

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(eventName, callback);
  };
}

function snapshot() {
  return window.localStorage.getItem(key) ?? fallback;
}

function parse(value: string): OrganisationSettingsData {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object')
      return initialOrganisationSettings;
    const record = parsed as Record<string, unknown>;
    const result = { ...initialOrganisationSettings };
    for (const field of Object.keys(
      result,
    ) as (keyof OrganisationSettingsData)[]) {
      if (typeof record[field] === typeof result[field]) {
        // Values are checked against the field's primitive type before use.
        Object.assign(result, { [field]: record[field] });
      }
    }
    return result;
  } catch {
    return initialOrganisationSettings;
  }
}

export function useOrganisationSettings() {
  const serialized = useSyncExternalStore(subscribe, snapshot, () => fallback);
  return useMemo(() => parse(serialized), [serialized]);
}

export function saveOrganisationSettings(value: OrganisationSettingsData) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(eventName));
}
