'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useStore, useStudentEvidence } from '@/lib/store';
import { demoService } from '@/demo/service';
import { evidenceSourceLabel, reviewStatusLabel, formatDate, cn } from '@/lib/utils';
import type { EvidenceRecord, VisibilityLevel } from '@/demo/types';

export default function PassportPage() {
  const { state, dispatch, isHydrated, showToast } = useStore();
  const evidence = useStudentEvidence();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isHydrated) {
    return <div className="p-8 text-ink-muted text-sm">Loading skill passport…</div>;
  }

  const student = state.candidates.find((c) => c.id === state.currentStudentId);

  // Assessed skills for opp-1 to show live coverage
  const opp1 = state.opportunities.find((o) => o.id === 'opp-1');
  const opp1Skills = opp1?.requirements.filter((r) => r.isAssessed).map((r) => r.skill) ?? [];
  const coveredSkills = opp1Skills.filter((skill) =>
    evidence.some(
      (e) => e.skill.toLowerCase() === skill.toLowerCase() && e.visibility !== 'private'
    )
  );

  return (
    <div className="page-enter max-w-4xl space-y-6">
      <PageHeader
        title="Skill Passport"
        subtitle="Inspectable evidence dossier of verified academic work, practical challenges, and industry assessments."
      />

      {/* Profile & Live Coverage Summary */}
      <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold text-base flex items-center justify-center shrink-0">
              {student?.initials ?? 'AS'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-ink">{student?.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                  Verified Candidate
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                {student?.university} · {student?.targetRole}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="p-2 rounded-lg bg-surface-muted/50 border border-line/60">
              <span className="text-[10px] text-ink-muted block uppercase tracking-wider font-semibold">
                Verified Records
              </span>
              <span className="text-sm font-bold text-ink">
                {evidence.filter((e) => e.reviewStatus === 'reviewed' || e.reviewStatus === 'verified').length}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-surface-muted/50 border border-line/60">
              <span className="text-[10px] text-ink-muted block uppercase tracking-wider font-semibold">
                Carthage & Co. Match
              </span>
              <span className="text-sm font-bold text-accent">
                {coveredSkills.length} / {opp1Skills.length} Assessed Criteria
              </span>
            </div>
          </div>
        </div>

        {/* Coverage Progress Bar */}
        <div className="mt-4 pt-3 border-t border-line/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-ink-muted font-medium">
              Marketing Intern (Carthage & Co.) Assessed Requirements Coverage
            </span>
            <span className="font-semibold text-ink">
              {Math.round((coveredSkills.length / (opp1Skills.length || 1)) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden border border-line/60">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((coveredSkills.length / (opp1Skills.length || 1)) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Evidence records list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Verified Evidence Dossier ({evidence.length})
          </h2>
          <span className="text-[11px] text-ink-muted">
            Click any dossier to inspect criterion results and submitted work
          </span>
        </div>

        {evidence.map((ev) => (
          <EvidenceCard
            key={ev.id}
            evidence={ev}
            isExpanded={expandedId === ev.id}
            onToggle={() => setExpandedId(expandedId === ev.id ? null : ev.id)}
          />
        ))}
      </div>
    </div>
  );
}

function EvidenceCard({
  evidence: ev,
  isExpanded,
  onToggle,
}: {
  evidence: EvidenceRecord;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { dispatch, showToast } = useStore();

  const handleVisibilityChange = async (newVis: VisibilityLevel) => {
    const { evidence: updated } = await demoService.updateEvidenceVisibility(ev.id, newVis);
    dispatch({
      type: 'UPDATE_EVIDENCE_VISIBILITY',
      payload: { id: ev.id, visibility: newVis },
    });
    showToast(
      'Sharing Visibility Updated',
      `Evidence for "${ev.skill}" is now ${newVis.replace('-', ' ')}.`,
      'success'
    );
  };

  return (
    <div className="card p-4 sm:p-5 border border-line bg-surface-card rounded-xl shadow-xs transition-all hover:border-line-hover">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-ink">{ev.skill}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-line font-medium text-ink-muted">
              {evidenceSourceLabel(ev.source)}
            </span>
            {ev.isSimulated && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Simulated Review</span>
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted font-medium">{ev.taskOrProject}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider',
              ev.reviewStatus === 'verified'
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                : ev.reviewStatus === 'reviewed'
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'bg-surface-muted text-ink-muted border border-line'
            )}
          >
            {reviewStatusLabel(ev.reviewStatus)}
          </span>
        </div>
      </div>

      <p className="text-xs text-ink mt-2 leading-relaxed line-clamp-2">{ev.description}</p>

      {/* Meta Bar */}
      <div className="mt-3 pt-3 border-t border-line/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-ink-muted text-[11px]">
          <span>Assessed: {formatDate(ev.assessmentDate)}</span>
          <span>·</span>
          <span>By: {ev.reviewerName || 'Automated Rubric'}</span>
          <span>·</span>
          <span className="capitalize">{ev.visibility.replace('-', ' ')}</span>
        </div>

        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-accent font-semibold hover:underline text-xs"
        >
          <span>{isExpanded ? 'Hide inspection details' : 'Inspect work & rubrics'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Detailed Inspection */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-line space-y-4 text-xs animate-in fade-in">
          {/* Full description */}
          <div>
            <h4 className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Assessment Task Background
            </h4>
            <p className="text-ink leading-relaxed">{ev.description}</p>
          </div>

          {/* Submitted work sample */}
          {ev.sampleWork && (
            <div>
              <h4 className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Inspectable Submitted Work Sample
              </h4>
              <div className="p-3.5 rounded-lg bg-surface-muted/60 border border-line text-ink font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                {ev.sampleWork}
              </div>
            </div>
          )}

          {/* Criterion results */}
          {ev.criterionResults.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-2">
                Assessed Criteria Breakdown ({ev.criterionResults.length})
              </h4>
              <div className="space-y-2">
                {ev.criterionResults.map((cr, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-line bg-surface flex items-start gap-2.5"
                  >
                    {cr.met ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-ink block">{cr.criterion}</span>
                      <span className="text-[11px] text-ink-muted leading-tight">{cr.comment}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewer Details */}
          <div className="p-3 rounded-lg bg-surface-muted/40 border border-line/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold block">
                Evaluator / Organization
              </span>
              <span className="font-semibold text-ink">{ev.reviewerName || 'Simulated Rubric Engine'}</span>
              <span className="text-ink-muted block text-[11px]">{ev.reviewerRole}</span>
            </div>
            <div>
              <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold block">
                Permitted Tools & Environment
              </span>
              <span className="text-ink font-medium text-[11px]">
                {ev.permittedTools.length > 0 ? ev.permittedTools.join(', ') : 'Standard workspace'}
              </span>
            </div>
          </div>

          {/* Sharing Visibility Controls */}
          <div className="pt-2 border-t border-line">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-2">
              Dossier Sharing Visibility
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {(['public', 'employers-only', 'private'] as VisibilityLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleVisibilityChange(lvl)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all capitalize',
                    ev.visibility === lvl
                      ? 'border-accent bg-accent/10 text-accent font-semibold shadow-2xs'
                      : 'border-line bg-surface hover:bg-surface-muted text-ink-muted hover:text-ink'
                  )}
                >
                  {lvl.replace('-', ' ')}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-ink-muted mt-1.5">
              Private practice results remain private unless explicitly attached to an application.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
