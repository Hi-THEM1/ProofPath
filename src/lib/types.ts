// ─── Core enums & unions ───────────────────────────────────────────

export type OpportunityType = 'internship' | 'job';
export type WorkMode = 'remote' | 'hybrid' | 'on-site';
export type RoleFamily =
  | 'marketing'
  | 'accounting'
  | 'engineering'
  | 'design'
  | 'data'
  | 'operations'
  | 'sales'
  | 'other';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'shortlisted'
  | 'interview'
  | 'follow-up-requested'
  | 'accepted'
  | 'rejected';

export type EvidenceSource =
  | 'academic-project'
  | 'challenge'
  | 'work-experience'
  | 'certification'
  | 'portfolio';

export type ReviewStatus =
  | 'pending'
  | 'reviewed'
  | 'verified';

export type ChallengeStatus =
  | 'not-started'
  | 'in-progress'
  | 'submitted'
  | 'reviewed';

export type VisibilityLevel = 'public' | 'employers-only' | 'private';

// ─── Company ───────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  monogram: string;       // 1–2 letter abbreviation
  industry: string;
  location: string;
  description: string;
  isFictional: true;      // always true for demo
}

// ─── Opportunity ───────────────────────────────────────────────────

export interface SkillRequirement {
  id: string;
  skill: string;
  description: string;
  isEssential: boolean;   // true = essential, false = trainable
  isAssessed: boolean;    // does this have an associated evidence/challenge?
}

export interface Opportunity {
  id: string;
  companyId: string;
  title: string;
  type: OpportunityType;
  roleFamily: RoleFamily;
  description: string;
  location: string;
  workMode: WorkMode;
  isPaid: boolean;
  compensation?: string;       // e.g. "800 TND / month"
  duration?: string;           // e.g. "3 months"
  essentialQualifications: string[];
  requirements: SkillRequirement[];
  acceptedEvidence: string[];  // evidence source types accepted
  requiredChallengeId?: string;
  deadline: string;            // ISO date
  postedDate: string;          // ISO date
  practicalDetails: string;
  isPublished: boolean;
}

// ─── Evidence ──────────────────────────────────────────────────────

export interface CriterionResult {
  criterion: string;
  met: boolean;
  comment: string;
}

export interface EvidenceRecord {
  id: string;
  candidateId: string;
  skill: string;
  taskOrProject: string;
  description: string;
  source: EvidenceSource;
  reviewStatus: ReviewStatus;
  criterionResults: CriterionResult[];
  reviewerName: string;
  reviewerRole: string;
  assessmentDate: string;      // ISO date
  permittedTools: string[];
  authorshipFollowUp: 'not-required' | 'completed' | 'pending';
  visibility: VisibilityLevel;
  sampleWork?: string;         // text / description of submitted work
  evaluationDetails?: string;  // summary of evaluation
}

// ─── Candidate ─────────────────────────────────────────────────────

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  targetRole: string;
  university: string;
  graduationYear: number;
  location: string;
  availability: string;        // e.g. "Available from June 2027"
  bio: string;
  skills: string[];
  visibility: {
    profile: VisibilityLevel;
    evidence: VisibilityLevel;
    contactInfo: VisibilityLevel;
  };
  email?: string;              // only shown if contactInfo is public/employers-only
}

// ─── Application ───────────────────────────────────────────────────

export interface ApplicationEvidenceSnapshot {
  evidenceId: string;
  skill: string;
  taskOrProject: string;
  source: EvidenceSource;
  reviewStatus: ReviewStatus;
  snapshotDate: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  candidateId: string;
  status: ApplicationStatus;
  cvSelected: string;          // filename
  sharedEvidenceIds: string[]; // evidence record IDs explicitly shared
  evidenceSnapshot: ApplicationEvidenceSnapshot[];
  coverMessage: string;
  submittedAt?: string;        // ISO datetime
  lastUpdated: string;         // ISO datetime
  employerNotes: string;
  statusHistory: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  date: string;
  note?: string;
}

// ─── Challenge ─────────────────────────────────────────────────────

export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;              // 0–100
}

export interface Challenge {
  id: string;
  title: string;
  roleFamily: RoleFamily;
  skillsAssessed: string[];
  brief: string;
  estimatedTime: string;       // e.g. "45 minutes"
  permittedTools: string[];
  evaluationCriteria: EvaluationCriterion[];
  sampleDataset: string;       // text description or data
  followUpQuestion: string;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  candidateId: string;
  status: ChallengeStatus;
  draftContent: string;
  submittedContent?: string;
  followUpAnswer?: string;
  submittedAt?: string;
  reviewResult?: ChallengeReviewResult;
}

export interface ChallengeReviewResult {
  strength: string;
  gap: string;
  nextAction: string;
  criterionResults: CriterionResult[];
  overallResult: 'demonstrated' | 'partially-demonstrated' | 'not-demonstrated';
  reviewDate: string;
  isSimulated: true;           // always true for demo
}

// ─── Invitation ────────────────────────────────────────────────────

export interface Invitation {
  id: string;
  employerId: string;
  candidateId: string;
  opportunityId?: string;
  message: string;
  sentAt: string;
  status: 'sent' | 'viewed' | 'accepted' | 'declined';
}

// ─── Saved Opportunities ──────────────────────────────────────────

export interface SavedOpportunity {
  opportunityId: string;
  savedAt: string;
}

// ─── Demo state ────────────────────────────────────────────────────

export interface DemoState {
  companies: Company[];
  opportunities: Opportunity[];
  candidates: Candidate[];
  evidence: EvidenceRecord[];
  applications: Application[];
  challenges: Challenge[];
  challengeSubmissions: ChallengeSubmission[];
  invitations: Invitation[];
  savedOpportunities: SavedOpportunity[];
  currentStudentId: string;
  currentRole: 'student' | 'employer';
}
