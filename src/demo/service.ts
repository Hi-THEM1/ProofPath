import type {
  DemoState,
  Opportunity,
  Application,
  EvidenceRecord,
  ChallengeSubmission,
  Invitation,
  Candidate,
  ApplicationStatus,
  VisibilityLevel,
  ExtractedCvData,
  DemoScenarioName,
  ApplicationEvidenceSnapshot,
} from './types';
import { loadStoredState, saveStoredState, clearStoredState } from './storage';
import { getScenarioState, deterministicBudgetReview, simulatedBudgetEvidence } from './scenarios';

// Helper to simulate realistic async delays
function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// In-flight operation lock to prevent accidental duplicate submissions
const pendingOperations = new Set<string>();

function acquireLock(operationKey: string): boolean {
  if (pendingOperations.has(operationKey)) {
    return false;
  }
  pendingOperations.add(operationKey);
  return true;
}

function releaseLock(operationKey: string): void {
  pendingOperations.delete(operationKey);
}

export const demoService = {
  // ─── State Management ──────────────────────────────────────────

  async getState(): Promise<DemoState> {
    await delay(50);
    return loadStoredState();
  },

  async resetDemo(): Promise<DemoState> {
    await delay(350);
    const fresh = clearStoredState();
    return fresh;
  },

  async switchRole(role: 'student' | 'employer'): Promise<DemoState> {
    await delay(150);
    const state = loadStoredState();
    const updated = { ...state, currentRole: role };
    saveStoredState(updated);
    return updated;
  },

  async loadScenario(scenario: DemoScenarioName): Promise<DemoState> {
    await delay(400);
    const state = getScenarioState(scenario);
    saveStoredState(state);
    return state;
  },

  // ─── Opportunities & Bookmarks ─────────────────────────────────

  async getOpportunities(): Promise<Opportunity[]> {
    await delay(100);
    const state = loadStoredState();
    return state.opportunities;
  },

  async getOpportunityById(id: string): Promise<Opportunity | undefined> {
    await delay(80);
    const state = loadStoredState();
    return state.opportunities.find((o) => o.id === id);
  },

  async toggleSaveOpportunity(opportunityId: string): Promise<{ isSaved: boolean; state: DemoState }> {
    await delay(250);
    const state = loadStoredState();
    const existing = state.savedOpportunities.find((s) => s.opportunityId === opportunityId);

    let updatedSaved;
    let isSaved = false;
    if (existing) {
      updatedSaved = state.savedOpportunities.filter((s) => s.opportunityId !== opportunityId);
      isSaved = false;
    } else {
      updatedSaved = [...state.savedOpportunities, { opportunityId, savedAt: new Date().toISOString() }];
      isSaved = true;
    }

    const updatedState = { ...state, savedOpportunities: updatedSaved };
    saveStoredState(updatedState);
    return { isSaved, state: updatedState };
  },

  async publishOpportunity(data: Omit<Opportunity, 'id' | 'postedDate' | 'isPublished'>): Promise<{ opportunity: Opportunity; state: DemoState }> {
    const lockKey = `publish-opp-${data.title}`;
    if (!acquireLock(lockKey)) {
      throw new Error('A publication request is already in progress.');
    }

    try {
      await delay(650);
      const state = loadStoredState();
      const newId = `opp-published-${Date.now().toString(36)}`;
      const newOpportunity: Opportunity = {
        ...data,
        id: newId,
        postedDate: new Date().toISOString().split('T')[0],
        isPublished: true,
      };

      const updatedState = {
        ...state,
        opportunities: [newOpportunity, ...state.opportunities],
      };
      saveStoredState(updatedState);
      return { opportunity: newOpportunity, state: updatedState };
    } finally {
      releaseLock(lockKey);
    }
  },

  // ─── Student Applications ──────────────────────────────────────

  async submitApplication(input: {
    opportunityId: string;
    candidateId: string;
    cvSelected: string;
    sharedEvidenceIds: string[];
    coverMessage: string;
  }): Promise<{ application: Application; state: DemoState }> {
    const lockKey = `apply-${input.candidateId}-${input.opportunityId}`;
    if (!acquireLock(lockKey)) {
      throw new Error('This application is already being submitted. Please wait.');
    }

    try {
      await delay(600);
      const state = loadStoredState();

      // Check if already applied
      const existing = state.applications.find(
        (a) => a.opportunityId === input.opportunityId && a.candidateId === input.candidateId
      );
      if (existing) {
        throw new Error('An application for this opportunity has already been submitted.');
      }

      // Freeze immutable snapshot of ONLY the selected evidence
      const selectedRecords = state.evidence.filter((e) => input.sharedEvidenceIds.includes(e.id));
      const snapshot: ApplicationEvidenceSnapshot[] = selectedRecords.map((e) => ({
        evidenceId: e.id,
        skill: e.skill,
        taskOrProject: e.taskOrProject,
        source: e.source,
        reviewStatus: e.reviewStatus,
        snapshotDate: new Date().toISOString(),
        isSimulated: e.isSimulated,
      }));

      const now = new Date().toISOString();
      const newApplication: Application = {
        id: `app-${Date.now().toString(36)}`,
        opportunityId: input.opportunityId,
        candidateId: input.candidateId,
        status: 'submitted',
        cvSelected: input.cvSelected,
        sharedEvidenceIds: input.sharedEvidenceIds,
        evidenceSnapshot: snapshot,
        coverMessage: input.coverMessage,
        submittedAt: now,
        lastUpdated: now,
        employerNotes: '',
        statusHistory: [
          {
            status: 'submitted',
            date: now,
            note: `Application submitted with ${snapshot.length} verified skill evidence item(s).`,
          },
        ],
      };

      const updatedState = {
        ...state,
        applications: [newApplication, ...state.applications],
      };
      saveStoredState(updatedState);
      return { application: newApplication, state: updatedState };
    } finally {
      releaseLock(lockKey);
    }
  },

  // Explicit step 8 action: Student shares newly acquired evidence with existing application
  async shareUpdatedEvidenceToApplication(
    applicationId: string,
    additionalEvidenceIds: string[]
  ): Promise<{ application: Application; state: DemoState }> {
    const lockKey = `update-evidence-${applicationId}`;
    if (!acquireLock(lockKey)) {
      throw new Error('Evidence update is already processing.');
    }

    try {
      await delay(500);
      const state = loadStoredState();
      const app = state.applications.find((a) => a.id === applicationId);
      if (!app) {
        throw new Error('Application not found.');
      }

      // Find new records that aren't already shared
      const newRecords = state.evidence.filter(
        (e) => additionalEvidenceIds.includes(e.id) && !app.sharedEvidenceIds.includes(e.id)
      );

      if (newRecords.length === 0) {
        return { application: app, state };
      }

      const newSnapshots: ApplicationEvidenceSnapshot[] = newRecords.map((e) => ({
        evidenceId: e.id,
        skill: e.skill,
        taskOrProject: e.taskOrProject,
        source: e.source,
        reviewStatus: e.reviewStatus,
        snapshotDate: new Date().toISOString(),
        isSimulated: e.isSimulated,
      }));

      const combinedEvidenceIds = Array.from(new Set([...app.sharedEvidenceIds, ...additionalEvidenceIds]));
      const combinedSnapshot = [...app.evidenceSnapshot, ...newSnapshots];
      const now = new Date().toISOString();

      const skillsAdded = newRecords.map((r) => r.skill).join(', ');
      const updateNote = `Shared updated evidence: Added ${skillsAdded} verification (${combinedSnapshot.length} total evidence items).`;

      const updatedApp: Application = {
        ...app,
        sharedEvidenceIds: combinedEvidenceIds,
        evidenceSnapshot: combinedSnapshot,
        lastUpdated: now,
        statusHistory: [
          ...app.statusHistory,
          {
            status: app.status,
            date: now,
            note: updateNote,
          },
        ],
      };

      const updatedState = {
        ...state,
        applications: state.applications.map((a) => (a.id === applicationId ? updatedApp : a)),
      };
      saveStoredState(updatedState);
      return { application: updatedApp, state: updatedState };
    } finally {
      releaseLock(lockKey);
    }
  },

  // ─── Employer Application Review ───────────────────────────────

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    note?: string
  ): Promise<{ application: Application; state: DemoState }> {
    await delay(450);
    const state = loadStoredState();
    const app = state.applications.find((a) => a.id === applicationId);
    if (!app) {
      throw new Error('Application not found.');
    }

    const now = new Date().toISOString();
    const historyEntry = {
      status,
      date: now,
      note: note || `Status updated to ${status}.`,
    };

    const updatedApp: Application = {
      ...app,
      status,
      lastUpdated: now,
      statusHistory: [...app.statusHistory, historyEntry],
    };

    const updatedState = {
      ...state,
      applications: state.applications.map((a) => (a.id === applicationId ? updatedApp : a)),
    };
    saveStoredState(updatedState);
    return { application: updatedApp, state: updatedState };
  },

  async updateApplicationNotes(
    applicationId: string,
    employerNotes: string
  ): Promise<{ application: Application; state: DemoState }> {
    await delay(300);
    const state = loadStoredState();
    const app = state.applications.find((a) => a.id === applicationId);
    if (!app) {
      throw new Error('Application not found.');
    }

    const updatedApp: Application = {
      ...app,
      employerNotes,
    };

    const updatedState = {
      ...state,
      applications: state.applications.map((a) => (a.id === applicationId ? updatedApp : a)),
    };
    saveStoredState(updatedState);
    return { application: updatedApp, state: updatedState };
  },

  // ─── Challenge Flow & Simulated Review ─────────────────────────

  async saveChallengeDraft(
    challengeId: string,
    candidateId: string,
    draftContent: string
  ): Promise<DemoState> {
    await delay(250);
    const state = loadStoredState();
    const existing = state.challengeSubmissions.find(
      (s) => s.challengeId === challengeId && s.candidateId === candidateId
    );

    let updatedSubmissions: ChallengeSubmission[];
    if (existing) {
      updatedSubmissions = state.challengeSubmissions.map((s) =>
        s.id === existing.id ? { ...s, draftContent } : s
      );
    } else {
      updatedSubmissions = [
        ...state.challengeSubmissions,
        {
          id: `sub-${Date.now().toString(36)}`,
          challengeId,
          candidateId,
          status: 'in-progress',
          draftContent,
        },
      ];
    }

    const updatedState = { ...state, challengeSubmissions: updatedSubmissions };
    saveStoredState(updatedState);
    return updatedState;
  },

  async submitChallenge(
    challengeId: string,
    candidateId: string,
    submittedContent: string,
    followUpAnswer?: string
  ): Promise<{ submission: ChallengeSubmission; state: DemoState }> {
    const lockKey = `submit-ch-${challengeId}-${candidateId}`;
    if (!acquireLock(lockKey)) {
      throw new Error('Submission is already being processed.');
    }

    try {
      await delay(600);
      const state = loadStoredState();
      const existing = state.challengeSubmissions.find(
        (s) => s.challengeId === challengeId && s.candidateId === candidateId
      );

      const now = new Date().toISOString();
      const updatedSubmission: ChallengeSubmission = {
        id: existing?.id || `sub-${Date.now().toString(36)}`,
        challengeId,
        candidateId,
        status: 'submitted',
        draftContent: submittedContent,
        submittedContent,
        followUpAnswer,
        submittedAt: now,
      };

      const otherSubmissions = state.challengeSubmissions.filter((s) => s.id !== updatedSubmission.id);
      const updatedState = {
        ...state,
        challengeSubmissions: [updatedSubmission, ...otherSubmissions],
      };
      saveStoredState(updatedState);
      return { submission: updatedSubmission, state: updatedState };
    } finally {
      releaseLock(lockKey);
    }
  },

  // Clearly labelled "Run demo review" producing deterministic results
  async runSimulatedChallengeReview(
    challengeId: string,
    candidateId: string
  ): Promise<{ submission: ChallengeSubmission; evidence: EvidenceRecord; state: DemoState }> {
    await delay(750);
    const state = loadStoredState();
    const sub = state.challengeSubmissions.find(
      (s) => s.challengeId === challengeId && s.candidateId === candidateId
    );

    const submissionContent = sub?.submittedContent || sub?.draftContent || simulatedBudgetEvidence.sampleWork || '';

    const reviewResult = {
      ...deterministicBudgetReview,
      reviewDate: new Date().toISOString(),
    };

    const updatedSubmission: ChallengeSubmission = {
      id: sub?.id || `sub-${Date.now().toString(36)}`,
      challengeId,
      candidateId,
      status: 'reviewed',
      draftContent: submissionContent,
      submittedContent: submissionContent,
      submittedAt: sub?.submittedAt || new Date().toISOString(),
      reviewResult,
    };

    // Add or update the verified evidence record in the student's passport
    const newEvidence: EvidenceRecord = {
      ...simulatedBudgetEvidence,
      candidateId,
      sampleWork: submissionContent,
      assessmentDate: new Date().toISOString().split('T')[0],
      criterionResults: reviewResult.criterionResults,
    };

    const existingEvidence = state.evidence.filter((e) => e.id !== newEvidence.id);
    const otherSubmissions = state.challengeSubmissions.filter((s) => s.id !== updatedSubmission.id);

    const updatedState = {
      ...state,
      evidence: [newEvidence, ...existingEvidence],
      challengeSubmissions: [updatedSubmission, ...otherSubmissions],
    };

    saveStoredState(updatedState);
    return { submission: updatedSubmission, evidence: newEvidence, state: updatedState };
  },

  // ─── Skill Passport & Evidence Visibility ──────────────────────

  async updateEvidenceVisibility(
    evidenceId: string,
    visibility: VisibilityLevel
  ): Promise<{ evidence: EvidenceRecord; state: DemoState }> {
    await delay(250);
    const state = loadStoredState();
    const item = state.evidence.find((e) => e.id === evidenceId);
    if (!item) {
      throw new Error('Evidence record not found.');
    }

    const updatedItem = { ...item, visibility };
    const updatedState = {
      ...state,
      evidence: state.evidence.map((e) => (e.id === evidenceId ? updatedItem : e)),
    };
    saveStoredState(updatedState);
    return { evidence: updatedItem, state: updatedState };
  },

  // ─── CV Import Simulation ──────────────────────────────────────

  async simulateCvImport(file: { name: string; size: number }): Promise<ExtractedCvData> {
    await delay(800);
    const sizeKb = Math.round(file.size / 1024) || 240;
    return {
      filename: file.name,
      fileSizeText: `${sizeKb} KB`,
      extractedName: 'Amira Ben Salah',
      extractedTargetRole: 'Marketing Analyst / Intern',
      extractedUniversity: 'University of Tunis — IHEC Carthage',
      extractedGraduationYear: 2027,
      extractedLocation: 'Tunis, Tunisia',
      extractedBio:
        'Final-year marketing student at IHEC Carthage with hands-on coursework in digital campaign metrics, customer journey analytics, and visual reporting. Looking to apply structured analytical methods to growth campaigns.',
      extractedSkills: [
        'Campaign performance analysis',
        'Reporting and presentation',
        'Content planning',
        'Social media analytics',
        'Budget allocation',
      ],
      notes:
        'Demo extraction preview: Extracted from sample document structure. Large files are not stored in browser memory.',
    };
  },

  async confirmImportedCv(
    candidateId: string,
    data: ExtractedCvData
  ): Promise<{ candidate: Candidate; state: DemoState }> {
    await delay(450);
    const state = loadStoredState();
    const cand = state.candidates.find((c) => c.id === candidateId);
    if (!cand) {
      throw new Error('Candidate not found.');
    }

    const updatedCandidate: Candidate = {
      ...cand,
      name: data.extractedName,
      targetRole: data.extractedTargetRole,
      university: data.extractedUniversity,
      graduationYear: data.extractedGraduationYear,
      location: data.extractedLocation,
      bio: data.extractedBio,
      skills: data.extractedSkills,
      cvFilename: data.filename,
    };

    const updatedState = {
      ...state,
      candidates: state.candidates.map((c) => (c.id === candidateId ? updatedCandidate : c)),
    };
    saveStoredState(updatedState);
    return { candidate: updatedCandidate, state: updatedState };
  },

  // ─── Privacy & Discovery ───────────────────────────────────────

  async updateCandidateVisibility(
    candidateId: string,
    visibility: Candidate['visibility']
  ): Promise<{ candidate: Candidate; state: DemoState }> {
    await delay(300);
    const state = loadStoredState();
    const cand = state.candidates.find((c) => c.id === candidateId);
    if (!cand) {
      throw new Error('Candidate not found.');
    }

    const updatedCandidate = { ...cand, visibility };
    const updatedState = {
      ...state,
      candidates: state.candidates.map((c) => (c.id === candidateId ? updatedCandidate : c)),
    };
    saveStoredState(updatedState);
    return { candidate: updatedCandidate, state: updatedState };
  },

  // ─── Employer Invitations ──────────────────────────────────────

  async createInvitation(
    candidateId: string,
    employerId: string,
    opportunityId?: string,
    message?: string
  ): Promise<{ invitation: Invitation; state: DemoState }> {
    await delay(500);
    const state = loadStoredState();
    const cand = state.candidates.find((c) => c.id === candidateId);
    if (!cand) {
      throw new Error('Candidate not found.');
    }

    // Check visibility
    if (cand.visibility.profile === 'private') {
      throw new Error('This candidate has set their profile to private and cannot be invited.');
    }

    const now = new Date().toISOString();
    const newInvitation: Invitation = {
      id: `inv-${Date.now().toString(36)}`,
      employerId,
      candidateId,
      opportunityId,
      message: message || `Carthage & Co. would like to invite you to review our open Marketing Intern role.`,
      sentAt: now,
      status: 'sent',
    };

    const newNotification = {
      id: `notif-${Date.now().toString(36)}`,
      title: 'New Opportunity Invitation',
      message: `Carthage & Co. reviewed your skill passport and invited you to apply.`,
      date: now,
      read: false,
      targetRole: 'student' as const,
      type: 'invitation' as const,
    };

    const updatedState = {
      ...state,
      invitations: [newInvitation, ...state.invitations],
      notifications: [newNotification, ...state.notifications],
    };
    saveStoredState(updatedState);
    return { invitation: newInvitation, state: updatedState };
  },
};
