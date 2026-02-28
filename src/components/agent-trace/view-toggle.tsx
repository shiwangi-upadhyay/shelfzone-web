'use client';

import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'org' | 'agent';
  onChange: (view: 'org' | 'agent') => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
      {(['org', 'agent'] as const).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            'px-3.5 py-1.5 text-xs font-medium rounded-md transition-all',
            view === v
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {v === 'org' ? 'Org View' : 'Agent View'}
        </button>
      ))}
    </div>
  );
}
