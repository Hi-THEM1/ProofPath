'use client';

import { useState, useMemo } from 'react';
import { Search, MapPin, Send, Check, Filter, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useStore } from '@/lib/store';
import { demoService } from '@/demo/service';
import { cn } from '@/lib/utils';
import type { Candidate, EvidenceRecord } from '@/demo/types';

export default function TalentDiscoveryPage() {
  const { state, dispatch, isHydrated, showToast } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [loadingInviteId, setLoadingInviteId] = useState<string | null>(null);

  if (!isHydrated) {
    return <div className="p-8 text-ink-muted text-sm">Loading talent discovery…</div>;
  }

  // Only show candidates whose profile visibility allows discovery (public or employers-only)
  const discoverableCandidates = state.candidates.filter(
    (c) => c.visibility.profile !== 'private'
  );

  const privateCandidates = state.candidates.filter(
    (c) => c.visibility.profile === 'private'
  );

  const filtered = discoverableCandidates.filter((c) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.targetRole.toLowerCase().includes(q) &&
          !c.university.toLowerCase().includes(q) &&
          !c.skills.some((s) => s.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      if (locationFilter && !c.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
      if (skillFilter && !c.skills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()))) {
        return false;
      }
      return true;
    });

  const handleInvite = async (candidateId: string) => {
    setLoadingInviteId(candidateId);
    try {
      const { invitation, state: updatedState } = await demoService.createInvitation(
        candidateId,
        'co-1', // Carthage & Co.
        'opp-1',
        'Carthage & Co. would like to invite you to review our open Marketing Intern — Campaign Analysis position.'
      );
      dispatch({ type: 'SEND_INVITATION', payload: invitation });
      showToast(
        'Demo invitation created',
        'In-app notification created for candidate (no external emails sent in demo mode).',
        'success'
      );
    } catch (err: any) {
      showToast('Invitation Notice', err.message || 'Could not send invitation.', 'default');
    } finally {
      setLoadingInviteId(null);
    }
  };

  return (
    <div className="page-enter max-w-5xl space-y-6">
      <PageHeader
        title="Candidate Discovery"
        subtitle={`Discover opted-in students based on verified skills and inspectable evidence (${filtered.length} candidates available).`}
      />

      {/* Search & Filter Bar */}
      <div className="card p-4 border border-line bg-surface-card rounded-xl shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="search"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
              placeholder="Search by name, role, or university…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search candidates"
            />
          </div>
          <div>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
              placeholder="Filter by location (e.g. Tunis, Sfax)…"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
              placeholder="Filter by skill (e.g. Campaign, React)…"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12 border border-line bg-surface-card rounded-xl">
          <p className="text-ink-muted text-sm">No discoverable candidates match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((candidate) => {
            const isInvited = state.invitations.some((inv) => inv.candidateId === candidate.id);
            const candidateEvidence = state.evidence.filter(
              (e) =>
                e.candidateId === candidate.id &&
                e.visibility !== 'private' &&
                candidate.visibility.evidence !== 'private'
            );

            return (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isInvited={isInvited}
                isLoadingInvite={loadingInviteId === candidate.id}
                onInvite={() => handleInvite(candidate.id)}
                evidence={candidateEvidence}
              />
            );
          })}
        </div>
      )}

      {/* Private candidate notice explaining privacy policy */}
      {privateCandidates.length > 0 && (
        <div className="p-4 rounded-xl border border-line bg-surface-muted/40 text-xs text-ink-muted flex items-start gap-3">
          <EyeOff className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-ink">
              Privacy filtering active: {privateCandidates.length} candidate
              {privateCandidates.length !== 1 ? 's have' : ' has'} set their profile to private.
            </span>
            <p className="mt-0.5">
              ProofPath strictly respects student privacy preferences. Private profiles never appear in discovery feeds, but candidates can still submit applications directly to specific opportunities.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CandidateCard({
  candidate,
  isInvited,
  isLoadingInvite,
  onInvite,
  evidence,
}: {
  candidate: Candidate;
  isInvited: boolean;
  isLoadingInvite: boolean;
  onInvite: () => void;
  evidence: EvidenceRecord[];
}) {
  return (
    <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs transition-all hover:border-line-hover flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold text-sm flex items-center justify-center shrink-0">
              {candidate.initials}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">{candidate.name}</h3>
              <p className="text-xs text-ink-muted">{candidate.targetRole}</p>
            </div>
          </div>
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded font-semibold capitalize',
              candidate.visibility.profile === 'public'
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                : 'bg-accent/10 text-accent border border-accent/20'
            )}
          >
            {candidate.visibility.profile.replace('-', ' ')}
          </span>
        </div>

        <p className="text-xs text-ink mt-3 leading-relaxed line-clamp-2">{candidate.bio}</p>

        <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-accent" />
            {candidate.location}
          </span>
          <span>·</span>
          <span>{candidate.university}</span>
          <span>·</span>
          <span>{candidate.availability}</span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {candidate.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="text-[10px] px-2 py-0.5 rounded bg-surface-muted border border-line/60 text-ink font-medium"
            >
              {s}
            </span>
          ))}
          {candidate.skills.length > 4 && (
            <span className="text-[10px] text-ink-muted self-center">
              +{candidate.skills.length - 4} more
            </span>
          )}
        </div>

        {/* Evidence preview */}
        {evidence.length > 0 && (
          <div className="mt-3 p-2.5 rounded-lg bg-surface-muted/50 border border-line/60 text-xs">
            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider block mb-1">
              {evidence.length} Inspectable Skill Record{evidence.length !== 1 ? 's' : ''}
            </span>
            <div className="space-y-0.5 text-[11px] text-ink">
              {evidence.slice(0, 2).map((e) => (
                <div key={e.id} className="truncate">
                  • <strong>{e.skill}</strong> — {e.taskOrProject}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
        <span className="text-[11px] text-ink-muted">
          {isInvited ? 'Invitation dispatched' : 'Direct opportunity invitation'}
        </span>

        {isInvited ? (
          <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" />
            <span>Demo invitation created</span>
          </span>
        ) : (
          <button
            type="button"
            disabled={isLoadingInvite}
            onClick={onInvite}
            className="px-3.5 py-1.5 rounded-lg bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            {isLoadingInvite ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Invite to apply</span>
          </button>
        )}
      </div>
    </div>
  );
}
