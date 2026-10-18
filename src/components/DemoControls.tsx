'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Users,
  Briefcase,
  Play,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import type { DemoScenarioName } from '@/demo/types';

export default function DemoControls() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { state, loadScenario, resetDemo, switchRole } = useStore();
  const router = useRouter();

  const handleScenarioChange = async (scenario: DemoScenarioName) => {
    setIsLoading(true);
    try {
      await loadScenario(scenario);
      if (scenario === 'candidate-shortlisted') {
        router.push('/employer');
      } else {
        router.push('/student');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await resetDemo();
      router.push('/student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = async () => {
    setIsLoading(true);
    try {
      const nextRole = state.currentRole === 'student' ? 'employer' : 'student';
      await switchRole(nextRole);
      router.push(nextRole === 'student' ? '/student' : '/employer');
    } finally {
      setIsLoading(false);
    }
  };

  const scenarios: { key: DemoScenarioName; label: string; desc: string; step: number }[] = [
    {
      key: 'before-application',
      label: '1. Before application',
      desc: 'Fresh student profile (Amira) with 2/3 assessed criteria covered',
      step: 1,
    },
    {
      key: 'application-submitted',
      label: '2. Application submitted',
      desc: 'Applied to Carthage & Co. with initial verified evidence (2/3)',
      step: 2,
    },
    {
      key: 'challenge-reviewed',
      label: '3. Challenge reviewed',
      desc: 'Budget challenge completed & simulated review added to passport',
      step: 3,
    },
    {
      key: 'candidate-shortlisted',
      label: '4. Candidate shortlisted',
      desc: 'Evidence shared to application (3/3 covered) and shortlisted by employer',
      step: 4,
    },
  ];

  return (
    <aside aria-label="Demo and presentation controls" className="fixed bottom-4 right-4 z-40 max-w-sm w-full sm:w-80">
      <div className="rounded-xl border border-line bg-surface-card/95 backdrop-blur-md shadow-xl text-ink overflow-hidden transition-all duration-200">
        {/* Header Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="demo-controls-panel"
          className="w-full px-3.5 py-2.5 flex items-center justify-between bg-surface-muted/60 hover:bg-surface-muted transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold tracking-wide uppercase text-ink">
              Presenter Demo Controls
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-ink-muted hidden sm:inline">
              {state.currentRole === 'student' ? 'Amira (Student)' : 'Carthage & Co. (Employer)'}
            </span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-ink-muted" />
            ) : (
              <ChevronUp className="h-4 w-4 text-ink-muted" />
            )}
          </div>
        </button>

        {/* Collapsible Content */}
        {isOpen && (
          <div id="demo-controls-panel" className="p-3.5 space-y-3.5 text-xs border-t border-line">
            {/* Context Note */}
            <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-muted text-[11px] text-ink-muted leading-relaxed">
              <Info className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
              <span>
                Use these controls to skip or recover presentation steps cleanly without reloading fresh windows.
              </span>
            </div>

            {/* Role Switcher */}
            <div>
              <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                Active Perspective
              </label>
              <button
                onClick={handleRoleToggle}
                disabled={isLoading}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-line bg-surface hover:bg-surface-muted transition-colors font-medium text-ink disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  {state.currentRole === 'student' ? (
                    <Users className="h-4 w-4 text-accent" />
                  ) : (
                    <Briefcase className="h-4 w-4 text-accent" />
                  )}
                  <span>
                    Switch to {state.currentRole === 'student' ? 'Employer' : 'Student'}
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-muted text-ink-muted border border-line">
                  {state.currentRole === 'student' ? 'Carthage & Co.' : 'Amira'}
                </span>
              </button>
            </div>

            {/* Presentation Scenario Jumpers */}
            <div>
              <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                Load Presentation Stage
              </label>
              <div className="space-y-1.5">
                {scenarios.map((sc) => {
                  const isActive = state.activeScenario === sc.key;
                  return (
                    <button
                      key={sc.key}
                      onClick={() => handleScenarioChange(sc.key)}
                      disabled={isLoading}
                      className={`w-full text-left p-2 rounded-lg border transition-all flex items-start gap-2.5 ${
                        isActive
                          ? 'border-accent bg-accent/10 text-ink font-medium shadow-sm'
                          : 'border-line/70 bg-surface/50 hover:bg-surface text-ink-muted hover:text-ink'
                      } disabled:opacity-50`}
                    >
                      {isActive ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5 text-ink-muted/50 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-xs font-medium text-ink">{sc.label}</div>
                        <div className="text-[10px] text-ink-muted line-clamp-1">{sc.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset All Data */}
            <div className="pt-1 border-t border-line">
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors font-medium text-xs disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All Demo Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
