'use client';

import { useState, useRef } from 'react';
import {
  Eye,
  EyeOff,
  Shield,
  Check,
  Upload,
  FileText,
  AlertCircle,
  Loader2,
  Edit3,
  Sparkles,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useStore, useCurrentStudent } from '@/lib/store';
import { demoService } from '@/demo/service';
import { cn } from '@/lib/utils';
import type { VisibilityLevel, ExtractedCvData } from '@/demo/types';

export default function SettingsPage() {
  const { state, dispatch, isHydrated, showToast } = useStore();
  const student = useCurrentStudent();
  const [saved, setSaved] = useState(false);

  // CV Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedCvData | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isHydrated || !student) {
    return <div className="p-8 text-ink-muted text-sm">Loading settings…</div>;
  }

  const handleVisibilityChange = async (
    field: 'profile' | 'evidence' | 'contactInfo',
    value: VisibilityLevel
  ) => {
    const newVisibility = { ...student.visibility, [field]: value };
    await demoService.updateCandidateVisibility(student.id, newVisibility);
    dispatch({
      type: 'UPDATE_CANDIDATE_VISIBILITY',
      payload: {
        candidateId: student.id,
        visibility: newVisibility,
      },
    });
    setSaved(true);
    showToast('Visibility Updated', `Set ${field} visibility to ${value}.`, 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile({ name: file.name, size: file.size });
      setExtractedData(null);
    }
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    try {
      const data = await demoService.simulateCvImport(selectedFile);
      setExtractedData(data);
      showToast('Sample Extraction Ready', 'Sample fields loaded for review.', 'info');
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmProfile = async () => {
    if (!extractedData) return;
    setIsConfirming(true);
    try {
      const { candidate } = await demoService.confirmImportedCv(student.id, extractedData);
      dispatch({ type: 'UPDATE_CANDIDATE', payload: candidate });
      setExtractedData(null);
      setSelectedFile(null);
      showToast('Profile Updated', 'Student profile and CV metadata updated successfully.', 'success');
    } finally {
      setIsConfirming(false);
    }
  };

  const visibilityOptions: { value: VisibilityLevel; label: string; description: string }[] = [
    { value: 'public', label: 'Public', description: 'Visible to anyone and indexed in discovery' },
    { value: 'employers-only', label: 'Employers only', description: 'Visible to registered employers only' },
    { value: 'private', label: 'Private', description: 'Only you can see this; excluded from employer discovery' },
  ];

  return (
    <div className="page-enter max-w-3xl space-y-8">
      <PageHeader
        title="Settings & Profile"
        subtitle="Manage your student profile, CV import, and candidate visibility controls"
        actions={
          saved ? (
            <span className="flex items-center gap-1.5 text-accent text-xs font-semibold px-2.5 py-1 rounded bg-accent/10 border border-accent/20">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          ) : null
        }
      />

      {/* CV Import Section */}
      <section className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-ink">CV Import & Extraction</h2>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
            Simulated Feature
          </span>
        </div>

        <p className="text-xs text-ink-muted mb-4 leading-relaxed">
          Select a sample resume (PDF or DOCX) to simulate profile extraction. In this demo, sample fields are loaded deterministically for your review. Large document files are never persisted.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.docx"
            className="hidden"
            id="cv-upload-input"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-lg border border-line bg-surface text-xs font-medium text-ink hover:bg-surface-muted transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-accent" />
            <span>{selectedFile ? 'Change document' : 'Select PDF / DOCX'}</span>
          </button>

          {selectedFile && (
            <div className="flex items-center gap-2 text-xs text-ink">
              <span className="font-medium truncate max-w-xs">{selectedFile.name}</span>
              <span className="text-ink-muted">({Math.round(selectedFile.size / 1024)} KB)</span>
              <button
                type="button"
                onClick={handleStartImport}
                disabled={isImporting}
                className="ml-2 px-3 py-1.5 rounded-lg bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Demo Extraction</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Extracted Sample Review Box */}
        {extractedData && (
          <div className="mt-5 p-4 rounded-xl border border-accent/30 bg-surface-muted/50 space-y-4 animate-in fade-in">
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-surface border border-line text-xs text-ink-muted leading-relaxed">
              <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                <strong>Demo mode note:</strong> {extractedData.notes} You may edit any field below before confirming.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-ink-muted block mb-1">Candidate Name</label>
                <input
                  type="text"
                  value={extractedData.extractedName}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, extractedName: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-md border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
                />
              </div>
              <div>
                <label className="font-semibold text-ink-muted block mb-1">Target Role</label>
                <input
                  type="text"
                  value={extractedData.extractedTargetRole}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, extractedTargetRole: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-md border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
                />
              </div>
              <div>
                <label className="font-semibold text-ink-muted block mb-1">University / Institute</label>
                <input
                  type="text"
                  value={extractedData.extractedUniversity}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, extractedUniversity: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-md border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
                />
              </div>
              <div>
                <label className="font-semibold text-ink-muted block mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={extractedData.extractedGraduationYear}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, extractedGraduationYear: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 rounded-md border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-ink-muted block mb-1 text-xs">Professional Bio</label>
              <textarea
                rows={2}
                value={extractedData.extractedBio}
                onChange={(e) =>
                  setExtractedData({ ...extractedData, extractedBio: e.target.value })
                }
                className="w-full px-3 py-1.5 rounded-md border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-ink-muted block mb-1 text-xs">
                Extracted Skills (comma-separated)
              </label>
              <input
                type="text"
                value={extractedData.extractedSkills.join(', ')}
                onChange={(e) =>
                  setExtractedData({
                    ...extractedData,
                    extractedSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-1.5 rounded-md border border-line bg-surface text-ink text-xs focus:ring-1 focus:ring-accent outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExtractedData(null)}
                className="px-3 py-1.5 rounded-lg border border-line text-xs text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmProfile}
                disabled={isConfirming}
                className="px-4 py-1.5 rounded-lg bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Update Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Active Profile Summary */}
      <section className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs">
        <h2 className="text-sm font-semibold text-ink mb-3">Current Profile Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-surface-muted/50 border border-line/60">
            <span className="text-ink-muted block text-[11px] mb-0.5">Full Name</span>
            <span className="font-semibold text-ink">{student.name}</span>
          </div>
          <div className="p-3 rounded-lg bg-surface-muted/50 border border-line/60">
            <span className="text-ink-muted block text-[11px] mb-0.5">University</span>
            <span className="font-semibold text-ink">{student.university} ({student.graduationYear})</span>
          </div>
          <div className="p-3 rounded-lg bg-surface-muted/50 border border-line/60">
            <span className="text-ink-muted block text-[11px] mb-0.5">Target Role</span>
            <span className="font-semibold text-ink">{student.targetRole}</span>
          </div>
          <div className="p-3 rounded-lg bg-surface-muted/50 border border-line/60">
            <span className="text-ink-muted block text-[11px] mb-0.5">Active CV File</span>
            <span className="font-semibold text-ink">{student.cvFilename || 'Amira_Ben_Salah_CV_2026.pdf'}</span>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-lg bg-surface-muted/50 border border-line/60 text-xs">
          <span className="text-ink-muted block text-[11px] mb-0.5">Bio</span>
          <p className="text-ink leading-relaxed">{student.bio}</p>
        </div>

        <div className="mt-3">
          <span className="text-ink-muted block text-[11px] mb-1.5 font-semibold uppercase tracking-wider">
            Verified & Stated Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {student.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md text-[11px] bg-accent/10 border border-accent/20 text-accent font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Visibility Controls */}
      <section className="card p-5 border border-line bg-surface-card rounded-xl shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-ink">Visibility & Discovery Settings</h2>
        </div>
        <p className="text-xs text-ink-muted mb-5 leading-relaxed">
          Control what employers can see. Setting your profile to <strong>Private</strong> immediately hides you from employer talent discovery, while previously submitted applications remain with their intended employers.
        </p>

        <div className="space-y-5">
          <VisibilityControl
            label="Profile Visibility"
            description="Controls whether your name, university, and target role appear in employer search & discovery."
            current={student.visibility.profile}
            options={visibilityOptions}
            onChange={(val) => handleVisibilityChange('profile', val)}
          />

          <VisibilityControl
            label="Evidence Dossier Visibility"
            description="Controls whether employers browsing talent can inspect your verified skill evidence before an application."
            current={student.visibility.evidence}
            options={visibilityOptions}
            onChange={(val) => handleVisibilityChange('evidence', val)}
          />

          <VisibilityControl
            label="Direct Contact Info"
            description="Email and direct contact details."
            current={student.visibility.contactInfo}
            options={visibilityOptions}
            onChange={(val) => handleVisibilityChange('contactInfo', val)}
          />
        </div>
      </section>
    </div>
  );
}

function VisibilityControl({
  label,
  description,
  current,
  options,
  onChange,
}: {
  label: string;
  description: string;
  current: VisibilityLevel;
  options: { value: VisibilityLevel; label: string; description: string }[];
  onChange: (val: VisibilityLevel) => void;
}) {
  return (
    <div className="border border-line rounded-lg p-3.5 bg-surface-muted/30">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-ink">{label}</span>
        <span className="text-[11px] px-2 py-0.5 rounded bg-surface border border-line text-accent font-medium capitalize">
          {current}
        </span>
      </div>
      <p className="text-[11px] text-ink-muted mb-3">{description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'p-2.5 rounded-lg border text-left transition-all text-xs',
              current === opt.value
                ? 'border-accent bg-accent/10 text-ink font-medium shadow-2xs'
                : 'border-line bg-surface hover:bg-surface-muted text-ink-muted hover:text-ink'
            )}
          >
            <div className="font-semibold mb-0.5">{opt.label}</div>
            <div className="text-[10px] text-ink-muted leading-tight">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
