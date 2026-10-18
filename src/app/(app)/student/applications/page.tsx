'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Shield,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Sparkles,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useStore, useStudentApplications, useStudentEvidence } from '@/lib/store';
import { demoService } from '@/demo/service';
import {
  applicationStatusLabel,
  applicationStatusColor,
  formatDate,
  formatDateTime,
  cn,
} from '@/lib/utils';
import type { ApplicationStatus } from '@/demo/types';

export default function ApplicationsPage() {
  const { state, isHydrated } = useStore();
  const applications = useStudentApplications();

  if (!isHydrated) {
    return <div className="p-8 text-ink-muted text-sm">Loading applications…</div>;
  }

  const sorted = [...applications].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );

  return (
    <div className="page-enter max-w-4xl space-y-6">
      <PageHeader
        title="Application Tracker"
        subtitle={`Track submission stages, evidence snapshots, and status updates across ${applications.length} ${
          applications.length === 1 ? 'application' : 'applications'
        }.`}
      />

      {sorted.length === 0 ? (
        <div className="card text-center py-12 border border-line bg-surface-card rounded-xl shadow-xs">
          <p className="text-ink-muted text-sm mb-4">You have not submitted any applications yet.</p>
          <Link
            href="/student/opportunities"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-2xs"
          >
            <span>Browse opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((app) => (
            <ApplicationCard key={app.id} applicationId={app.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ applicationId }: { applicationId: string }) {
  const { state, dispatch, showToast } = useStore();
  const [expanded, setExpanded] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const app = state.applications.find((a) => a.id === applicationId);
  if (!app) return null;

  const opp = state.opportunities.find((o) => o.id === app.opportunityId);
  const company = opp ? state.companies.find((c) => c.id === opp.companyId) : null;
  const studentEvidence = state.evidence.filter((e) => e.candidateId === state.currentStudentId);

  // Find newly acquired evidence in student's passport that isn't yet attached to this application
  const unsharedEvidence = studentEvidence.filter(
    (e) => !app.sharedEvidenceIds.includes(e.id) && e.visibility !== 'private'
  );

  const statusColor = applicationStatusColor(app.status);

  // Status timeline stages
  const timelineStages: { key: ApplicationStatus; label: string }[] = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'under-review', label: 'Under Review' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'interview', label: 'Interview' },
  ];

  const getStageIndex = (status: ApplicationStatus) => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'under-review':
      case 'follow-up-requested':
        return 1;
      case 'shortlisted':
        return 2;
      case 'interview':
      case 'accepted':
        return 3;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(app.status);

  const handleShareEvidence = async (evidenceId: string) => {
    setIsSharing(true);
    try {
      const { application: updatedApp, state: updatedState } =
        await demoService.shareUpdatedEvidenceToApplication(app.id, [evidenceId]);
      dispatch({ type: 'LOAD_STATE', payload: updatedState });
      setShowShareModal(false);
      showToast(
        'Evidence Attached to Application',
        'Updated dossier with verified Budget Allocation evidence sent to Carthage & Co.',
        'success'
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {company && (
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-sm shrink-0">
              {company.monogram}
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-ink">
              {opp?.title ?? 'Opportunity Application'}
            </h3>
            <p className="text-xs text-ink-muted">
              {company?.name} · {opp?.location} · {opp?.workMode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <span className={`badge badge-${statusColor} text-[11px] font-semibold capitalize`}>
            {applicationStatusLabel(app.status)}
          </span>
        </div>
      </div>

      {/* Visual Status Progress Pipeline */}
      <div className="mt-5 pt-4 border-t border-line/60">
        <div className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-2.5">
          Application Progression Stage
        </div>
        <div className="grid grid-cols-4 gap-2">
          {timelineStages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div key={stage.key} className="space-y-1">
                <div
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    isCurrent
                      ? 'bg-accent'
                      : isCompleted
                      ? 'bg-emerald-500'
                      : 'bg-surface-muted border border-line/60'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] block truncate font-medium',
                    isCurrent
                      ? 'text-accent font-semibold'
                      : isCompleted
                      ? 'text-ink'
                      : 'text-ink-muted/70'
                  )}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Banner for newly acquired unshared evidence (Step 8 of presentation journey) */}
      {unsharedEvidence.length > 0 && (
        <div className="mt-4 p-3.5 rounded-lg border border-accent/30 bg-accent/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-ink">
                New verified skill evidence available in your passport!
              </p>
              <p className="text-[11px] text-ink-muted">
                {unsharedEvidence.map((e) => e.skill).join(', ')} — You can explicitly share this with {company?.name} to strengthen your application.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowShareModal(!showShareModal)}
            className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shrink-0 shadow-2xs"
          >
            Share updated evidence
          </button>
        </div>
      )}

      {/* Share Evidence Inline Modal/Box */}
      {showShareModal && unsharedEvidence.length > 0 && (
        <div className="mt-3 p-4 rounded-lg border border-accent/40 bg-surface-muted/60 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">
              Select verified evidence to add to this application:
            </span>
            <button
              onClick={() => setShowShareModal(false)}
              className="text-[11px] text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-2">
            {unsharedEvidence.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-lg border border-line bg-surface flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink">{ev.skill}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                      Verified
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-muted">{ev.taskOrProject}</span>
                </div>
                <button
                  type="button"
                  disabled={isSharing}
                  onClick={() => handleShareEvidence(ev.id)}
                  className="px-3 py-1.5 rounded-md bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSharing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Attach & Update Dossier</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expand/Collapse Toggle */}
      <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
        <span className="text-[11px] text-ink-muted">
          Submitted on {formatDate(app.submittedAt ?? app.lastUpdated)} · {app.sharedEvidenceIds.length} verified evidence items attached
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-accent font-semibold hover:underline"
        >
          <span>{expanded ? 'Collapse dossier' : 'Inspect dossier & history'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Dossier Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-line space-y-4 text-xs animate-in fade-in">
          {/* Shared Evidence Snapshot */}
          <div>
            <h4 className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Attached Skill Evidence Snapshot ({app.evidenceSnapshot.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {app.evidenceSnapshot.map((snap) => (
                <div
                  key={snap.evidenceId}
                  className="p-3 rounded-lg border border-line/80 bg-surface-muted/40 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink text-xs">{snap.skill}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                      {snap.reviewStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted line-clamp-1">{snap.taskOrProject}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cover Message */}
          {app.coverMessage && (
            <div>
              <h4 className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                Submitted Cover Note
              </h4>
              <p className="p-3 rounded-lg bg-surface-muted/40 border border-line/60 text-ink leading-relaxed">
                {app.coverMessage}
              </p>
            </div>
          )}

          {/* Status Timeline History */}
          <div>
            <h4 className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Auditable Timeline History
            </h4>
            <div className="space-y-2 border-l-2 border-line/80 ml-1.5 pl-3">
              {app.statusHistory.map((entry, idx) => (
                <div key={idx} className="relative text-xs">
                  <div className="w-2 h-2 rounded-full bg-accent absolute -left-[17px] top-1.5" />
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink capitalize">
                      {applicationStatusLabel(entry.status)}
                    </span>
                    <span className="text-[10px] text-ink-muted">
                      {formatDateTime(entry.date)}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-[11px] text-ink-muted mt-0.5">{entry.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
