import 'expo-sqlite/localStorage/install';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { LocalPhotoEvidence } from '@/reporting/model';
import {
  createInitialSafetyState,
  parseSafetyState,
  type ChecklistAnswerValue,
  type LocalSafetyState,
  type SafetyChecklist,
} from './model';

const storageKey = 'safira.worker.safety.v1';

interface SafetyContextValue {
  checklists: readonly SafetyChecklist[];
  ready: boolean;
  storageError: string | null;
  getChecklist(id: string): SafetyChecklist | null;
  setAnswer(
    checklistId: string,
    itemId: string,
    answer: ChecklistAnswerValue,
  ): void;
  setNote(checklistId: string, itemId: string, note: string): void;
  setPhoto(
    checklistId: string,
    itemId: string,
    photo: LocalPhotoEvidence | null,
  ): void;
  submitChecklist(checklistId: string): boolean;
  linkReportToChecklist(
    checklistId: string,
    itemId: string,
    reportRef: string,
  ): void;
}

const SafetyContext = createContext<SafetyContextValue | null>(null);

export function SafetyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createInitialSafetyState);
  const stateRef = useRef(state);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const unreadableRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const restored = parseSafetyState(saved);
          if (!restored) throw new Error('Invalid saved safety data');
          stateRef.current = restored;
          setState(restored);
        }
      } catch {
        unreadableRef.current = true;
        setStorageError(
          'Saved safety checklist data could not be read and has not been overwritten.',
        );
      } finally {
        setReady(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function persist(next: LocalSafetyState): boolean {
    if (unreadableRef.current) return false;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageError(null);
      return true;
    } catch {
      setStorageError('Safety checklist changes could not be saved locally.');
      return false;
    }
  }

  function getChecklist(id: string): SafetyChecklist | null {
    return stateRef.current.checklists.find((c) => c.id === id) ?? null;
  }

  function updateChecklist(
    checklistId: string,
    updater: (c: SafetyChecklist) => SafetyChecklist,
  ) {
    if (!ready) return;
    const nextChecklists = stateRef.current.checklists.map((c) =>
      c.id === checklistId ? updater(c) : c,
    );
    const next: LocalSafetyState = { checklists: nextChecklists };
    stateRef.current = next;
    setState(next);
    persist(next);
  }

  function setAnswer(
    checklistId: string,
    itemId: string,
    answer: ChecklistAnswerValue,
  ) {
    updateChecklist(checklistId, (c) => {
      const existing = c.responses[itemId] ?? { itemId, answer: null };
      const updatedResponses = {
        ...c.responses,
        [itemId]: { ...existing, answer },
      };
      const anyAnswered = Object.values(updatedResponses).some(
        (r) => r.answer !== null,
      );
      const nextStatus =
        c.status === 'completed'
          ? 'completed'
          : anyAnswered
            ? 'in_progress'
            : 'assigned';
      return {
        ...c,
        status: nextStatus,
        responses: updatedResponses,
      };
    });
  }

  function setNote(checklistId: string, itemId: string, note: string) {
    updateChecklist(checklistId, (c) => {
      const existing = c.responses[itemId] ?? { itemId, answer: null };
      return {
        ...c,
        responses: {
          ...c.responses,
          [itemId]: { ...existing, note },
        },
      };
    });
  }

  function setPhoto(
    checklistId: string,
    itemId: string,
    photo: LocalPhotoEvidence | null,
  ) {
    updateChecklist(checklistId, (c) => {
      const existing = c.responses[itemId] ?? { itemId, answer: null };
      return {
        ...c,
        responses: {
          ...c.responses,
          [itemId]: { ...existing, photo },
        },
      };
    });
  }

  function submitChecklist(checklistId: string): boolean {
    if (!ready) return false;
    let success = false;
    updateChecklist(checklistId, (c) => {
      success = true;
      return {
        ...c,
        status: 'completed',
        submittedAt: new Date().toISOString(),
      };
    });
    return success;
  }

  function linkReportToChecklist(
    checklistId: string,
    itemId: string,
    reportRef: string,
  ) {
    updateChecklist(checklistId, (c) => {
      const existing = c.responses[itemId] ?? { itemId, answer: null };
      return {
        ...c,
        responses: {
          ...c.responses,
          [itemId]: { ...existing, reportedIssueRef: reportRef },
        },
      };
    });
  }

  return (
    <SafetyContext.Provider
      value={{
        checklists: state.checklists,
        ready,
        storageError,
        getChecklist,
        setAnswer,
        setNote,
        setPhoto,
        submitChecklist,
        linkReportToChecklist,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context)
    throw new Error('useSafety must be used inside SafetyProvider.');
  return context;
}
