// Utility helpers shared across the application

import type { ApplicationStatus, ReviewStatus, EvidenceSource, WorkMode, OpportunityType } from './types';

export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

export function formatDateTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function applicationStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    'under-review': 'Under review',
    shortlisted: 'Shortlisted',
    interview: 'Interview scheduled',
    'follow-up-requested': 'Follow-up requested',
    accepted: 'Accepted',
    rejected: 'Not selected',
  };
  return labels[status] || status;
}

export function applicationStatusColor(status: ApplicationStatus): string {
  const colors: Record<ApplicationStatus, string> = {
    draft: 'neutral',
    submitted: 'accent',
    'under-review': 'amber',
    shortlisted: 'success',
    interview: 'primary',
    'follow-up-requested': 'amber',
    accepted: 'success',
    rejected: 'error',
  };
  return colors[status] || 'neutral';
}

export function reviewStatusLabel(status: ReviewStatus): string {
  const labels: Record<ReviewStatus, string> = {
    pending: 'Pending review',
    reviewed: 'Reviewed',
    verified: 'Verified',
  };
  return labels[status] || status;
}

export function evidenceSourceLabel(source: EvidenceSource): string {
  const labels: Record<EvidenceSource, string> = {
    'academic-project': 'Academic project',
    challenge: 'Challenge',
    'work-experience': 'Work experience',
    certification: 'Certification',
    portfolio: 'Portfolio',
  };
  return labels[source] || source;
}

export function workModeLabel(mode: WorkMode): string {
  const labels: Record<WorkMode, string> = {
    remote: 'Remote',
    hybrid: 'Hybrid',
    'on-site': 'On-site',
  };
  return labels[mode] || mode;
}

export function opportunityTypeLabel(type: OpportunityType): string {
  return type === 'internship' ? 'Internship' : 'Job';
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
