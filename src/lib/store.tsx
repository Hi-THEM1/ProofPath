'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import type {
  DemoState,
  Opportunity,
  Application,
  EvidenceRecord,
  ChallengeSubmission,
  Invitation,
  SavedOpportunity,
  Candidate,
  ApplicationStatus,
  StatusHistoryEntry,
  ApplicationEvidenceSnapshot,
  DemoScenarioName,
} from '@/demo/types';
import { loadStoredState, saveStoredState, clearStoredState } from '@/demo/storage';
import { demoService } from '@/demo/service';
import { createInitialDemoState } from '@/demo/seed';

// ─── Actions ───────────────────────────────────────────────────────

export type Action =
  | { type: 'LOAD_STATE'; payload: DemoState }
  | { type: 'RESET_STATE' }
  | { type: 'SET_ROLE'; payload: 'student' | 'employer' }
  | { type: 'SAVE_OPPORTUNITY'; payload: SavedOpportunity }
  | { type: 'UNSAVE_OPPORTUNITY'; payload: string }
  | { type: 'SUBMIT_APPLICATION'; payload: Application }
  | { type: 'UPDATE_APPLICATION_EVIDENCE'; payload: { id: string; sharedEvidenceIds: string[]; snapshot: ApplicationEvidenceSnapshot[]; note: string } }
  | { type: 'UPDATE_APPLICATION_STATUS'; payload: { id: string; status: ApplicationStatus; note?: string } }
  | { type: 'UPDATE_APPLICATION_NOTES'; payload: { id: string; notes: string } }
  | { type: 'ADD_EVIDENCE'; payload: EvidenceRecord }
  | { type: 'UPDATE_EVIDENCE_VISIBILITY'; payload: { id: string; visibility: EvidenceRecord['visibility'] } }
  | { type: 'SAVE_CHALLENGE_DRAFT'; payload: ChallengeSubmission }
  | { type: 'SUBMIT_CHALLENGE'; payload: ChallengeSubmission }
  | { type: 'REVIEW_CHALLENGE'; payload: { submission: ChallengeSubmission; evidence: EvidenceRecord } }
  | { type: 'ADD_OPPORTUNITY'; payload: Opportunity }
  | { type: 'SEND_INVITATION'; payload: Invitation }
  | { type: 'UPDATE_CANDIDATE'; payload: Candidate }
  | { type: 'UPDATE_CANDIDATE_VISIBILITY'; payload: { candidateId: string; visibility: Candidate['visibility'] } }
  | { type: 'SET_SCENARIO'; payload: DemoScenarioName };

// ─── Reducer ───────────────────────────────────────────────────────

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'RESET_STATE':
      return createInitialDemoState();

    case 'SET_ROLE':
      return { ...state, currentRole: action.payload };

    case 'SET_SCENARIO':
      return { ...state, activeScenario: action.payload };

    case 'SAVE_OPPORTUNITY':
      return {
        ...state,
        savedOpportunities: [...state.savedOpportunities, action.payload],
      };

    case 'UNSAVE_OPPORTUNITY':
      return {
        ...state,
        savedOpportunities: state.savedOpportunities.filter(
          (s) => s.opportunityId !== action.payload
        ),
      };

    case 'SUBMIT_APPLICATION':
      return {
        ...state,
        applications: [action.payload, ...state.applications.filter((a) => a.id !== action.payload.id)],
      };

    case 'UPDATE_APPLICATION_EVIDENCE': {
      const { id, sharedEvidenceIds, snapshot, note } = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        applications: state.applications.map((app) =>
          app.id === id
            ? {
                ...app,
                sharedEvidenceIds,
                evidenceSnapshot: snapshot,
                lastUpdated: now,
                statusHistory: [
                  ...app.statusHistory,
                  { status: app.status, date: now, note },
                ],
              }
            : app
        ),
      };
    }

    case 'UPDATE_APPLICATION_STATUS': {
      const { id, status, note } = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        applications: state.applications.map((app) =>
          app.id === id
            ? {
                ...app,
                status,
                lastUpdated: now,
                statusHistory: [
                  ...app.statusHistory,
                  { status, date: now, note: note || `Status updated to ${status}.` },
                ],
              }
            : app
        ),
      };
    }

    case 'UPDATE_APPLICATION_NOTES':
      return {
        ...state,
        applications: state.applications.map((app) =>
          app.id === action.payload.id
            ? { ...app, employerNotes: action.payload.notes }
            : app
        ),
      };

    case 'ADD_EVIDENCE':
      return {
        ...state,
        evidence: [action.payload, ...state.evidence.filter((e) => e.id !== action.payload.id)],
      };

    case 'UPDATE_EVIDENCE_VISIBILITY':
      return {
        ...state,
        evidence: state.evidence.map((ev) =>
          ev.id === action.payload.id
            ? { ...ev, visibility: action.payload.visibility }
            : ev
        ),
      };

    case 'SAVE_CHALLENGE_DRAFT':
      return {
        ...state,
        challengeSubmissions: state.challengeSubmissions.some((s) => s.id === action.payload.id)
          ? state.challengeSubmissions.map((s) =>
              s.id === action.payload.id ? action.payload : s
            )
          : [...state.challengeSubmissions, action.payload],
      };

    case 'SUBMIT_CHALLENGE':
      return {
        ...state,
        challengeSubmissions: [
          action.payload,
          ...state.challengeSubmissions.filter((s) => s.id !== action.payload.id),
        ],
      };

    case 'REVIEW_CHALLENGE':
      return {
        ...state,
        challengeSubmissions: [
          action.payload.submission,
          ...state.challengeSubmissions.filter((s) => s.id !== action.payload.submission.id),
        ],
        evidence: [
          action.payload.evidence,
          ...state.evidence.filter((e) => e.id !== action.payload.evidence.id),
        ],
      };

    case 'ADD_OPPORTUNITY':
      return {
        ...state,
        opportunities: [action.payload, ...state.opportunities],
      };

    case 'SEND_INVITATION':
      return {
        ...state,
        invitations: [action.payload, ...state.invitations],
      };

    case 'UPDATE_CANDIDATE':
      return {
        ...state,
        candidates: state.candidates.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'UPDATE_CANDIDATE_VISIBILITY':
      return {
        ...state,
        candidates: state.candidates.map((c) =>
          c.id === action.payload.candidateId
            ? { ...c, visibility: action.payload.visibility }
            : c
        ),
      };

    default:
      return state;
  }
}

// ─── Toast System ──────────────────────────────────────────────────

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'info';
}

// ─── Context ───────────────────────────────────────────────────────

interface StoreContextType {
  state: DemoState;
  dispatch: React.Dispatch<Action>;
  isHydrated: boolean;
  toast: ToastMessage | null;
  showToast: (title: string, description?: string, variant?: ToastMessage['variant']) => void;
  loadScenario: (scenario: DemoScenarioName) => Promise<void>;
  resetDemo: () => Promise<void>;
  switchRole: (role: 'student' | 'employer') => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, createInitialDemoState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (title: string, description?: string, variant: ToastMessage['variant'] = 'default') => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      const newToast: ToastMessage = {
        id: `toast-${Date.now()}`,
        title,
        description,
        variant,
      };
      setToast(newToast);
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
      }, 4000);
    },
    []
  );

  // Safe hydration from storage after mount
  useEffect(() => {
    const saved = loadStoredState();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
    setIsHydrated(true);
  }, []);

  // Save to storage on state change after hydration
  useEffect(() => {
    if (isHydrated) {
      saveStoredState(state);
    }
  }, [state, isHydrated]);

  const loadScenario = useCallback(
    async (scenario: DemoScenarioName) => {
      const updated = await demoService.loadScenario(scenario);
      dispatch({ type: 'LOAD_STATE', payload: updated });
      showToast('Demo Scenario Loaded', `Activated: ${scenario.replace(/-/g, ' ')}`, 'info');
    },
    [showToast]
  );

  const resetDemo = useCallback(async () => {
    const fresh = await demoService.resetDemo();
    dispatch({ type: 'LOAD_STATE', payload: fresh });
    showToast('Demo Reset', 'All records returned to initial sample state.', 'info');
  }, [showToast]);

  const switchRole = useCallback(
    async (role: 'student' | 'employer') => {
      const updated = await demoService.switchRole(role);
      dispatch({ type: 'SET_ROLE', payload: role });
      showToast(
        role === 'student' ? 'Switched to Student' : 'Switched to Employer',
        role === 'student' ? 'Viewing as Amira Ben Salah' : 'Viewing as Carthage & Co.',
        'default'
      );
    },
    [showToast]
  );

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        isHydrated,
        toast,
        showToast,
        loadScenario,
        resetDemo,
        switchRole,
      }}
    >
      {children}
      {/* Restrained Toast Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-5 z-50 flex items-start gap-3 rounded-lg border border-line bg-surface-card p-3.5 shadow-lg backdrop-blur-md max-w-sm transition-all animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-ink">{toast.title}</p>
            {toast.description && (
              <p className="text-ink-muted mt-0.5">{toast.description}</p>
            )}
          </div>
        </div>
      )}
    </StoreContext.Provider>
  );
}

// ─── Consumer Hooks ─────────────────────────────────────────────────

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function useCurrentStudent() {
  const { state } = useStore();
  return state.candidates.find((c) => c.id === state.currentStudentId) ?? null;
}

export function useCompany(id: string) {
  const { state } = useStore();
  return state.companies.find((c) => c.id === id) ?? null;
}

export function useStudentApplications() {
  const { state } = useStore();
  return state.applications.filter((a) => a.candidateId === state.currentStudentId);
}

export function useStudentEvidence() {
  const { state } = useStore();
  return state.evidence.filter((e) => e.candidateId === state.currentStudentId);
}

export function useIsSaved(opportunityId: string) {
  const { state } = useStore();
  return state.savedOpportunities.some((s) => s.opportunityId === opportunityId);
}

export function useHasApplied(opportunityId: string) {
  const { state } = useStore();
  return state.applications.some(
    (a) => a.opportunityId === opportunityId && a.candidateId === state.currentStudentId
  );
}

export function useEvidenceForSkills(skills: string[]) {
  const { state } = useStore();
  const studentEvidence = state.evidence.filter(
    (e) => e.candidateId === state.currentStudentId
  );
  const covered = skills.filter((skill) =>
    studentEvidence.some(
      (e) =>
        e.skill.toLowerCase() === skill.toLowerCase() &&
        e.visibility !== 'private'
    )
  );
  return { covered, total: skills.length, evidence: studentEvidence };
}

// ─── Helpers & ID generators ────────────────────────────────────────

export function createApplicationId() {
  return `app-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createEvidenceId() {
  return `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createSubmissionId() {
  return `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createOpportunityId() {
  return `opp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createInvitationId() {
  return `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createEvidenceSnapshot(
  evidence: EvidenceRecord[]
): ApplicationEvidenceSnapshot[] {
  return evidence.map((e) => ({
    evidenceId: e.id,
    skill: e.skill,
    taskOrProject: e.taskOrProject,
    source: e.source,
    reviewStatus: e.reviewStatus,
    snapshotDate: new Date().toISOString().slice(0, 10),
    isSimulated: e.isSimulated,
  }));
}
