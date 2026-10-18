// ─── ProofPath Demo Types ──────────────────────────────────────────

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
  monogram: string;
  industry: string;
  location: string;
  description: string;
  isFictional: true;
}

// ─── Opportunity ───────────────────────────────────────────────────

export interface SkillRequirement {
  id: string;
  skill: string;
  description: string;
  isEssential: boolean;
  isAssessed: boolean;
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
  compensation?: string;
  duration?: string;
  essentialQualifications: string[];
  requirements: SkillRequirement[];
  acceptedEvidence: string[];
  requiredChallengeId?: string;
  deadline: string;
  postedDate: string;
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
  assessmentDate: string;
  permittedTools: string[];
  authorshipFollowUp: 'not-required' | 'completed' | 'pending';
  visibility: VisibilityLevel;
  sampleWork?: string;
  evaluationDetails?: string;
  isSimulated?: boolean;
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
  availability: string;
  bio: string;
  skills: string[];
  cvFilename?: string;
  visibility: {
    profile: VisibilityLevel;
    evidence: VisibilityLevel;
    contactInfo: VisibilityLevel;
  };
  email?: string;
}

// ─── Application ───────────────────────────────────────────────────

export interface ApplicationEvidenceSnapshot {
  evidenceId: string;
  skill: string;
  taskOrProject: string;
  source: EvidenceSource;
  reviewStatus: ReviewStatus;
  snapshotDate: string;
  isSimulated?: boolean;
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  date: string;
  note?: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  candidateId: string;
  status: ApplicationStatus;
  cvSelected: string;
  sharedEvidenceIds: string[];
  evidenceSnapshot: ApplicationEvidenceSnapshot[];
  coverMessage: string;
  submittedAt?: string;
  lastUpdated: string;
  employerNotes: string;
  statusHistory: StatusHistoryEntry[];
}

// ─── Challenge ─────────────────────────────────────────────────────

export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface Challenge {
  id: string;
  title: string;
  roleFamily: RoleFamily;
  skillsAssessed: string[];
  brief: string;
  estimatedTime: string;
  permittedTools: string[];
  evaluationCriteria: EvaluationCriterion[];
  sampleDataset: string;
  followUpQuestion: string;
}

export interface ChallengeReviewResult {
  strength: string;
  gap: string;
  nextAction: string;
  criterionResults: CriterionResult[];
  overallResult: 'demonstrated' | 'partially-demonstrated' | 'not-demonstrated';
  reviewDate: string;
  isSimulated: true;
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

// ─── Notification ──────────────────────────────────────────────────

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  targetRole: 'student' | 'employer';
  type: 'invitation' | 'application' | 'review' | 'update';
}

// ─── Saved Opportunities ──────────────────────────────────────────

export interface SavedOpportunity {
  opportunityId: string;
  savedAt: string;
}

// ─── CV Import Demo ────────────────────────────────────────────────

export interface ExtractedCvData {
  filename: string;
  fileSizeText: string;
  extractedName: string;
  extractedTargetRole: string;
  extractedUniversity: string;
  extractedGraduationYear: number;
  extractedBio: string;
  extractedSkills: string[];
  extractedLocation: string;
  notes: string;
}

// ─── Demo Scenarios ────────────────────────────────────────────────

export type DemoScenarioName =
  | 'before-application'
  | 'application-submitted'
  | 'challenge-reviewed'
  | 'candidate-shortlisted';

// ─── Demo State ────────────────────────────────────────────────────

export interface DemoState {
  companies: Company[];
  opportunities: Opportunity[];
  candidates: Candidate[];
  evidence: EvidenceRecord[];
  applications: Application[];
  challenges: Challenge[];
  challengeSubmissions: ChallengeSubmission[];
  invitations: Invitation[];
  notifications: DemoNotification[];
  savedOpportunities: SavedOpportunity[];
  currentStudentId: string;
  currentRole: 'student' | 'employer';
  activeScenario?: DemoScenarioName;
}
