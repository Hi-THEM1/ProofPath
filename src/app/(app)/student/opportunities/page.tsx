'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  Filter,
  X,
  ArrowRight,
  Building2,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useStore, useEvidenceForSkills } from '@/lib/store';
import {
  workModeLabel,
  opportunityTypeLabel,
  formatDate,
  daysUntil,
  cn,
} from '@/lib/utils';
import type { Opportunity, RoleFamily, WorkMode, OpportunityType } from '@/lib/types';

export default function OpportunitiesPage() {
  const { state, dispatch, isHydrated } = useStore();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<OpportunityType | ''>('');
  const [roleFamilyFilter, setRoleFamilyFilter] = useState<RoleFamily | ''>('');
  const [workModeFilter, setWorkModeFilter] = useState<WorkMode | ''>('');
  const [locationFilter, setLocationFilter] = useState('');
  const [paidOnly, setPaidOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Selected opportunity (desktop detail view)
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const published = state.opportunities.filter((o) => o.isPublished);

  // Filtering
  const filtered = useMemo(() => {
    return published.filter((opp) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          opp.title.toLowerCase().includes(q) ||
          opp.description.toLowerCase().includes(q) ||
          opp.location.toLowerCase().includes(q);
        const company = state.companies.find((c) => c.id === opp.companyId);
        const matchesCompany = company?.name.toLowerCase().includes(q);
        if (!matchesText && !matchesCompany) return false;
      }
      if (typeFilter && opp.type !== typeFilter) return false;
      if (roleFamilyFilter && opp.roleFamily !== roleFamilyFilter) return false;
      if (workModeFilter && opp.workMode !== workModeFilter) return false;
      if (locationFilter && !opp.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (paidOnly && !opp.isPaid) return false;
      return true;
    });
  }, [published, searchQuery, typeFilter, roleFamilyFilter, workModeFilter, locationFilter, paidOnly, state.companies]);

  const selected = selectedId
    ? state.opportunities.find((o) => o.id === selectedId) ?? null
    : filtered[0] ?? null;

  const activeFilterCount = [typeFilter, roleFamilyFilter, workModeFilter, locationFilter, paidOnly].filter(Boolean).length;

  if (!isHydrated) {
    return <div className="p-8 text-ink-tertiary text-sm">Loading…</div>;
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Opportunities"
        subtitle={`${filtered.length} ${filtered.length === 1 ? 'opportunity' : 'opportunities'} available`}
      />

      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" strokeWidth={1.75} />
          <input
            type="search"
            className="input pl-9"
            placeholder="Search roles, companies, locations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search opportunities"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn('btn btn-secondary', activeFilterCount > 0 && 'border-primary text-primary')}
        >
          <Filter className="w-4 h-4" strokeWidth={1.75} />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="label">Type</label>
            <select
              className="select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as OpportunityType | '')}
            >
              <option value="">All types</option>
              <option value="internship">Internship</option>
              <option value="job">Job</option>
            </select>
          </div>
          <div>
            <label className="label">Role family</label>
            <select
              className="select"
              value={roleFamilyFilter}
              onChange={(e) => setRoleFamilyFilter(e.target.value as RoleFamily | '')}
            >
              <option value="">All roles</option>
              <option value="marketing">Marketing</option>
              <option value="accounting">Accounting</option>
              <option value="engineering">Engineering</option>
              <option value="design">Design</option>
              <option value="operations">Operations</option>
              <option value="data">Data</option>
              <option value="sales">Sales</option>
            </select>
          </div>
          <div>
            <label className="label">Work mode</label>
            <select
              className="select"
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value as WorkMode | '')}
            >
              <option value="">Any mode</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-site</option>
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Tunis"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={paidOnly}
                onChange={(e) => setPaidOnly(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary accent-primary"
              />
              Paid only
            </label>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setTypeFilter('');
                setRoleFamilyFilter('');
                setWorkModeFilter('');
                setLocationFilter('');
                setPaidOnly(false);
              }}
              className="btn btn-ghost btn-sm col-span-2 sm:col-span-1"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* List + Detail layout */}
      <div className="flex gap-6">
        {/* Opportunity list */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0 space-y-2">
          {filtered.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-ink-tertiary text-sm">No opportunities match your filters.</p>
            </div>
          ) : (
            filtered.map((opp) => (
              <OpportunityListItem
                key={opp.id}
                opportunity={opp}
                isSelected={selected?.id === opp.id}
                onSelect={() => setSelectedId(opp.id)}
              />
            ))
          )}
        </div>

        {/* Detail panel — desktop only */}
        {selected && (
          <div className="hidden lg:block flex-1 sticky top-4 self-start">
            <OpportunityDetail opportunity={selected} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── List Item ─────────────────────────────────────────────────────

function OpportunityListItem({
  opportunity: opp,
  isSelected,
  onSelect,
}: {
  opportunity: Opportunity;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { state, dispatch } = useStore();
  const company = state.companies.find((c) => c.id === opp.companyId);
  const isSaved = state.savedOpportunities.some((s) => s.opportunityId === opp.id);
  const deadline = daysUntil(opp.deadline);

  const assessedSkills = opp.requirements.filter((r) => r.isAssessed).map((r) => r.skill);
  const { covered } = useEvidenceForSkills(assessedSkills);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      dispatch({ type: 'UNSAVE_OPPORTUNITY', payload: opp.id });
    } else {
      dispatch({
        type: 'SAVE_OPPORTUNITY',
        payload: { opportunityId: opp.id, savedAt: new Date().toISOString() },
      });
    }
  };

  return (
    <div className="relative">
      {/* Mobile: Link to detail page. Desktop: select in list */}
      <Link
        href={`/student/opportunities/${opp.id}`}
        className={cn(
          'card-interactive block lg:hidden'
        )}
      >
        <MobileListContent opp={opp} company={company} deadline={deadline} covered={covered} assessedSkills={assessedSkills} />
      </Link>
      <div
        onClick={onSelect}
        className={cn(
          'card-interactive hidden lg:block',
          isSelected && 'active'
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(); }}
        aria-label={`View details for ${opp.title}`}
      >
        <MobileListContent opp={opp} company={company} deadline={deadline} covered={covered} assessedSkills={assessedSkills} />
      </div>
      <button
        onClick={toggleSave}
        className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-surface-alt transition-colors"
        aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
      >
        {isSaved ? (
          <BookmarkCheck className="w-4 h-4 text-primary" strokeWidth={1.75} />
        ) : (
          <Bookmark className="w-4 h-4 text-ink-tertiary" strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
}

function MobileListContent({ opp, company, deadline, covered, assessedSkills }: {
  opp: Opportunity;
  company: ReturnType<typeof Object.create> | undefined;
  deadline: number;
  covered: string[];
  assessedSkills: string[];
}) {
  return (
    <>
      <div className="flex items-start gap-3 pr-8">
        {company && (
          <div className="monogram monogram-sm bg-surface-alt text-ink-secondary mt-0.5">
            {company.monogram}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate pr-4">{opp.title}</h3>
          <p className="text-[0.75rem] text-ink-tertiary mt-0.5">
            {company?.name}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[0.75rem] text-ink-secondary">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" strokeWidth={1.75} />
          {opp.location}
        </span>
        <span className="badge badge-neutral text-[0.6875rem]">
          {workModeLabel(opp.workMode)}
        </span>
        <span className="badge badge-neutral text-[0.6875rem]">
          {opportunityTypeLabel(opp.type)}
        </span>
        {opp.duration && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={1.75} />
            {opp.duration}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-2.5">
        {assessedSkills.length > 0 && (
          <span className="text-[0.75rem] text-ink-secondary">
            Your evidence covers{' '}
            <strong className="text-ink font-medium">
              {covered.length} of {assessedSkills.length}
            </strong>{' '}
            assessed {assessedSkills.length === 1 ? 'requirement' : 'requirements'}
          </span>
        )}
        {deadline > 0 && (
          <span className={cn(
            'text-[0.75rem] tabular-nums',
            deadline <= 7 ? 'text-amber font-medium' : 'text-ink-tertiary'
          )}>
            {deadline}d left
          </span>
        )}
      </div>
    </>
  );
}

// ─── Detail Panel ──────────────────────────────────────────────────

function OpportunityDetail({ opportunity: opp }: { opportunity: Opportunity }) {
  const { state, dispatch } = useStore();
  const company = state.companies.find((c) => c.id === opp.companyId);
  const isSaved = state.savedOpportunities.some((s) => s.opportunityId === opp.id);
  const hasApplied = state.applications.some(
    (a) => a.opportunityId === opp.id && a.candidateId === state.currentStudentId
  );

  const assessedSkills = opp.requirements.filter((r) => r.isAssessed).map((r) => r.skill);
  const { covered, evidence: studentEvidence } = useEvidenceForSkills(assessedSkills);

  const essentialReqs = opp.requirements.filter((r) => r.isEssential);
  const trainableReqs = opp.requirements.filter((r) => !r.isEssential);

  const toggleSave = () => {
    if (isSaved) {
      dispatch({ type: 'UNSAVE_OPPORTUNITY', payload: opp.id });
    } else {
      dispatch({
        type: 'SAVE_OPPORTUNITY',
        payload: { opportunityId: opp.id, savedAt: new Date().toISOString() },
      });
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {company && (
          <div className="monogram monogram-md bg-primary-light text-primary">
            {company.monogram}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-lg font-semibold tracking-tight">{opp.title}</h2>
          <p className="text-sm text-ink-secondary">{company?.name}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="badge badge-primary">{opportunityTypeLabel(opp.type)}</span>
        <span className="badge badge-neutral">{workModeLabel(opp.workMode)}</span>
        {opp.isPaid && opp.compensation && (
          <span className="badge badge-success">{opp.compensation}</span>
        )}
        {opp.duration && <span className="badge badge-neutral">{opp.duration}</span>}
      </div>

      {/* Description */}
      <p className="text-[0.8125rem] text-ink-secondary leading-relaxed mb-5">
        {opp.description}
      </p>

      {/* Evidence coverage */}
      {assessedSkills.length > 0 && (
        <div className="card bg-canvas border-border mb-5">
          <p className="text-sm font-medium mb-1">Evidence coverage</p>
          <p className="text-[0.8125rem] text-ink-secondary">
            Your evidence covers <strong className="text-ink">{covered.length} of {assessedSkills.length}</strong> assessed requirements.
          </p>
        </div>
      )}

      {/* Essential qualifications */}
      {opp.essentialQualifications.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold mb-2">Essential qualifications</h3>
          <ul className="space-y-1.5">
            {opp.essentialQualifications.map((q, i) => (
              <li key={i} className="text-[0.8125rem] text-ink-secondary flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-ink-tertiary mt-2 flex-shrink-0" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills with evidence support */}
      {essentialReqs.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold mb-2">Required skills</h3>
          <div className="space-y-2">
            {essentialReqs.map((req) => {
              const hasCoverage = covered.some(
                (s) => s.toLowerCase() === req.skill.toLowerCase()
              );
              return (
                <div key={req.id} className="flex items-start gap-2">
                  <div className={cn(
                    'status-dot mt-1.5',
                    hasCoverage ? 'status-dot-success' : 'status-dot-neutral'
                  )} />
                  <div>
                    <p className="text-[0.8125rem] font-medium">{req.skill}</p>
                    <p className="text-[0.75rem] text-ink-tertiary">{req.description}</p>
                    {hasCoverage && (
                      <p className="text-[0.75rem] text-success mt-0.5">Evidence available</p>
                    )}
                    {!hasCoverage && req.isAssessed && (
                      <p className="text-[0.75rem] text-ink-tertiary mt-0.5">Not yet assessed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trainable */}
      {trainableReqs.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold mb-2">Trainable preferences</h3>
          <div className="space-y-2">
            {trainableReqs.map((req) => (
              <div key={req.id} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-ink-tertiary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-[0.8125rem] font-medium">{req.skill}</p>
                  <p className="text-[0.75rem] text-ink-tertiary">{req.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practical details */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold mb-2">Practical details</h3>
        <div className="space-y-1.5 text-[0.8125rem] text-ink-secondary">
          <p className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-ink-tertiary flex-shrink-0" strokeWidth={1.75} />
            {opp.location} · {workModeLabel(opp.workMode)}
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-ink-tertiary flex-shrink-0" strokeWidth={1.75} />
            Deadline: {formatDate(opp.deadline)}
          </p>
          {opp.practicalDetails && <p className="mt-1">{opp.practicalDetails}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        {hasApplied ? (
          <span className="btn btn-secondary btn-sm cursor-default">
            Already applied
          </span>
        ) : (
          <Link
            href={`/student/opportunities/${opp.id}`}
            className="btn btn-primary btn-sm"
          >
            Apply
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        )}
        <button onClick={toggleSave} className="btn btn-secondary btn-sm">
          {isSaved ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5" strokeWidth={1.75} />
              Save
            </>
          )}
        </button>
      </div>
    </div>
  );
}
