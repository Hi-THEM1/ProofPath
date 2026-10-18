import type {
  DemoState,
  DemoScenarioName,
  EvidenceRecord,
  ChallengeSubmission,
  Application,
  StatusHistoryEntry,
} from './types';
import {
  seedCompanies,
  seedOpportunities,
  seedCandidates,
  seedEvidence,
  seedChallenges,
  createInitialDemoState,
} from './seed';

// Deterministic simulated review result for the budget challenge
export const deterministicBudgetReview = {
  overallResult: 'demonstrated' as const,
  strength:
    'Clear quantitative rationale for reducing low-yielding display budget and shifting funds to Meta Story placements with proven 10.00 TND CPA.',
  gap:
    'Did not explicitly model diminishing marginal returns or audience saturation if story spend is scaled above 7,500 TND.',
  nextAction:
    'Monitor 7-day conversion velocity after scaling; cap daily budget increases at 15% intervals to protect efficiency.',
  criterionResults: [
    {
      criterion: 'Data interpretation & metric calculations',
      met: true,
      comment: 'Accurately computed channel CPAs and recognized Google Search (12.50 TND) and Story Ads (10.00 TND) as top converters.',
    },
    {
      criterion: 'Budget allocation logic',
      met: true,
      comment: 'Reallocated 15,000 TND total: 6,500 TND to Stories (+44%), 6,000 TND to Search (held), 2,000 TND to LinkedIn, 500 TND to Display.',
    },
    {
      criterion: 'Strategic justification & clarity',
      met: true,
      comment: 'Explanations are concise, structured around acquisition efficiency, and avoid ungrounded assumptions.',
    },
  ],
  reviewDate: new Date().toISOString(),
  isSimulated: true as const,
};

// Deterministic evidence generated from the completed challenge
export const simulatedBudgetEvidence: EvidenceRecord = {
  id: 'ev-ch-budget-1',
  candidateId: 'cand-1',
  skill: 'Budget allocation',
  taskOrProject: 'Campaign Budget Allocation Exercise — Challenge',
  description:
    'Recommended a 15,000 TND quarterly budget redistribution based on historical channel CPA and conversion efficiency. Reallocated 2,000 TND from high-CPA display banners into high-intent story placements while maintaining Google Search stability.',
  source: 'challenge',
  reviewStatus: 'reviewed',
  criterionResults: deterministicBudgetReview.criterionResults,
  reviewerName: 'Simulated Assessment Engine',
  reviewerRole: 'Automated Evaluation Rubric · Demo Review',
  assessmentDate: new Date().toISOString().split('T')[0],
  permittedTools: ['Spreadsheet software', 'Calculator', 'Notes'],
  authorshipFollowUp: 'not-required',
  visibility: 'employers-only',
  sampleWork:
    'Proposed Q4 Allocation:\n- Meta Story Ads: 6,500 TND (Projected 650 leads @ 10.00 TND CPA)\n- Google Search: 6,000 TND (Projected 480 leads @ 12.50 TND CPA)\n- LinkedIn InMail: 2,000 TND (Projected 50 high-value B2B leads)\n- Display Banners: 500 TND (Retargeting only)\nTotal: 15,000 TND | Projected Blended CPA: 12.71 TND (vs 14.49 TND Q3).',
  evaluationDetails:
    'Simulated rubric assessment completed on deterministic student submission. Evaluated across 3 criteria: data interpretation, budget allocation logic, and clarity.',
  isSimulated: true,
};

export function getScenarioState(scenario: DemoScenarioName): DemoState {
  const base = createInitialDemoState();

  switch (scenario) {
    case 'before-application': {
      // Amira has not applied to opp-1. Evidence covers 2 of 3 (ev-1 & ev-2).
      return {
        ...base,
        currentRole: 'student',
        activeScenario: 'before-application',
        applications: base.applications.filter((a) => a.opportunityId !== 'opp-1'),
        challengeSubmissions: [],
      };
    }

    case 'application-submitted': {
      // Amira has applied to opp-1 with ev-1 and ev-2 (2/3 requirements covered)
      const submittedApp: Application = {
        id: 'app-amira-1',
        opportunityId: 'opp-1',
        candidateId: 'cand-1',
        status: 'submitted',
        cvSelected: 'Amira_Ben_Salah_CV_2026.pdf',
        sharedEvidenceIds: ['ev-1', 'ev-2'],
        evidenceSnapshot: [
          {
            evidenceId: 'ev-1',
            skill: 'Campaign performance analysis',
            taskOrProject: 'Olive Oil Export Campaign — Academic Project',
            source: 'academic-project',
            reviewStatus: 'reviewed',
            snapshotDate: new Date().toISOString(),
          },
          {
            evidenceId: 'ev-2',
            skill: 'Reporting and presentation',
            taskOrProject: 'Brand Audit Presentation — Academic Project',
            source: 'academic-project',
            reviewStatus: 'reviewed',
            snapshotDate: new Date().toISOString(),
          },
        ],
        coverMessage:
          'I am excited to apply for the Marketing Intern position at Carthage & Co. My coursework and capstone projects in campaign performance analysis and visual reporting directly align with your client deliverables.',
        submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        lastUpdated: new Date(Date.now() - 3600000 * 4).toISOString(),
        employerNotes: '',
        statusHistory: [
          {
            status: 'submitted',
            date: new Date(Date.now() - 3600000 * 4).toISOString(),
            note: 'Application submitted with 2 verified skill evidence records.',
          },
        ],
      };

      return {
        ...base,
        currentRole: 'student',
        activeScenario: 'application-submitted',
        applications: [submittedApp, ...base.applications],
        challengeSubmissions: [],
      };
    }

    case 'challenge-reviewed': {
      // Amira has applied to opp-1, AND completed ch-1 with simulated review.
      // The new evidence is in her passport, but NOT yet shared to the application.
      const submittedApp: Application = {
        id: 'app-amira-1',
        opportunityId: 'opp-1',
        candidateId: 'cand-1',
        status: 'submitted',
        cvSelected: 'Amira_Ben_Salah_CV_2026.pdf',
        sharedEvidenceIds: ['ev-1', 'ev-2'],
        evidenceSnapshot: [
          {
            evidenceId: 'ev-1',
            skill: 'Campaign performance analysis',
            taskOrProject: 'Olive Oil Export Campaign — Academic Project',
            source: 'academic-project',
            reviewStatus: 'reviewed',
            snapshotDate: new Date(Date.now() - 3600000 * 6).toISOString(),
          },
          {
            evidenceId: 'ev-2',
            skill: 'Reporting and presentation',
            taskOrProject: 'Brand Audit Presentation — Academic Project',
            source: 'academic-project',
            reviewStatus: 'reviewed',
            snapshotDate: new Date(Date.now() - 3600000 * 6).toISOString(),
          },
        ],
        coverMessage:
          'I am excited to apply for the Marketing Intern position at Carthage & Co. My coursework in campaign performance analysis directly aligns with your client deliverables.',
        submittedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        lastUpdated: new Date(Date.now() - 3600000 * 6).toISOString(),
        employerNotes: '',
        statusHistory: [
          {
            status: 'submitted',
            date: new Date(Date.now() - 3600000 * 6).toISOString(),
            note: 'Application submitted with 2 verified skill evidence records.',
          },
        ],
      };

      const challengeSub: ChallengeSubmission = {
        id: 'sub-ch-1',
        challengeId: 'ch-1',
        candidateId: 'cand-1',
        status: 'reviewed',
        draftContent: simulatedBudgetEvidence.sampleWork || '',
        submittedContent: simulatedBudgetEvidence.sampleWork || '',
        followUpAnswer:
          'A sudden drop in CTR combined with rising frequency above 3.5 impressions per user would indicate audience fatigue before CPA spikes.',
        submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        reviewResult: deterministicBudgetReview,
      };

      return {
        ...base,
        currentRole: 'student',
        activeScenario: 'challenge-reviewed',
        evidence: [simulatedBudgetEvidence, ...base.evidence],
        applications: [submittedApp, ...base.applications],
        challengeSubmissions: [challengeSub],
      };
    }

    case 'candidate-shortlisted': {
      // Evidence has been shared to application (covering 3/3!), employer shortlisted Amira.
      const shortlistedApp: Application = {
        id: 'app-amira-1',
        opportunityId: 'opp-1',
        candidateId: 'cand-1',
        status: 'shortlisted',
        cvSelected: 'Amira_Ben_Salah_CV_2026.pdf',
        sharedEvidenceIds: ['ev-1', 'ev-2', 'ev-ch-budget-1'],
        evidenceSnapshot: [
          {
            evidenceId: 'ev-1',
            skill: 'Campaign performance analysis',
            taskOrProject: 'Olive Oil Export Campaign — Academic Project',
            source: 'academic-project',
            reviewStatus: 'reviewed',
            snapshotDate: new Date(Date.now() - 3600000 * 8).toISOString(),
          },
          {
            evidenceId: 'ev-2',
            skill: 'Reporting and presentation',
            taskOrProject: 'Brand Audit Presentation — Academic Project',
            source: 'academic-project',
            reviewStatus: 'reviewed',
            snapshotDate: new Date(Date.now() - 3600000 * 8).toISOString(),
          },
          {
            evidenceId: 'ev-ch-budget-1',
            skill: 'Budget allocation',
            taskOrProject: 'Campaign Budget Allocation Exercise — Challenge',
            source: 'challenge',
            reviewStatus: 'reviewed',
            snapshotDate: new Date(Date.now() - 3600000 * 1).toISOString(),
            isSimulated: true,
          },
        ],
        coverMessage:
          'I am excited to apply for the Marketing Intern position at Carthage & Co. My coursework in campaign performance analysis directly aligns with your client deliverables.',
        submittedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        lastUpdated: new Date(Date.now() - 1800000).toISOString(),
        employerNotes:
          'Candidate supplemented application with verified Budget Allocation evidence from the practical challenge. All 3 essential requirements now validated (3/3). Top candidate for interview round.',
        statusHistory: [
          {
            status: 'submitted',
            date: new Date(Date.now() - 3600000 * 8).toISOString(),
            note: 'Application submitted with 2 verified skill evidence records.',
          },
          {
            status: 'under-review',
            date: new Date(Date.now() - 3600000 * 5).toISOString(),
            note: 'Reviewed by Carthage & Co. hiring manager.',
          },
          {
            status: 'under-review',
            date: new Date(Date.now() - 3600000 * 2).toISOString(),
            note: 'Updated application evidence: Added Budget allocation verification (3/3 requirements covered).',
          },
          {
            status: 'shortlisted',
            date: new Date(Date.now() - 1800000).toISOString(),
            note: 'Candidate shortlisted for interview round.',
          },
        ],
      };

      const challengeSub: ChallengeSubmission = {
        id: 'sub-ch-1',
        challengeId: 'ch-1',
        candidateId: 'cand-1',
        status: 'reviewed',
        draftContent: simulatedBudgetEvidence.sampleWork || '',
        submittedContent: simulatedBudgetEvidence.sampleWork || '',
        followUpAnswer:
          'A sudden drop in CTR combined with rising frequency above 3.5 impressions per user would indicate audience fatigue before CPA spikes.',
        submittedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        reviewResult: deterministicBudgetReview,
      };

      return {
        ...base,
        currentRole: 'employer',
        activeScenario: 'candidate-shortlisted',
        evidence: [simulatedBudgetEvidence, ...base.evidence],
        applications: [shortlistedApp, ...base.applications],
        challengeSubmissions: [challengeSub],
      };
    }
  }
}
