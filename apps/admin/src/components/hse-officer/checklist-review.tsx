'use client';
import { useSyncExternalStore } from 'react';
import { ChecklistBadge } from './ui';
import { type ChecklistStatus } from '@/data/checklists';
const key = 'safira.officer.checklist-reviews.v1';
const event = 'safira-checklist-review';
function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(event, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(event, onChange);
  };
}
function snapshot() {
  try {
    return window.localStorage.getItem(key) || '{}';
  } catch {
    return '{}';
  }
}
export function useChecklistReview() {
  const saved = useSyncExternalStore(subscribe, snapshot, () => '{}');
  let reviews: Record<string, string> = {};
  try {
    const parsed: unknown = JSON.parse(saved);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
      reviews = parsed as Record<string, string>;
  } catch {
    /* Ignore invalid local state. */
  }
  function markReviewed(id: string) {
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify({ ...reviews, [id]: new Date().toISOString() }),
      );
      window.dispatchEvent(new Event(event));
      return true;
    } catch {
      return false;
    }
  }
  return { reviews, markReviewed };
}
export function ChecklistStatusBadge({ status }: { status: ChecklistStatus }) {
  return <ChecklistBadge status={status} />;
}
