'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Save,
  Send,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  Target,
  Wrench,
  Loader2,
  Sparkles,
  FileText,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useStore } from '@/lib/store';
import { demoService } from '@/demo/service';
import { simulatedBudgetEvidence } from '@/demo/scenarios';
import { formatDate, cn } from '@/lib/utils';
import type { ChallengeSubmission, ChallengeReviewResult, EvidenceRecord } from '@/demo/types';

export default function ChallengeWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, dispatch, isHydrated, showToast } = useStore();

  const challenge = state.challenges.find((c) => c.id === id);
  const existingSubmission = state.challengeSubmissions.find(
    (s) => s.challengeId === id && s.candidateId === state.currentStudentId
  );

  const [draftContent, setDraftContent] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    if (existingSubmission) {
      setDraftContent(existingSubmission.submittedContent || existingSubmission.draftContent || '');
      setFollowUpAnswer(existingSubmission.followUpAnswer || '');
    }
  }, [existingSubmission]);

  if (!isHydrated) {
    return <div className="p-8 text-ink-muted text-sm">Loading challenge workspace…</div>;
  }

  if (!challenge) {
    return (
      <div className="page-enter max-w-3xl">
        <Link href="/student" className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </Link>
        <div className="card text-center py-12 border border-line bg-surface-card rounded-xl">
          <p className="text-ink-muted text-sm">Challenge not found.</p>
        </div>
      </div>
    );
  }

  const isSubmitted = existingSubmission?.status === 'submitted' || existingSubmission?.status === 'reviewed';
  const isReviewed = existingSubmission?.status === 'reviewed';

  const handleFillSample = () => {
    setDraftContent(
      `Proposed Q4 Budget Allocation (Total: 15,000 TND):

1. Meta Story Ads: 6,500 TND (+44%)
- Target: 650 conversions @ 10.00 TND CPA.
- Rationale: High efficiency placement with lowest historical CPA in Q3. Cap daily increments to prevent saturation.

2. Google Search: 6,000 TND (Held steady)
- Target: 480 high-intent leads @ 12.50 TND CPA.
- Rationale: Core capture channel with strong 10% conversion rate. Maintains stable baseline.

3. LinkedIn InMail: 2,000 TND (-33%)
- Target: 50 qualified B2B leads @ 40.00 TND CPA.
- Rationale: High acquisition cost, but valuable lead quality. Retain focused on decision-makers.

4. Display Banners: 500 TND (-67%)
- Target: Retargeting warm visitors only.
- Rationale: Broad display suffered from 50.00 TND CPA. Slashing budget saves 1,000 TND for higher-performing placements.

Projected Blended CPA: 12.71 TND (down from 14.49 TND). Total projected conversions: 1,180 (+14%).`
    );
    setFollowUpAnswer(
      'A drop in click-through rate alongside ad frequency exceeding 3.5 impressions would signal ad fatigue before CPA spikes.'
    );
    showToast('Sample Proposal Inserted', 'Deterministic challenge response ready for submission.', 'info');
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const updatedState = await demoService.saveChallengeDraft(
        challenge.id,
        state.currentStudentId,
        draftContent
      );
      dispatch({ type: 'LOAD_STATE', payload: updatedState });
      showToast('Draft Saved', 'Your work is saved locally in browser storage.', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!draftContent.trim()) {
      showToast('Content Required', 'Please enter your budget proposal before submitting.', 'default');
      return;
    }
    setIsSubmitting(true);
    try {
      const { submission, state: updatedState } = await demoService.submitChallenge(
        challenge.id,
        state.currentStudentId,
        draftContent,
        followUpAnswer
      );
      dispatch({ type: 'SUBMIT_CHALLENGE', payload: submission });
      showToast('Challenge Submitted', 'Ready for simulated review.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunSimulatedReview = async () => {
    setIsReviewing(true);
    try {
      const { submission, evidence, state: updatedState } = await demoService.runSimulatedChallengeReview(
        challenge.id,
        state.currentStudentId
      );
      dispatch({ type: 'REVIEW_CHALLENGE', payload: { submission, evidence } });
      showToast('Simulated Review Complete', 'Verified evidence record added to your Skill Passport.', 'success');
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="page-enter max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/student"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to student dashboard</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent font-medium">
            Practical Skill Challenge
          </span>
          <span className="text-[10px] text-ink-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {challenge.estimatedTime}
          </span>
        </div>
      </div>

      <PageHeader
        title={challenge.title}
        subtitle="Demonstrate budget allocation and data-driven marketing strategy under simulated client conditions."
      />

      {/* Brief & Dataset Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Brief Card */}
          <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs">
            <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              <span>Challenge Scenario Brief</span>
            </h2>
            <div className="text-xs text-ink space-y-3 leading-relaxed whitespace-pre-line">
              {challenge.brief}
            </div>
          </div>

          {/* Dataset Card */}
          <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <span>Quarterly Media Performance Dataset</span>
              </h2>
              <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                Client: Q3 Baseline
              </span>
            </div>
            <pre className="p-3.5 rounded-lg bg-surface-muted border border-line font-mono text-[11px] text-ink overflow-x-auto leading-normal">
              {challenge.sampleDataset}
            </pre>
          </div>

          {/* Answer Workspace */}
          <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-accent" />
                <span>Your Proposed Allocation & Justification</span>
              </h2>
              {!isReviewed && (
                <button
                  type="button"
                  onClick={handleFillSample}
                  className="text-[11px] text-accent hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Insert sample proposal</span>
                </button>
              )}
            </div>

            <textarea
              rows={10}
              disabled={isReviewed}
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Structure your 15,000 TND redistribution across Google, Meta, LinkedIn, and Display with concise justifications..."
              className="w-full p-3.5 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden font-mono leading-relaxed disabled:bg-surface-muted/60 disabled:cursor-not-allowed"
            />

            <div>
              <label className="text-xs font-semibold text-ink block mb-1.5">
                Follow-up Question: {challenge.followUpQuestion}
              </label>
              <input
                type="text"
                disabled={isReviewed}
                value={followUpAnswer}
                onChange={(e) => setFollowUpAnswer(e.target.value)}
                placeholder="What leading metric would signal diminishing returns or fatigue?"
                className="w-full px-3.5 py-2 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden disabled:bg-surface-muted/60"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-line">
              <div className="text-[11px] text-ink-muted">
                {isReviewed
                  ? 'Completed and reviewed'
                  : isSubmitted
                  ? 'Submitted — pending review'
                  : 'Draft in progress'}
              </div>

              <div className="flex items-center gap-2">
                {!isSubmitted && (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={isSaving}
                      className="px-3.5 py-2 rounded-lg border border-line bg-surface text-xs font-medium text-ink hover:bg-surface-muted transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Save Draft</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || !draftContent.trim()}
                      className="px-4 py-2 rounded-lg bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Submit Challenge</span>
                    </button>
                  </>
                )}

                {isSubmitted && !isReviewed && (
                  <button
                    type="button"
                    onClick={handleRunSimulatedReview}
                    disabled={isReviewing}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isReviewing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating submission...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Run Demo Review</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Evaluation Criteria & Review Output */}
        <div className="space-y-6">
          {/* Rubric Criteria */}
          <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
              Assessed Evaluation Rubric
            </h3>
            <div className="space-y-3">
              {challenge.evaluationCriteria.map((crit) => (
                <div key={crit.id} className="p-2.5 rounded-lg bg-surface-muted/40 border border-line/60">
                  <div className="flex items-center justify-between text-xs font-medium text-ink mb-1">
                    <span>{crit.name}</span>
                    <span className="text-[10px] text-accent font-semibold">{crit.weight}%</span>
                  </div>
                  <p className="text-[11px] text-ink-muted leading-tight">{crit.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-line text-[11px] text-ink-muted flex items-start gap-2">
              <Wrench className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
              <span>Permitted tools: {challenge.permittedTools.join(', ')}</span>
            </div>
          </div>

          {/* Deterministic Review Outcome Panel */}
          {isReviewed && existingSubmission.reviewResult && (
            <div className="card p-5 border border-emerald-500/40 bg-emerald-500/5 rounded-xl shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                    Simulated Review Result
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold uppercase tracking-wider">
                  Demonstrated
                </span>
              </div>

              {/* Strength & Improvement */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface border border-line">
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    Evaluated Strength
                  </span>
                  <p className="text-ink text-[11px] leading-relaxed">
                    {existingSubmission.reviewResult.strength}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-surface border border-line">
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                    Area for Improvement
                  </span>
                  <p className="text-ink text-[11px] leading-relaxed">
                    {existingSubmission.reviewResult.gap}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-surface border border-line">
                  <span className="text-[10px] font-semibold text-accent uppercase tracking-wider block mb-1">
                    Recommended Next Step
                  </span>
                  <p className="text-ink text-[11px] leading-relaxed">
                    {existingSubmission.reviewResult.nextAction}
                  </p>
                </div>
              </div>

              {/* Criterion Breakdown */}
              <div className="pt-2 border-t border-emerald-500/20 space-y-1.5">
                <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                  Criterion-level checks
                </span>
                {existingSubmission.reviewResult.criterionResults.map((cr, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-ink font-medium">{cr.criterion}</span>
                  </div>
                ))}
              </div>

              {/* Next Presentation Actions */}
              <div className="pt-3 border-t border-emerald-500/20 space-y-2">
                <Link
                  href="/student/passport"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface border border-line text-ink font-medium text-xs hover:bg-surface-muted transition-colors"
                >
                  <span>Inspect in Skill Passport</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/student/applications"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors shadow-2xs"
                >
                  <span>Share with Carthage & Co. Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
