'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Calendar,
  Send,
  Eye,
  Loader2,
  Sparkles,
  FileText,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useStore } from '@/lib/store';
import { demoService } from '@/demo/service';
import {
  applicationStatusLabel,
  applicationStatusColor,
  formatDate,
  formatDateTime,
  evidenceSourceLabel,
  reviewStatusLabel,
  cn,
} from '@/lib/utils';
import type { ApplicationStatus } from '@/demo/types';

export default function EmployerApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, dispatch, isHydrated, showToast } = useStore();

  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);

  if (!isHydrated) {
    return <div className="p-8 text-ink-muted text-sm">Loading application dossier…</div>;
  }

  const app = state.applications.find((a) => a.id === id);
  if (!app) {
    return (
      <div className="page-enter max-w-3xl">
        <Link href="/employer" className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to dashboard</span>
        </Link>
        <div className="card text-center py-12 border border-line bg-surface-card rounded-xl">
          <p className="text-ink-muted text-sm">Application record not found.</p>
        </div>
      </div>
    );
  }

  const opp = state.opportunities.find((o) => o.id === app.opportunityId);
  const candidate = state.candidates.find((c) => c.id === app.candidateId);
  const company = opp ? state.companies.find((c) => c.id === opp.companyId) : null;

  // Use the immutable evidence snapshot submitted with this application
  const sharedEvidence = app.evidenceSnapshot;

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setIsChangingStatus(true);
    try {
      const { application: updatedApp, state: updatedState } =
        await demoService.updateApplicationStatus(app.id, newStatus);
      dispatch({ type: 'LOAD_STATE', payload: updatedState });
      showToast(
        'Application Status Updated',
        `Moved ${candidate?.name ?? 'candidate'} to "${applicationStatusLabel(newStatus)}".`,
        'success'
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const { application: updatedApp, state: updatedState } =
        await demoService.updateApplicationNotes(app.id, notes || app.employerNotes);
      dispatch({ type: 'LOAD_STATE', payload: updatedState });
      showToast('Internal Notes Saved', 'Private employer notes saved locally.', 'success');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Requirements matching analysis
  const assessedReqs = opp?.requirements.filter((r) => r.isAssessed) ?? [];
  const coveredCount = assessedReqs.filter((req) =>
    sharedEvidence.some((ev) => ev.skill.toLowerCase() === req.skill.toLowerCase())
  ).length;

  return (
    <div className="page-enter max-w-5xl space-y-6">
      <Link
        href="/employer"
        className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to employer dashboard</span>
      </Link>

      <PageHeader
        title={`Candidate Review: ${candidate?.name ?? 'Applicant'}`}
        subtitle={`Reviewing application for ${opp?.title ?? 'Opportunity'} at ${company?.name ?? 'Company'}.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (3/5): Candidate profile & inspectable evidence */}
        <div className="lg:col-span-3 space-y-5">
          {/* Candidate Card */}
          <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold text-base flex items-center justify-center shrink-0">
                  {candidate?.initials ?? 'C'}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink">{candidate?.name}</h2>
                  <p className="text-xs text-ink-muted">
                    {candidate?.university} ({candidate?.graduationYear}) · {candidate?.targetRole}
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-line text-ink-muted font-medium">
                CV: {app.cvSelected}
              </span>
            </div>

            {candidate?.bio && (
              <p className="text-xs text-ink leading-relaxed mt-2">{candidate.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-line/60 text-xs text-ink-muted">
              <span>Location: {candidate?.location}</span>
              <span>·</span>
              <span>Availability: {candidate?.availability}</span>
            </div>
          </div>

          {/* Cover note */}
          {app.coverMessage && (
            <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs">
              <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                Candidate Cover Note
              </h3>
              <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap p-3 rounded-lg bg-surface-muted/40 border border-line/60">
                {app.coverMessage}
              </p>
            </div>
          )}

          {/* Submitted evidence snapshot list */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Submitted Evidence Dossier ({sharedEvidence.length})
              </h3>
              <span className="text-[11px] font-semibold text-accent">
                {coveredCount} of {assessedReqs.length} Assessed Criteria Met
              </span>
            </div>

            {sharedEvidence.length === 0 ? (
              <div className="card p-6 border border-line bg-surface-card rounded-xl text-center text-xs text-ink-muted">
                No verified evidence was attached to this application.
              </div>
            ) : (
              <div className="space-y-3">
                {sharedEvidence.map((snap) => {
                  const fullRecord = state.evidence.find((e) => e.id === snap.evidenceId);
                  const isExpanded = expandedEvidence === snap.evidenceId;

                  return (
                    <div
                      key={snap.evidenceId}
                      className="card p-4 border border-line bg-surface-card rounded-xl shadow-xs transition-all hover:border-line-hover"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-semibold text-ink">{snap.skill}</h4>
                              {snap.isSimulated && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold">
                                  Simulated Review
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-ink-muted mt-0.5">{snap.taskOrProject}</p>
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium capitalize">
                          {snap.reviewStatus}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between text-[11px]">
                        <span className="text-ink-muted">
                          Source: {evidenceSourceLabel(snap.source)} · Attached: {formatDate(snap.snapshotDate)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setExpandedEvidence(isExpanded ? null : snap.evidenceId)}
                          className="text-accent font-semibold hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{isExpanded ? 'Hide inspection' : 'Inspect submitted work'}</span>
                        </button>
                      </div>

                      {/* Detailed inspection drawer */}
                      {isExpanded && fullRecord && (
                        <div className="mt-3 pt-3 border-t border-line space-y-3 text-xs animate-in fade-in">
                          <div>
                            <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                              Task Background
                            </span>
                            <p className="text-ink leading-relaxed">{fullRecord.description}</p>
                          </div>

                          {fullRecord.sampleWork && (
                            <div>
                              <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                                Submitted Work Sample
                              </span>
                              <pre className="p-3 rounded-lg bg-surface-muted text-[11px] text-ink font-mono whitespace-pre-wrap leading-relaxed border border-line">
                                {fullRecord.sampleWork}
                              </pre>
                            </div>
                          )}

                          {fullRecord.criterionResults.length > 0 && (
                            <div>
                              <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                                Rubric Evaluation Breakdown
                              </span>
                              <div className="space-y-1.5">
                                {fullRecord.criterionResults.map((cr, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2 rounded-lg bg-surface border border-line flex items-start gap-2 text-[11px]"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-ink font-semibold">{cr.criterion}: </strong>
                                      <span className="text-ink-muted">{cr.comment}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-line text-[11px] text-ink-muted">
                            Assessed by: <strong>{fullRecord.reviewerName || 'Simulated Rubric'}</strong> ({fullRecord.reviewerRole})
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Requirements Match Overview */}
          {opp && (
            <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs">
              <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
                Requirements Match Breakdown
              </h3>
              <div className="space-y-2">
                {opp.requirements.map((req) => {
                  const hasEvidence = sharedEvidence.some(
                    (ev) => ev.skill.toLowerCase() === req.skill.toLowerCase()
                  );
                  return (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-lg border border-line bg-surface flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2">
                        {hasEvidence ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="text-xs font-semibold text-ink">{req.skill}</span>
                          <p className="text-[11px] text-ink-muted">{req.description}</p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded font-semibold shrink-0',
                          hasEvidence
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                        )}
                      >
                        {hasEvidence ? 'Evidence Verified' : 'Missing Evidence'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (2/5): Review Actions & Status Management */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status Decision Card */}
          <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                Current Pipeline Status
              </span>
              <span
                className={`badge badge-${applicationStatusColor(
                  app.status
                )} text-xs font-bold capitalize px-3 py-1`}
              >
                {applicationStatusLabel(app.status)}
              </span>
            </div>

            <div className="pt-3 border-t border-line space-y-2">
              <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block">
                Advance Candidate Status
              </span>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  disabled={isChangingStatus || app.status === 'shortlisted'}
                  onClick={() => handleStatusChange('shortlisted')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Shortlist Candidate</span>
                </button>

                <button
                  type="button"
                  disabled={isChangingStatus || app.status === 'interview'}
                  onClick={() => handleStatusChange('interview')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface border border-line text-ink font-medium text-xs hover:bg-surface-muted transition-colors disabled:opacity-50"
                >
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  <span>Move to Interview</span>
                </button>

                <button
                  type="button"
                  disabled={isChangingStatus || app.status === 'under-review'}
                  onClick={() => handleStatusChange('under-review')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface border border-line text-ink font-medium text-xs hover:bg-surface-muted transition-colors disabled:opacity-50"
                >
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span>Mark Under Review</span>
                </button>

                <button
                  type="button"
                  disabled={isChangingStatus || app.status === 'follow-up-requested'}
                  onClick={() => handleStatusChange('follow-up-requested')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface border border-line text-ink font-medium text-xs hover:bg-surface-muted transition-colors disabled:opacity-50"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-accent" />
                  <span>Request Follow-up Note</span>
                </button>
              </div>
            </div>
          </div>

          {/* Internal Notes (Confidential to Employer) */}
          <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Internal Hiring Notes
              </h3>
              <span className="text-[10px] text-ink-muted">Private to employer</span>
            </div>
            <textarea
              rows={4}
              value={notes || app.employerNotes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record private evaluation notes, interview questions, or rubric ratings..."
              className="w-full p-3 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden leading-relaxed"
            />
            <button
              type="button"
              disabled={isSavingNotes}
              onClick={handleSaveNotes}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-line text-ink font-medium text-xs hover:bg-surface-muted transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSavingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Save Internal Notes</span>
            </button>
          </div>

          {/* Status Timeline History */}
          <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Auditable Timeline
            </h3>
            <div className="space-y-3 border-l-2 border-line/80 ml-1 pl-3 text-xs">
              {[...app.statusHistory].reverse().map((entry, idx) => (
                <div key={idx} className="relative">
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
      </div>
    </div>
  );
}
