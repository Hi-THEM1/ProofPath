'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Circle,
  ChevronRight,
  Send,
  Check,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import {
  useStore,
  useEvidenceForSkills,
  useStudentEvidence,
  useCurrentStudent,
} from '@/lib/store';
import { demoService } from '@/demo/service';
import {
  workModeLabel,
  opportunityTypeLabel,
  formatDate,
  daysUntil,
  evidenceSourceLabel,
  reviewStatusLabel,
  cn,
} from '@/lib/utils';
import type { ApplicationEvidenceSnapshot } from '@/demo/types';

export default function OpportunityDetailPage() {
  const routeParams = useParams();
  const id = typeof routeParams?.id === 'string' ? routeParams.id : Array.isArray(routeParams?.id) ? routeParams.id[0] : '';
  const { state, dispatch, isHydrated, showToast } = useStore();
  const router = useRouter();
  const student = useCurrentStudent();
  const allEvidence = useStudentEvidence();

  const [applicationStep, setApplicationStep] = useState(0); // 0 = not applying
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [coverMessage, setCoverMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const opp = state.opportunities.find((o) => o.id === id);
  const company = opp ? state.companies.find((c) => c.id === opp.companyId) : null;
  const isSaved = state.savedOpportunities.some((s) => s.opportunityId === id);
  const hasApplied = state.applications.some(
    (a) => a.opportunityId === id && a.candidateId === state.currentStudentId
  );

  // Preselect matching evidence when opp or evidence loads
  useEffect(() => {
    if (opp && allEvidence.length > 0 && selectedEvidenceIds.length === 0) {
      const assessedSkills = opp.requirements.filter((r) => r.isAssessed).map((r) => r.skill.toLowerCase());
      const matchingIds = allEvidence
        .filter((e) => assessedSkills.includes(e.skill.toLowerCase()) && e.visibility !== 'private')
        .map((e) => e.id);
      setSelectedEvidenceIds(matchingIds);
    }
  }, [opp, allEvidence]);

  if (!isHydrated) {
    return <div className="p-8 text-ink-muted text-sm">Loading opportunity details…</div>;
  }

  if (!opp) {
    return (
      <div className="page-enter max-w-3xl">
        <Link href="/student/opportunities" className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to opportunities</span>
        </Link>
        <div className="card text-center py-12 border border-line bg-surface-card rounded-xl">
          <p className="text-ink-muted text-sm">Opportunity not found.</p>
        </div>
      </div>
    );
  }

  const assessedSkills = opp.requirements.filter((r) => r.isAssessed).map((r) => r.skill);
  const covered = assessedSkills.filter((skill) =>
    allEvidence.some(
      (e) => e.skill.toLowerCase() === skill.toLowerCase() && e.visibility !== 'private'
    )
  );
  const shareableEvidence = allEvidence.filter((e) => e.visibility !== 'private');

  const toggleSave = async () => {
    setIsSaving(true);
    try {
      const { isSaved: nowSaved, state: updatedState } = await demoService.toggleSaveOpportunity(opp.id);
      dispatch({ type: 'LOAD_STATE', payload: updatedState });
      showToast(
        nowSaved ? 'Opportunity Saved' : 'Removed from Saved',
        nowSaved ? 'Added to your bookmarked opportunities.' : 'Removed from bookmarks.',
        'default'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEvidence = (evId: string) => {
    setSelectedEvidenceIds((prev) =>
      prev.includes(evId) ? prev.filter((i) => i !== evId) : [...prev, evId]
    );
  };

  const handleSubmitApplication = async () => {
    if (!student) return;
    setIsSubmitting(true);
    try {
      const { application, state: updatedState } = await demoService.submitApplication({
        opportunityId: opp.id,
        candidateId: student.id,
        cvSelected: student.cvFilename || `${student.name.replace(/ /g, '_')}_CV.pdf`,
        sharedEvidenceIds: selectedEvidenceIds,
        coverMessage,
      });

      dispatch({ type: 'SUBMIT_APPLICATION', payload: application });
      setSubmitted(true);
      showToast(
        'Application Submitted',
        `Successfully applied to ${opp.title} at ${company?.name}.`,
        'success'
      );
    } catch (err: any) {
      showToast('Submission Notice', err.message || 'Could not submit application.', 'default');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Post-Submission Confirmation Screen ─────────────────────────
  if (submitted) {
    return (
      <div className="page-enter max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600">
          <Check className="w-7 h-7" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-ink">Application Submitted</h2>
        <p className="text-xs text-ink-muted leading-relaxed max-w-md mx-auto">
          Your application for <strong>{opp.title}</strong> at <strong>{company?.name}</strong> has been created with an immutable snapshot of your {selectedEvidenceIds.length} shared evidence item(s).
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/student/applications"
            className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-2xs"
          >
            Track in Applications
          </Link>
          <Link
            href="/student/opportunities"
            className="px-4 py-2 rounded-lg border border-line bg-surface text-ink text-xs font-medium hover:bg-surface-muted transition-colors"
          >
            Browse More Opportunities
          </Link>
        </div>
      </div>
    );
  }

  // ─── Application Wizard Steps (1 to 4) ───────────────────────────
  if (applicationStep > 0 && student) {
    return (
      <div className="page-enter max-w-2xl space-y-6">
        <button
          type="button"
          onClick={() => setApplicationStep((s) => Math.max(0, s - 1))}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{applicationStep === 1 ? 'Cancel & Return to Opportunity' : 'Back to previous step'}</span>
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                  applicationStep >= step
                    ? 'bg-accent text-white'
                    : 'bg-surface-muted text-ink-muted border border-line'
                )}
              >
                {applicationStep > step ? <Check className="w-3.5 h-3.5" /> : step}
              </div>
              {step < 4 && (
                <div
                  className={cn(
                    'w-8 sm:w-14 h-0.5',
                    applicationStep > step ? 'bg-accent' : 'bg-line'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Review Profile & CV */}
        {applicationStep === 1 && (
          <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-ink">Step 1: Confirm Profile & CV</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Verify the candidate details that will be submitted to {company?.name}.
              </p>
            </div>

            <div className="space-y-2.5 p-3.5 rounded-lg bg-surface-muted/50 border border-line/60 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-muted">Candidate</span>
                <span className="font-semibold text-ink">{student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">University</span>
                <span className="font-semibold text-ink">{student.university}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Target Role</span>
                <span className="font-semibold text-ink">{student.targetRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Attached CV</span>
                <span className="font-semibold text-accent">{student.cvFilename || 'Amira_Ben_Salah_CV_2026.pdf'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setApplicationStep(2)}
              className="px-4 py-2 rounded-lg bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <span>Next: Select Skill Evidence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Step 2: Choose Evidence to Share */}
        {applicationStep === 2 && (
          <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-ink">Step 2: Choose Verified Evidence</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Select which verified evidence dossiers to attach. Only chosen evidence will be inspectable by {company?.name}.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-xs text-ink flex items-center justify-between">
              <span>Selected evidence covers:</span>
              <span className="font-bold text-accent">
                {selectedEvidenceIds.length} of {assessedSkills.length} Assessed Criteria
              </span>
            </div>

            <div className="space-y-2">
              {shareableEvidence.map((ev) => {
                const isSelected = selectedEvidenceIds.includes(ev.id);
                const isRelevant = assessedSkills.some((s) => s.toLowerCase() === ev.skill.toLowerCase());
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => toggleEvidence(ev.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3',
                      isSelected
                        ? 'border-accent bg-accent/10 shadow-2xs'
                        : 'border-line bg-surface hover:bg-surface-muted/60'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0',
                        isSelected ? 'bg-accent border-accent text-white' : 'border-line'
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink">{ev.skill}</span>
                        {isRelevant && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent/20 text-accent font-semibold">
                            Opportunity Requirement
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        {ev.taskOrProject} · {evidenceSourceLabel(ev.source)} · {reviewStatusLabel(ev.reviewStatus)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setApplicationStep(3)}
              className="px-4 py-2 rounded-lg bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <span>Next: Add Cover Note</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Step 3: Optional Cover Message */}
        {applicationStep === 3 && (
          <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-ink">Step 3: Cover Note (Optional)</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Share a concise message explaining why your background fits this role at {company?.name}.
              </p>
            </div>

            <textarea
              rows={5}
              value={coverMessage}
              onChange={(e) => setCoverMessage(e.target.value)}
              placeholder="I am excited to apply for this internship. My attached academic evidence demonstrates practical performance analysis and visual reporting..."
              className="w-full p-3.5 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden leading-relaxed"
            />

            <button
              type="button"
              onClick={() => setApplicationStep(4)}
              className="px-4 py-2 rounded-lg bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <span>Review Application Summary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Step 4: Final Review & Submit */}
        {applicationStep === 4 && (
          <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-ink">Step 4: Review & Submit Application</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                This exact dossier will be submitted to {company?.name}.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-muted/50 border border-line/60">
                <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                  Applying to
                </span>
                <span className="font-semibold text-ink">{opp.title} at {company?.name}</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-muted/50 border border-line/60">
                <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                  Attached Verified Evidence ({selectedEvidenceIds.length})
                </span>
                <div className="space-y-1">
                  {selectedEvidenceIds.map((id) => {
                    const ev = allEvidence.find((e) => e.id === id);
                    if (!ev) return null;
                    return (
                      <div key={id} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-ink font-medium">{ev.skill} — {ev.taskOrProject}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {coverMessage && (
                <div className="p-3 rounded-lg bg-surface-muted/50 border border-line/60">
                  <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                    Cover Note
                  </span>
                  <p className="text-ink leading-relaxed whitespace-pre-wrap">{coverMessage}</p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitApplication}
                className="w-full py-2.5 rounded-lg bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting application dossier...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Verified Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Default Opportunity Overview Page ───────────────────────────
  return (
    <div className="page-enter max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/student/opportunities"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to opportunities</span>
        </Link>
        <button
          type="button"
          disabled={isSaving}
          onClick={toggleSave}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-surface text-xs font-medium text-ink hover:bg-surface-muted transition-colors disabled:opacity-50"
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 text-accent" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 text-ink-muted" />
              <span>Save opportunity</span>
            </>
          )}
        </button>
      </div>

      {/* Header Info Card */}
      <div className="card p-6 border border-line bg-surface-card rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {company && (
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold text-base flex items-center justify-center shrink-0">
                {company.monogram}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-ink">{opp.title}</h1>
              <p className="text-xs text-ink-muted mt-0.5">
                {company?.name} · {company?.industry}
              </p>
            </div>
          </div>

          {/* Apply / View Application Action */}
          <div>
            {hasApplied ? (
              <Link
                href="/student/applications"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>View Application in Tracker</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setApplicationStep(1)}
                className="px-4 py-2 rounded-lg bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5 shadow-2xs"
              >
                <span>Apply with Evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-line/60 text-xs text-ink-muted">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            {opp.location} ({workModeLabel(opp.workMode)})
          </span>
          <span>·</span>
          <span>{opportunityTypeLabel(opp.type)}</span>
          {opp.compensation && (
            <>
              <span>·</span>
              <span className="font-medium text-ink">{opp.compensation}</span>
            </>
          )}
          {opp.duration && (
            <>
              <span>·</span>
              <span>{opp.duration}</span>
            </>
          )}
          <span>·</span>
          <span>Deadline: {formatDate(opp.deadline)}</span>
        </div>
      </div>

      {/* Match Coverage Banner (Step 3: Inspect evidence covering 2 of 3 assessed requirements) */}
      <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Your Skill Evidence Coverage
          </h2>
          <span className="text-xs font-bold text-accent">
            {covered.length} of {assessedSkills.length} Assessed Requirements Covered
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden border border-line/60">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${Math.round((covered.length / (assessedSkills.length || 1)) * 100)}%` }}
          />
        </div>

        {/* Opportunity Assessed Requirements List */}
        <div className="mt-4 space-y-2">
          {opp.requirements.map((req) => {
            const isMet = covered.some((c) => c.toLowerCase() === req.skill.toLowerCase());
            return (
              <div
                key={req.id}
                className="p-3 rounded-lg border border-line bg-surface flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  {isMet ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold text-ink">{req.skill}</span>
                    <p className="text-[11px] text-ink-muted mt-0.5">{req.description}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded font-semibold shrink-0',
                    isMet
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                  )}
                >
                  {isMet ? 'Covered by Passport' : 'Missing Verified Evidence'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Challenge prompt to cover missing requirement */}
        {opp.requiredChallengeId && covered.length < assessedSkills.length && (
          <div className="mt-4 p-3.5 rounded-lg border border-accent/30 bg-accent/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-ink">
                  Earn evidence for the missing requirement
                </p>
                <p className="text-[11px] text-ink-muted">
                  Complete the <strong>Campaign Budget Allocation Exercise</strong> to verify your Budget Allocation skill and achieve 100% requirement coverage.
                </p>
              </div>
            </div>
            <Link
              href={`/student/challenges/${opp.requiredChallengeId}`}
              className="px-3.5 py-1.5 rounded-lg bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-colors shrink-0 shadow-2xs"
            >
              Start Challenge
            </Link>
          </div>
        )}
      </div>

      {/* Description & Qualifications */}
      <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Role Description
          </h3>
          <p className="text-xs text-ink leading-relaxed">{opp.description}</p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Essential Qualifications
          </h3>
          <ul className="space-y-1.5 text-xs text-ink">
            {opp.essentialQualifications.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Practical Working Arrangements
          </h3>
          <p className="text-xs text-ink-muted leading-relaxed">{opp.practicalDetails}</p>
        </div>
      </div>
    </div>
  );
}
