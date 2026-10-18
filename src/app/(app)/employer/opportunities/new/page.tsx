'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Eye,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useStore } from '@/lib/store';
import { demoService } from '@/demo/service';
import { cn, workModeLabel, opportunityTypeLabel, formatDate } from '@/lib/utils';
import type { Opportunity, SkillRequirement, OpportunityType, WorkMode, RoleFamily } from '@/demo/types';

export default function NewOpportunityPage() {
  const { state, dispatch, showToast } = useStore();
  const router = useRouter();

  const [step, setStep] = useState<'edit' | 'preview'>('edit');
  const [isPublishing, setIsPublishing] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<OpportunityType>('internship');
  const [roleFamily, setRoleFamily] = useState<RoleFamily>('marketing');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('hybrid');
  const [isPaid, setIsPaid] = useState(true);
  const [compensation, setCompensation] = useState('');
  const [duration, setDuration] = useState('');
  const [deadline, setDeadline] = useState('');
  const [practicalDetails, setPracticalDetails] = useState('');
  const [qualifications, setQualifications] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<{ skill: string; description: string; isEssential: boolean; isAssessed: boolean }[]>([
    { skill: '', description: '', isEssential: true, isAssessed: true },
  ]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!deadline) newErrors.deadline = 'Deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFillSample = () => {
    setTitle('Growth Marketing Associate');
    setType('internship');
    setRoleFamily('marketing');
    setDescription(
      'Lead audience segmentation, retention workflows, and weekly cross-channel reporting for fast-growing regional client accounts at Carthage & Co.'
    );
    setLocation('Tunis, Tunisia');
    setWorkMode('hybrid');
    setIsPaid(true);
    setCompensation('750 TND / month');
    setDuration('4 months');
    setDeadline('2027-03-31');
    setPracticalDetails('Hybrid in our central Tunis workspace with mentorship from strategy directors.');
    setQualifications([
      'Degree or ongoing coursework in Marketing, Analytics, or Media',
      'Hands-on comfort with spreadsheet models and visual storytelling',
    ]);
    setRequirements([
      {
        skill: 'Campaign performance analysis',
        description: 'Analyze attribution models and CAC across channels',
        isEssential: true,
        isAssessed: true,
      },
      {
        skill: 'Budget allocation',
        description: 'Distribute ad spend across performance tiers',
        isEssential: true,
        isAssessed: true,
      },
      {
        skill: 'Content planning',
        description: 'Organize promotion schedules around launches',
        isEssential: false,
        isAssessed: false,
      },
    ]);
    setErrors({});
    showToast('Sample Opportunity Inserted', 'Form autofilled with sample data for quick presentation.', 'info');
  };

  const handlePreview = () => {
    if (validate()) setStep('preview');
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const companyId = state.companies[0]?.id ?? 'co-1';
      const { opportunity: newOpp, state: updatedState } = await demoService.publishOpportunity({
        companyId,
        title: title.trim(),
        type,
        roleFamily,
        description: description.trim(),
        location: location.trim(),
        workMode,
        isPaid,
        compensation: isPaid ? compensation.trim() : undefined,
        duration: duration.trim() || undefined,
        essentialQualifications: qualifications.filter((q) => q.trim()),
        requirements: requirements
          .filter((r) => r.skill.trim())
          .map((r, i) => ({
            id: `req-new-${i}`,
            skill: r.skill.trim(),
            description: r.description.trim(),
            isEssential: r.isEssential,
            isAssessed: r.isAssessed,
          })),
        acceptedEvidence: ['academic-project', 'challenge', 'portfolio', 'work-experience'],
        deadline: deadline,
        practicalDetails: practicalDetails.trim(),
      });

      dispatch({ type: 'ADD_OPPORTUNITY', payload: newOpp });
      showToast('Opportunity Published', `${newOpp.title} is now active and searchable by students.`, 'success');
      router.push('/employer');
    } catch (err: any) {
      showToast('Publish Notice', err.message || 'Could not publish opportunity.', 'default');
    } finally {
      setIsPublishing(false);
    }
  };

  if (step === 'preview') {
    return (
      <div className="page-enter max-w-2xl space-y-5">
        <button
          type="button"
          onClick={() => setStep('edit')}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to edit form</span>
        </button>

        <PageHeader title="Preview Opportunity" subtitle="Review details before publishing to students" />

        <div className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-ink">{title}</h2>
            <p className="text-xs text-ink-muted">{state.companies[0]?.name} · Fictional Company</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent font-semibold">
                {opportunityTypeLabel(type)}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-surface-muted text-ink-muted border border-line">
                {workModeLabel(workMode)}
              </span>
              {isPaid && compensation && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">
                  {compensation}
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Description</h3>
            <p className="text-xs text-ink leading-relaxed">{description}</p>
          </div>

          {qualifications.filter((q) => q.trim()).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                Essential Qualifications
              </h3>
              <ul className="space-y-1 text-xs text-ink">
                {qualifications
                  .filter((q) => q.trim())
                  .map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {requirements.filter((r) => r.skill.trim()).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                Assessed Skill Requirements
              </h3>
              <div className="space-y-1.5">
                {requirements
                  .filter((r) => r.skill.trim())
                  .map((r, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-surface border border-line text-xs">
                      <span className="font-semibold text-ink">{r.skill}</span>
                      {!r.isEssential && <span className="text-ink-muted font-normal"> (Trainable)</span>}
                      {r.description && <p className="text-[11px] text-ink-muted mt-0.5">{r.description}</p>}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isPublishing}
            onClick={handlePublish}
            className="px-4 py-2 rounded-lg bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Publish Opportunity Now</span>
          </button>
          <button
            type="button"
            onClick={() => setStep('edit')}
            className="px-3.5 py-2 rounded-lg border border-line bg-surface text-ink text-xs font-medium hover:bg-surface-muted transition-colors"
          >
            Continue Editing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/employer')}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to employer overview</span>
        </button>
        <button
          type="button"
          onClick={handleFillSample}
          className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Autofill sample listing</span>
        </button>
      </div>

      <PageHeader
        title="Post New Opportunity"
        subtitle="Define essential requirements, trainable skills, and accepted evidence types."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handlePreview();
        }}
        className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs space-y-5"
      >
        <div>
          <label className="text-xs font-semibold text-ink block mb-1">Listing Title *</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
            placeholder="e.g. Marketing Intern — Campaign Analysis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Opportunity Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OpportunityType)}
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
            >
              <option value="internship">Internship</option>
              <option value="job">Entry-level Job</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value as WorkMode)}
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
            >
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
              <option value="on-site">On-site</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Location *</label>
            <input
              type="text"
              placeholder="e.g. Tunis, Tunisia"
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            {errors.location && <p className="text-[11px] text-red-500 mt-1">{errors.location}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Application Deadline *</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            {errors.deadline && <p className="text-[11px] text-red-500 mt-1">{errors.deadline}</p>}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink block mb-1">Role Description *</label>
          <textarea
            rows={4}
            placeholder="Describe what the student or graduate will work on..."
            className="w-full p-3 rounded-lg border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden leading-relaxed"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && <p className="text-[11px] text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Essential Qualifications */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-ink">Essential Qualifications</label>
            <button
              type="button"
              onClick={() => setQualifications([...qualifications, ''])}
              className="text-accent text-[11px] font-semibold hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>Add qualification</span>
            </button>
          </div>
          <div className="space-y-1.5">
            {qualifications.map((q, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Final-year marketing undergraduate"
                  className="w-full px-3 py-1.5 rounded-lg border border-line bg-surface text-ink text-xs"
                  value={q}
                  onChange={(e) => {
                    const next = [...qualifications];
                    next[idx] = e.target.value;
                    setQualifications(next);
                  }}
                />
                {qualifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))}
                    className="p-1.5 text-ink-muted hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skill Requirements */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-ink">Assessed Skill Requirements</label>
            <button
              type="button"
              onClick={() =>
                setRequirements([
                  ...requirements,
                  { skill: '', description: '', isEssential: true, isAssessed: true },
                ])
              }
              className="text-accent text-[11px] font-semibold hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>Add skill requirement</span>
            </button>
          </div>
          <div className="space-y-2">
            {requirements.map((r, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-line bg-surface space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="Skill name (e.g. Budget allocation)"
                    className="w-full px-2.5 py-1.5 rounded-md border border-line bg-surface-muted/40 text-ink text-xs font-medium"
                    value={r.skill}
                    onChange={(e) => {
                      const next = [...requirements];
                      next[idx].skill = e.target.value;
                      setRequirements(next);
                    }}
                  />
                  {requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}
                      className="p-1 text-ink-muted hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Evaluation criteria description..."
                  className="w-full px-2.5 py-1.5 rounded-md border border-line bg-surface-muted/40 text-ink text-xs"
                  value={r.description}
                  onChange={(e) => {
                    const next = [...requirements];
                    next[idx].description = e.target.value;
                    setRequirements(next);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <span>Review & Preview Opportunity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
