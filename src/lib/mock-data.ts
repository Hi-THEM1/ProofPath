// Re-export seed data and generator from the unified demo seed module
export * from '@/demo/seed';

import {
  seedCompanies,
  seedOpportunities,
  seedCandidates,
  seedEvidence,
  seedChallenges,
} from '@/demo/seed';

export const companies = seedCompanies;
export const opportunities = seedOpportunities;
export const candidates = seedCandidates;
export const evidence = seedEvidence;
export const challenges = seedChallenges;
