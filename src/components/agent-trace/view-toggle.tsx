'use client';

import { Button } from '@/components/ui/button';

interface ViewToggleProps {
  view: 'org' | 'agent';
  onChange: (view: 'org' | 'agent') => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted p-1">
      <Button
        variant={view === 'org' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('org')}
        className="text-xs"
      >
        👥 Org View
      </Button>
      <Button
        variant={view === 'agent' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('agent')}
        className="text-xs"
      >
        🤖 Agent View
      </Button>
    </div>
  );
}
