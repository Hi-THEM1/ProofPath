'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  serif?: boolean;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, serif, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
      <div>
        <h1
          className={`text-2xl font-semibold tracking-tight ${
            serif ? 'font-[family-name:var(--font-serif)]' : ''
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-ink-secondary text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
