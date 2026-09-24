import 'expo-sqlite/localStorage/install';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createDraft,
  createInitialReportingState,
  parseReportingState,
  reviewIssues,
  submittedToDemoReport,
  type DemoReport,
  type LocalReportingState,
  type ReportContent,
  type SavedReportDraft,
  type SubmittedDemoReport,
} from './model';

const storageKey = 'safira.worker.reporting.v1';

interface ReportingContextValue {
  state: LocalReportingState;
  ready: boolean;
  storageError: string | null;
  updateDraft(patch: Partial<ReportContent>): void;
  submit(): SubmittedDemoReport | null;
  getReport(reference: string): DemoReport | null;
  startReportFromChecklist(params: {
    checklistId: string;
    checklistTitle: string;
    itemId: string;
    itemPrompt: string;
    workAreaId: string | null;
    note?: string;
    photo?: import('./model').LocalPhotoEvidence | null;
  }): void;
}

const ReportingContext = createContext<ReportingContextValue | null>(null);

export function ReportingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createInitialReportingState);
  const stateRef = useRef(state);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const unreadableRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const restored = parseReportingState(saved);
          if (!restored) throw new Error('Invalid saved report data');
          stateRef.current = restored;
          setState(restored);
        }
      } catch {
        unreadableRef.current = true;
        setStorageError(
          'Saved report data could not be read and has not been overwritten. New changes will stay in this open session only.',
        );
      } finally {
        setReady(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function persist(next: LocalReportingState): boolean {
    if (unreadableRef.current) return false;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageError(null);
      return true;
    } catch {
      setStorageError(
        'Changes are visible now but could not be saved on this device. Keep the app open and try again.',
      );
      return false;
    }
  }

  function updateDraft(patch: Partial<ReportContent>) {
    if (!ready) return;
    const draft: SavedReportDraft = {
      ...stateRef.current.draft,
      ...patch,
      kind: 'draft',
      updatedAt: new Date().toISOString(),
    };
    const next = { ...stateRef.current, draft };
    stateRef.current = next;
    setState(next);
    persist(next);
  }

  function submit(): SubmittedDemoReport | null {
    if (!ready || unreadableRef.current) return null;
    const current = stateRef.current;
    if (reviewIssues(current.draft).length > 0) return null;
    const content: ReportContent = {
      category: current.draft.category,
      evidenceChoice: current.draft.evidenceChoice,
      evidence: current.draft.evidence,
      description: current.draft.description,
      siteId: current.draft.siteId,
      workAreaId: current.draft.workAreaId,
      answers: { ...current.draft.answers },
      source: current.draft.source ?? { type: 'direct' },
    };
    const submitted: SubmittedDemoReport = {
      kind: 'submitted',
      reference: `SF-${current.nextReferenceNumber}`,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      content,
    };
    const demoReport = submittedToDemoReport(submitted);
    const next: LocalReportingState = {
      draft: createDraft(),
      submitted,
      nextReferenceNumber: current.nextReferenceNumber + 1,
      demoReports: [demoReport, ...current.demoReports],
    };
    if (!persist(next)) return null;
    stateRef.current = next;
    setState(next);
    return submitted;
  }

  function getReport(reference: string): DemoReport | null {
    return (
      stateRef.current.demoReports.find((r) => r.reference === reference) ??
      null
    );
  }

  function startReportFromChecklist(params: {
    checklistId: string;
    checklistTitle: string;
    itemId: string;
    itemPrompt: string;
    workAreaId: string | null;
    note?: string;
    photo?: import('./model').LocalPhotoEvidence | null;
  }) {
    if (!ready) return;
    const notePart = params.note?.trim()
      ? `\n\nNotes from check: ${params.note.trim()}`
      : '';
    const draft: SavedReportDraft = {
      kind: 'draft',
      updatedAt: new Date().toISOString(),
      category: 'unsafe_observation',
      evidenceChoice: params.photo ? 'photo' : 'unanswered',
      evidence: params.photo ?? null,
      description: `Issue found during ${params.checklistTitle}: ${params.itemPrompt}${notePart}`,
      siteId: stateRef.current.draft.siteId,
      workAreaId: params.workAreaId,
      answers: {
        anyoneHurt: 'no',
        anythingDamaged: null,
        environmentalImpact: null,
      },
      source: {
        type: 'checklist_submission',
        checklistId: params.checklistId,
        checklistTitle: params.checklistTitle,
        itemId: params.itemId,
        itemPrompt: params.itemPrompt,
      },
    };
    const next = { ...stateRef.current, draft };
    stateRef.current = next;
    setState(next);
    persist(next);
  }

  return (
    <ReportingContext.Provider
      value={{
        state,
        ready,
        storageError,
        updateDraft,
        submit,
        getReport,
        startReportFromChecklist,
      }}
    >
      {children}
    </ReportingContext.Provider>
  );
}

export function useReporting() {
  const context = useContext(ReportingContext);
  if (!context)
    throw new Error('useReporting must be used inside ReportingProvider.');
  return context;
}
