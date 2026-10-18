import type {
  Company,
  Opportunity,
  Candidate,
  EvidenceRecord,
  Application,
  Challenge,
  ChallengeSubmission,
  Invitation,
  DemoNotification,
  DemoState,
} from './types';

// ─── Fictional Companies ───────────────────────────────────────────

export const seedCompanies: Company[] = [
  {
    id: 'co-1',
    name: 'Carthage & Co.',
    monogram: 'CC',
    industry: 'Marketing & Communications',
    location: 'Tunis, Tunisia',
    description:
      'A Tunis-based integrated marketing consultancy working with regional and European brands on brand strategy, digital campaigns, and data-informed media.',
    isFictional: true,
  },
  {
    id: 'co-2',
    name: 'Médina Finance',
    monogram: 'MF',
    industry: 'Financial Services',
    location: 'Sfax, Tunisia',
    description:
      'An accounting and financial advisory firm specialising in SME support, auditing, and tax compliance across the Tunisian market.',
    isFictional: true,
  },
  {
    id: 'co-3',
    name: 'Bardo Digital',
    monogram: 'BD',
    industry: 'Technology & Digital',
    location: 'Tunis, Tunisia',
    description:
      'A digital product studio building web and mobile applications for emerging startups and established organisations.',
    isFictional: true,
  },
  {
    id: 'co-4',
    name: 'Olivia Group',
    monogram: 'OG',
    industry: 'Agriculture & Export',
    location: 'Sousse, Tunisia',
    description:
      'An agricultural export company managing sustainable supply chains from Tunisian farms to Mediterranean retailers.',
    isFictional: true,
  },
];

// ─── Fictional Opportunities ───────────────────────────────────────

export const seedOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    companyId: 'co-1',
    title: 'Marketing Intern — Campaign Analysis',
    type: 'internship',
    roleFamily: 'marketing',
    description:
      'Join our client analytics team to evaluate digital marketing performance data, support multi-channel A/B testing workflows, and contribute to client presentation decks. You will work on real campaigns with regional brands and gain hands-on experience in evidence-backed marketing decision making.',
    location: 'Tunis, Tunisia',
    workMode: 'hybrid',
    isPaid: true,
    compensation: '600 TND / month',
    duration: '3 months',
    essentialQualifications: [
      'Final-year undergraduate or recent graduate in Marketing, Business, or Analytics',
      'Solid working knowledge of spreadsheet software (Google Sheets / Excel)',
      'Working proficiency in written and spoken English and French',
    ],
    requirements: [
      {
        id: 'req-1',
        skill: 'Campaign performance analysis',
        description: 'Ability to interpret campaign metrics (CTR, CPC, conversion rate, ROAS) and identify actionable trends.',
        isEssential: true,
        isAssessed: true,
      },
      {
        id: 'req-2',
        skill: 'Budget allocation',
        description: 'Distribute a quarterly marketing budget across channels based on performance metrics and diminishing returns.',
        isEssential: true,
        isAssessed: true,
      },
      {
        id: 'req-3',
        skill: 'Reporting and presentation',
        description: 'Summarise findings clearly and logically for non-technical brand stakeholders in written and slide form.',
        isEssential: true,
        isAssessed: true,
      },
    ],
    acceptedEvidence: ['academic-project', 'challenge', 'work-experience', 'portfolio'],
    requiredChallengeId: 'ch-1',
    deadline: '2027-02-15',
    postedDate: '2026-10-10',
    practicalDetails:
      'Hybrid schedule: 2 days in our Tunis office, 3 days remote. Laptop and tools stipend provided. Mentorship by senior strategist.',
    isPublished: true,
  },
  {
    id: 'opp-2',
    companyId: 'co-2',
    title: 'Junior Audit Associate',
    type: 'job',
    roleFamily: 'accounting',
    description:
      'Support client audit engagements by verifying financial documentation, conducting analytical procedures, and identifying compliance variances under senior supervision.',
    location: 'Sfax, Tunisia',
    workMode: 'on-site',
    isPaid: true,
    compensation: '1,200 TND / month',
    duration: undefined,
    essentialQualifications: [
      'Degree in Accounting, Auditing, or Finance',
      'Knowledge of Tunisian financial reporting standards and basic tax regulations',
    ],
    requirements: [
      {
        id: 'req-4',
        skill: 'Financial statement preparation',
        description: 'Prepare balance sheets, income statements, and cash flow reports accurately.',
        isEssential: true,
        isAssessed: true,
      },
      {
        id: 'req-5',
        skill: 'Audit documentation',
        description: 'Prepare and organise audit work papers in line with quality benchmarks.',
        isEssential: true,
        isAssessed: false,
      },
    ],
    acceptedEvidence: ['academic-project', 'certification', 'work-experience'],
    deadline: '2027-02-28',
    postedDate: '2026-10-05',
    practicalDetails:
      'Full-time on-site in central Sfax. Initial 6-month evaluation period leading to permanent contract.',
    isPublished: true,
  },
  {
    id: 'opp-3',
    companyId: 'co-3',
    title: 'Frontend Developer Intern',
    type: 'internship',
    roleFamily: 'engineering',
    description:
      'Build and polish responsive user interfaces for modern web applications using React, TypeScript, and Tailwind CSS. You will participate in sprint planning, code reviews, and deliver features directly to staging environments.',
    location: 'Tunis, Tunisia',
    workMode: 'remote',
    isPaid: true,
    compensation: '800 TND / month',
    duration: '4 months',
    essentialQualifications: [
      'Studying or recently graduated in Computer Science, Software Engineering, or related discipline',
      'Strong fundamentals in HTML5, CSS3, modern JavaScript, and component-based UI',
    ],
    requirements: [
      {
        id: 'req-6',
        skill: 'React component development',
        description: 'Design and implement modular, type-safe React components with clean state separation.',
        isEssential: true,
        isAssessed: true,
      },
      {
        id: 'req-7',
        skill: 'TypeScript proficiency',
        description: 'Write robust TypeScript definitions, avoid any-casts, and handle asynchronous data safely.',
        isEssential: true,
        isAssessed: false,
      },
      {
        id: 'req-8',
        skill: 'Responsive design',
        description: 'Deliver pixel-accurate interfaces that adapt gracefully across mobile, tablet, and desktop viewports.',
        isEssential: false,
        isAssessed: false,
      },
    ],
    acceptedEvidence: ['portfolio', 'challenge', 'academic-project'],
    deadline: '2027-01-31',
    postedDate: '2026-10-12',
    practicalDetails:
      'Fully remote with weekly collaborative planning. Home office hardware subsidy provided.',
    isPublished: true,
  },
  {
    id: 'opp-4',
    companyId: 'co-4',
    title: 'Logistics Operations Coordinator',
    type: 'internship',
    roleFamily: 'operations',
    description:
      'Coordinate container shipment logistics, verify customs documentation, and track warehouse inventory turnover for international agricultural exports.',
    location: 'Sousse, Tunisia',
    workMode: 'on-site',
    isPaid: true,
    compensation: '550 TND / month',
    duration: '3 months',
    essentialQualifications: [
      'Degree or ongoing studies in Logistics, Supply Chain, or Industrial Engineering',
      'Intermediate to advanced spreadsheet skills',
    ],
    requirements: [
      {
        id: 'req-9',
        skill: 'Inventory tracking',
        description: 'Maintain accurate inventory databases and reconcile discrepancies.',
        isEssential: true,
        isAssessed: false,
      },
      {
        id: 'req-10',
        skill: 'Logistics coordination',
        description: 'Coordinate freight carrier pickup schedules and export documentation.',
        isEssential: true,
        isAssessed: false,
      },
    ],
    acceptedEvidence: ['academic-project', 'work-experience'],
    deadline: '2027-03-01',
    postedDate: '2026-10-08',
    practicalDetails:
      'On-site at Sousse logistics facility. Daily transportation allowance included.',
    isPublished: true,
  },
  {
    id: 'opp-5',
    companyId: 'co-1',
    title: 'Digital Content & Brand Coordinator',
    type: 'job',
    roleFamily: 'marketing',
    description:
      'Lead social content calendars, coordinate freelance creators, and synthesize brand engagement reports for three consumer food accounts.',
    location: 'Tunis, Tunisia',
    workMode: 'hybrid',
    isPaid: true,
    compensation: '1,100 TND / month',
    duration: undefined,
    essentialQualifications: [
      'Bachelor in Marketing, Communications, or Media Studies',
      'Proven experience producing structured social calendars and performance recaps',
    ],
    requirements: [
      {
        id: 'req-11',
        skill: 'Content planning',
        description: 'Architect multi-week content roadmaps aligned to key promotional moments.',
        isEssential: true,
        isAssessed: true,
      },
      {
        id: 'req-12',
        skill: 'Social media analytics',
        description: 'Measure organic engagement and recommend tactical audience shifts.',
        isEssential: true,
        isAssessed: false,
      },
    ],
    acceptedEvidence: ['portfolio', 'work-experience'],
    deadline: '2027-02-20',
    postedDate: '2026-10-14',
    practicalDetails:
      'Hybrid based in Tunis. Flexible working hours with dedicated creative workshop days.',
    isPublished: true,
  },
];

// ─── Fictional Candidates ──────────────────────────────────────────

export const seedCandidates: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Amira Ben Salah',
    initials: 'AS',
    targetRole: 'Marketing Analyst',
    university: 'University of Tunis — IHEC Carthage',
    graduationYear: 2027,
    location: 'Tunis, Tunisia',
    availability: 'Available from February 2027',
    bio: 'Final-year marketing student at IHEC Carthage with hands-on coursework in digital campaign metrics, customer journey analytics, and visual reporting. Looking to apply structured analytical methods to growth campaigns.',
    skills: [
      'Campaign performance analysis',
      'Reporting and presentation',
      'Content planning',
      'Social media analytics',
    ],
    cvFilename: 'Amira_Ben_Salah_CV_2026.pdf',
    visibility: {
      profile: 'employers-only',
      evidence: 'employers-only',
      contactInfo: 'private',
    },
    email: 'amira.bensalah@sample-edu.tn',
  },
  {
    id: 'cand-2',
    name: 'Youssef Trabelsi',
    initials: 'YT',
    targetRole: 'Junior Accountant',
    university: 'University of Sfax — FSEGS',
    graduationYear: 2026,
    location: 'Sfax, Tunisia',
    availability: 'Immediately available',
    bio: 'Recent accounting graduate with practical coursework in statutory audits, reconciliation, and financial statement review. Completed a 2-month summer internship with an auditing firm.',
    skills: ['Financial statement preparation', 'Audit documentation', 'Tax compliance'],
    cvFilename: 'Youssef_Trabelsi_Resume.pdf',
    visibility: {
      profile: 'public',
      evidence: 'public',
      contactInfo: 'employers-only',
    },
    email: 'youssef.t@sample-edu.tn',
  },
  {
    id: 'cand-3',
    name: 'Nour Gharbi',
    initials: 'NG',
    targetRole: 'Frontend Developer',
    university: 'INSAT — Tunis',
    graduationYear: 2027,
    location: 'Tunis, Tunisia',
    availability: 'Available from March 2027',
    bio: 'Software engineering student with deep interest in web applications, accessible design systems, and TypeScript.',
    skills: ['React component development', 'TypeScript proficiency', 'Responsive design'],
    cvFilename: 'Nour_Gharbi_DevCV.pdf',
    visibility: {
      profile: 'employers-only',
      evidence: 'employers-only',
      contactInfo: 'private',
    },
    email: 'nour.g@sample-edu.tn',
  },
  {
    id: 'cand-4',
    name: 'Salma Khemiri',
    initials: 'SK',
    targetRole: 'UX/UI Designer',
    university: 'ESSTED — Tunis',
    graduationYear: 2027,
    location: 'Tunis, Tunisia',
    availability: 'Available from January 2027',
    bio: 'Design student focused on user research methodologies and wireframing for web and mobile interfaces.',
    skills: ['User research', 'Interface design', 'Prototyping'],
    cvFilename: 'Salma_Khemiri_PortfolioCV.pdf',
    visibility: {
      profile: 'public',
      evidence: 'employers-only',
      contactInfo: 'private',
    },
    email: 'salma.k@sample-edu.tn',
  },
  {
    id: 'cand-5',
    name: 'Karim Jaziri',
    initials: 'KJ',
    targetRole: 'Operations Analyst',
    university: 'University of Sousse — ISITCom',
    graduationYear: 2026,
    location: 'Sousse, Tunisia',
    availability: 'Private mode (not discoverable)',
    bio: 'Industrial engineering graduate exploring logistics operations and warehouse inventory systems.',
    skills: ['Inventory tracking', 'Logistics coordination', 'Data accuracy'],
    cvFilename: 'Karim_Jaziri_CV.pdf',
    visibility: {
      profile: 'private', // explicitly private — excluded from discovery!
      evidence: 'private',
      contactInfo: 'private',
    },
    email: 'karim.j@sample-edu.tn',
  },
  {
    id: 'cand-6',
    name: 'Fatma Mansour',
    initials: 'FM',
    targetRole: 'Marketing Coordinator',
    university: 'University of Tunis — ISG',
    graduationYear: 2026,
    location: 'Tunis, Tunisia',
    availability: 'Immediately available',
    bio: 'Marketing graduate with practical experience managing bilingual social campaigns and tracking community metrics.',
    skills: ['Content planning', 'Social media analytics', 'Campaign performance analysis'],
    cvFilename: 'Fatma_Mansour_Marketing.pdf',
    visibility: {
      profile: 'public',
      evidence: 'public',
      contactInfo: 'employers-only',
    },
    email: 'fatma.m@sample-edu.tn',
  },
];

// ─── Initial Evidence Records (Amira covers 2 of 3 for opp-1) ─────

export const seedEvidence: EvidenceRecord[] = [
  {
    id: 'ev-1',
    candidateId: 'cand-1',
    skill: 'Campaign performance analysis',
    taskOrProject: 'Olive Oil Export Campaign — Academic Project',
    description:
      'Analysed three months of cross-channel digital performance data (Google Search, Meta Ads, Display) for a regional specialty food exporter. Discovered that Instagram Story placements delivered 40% of conversion actions at 52% lower CPA than desktop display banners. Produced an evidence-backed reallocation memo.',
    source: 'academic-project',
    reviewStatus: 'reviewed',
    criterionResults: [
      {
        criterion: 'KPI identification & calculation',
        met: true,
        comment: 'Accurately calculated and compared CTR, CPC, CPA, and conversion rates across all three media channels.',
      },
      {
        criterion: 'Efficiency pattern recognition',
        met: true,
        comment: 'Correctly identified diminishing returns on broad desktop display and highlighted story ad efficiency.',
      },
      {
        criterion: 'Actionable optimisation recommendation',
        met: true,
        comment: 'Recommended a concrete 25% shift into high-intent placements with realistic expected variance.',
      },
    ],
    reviewerName: 'Dr. Leila Hadj',
    reviewerRole: 'Lecturer in Digital Analytics, IHEC Carthage',
    assessmentDate: '2026-05-18',
    permittedTools: ['Google Sheets', 'Google Analytics Demo Account'],
    authorshipFollowUp: 'completed',
    visibility: 'employers-only',
    sampleWork:
      'Executive Summary:\nAcross October–December 2025, the campaign spent 4,800 TND generating 312 leads. Analysis revealed:\n1. Story placements generated leads at 9.20 TND CPA vs 19.40 TND on display.\n2. Conversion rates peaked between 19:00 and 22:00 on weekdays.\nRecommendation: Reallocate 1,200 TND from display to top-performing story ads in Q1.',
    evaluationDetails:
      'Assessed during the Advanced Digital Marketing capstone course. Met all 3 core evaluation rubrics with praise for disciplined quantitative analysis.',
    isSimulated: false,
  },
  {
    id: 'ev-2',
    candidateId: 'cand-1',
    skill: 'Reporting and presentation',
    taskOrProject: 'Brand Audit Presentation — Academic Project',
    description:
      'Designed and delivered a 12-slide stakeholder presentation evaluating brand perception and marketing funnel drop-off for a regional dairy brand. Translated raw survey and Google Trends data into clear visual charts with executive summaries.',
    source: 'academic-project',
    reviewStatus: 'reviewed',
    criterionResults: [
      {
        criterion: 'Clarity of narrative structure',
        met: true,
        comment: 'Structured smoothly from market diagnosis to friction points and final strategic recommendations.',
      },
      {
        criterion: 'Data visualisation & labelling',
        met: true,
        comment: 'Charts had unambiguous axes, distinct legends, and eliminated visual clutter.',
      },
      {
        criterion: 'Audience-appropriate tone',
        met: true,
        comment: 'Avoided excessive academic jargon; framed conclusions in commercial terms suitable for business leadership.',
      },
    ],
    reviewerName: 'Prof. Ahmed Chebbi',
    reviewerRole: 'Chair of Business Communications, IHEC Carthage',
    assessmentDate: '2026-04-02',
    permittedTools: ['Canva', 'Google Slides', 'Excel'],
    authorshipFollowUp: 'not-required',
    visibility: 'employers-only',
    sampleWork:
      'Slide deck highlights:\n- Slide 3: Funnel drop-off waterfall highlighting 48% loss between awareness and evaluation.\n- Slide 7: Competitor positioning matrix mapping 4 regional rivals on price vs perceived quality.\n- Slide 11: Three prioritized initiatives ranked by impact and implementation cost.',
    evaluationDetails:
      'Capstone presentation evaluated before a faculty panel. Awarded highest score in the cohort for visual synthesis and presentation pacing.',
    isSimulated: false,
  },
  {
    id: 'ev-3',
    candidateId: 'cand-1',
    skill: 'Social media analytics',
    taskOrProject: 'Student Organisation Performance Dashboard',
    description:
      'Maintained a weekly Google Sheets tracking model monitoring organic reach, engagement rates, and content format performance across LinkedIn and Instagram for the student business club.',
    source: 'portfolio',
    reviewStatus: 'pending',
    criterionResults: [],
    reviewerName: '',
    reviewerRole: '',
    assessmentDate: '2026-09-15',
    permittedTools: ['Google Sheets', 'Meta Business Suite'],
    authorshipFollowUp: 'not-required',
    visibility: 'private',
    sampleWork:
      'Multi-tab dashboard consolidating weekly follower growth, engagement-per-impression ratios, and video completion rates.',
    evaluationDetails: 'Self-submitted portfolio artifact. Stored in private dossier for personal skill tracking.',
    isSimulated: false,
  },
  {
    id: 'ev-4',
    candidateId: 'cand-1',
    skill: 'Content planning',
    taskOrProject: 'Environmental Non-Profit Social Campaign',
    description:
      'Built a 6-week bilingual (French/Arabic) content roadmap for an eco-awareness NGO. Scheduled 28 social posts, drafted copy variations, and coordinated visual asset production.',
    source: 'work-experience',
    reviewStatus: 'verified',
    criterionResults: [
      {
        criterion: 'Editorial roadmap structure',
        met: true,
        comment: 'Maintained disciplined cadence across educational, community spotlight, and call-to-action themes.',
      },
      {
        criterion: 'Execution feasibility',
        met: true,
        comment: 'Workload distribution was realistic for a small team with no missed publication deadlines.',
      },
    ],
    reviewerName: 'Monia Slimane',
    reviewerRole: 'Program Director, Green Tunisia NGO',
    assessmentDate: '2026-07-20',
    permittedTools: ['Notion', 'Canva'],
    authorshipFollowUp: 'completed',
    visibility: 'employers-only',
    sampleWork:
      'Delivered full Notion calendar with draft captions, visual briefs, and hashtag research covering World Clean Up Day and European Green Week campaigns.',
    evaluationDetails: 'Direct verification confirmed by program director.',
    isSimulated: false,
  },
  // Evidence for other candidates so employer reviews have inspectable work
  {
    id: 'ev-yt-1',
    candidateId: 'cand-2',
    skill: 'Financial statement preparation',
    taskOrProject: 'SME Balance Sheet & P&L Reconstruction',
    description:
      'Reconstructed full trial balance and year-end balance sheet for an agricultural supplier as part of an applied financial accounting practicum.',
    source: 'academic-project',
    reviewStatus: 'reviewed',
    criterionResults: [
      { criterion: 'Accurate reconciliation', met: true, comment: 'Trial balance reconciled with zero variance.' },
      { criterion: 'Compliance with Tunisian GAAP', met: true, comment: 'Depreciation schedules correctly applied.' },
    ],
    reviewerName: 'M. Sami Belkhodja',
    reviewerRole: 'Senior Lecturer in Accounting, FSEGS',
    assessmentDate: '2026-06-10',
    permittedTools: ['Sage', 'Excel'],
    authorshipFollowUp: 'completed',
    visibility: 'public',
  },
  {
    id: 'ev-ng-1',
    candidateId: 'cand-3',
    skill: 'React component development',
    taskOrProject: 'Accessible Design System Component Library',
    description:
      'Authored 14 accessible UI components (Modal, Dropdown, Combobox, Data Table) in TypeScript and React with zero a11y violations.',
    source: 'portfolio',
    reviewStatus: 'reviewed',
    criterionResults: [
      { criterion: 'Strict TypeScript typing', met: true, comment: 'Polymorphic ref typing and no implicit any.' },
      { criterion: 'Keyboard accessibility', met: true, comment: 'Full focus trapping and ARIA attributes in place.' },
    ],
    reviewerName: 'Tarek Rekik',
    reviewerRole: 'Principal Engineer & INSAT Mentor',
    assessmentDate: '2026-08-25',
    permittedTools: ['VS Code', 'Storybook', 'Jest'],
    authorshipFollowUp: 'completed',
    visibility: 'employers-only',
  },
];

// ─── Challenge Definition ──────────────────────────────────────────

export const seedChallenges: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Campaign Budget Allocation Exercise',
    roleFamily: 'marketing',
    skillsAssessed: ['Budget allocation'],
    brief: `You are acting as a junior marketing analyst at Carthage & Co. A regional client ran a Q3 digital acquisition campaign across four channels with a total budget of 15,000 TND.

The client CMO has observed uneven performance and requested a clear proposal to reallocate the 15,000 TND budget for Q4 to maximize total customer acquisitions while keeping blended CPA under 15 TND.

**Your task:**
1. Review the performance dataset below.
2. Calculate key efficiency metrics (CPA, Conversion Rate) for each channel.
3. Propose your revised budget allocation for the 15,000 TND Q4 budget.
4. Provide a 150–250 word justification explaining why you increased or reduced each channel's allocation, noting any diminishing returns or channel limits.`,
    estimatedTime: '30–45 minutes',
    permittedTools: ['Spreadsheet software', 'Calculator', 'Text editor'],
    evaluationCriteria: [
      {
        id: 'ec-1',
        name: 'Data interpretation & metric calculations',
        description: 'Accurately interprets channel figures, calculates acquisition cost (CPA), and identifies conversion efficiencies.',
        weight: 35,
      },
      {
        id: 'ec-2',
        name: 'Budget allocation logic',
        description: 'Allocation directly reflects performance data, respects practical channel saturation, and totals exactly 15,000 TND.',
        weight: 40,
      },
      {
        id: 'ec-3',
        name: 'Strategic justification & clarity',
        description: 'Explanations are clear, concise, and communicate trade-offs effectively to executive stakeholders.',
        weight: 25,
      },
    ],
    sampleDataset: `Channel Performance Report (Last Quarter):
--------------------------------------------------------------------------------------
Channel          Spend (TND)   Impressions   Clicks   Conversions   CPA (TND)   Conv. Rate
--------------------------------------------------------------------------------------
Google Search    6,000 TND     120,000       4,800    480 leads     12.50 TND   10.0%
Meta Story Ads   4,500 TND     300,000       9,000    450 leads     10.00 TND   5.0%
LinkedIn InMail  3,000 TND      35,000       1,200     75 leads     40.00 TND   6.25%
Display Banners  1,500 TND     200,000       1,000     30 leads     50.00 TND   3.0%
--------------------------------------------------------------------------------------
Total:          15,000 TND     655,000      16,000  1,035 leads     14.49 TND (Blended)
--------------------------------------------------------------------------------------`,
    followUpQuestion:
      'If Meta Story Ad ad fatigue sets in after doubling the spend, what leading indicator would alert you first?',
  },
];

// ─── Initial Demo State Generator ──────────────────────────────────

export function createInitialDemoState(): DemoState {
  return {
    companies: seedCompanies,
    opportunities: seedOpportunities,
    candidates: seedCandidates,
    evidence: seedEvidence,
    applications: [
      // Sample existing application for another candidate so employer dashboard is alive
      {
        id: 'app-sample-1',
        opportunityId: 'opp-2',
        candidateId: 'cand-2',
        status: 'under-review',
        cvSelected: 'Youssef_Trabelsi_Resume.pdf',
        sharedEvidenceIds: ['ev-yt-1'],
        evidenceSnapshot: [
          {
            evidenceId: 'ev-yt-1',
            skill: 'Financial statement preparation',
            taskOrProject: 'SME Balance Sheet & P&L Reconstruction',
            source: 'academic-project',
            reviewStatus: 'reviewed',
            snapshotDate: '2026-10-11T10:00:00.000Z',
          },
        ],
        coverMessage:
          'I am eager to contribute to the audit team in Sfax. My practical coursework covered full GAAP reconciliation.',
        submittedAt: '2026-10-11T10:00:00.000Z',
        lastUpdated: '2026-10-12T14:30:00.000Z',
        employerNotes: 'Good university background. Audit evidence is solid. Ready for first round interview.',
        statusHistory: [
          { status: 'submitted', date: '2026-10-11T10:00:00.000Z', note: 'Application submitted' },
          { status: 'under-review', date: '2026-10-12T14:30:00.000Z', note: 'Assigned to senior reviewer' },
        ],
      },
    ],
    challenges: seedChallenges,
    challengeSubmissions: [],
    invitations: [],
    notifications: [
      {
        id: 'notif-1',
        title: 'Welcome to ProofPath Demo',
        message:
          'Explore as Amira Ben Salah (Student) or Carthage & Co. (Employer). Try the full evidence-backed application journey.',
        date: '2026-10-18T05:00:00.000Z',
        read: false,
        targetRole: 'student',
        type: 'update',
      },
    ],
    savedOpportunities: [
      {
        opportunityId: 'opp-1',
        savedAt: '2026-10-16T12:00:00.000Z',
      },
    ],
    currentStudentId: 'cand-1', // Amira Ben Salah
    currentRole: 'student',
    activeScenario: 'before-application',
  };
}
