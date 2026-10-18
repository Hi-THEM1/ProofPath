import { Suspense } from 'react';
import AppNavigation from '@/components/AppNavigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AppNavigation />
      </Suspense>
      {/* Desktop: offset by sidebar width. Mobile: offset by top bar height */}
      <main className="md:ml-sidebar pt-14 md:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
          <Suspense fallback={<div className="p-8 text-sm text-ink-muted">Loading...</div>}>
            {children}
          </Suspense>
        </div>
      </main>
    </>
  );
}

