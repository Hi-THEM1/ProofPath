'use client';

import Link from 'next/link';
import { Shield, Search, FileText, Briefcase, ArrowRight, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Compact header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Shield className="w-4 h-4 text-ink-inverse" strokeWidth={2} />
            </div>
            <span className="font-semibold text-ink text-[0.9375rem] tracking-tight">
              ProofPath
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/student" className="btn btn-secondary btn-sm">
              Student view
            </Link>
            <Link href="/employer" className="btn btn-primary btn-sm">
              Employer view
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — editorial, concise */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
          <p className="text-ink-tertiary text-sm font-medium mb-3 tracking-wide">
            A skill passport for students and graduates
          </p>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-[2.75rem] font-semibold leading-[1.15] tracking-tight max-w-2xl">
            Show employers what you can do,<br className="hidden sm:block" /> not just what you studied.
          </h1>
          <p className="mt-5 text-ink-secondary text-base sm:text-lg max-w-xl leading-relaxed">
            ProofPath connects job applications with inspectable evidence — the work you submitted, the skills assessed, how it was reviewed, and the result.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/student" className="btn btn-primary btn-lg">
              Explore as a student
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
            <Link href="/employer" className="btn btn-secondary btn-lg">
              Explore as an employer
            </Link>
          </div>
        </section>

        {/* How it works — three columns */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card">
              <div className="w-9 h-9 rounded-md bg-primary-light flex items-center justify-center mb-3">
                <Search className="w-[18px] h-[18px] text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold mb-1">Find opportunities</h3>
              <p className="text-ink-secondary text-[0.8125rem] leading-relaxed">
                Search internships and jobs. See exactly which skills are required and which your evidence already covers.
              </p>
            </div>
            <div className="card">
              <div className="w-9 h-9 rounded-md bg-primary-light flex items-center justify-center mb-3">
                <FileText className="w-[18px] h-[18px] text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold mb-1">Build a skill passport</h3>
              <p className="text-ink-secondary text-[0.8125rem] leading-relaxed">
                Each piece of evidence records the specific skill, the task, how it was reviewed, and the criteria met. Not a score — inspectable detail.
              </p>
            </div>
            <div className="card">
              <div className="w-9 h-9 rounded-md bg-primary-light flex items-center justify-center mb-3">
                <Briefcase className="w-[18px] h-[18px] text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold mb-1">Apply with evidence</h3>
              <p className="text-ink-secondary text-[0.8125rem] leading-relaxed">
                Choose which evidence to share with each application. Employers see the work behind your claims.
              </p>
            </div>
          </div>
        </section>

        {/* For employers */}
        <section className="border-t border-border bg-surface">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="max-w-lg">
              <div className="w-9 h-9 rounded-md bg-accent-light flex items-center justify-center mb-3">
                <Users className="w-[18px] h-[18px] text-accent" strokeWidth={1.75} />
              </div>
              <h2 className="font-[family-name:var(--font-serif)] text-xl sm:text-2xl font-semibold tracking-tight mb-3">
                For employers
              </h2>
              <p className="text-ink-secondary text-[0.8125rem] leading-relaxed mb-4">
                Publish opportunities with clear skill requirements. Review applications alongside the candidate&apos;s submitted work and criterion-level feedback. Discover candidates who have opted into being found.
              </p>
              <Link href="/employer" className="btn btn-secondary btn-sm">
                Explore employer view
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </section>

        {/* Demo notice */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="card bg-amber-bg border-amber/30">
            <p className="text-sm text-amber">
              <strong>This is a functional demo</strong> built for an idea and pitching competition.
              All companies, candidates, and results are fictional. Data is stored locally in your browser
              and can be reset at any time from the sidebar.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.75rem] text-ink-tertiary">
          <span>ProofPath — Demo for pitching competition</span>
          <span>All companies and data are fictional</span>
        </div>
      </footer>
    </div>
  );
}
