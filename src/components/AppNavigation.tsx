'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  FileText,
  Shield,
  Settings,
  Briefcase,
  Plus,
  ClipboardList,
  Users,
  ArrowLeftRight,
  RotateCcw,
  Menu,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import DemoControls from './DemoControls';

const studentNav = [
  { href: '/student', label: 'Overview', icon: Home },
  { href: '/student/opportunities', label: 'Opportunities', icon: Search },
  { href: '/student/applications', label: 'Applications', icon: FileText },
  { href: '/student/passport', label: 'Skill Passport', icon: Shield },
  { href: '/student/settings', label: 'Settings', icon: Settings },
];

const employerNav = [
  { href: '/employer', label: 'Overview', icon: Briefcase },
  { href: '/employer/opportunities/new', label: 'Post Opportunity', icon: Plus },
  { href: '/employer/talent', label: 'Discover Talent', icon: Users },
];

export default function AppNavigation() {
  const { state, switchRole, resetDemo } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isStudent = state.currentRole === 'student';
  const navItems = isStudent ? studentNav : employerNav;

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleRoleToggle = async () => {
    const nextRole = isStudent ? 'employer' : 'student';
    await switchRole(nextRole);
    router.push(nextRole === 'student' ? '/student' : '/employer');
  };

  const handleReset = async () => {
    if (window.confirm('Reset all demo records back to initial sample state?')) {
      await resetDemo();
      router.push('/student');
    }
  };

  return (
    <>
      {/* Desktop sidebar rail */}
      <nav
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-sidebar bg-surface-card border-r border-line z-40"
        aria-label="Main navigation"
      >
        {/* Logo & Demo Mode Tag */}
        <div className="p-4 pb-2 border-b border-line/60">
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <span className="font-semibold text-ink text-sm tracking-tight block">
                ProofPath
              </span>
              <span className="text-[10px] text-ink-muted">Skill Verification</span>
            </div>
          </Link>

          {/* Discreet Demo Mode Label */}
          <div className="mt-2.5 px-2 py-1 rounded bg-accent/10 border border-accent/20 flex items-center gap-1.5 text-[11px] text-accent font-medium">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Demo mode · Sample data</span>
          </div>
        </div>

        {/* Current User Perspective Header */}
        <div className="px-4 py-3 bg-surface-muted/40 border-b border-line/60">
          <div className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-0.5">
            Current Perspective
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-ink truncate">
              {isStudent ? 'Amira Ben Salah' : 'Carthage & Co.'}
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-line text-ink-muted">
              {isStudent ? 'Student' : 'Employer'}
            </span>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === '/student' || item.href === '/employer'
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-accent/10 text-accent font-semibold border border-accent/20'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-muted'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Employer Quick Access Applications */}
          {!isStudent && state.applications.length > 0 && (
            <div className="pt-4">
              <div className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider px-3 pb-1.5">
                Active Applications ({state.applications.length})
              </div>
              <div className="space-y-0.5">
                {state.applications.slice(0, 4).map((app) => {
                  const opp = state.opportunities.find((o) => o.id === app.opportunityId);
                  const cand = state.candidates.find((c) => c.id === app.candidateId);
                  if (!opp || !cand) return null;
                  const isActive = pathname === `/employer/applications/${app.id}`;
                  return (
                    <Link
                      key={app.id}
                      href={`/employer/applications/${app.id}`}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] transition-colors',
                        isActive
                          ? 'bg-surface-muted text-ink font-medium border border-line'
                          : 'text-ink-muted hover:text-ink hover:bg-surface-muted/60'
                      )}
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="truncate">{cand.name.split(' ')[0]} — {opp.title.split('—')[0].trim()}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-line space-y-1.5 bg-surface-muted/30">
          <button
            onClick={handleRoleToggle}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-ink bg-surface border border-line hover:bg-surface-muted transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-3.5 h-3.5 text-accent" />
              <span>Switch to {isStudent ? 'Employer' : 'Student'}</span>
            </div>
          </button>
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </nav>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-surface-card border-b border-line z-40 h-14 flex items-center px-4 justify-between">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </div>
          <span className="font-semibold text-ink text-sm tracking-tight">ProofPath</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent font-medium">
            Demo mode
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg border border-line text-ink hover:bg-surface-muted"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-ink/40 z-40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="md:hidden fixed top-14 right-0 bottom-0 w-64 bg-surface-card border-l border-line z-50 overflow-y-auto p-4 flex flex-col justify-between"
            aria-label="Mobile navigation"
          >
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider px-2 pb-2">
                {isStudent ? 'Student: Amira Ben Salah' : 'Employer: Carthage & Co.'}
              </div>
              {navItems.map((item) => {
                const isActive =
                  item.href === '/student' || item.href === '/employer'
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-accent/10 text-accent font-semibold border border-accent/20'
                        : 'text-ink-muted hover:text-ink hover:bg-surface-muted'
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 border-t border-line space-y-2">
              <button
                onClick={() => {
                  handleRoleToggle();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-ink bg-surface border border-line"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-accent" />
                <span>Switch to {isStudent ? 'Employer' : 'Student'}</span>
              </button>
              <button
                onClick={() => {
                  handleReset();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </nav>
        </>
      )}

      {/* Floating Presenter Controls */}
      <DemoControls />
    </>
  );
}
