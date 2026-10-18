'use client';

import Link from 'next/link';
import { ArrowRight, Search, Zap, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useStore, useStudentApplications, useStudentEvidence, useCurrentStudent } from '@/lib/store';
import { applicationStatusLabel, applicationStatusColor, formatDate } from '@/lib/utils';

export default function StudentOverviewPage() {
  const { state, isHydrated } = useStore();
  const student = useCurrentStudent();
  const applications = useStudentApplications();
  const evidence = useStudentEvidence();

  if (!isHydrated) {
    return <div className="p-8 text-ink-tertiary text-sm">Loading…</div>;
  }

  if (!student) {
    return <div className="p-8 text-ink-secondary">Student profile not found.</div>;
  }

  // Find relevant opportunities (matching student's target role family)
  const relevantOpps = state.opportunities
    .filter((o) => o.isPublished)
    .slice(0, 3);

  // Evidence summary
  const sharedEvidence = evidence.filter((e) => e.visibility !== 'private');
  const reviewedEvidence = evidence.filter((e) => e.reviewStatus === 'reviewed' || e.reviewStatus === 'verified');

  // Active applications (non-draft)
  const activeApps = applications.filter((a) => a.status !== 'draft');

  // Recent updates
  const recentApps = [...activeApps]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 3);

  // Find one next action
  const pendingChallenge = state.challenges.find((ch) => {
    const sub = state.challengeSubmissions.find(
      (s) => s.challengeId === ch.id && s.candidateId === state.currentStudentId
    );
    return !sub || sub.status !== 'reviewed';
  });

  const missingEvidenceOpp = state.opportunities.find((opp) => {
    const assessedSkills = opp.requirements.filter((r) => r.isAssessed).map((r) => r.skill);
    const covered = assessedSkills.filter((sk) =>
      evidence.some(
        (e) =>
          e.skill.toLowerCase() === sk.toLowerCase() &&
          e.visibility !== 'private' &&
          (e.reviewStatus === 'reviewed' || e.reviewStatus === 'verified')
      )
    );
    return covered.length < assessedSkills.length;
  });

  return (
    <div className="page-enter">
      <PageHeader
        title={`Welcome back, ${student.name.split(' ')[0]}`}
        subtitle={`${student.targetRole} · ${student.university}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next action */}
          {pendingChallenge && (
            <div className="card border-accent/40 bg-accent-light/30">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" strokeWidth={1.75} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold mb-0.5">Suggested next step</h3>
                  <p className="text-[0.8125rem] text-ink-secondary mb-2">
                    Complete the &ldquo;{pendingChallenge.title}&rdquo; to add evidence for{' '}
                    {pendingChallenge.skillsAssessed.join(', ')}.
                  </p>
                  <Link
                    href={`/student/challenges/${pendingChallenge.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Start challenge
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Recent application updates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Recent applications</h2>
              <Link
                href="/student/applications"
                className="text-[0.8125rem] text-accent hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </Link>
            </div>
            {recentApps.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-ink-tertiary text-sm mb-3">No applications yet</p>
                <Link href="/student/opportunities" className="btn btn-secondary btn-sm">
                  <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Browse opportunities
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentApps.map((app) => {
                  const opp = state.opportunities.find((o) => o.id === app.opportunityId);
                  const company = opp
                    ? state.companies.find((c) => c.id === opp.companyId)
                    : null;
                  const statusColor = applicationStatusColor(app.status);
                  return (
                    <Link
                      key={app.id}
                      href="/student/applications"
                      className="card-interactive flex items-center gap-3"
                    >
                      {company && (
                        <div className={`monogram monogram-sm bg-primary-light text-primary`}>
                          {company.monogram}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {opp?.title ?? 'Unknown role'}
                        </p>
                        <p className="text-[0.75rem] text-ink-tertiary">
                          {company?.name} · Updated {formatDate(app.lastUpdated)}
                        </p>
                      </div>
                      <span className={`badge badge-${statusColor}`}>
                        {applicationStatusLabel(app.status)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Relevant opportunities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Relevant opportunities</h2>
              <Link
                href="/student/opportunities"
                className="text-[0.8125rem] text-accent hover:underline flex items-center gap-1"
              >
                Browse all <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </Link>
            </div>
            <div className="space-y-2">
              {relevantOpps.map((opp) => {
                const company = state.companies.find((c) => c.id === opp.companyId);
                return (
                  <Link
                    key={opp.id}
                    href={`/student/opportunities/${opp.id}`}
                    className="card-interactive flex items-center gap-3"
                  >
                    {company && (
                      <div className="monogram monogram-sm bg-surface-alt text-ink-secondary">
                        {company.monogram}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{opp.title}</p>
                      <p className="text-[0.75rem] text-ink-tertiary">
                        {company?.name} · {opp.location} · {opp.type === 'internship' ? 'Internship' : 'Job'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink-tertiary flex-shrink-0" strokeWidth={1.75} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column — skill evidence summary */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-sm font-semibold mb-3">Skill evidence</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[0.8125rem] text-ink-secondary">Total records</span>
                <span className="text-sm font-medium tabular-nums">{evidence.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.8125rem] text-ink-secondary flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" strokeWidth={1.75} />
                  Reviewed or verified
                </span>
                <span className="text-sm font-medium tabular-nums">{reviewedEvidence.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.8125rem] text-ink-secondary flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber" strokeWidth={1.75} />
                  Pending review
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {evidence.filter((e) => e.reviewStatus === 'pending').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.8125rem] text-ink-secondary">Shared with employers</span>
                <span className="text-sm font-medium tabular-nums">{sharedEvidence.length}</span>
              </div>
            </div>
            <Link
              href="/student/passport"
              className="btn btn-secondary btn-sm w-full mt-4"
            >
              View passport
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold mb-2">Profile</h2>
            <div className="space-y-2 text-[0.8125rem]">
              <div>
                <span className="text-ink-tertiary">Target role</span>
                <p className="font-medium">{student.targetRole}</p>
              </div>
              <div>
                <span className="text-ink-tertiary">Availability</span>
                <p className="font-medium">{student.availability}</p>
              </div>
              <div>
                <span className="text-ink-tertiary">Location</span>
                <p className="font-medium">{student.location}</p>
              </div>
            </div>
            <Link
              href="/student/settings"
              className="btn btn-ghost btn-sm w-full mt-3 text-accent"
            >
              Edit profile & visibility
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
