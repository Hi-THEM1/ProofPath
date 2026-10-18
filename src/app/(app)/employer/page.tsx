'use client';

import Link from 'next/link';
import { Plus, ClipboardList, Users, ArrowRight, Briefcase } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useStore } from '@/lib/store';
import { applicationStatusLabel, applicationStatusColor, formatDate } from '@/lib/utils';

export default function EmployerOverviewPage() {
  const { state, isHydrated } = useStore();

  if (!isHydrated) {
    return <div className="p-8 text-ink-tertiary text-sm">Loading…</div>;
  }

  const publishedOpps = state.opportunities.filter((o) => o.isPublished);
  const allApps = state.applications;

  return (
    <div className="page-enter">
      <PageHeader
        title="Employer dashboard"
        subtitle="Manage opportunities and review applications"
        actions={
          <Link href="/employer/opportunities/new" className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" strokeWidth={2} />
            Post opportunity
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent applications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Recent applications</h2>
            </div>
            {allApps.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-ink-tertiary text-sm">No applications received yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allApps
                  .sort(
                    (a, b) =>
                      new Date(b.lastUpdated).getTime() -
                      new Date(a.lastUpdated).getTime()
                  )
                  .map((app) => {
                    const opp = state.opportunities.find(
                      (o) => o.id === app.opportunityId
                    );
                    const cand = state.candidates.find(
                      (c) => c.id === app.candidateId
                    );
                    const statusColor = applicationStatusColor(app.status);
                    return (
                      <Link
                        key={app.id}
                        href={`/employer/applications/${app.id}`}
                        className="card-interactive flex items-center gap-3"
                      >
                        {cand && (
                          <div className="monogram monogram-sm bg-surface-alt text-ink-secondary">
                            {cand.initials}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {cand?.name ?? 'Unknown candidate'}
                          </p>
                          <p className="text-[0.75rem] text-ink-tertiary">
                            {opp?.title} · Updated {formatDate(app.lastUpdated)}
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

          {/* Published opportunities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Published opportunities</h2>
            </div>
            <div className="space-y-2">
              {publishedOpps.map((opp) => {
                const company = state.companies.find(
                  (c) => c.id === opp.companyId
                );
                const appCount = state.applications.filter(
                  (a) => a.opportunityId === opp.id
                ).length;
                return (
                  <div key={opp.id} className="card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {company && (
                        <div className="monogram monogram-sm bg-primary-light text-primary">
                          {company.monogram}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{opp.title}</p>
                        <p className="text-[0.75rem] text-ink-tertiary">
                          {company?.name} · {appCount} application{appCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[0.75rem] text-ink-tertiary tabular-nums">
                      Deadline: {formatDate(opp.deadline)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold mb-3">Quick actions</h3>
            <div className="space-y-2">
              <Link
                href="/employer/opportunities/new"
                className="card-interactive flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-md bg-primary-light flex items-center justify-center">
                  <Plus className="w-4 h-4 text-primary" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-medium">Post opportunity</p>
                  <p className="text-[0.75rem] text-ink-tertiary">Create a new listing</p>
                </div>
              </Link>
              <Link
                href="/employer/talent"
                className="card-interactive flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-md bg-accent-light flex items-center justify-center">
                  <Users className="w-4 h-4 text-accent" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-medium">Discover talent</p>
                  <p className="text-[0.75rem] text-ink-tertiary">Browse opted-in candidates</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="card bg-amber-bg border-amber/30">
            <p className="text-[0.8125rem] text-amber">
              <strong>Demo mode</strong> — You are viewing the employer side of the demo.
              All data is fictional and shared with the student view in this browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
