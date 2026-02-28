'use client';

import { cn } from '@/lib/utils';

const AGENT_EMOJI: Record<string, string> = {
  SHIWANGI: '🏗️', BackendForge: '⚙️', DataArchitect: '🗄️',
  ShieldOps: '🛡️', PortalEngine: '🖥️', UIcraft: '🎨',
  TestRunner: '🧪', DocSmith: '📝',
};

const MODEL_LABELS: Record<string, string> = {
  'claude-opus-4-6': 'Opus 4.6',
  'claude-sonnet-4': 'Sonnet 4',
  'claude-haiku-4-5': 'Haiku 4.5',
};

function StatusDot({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const color = status === 'ACTIVE' || status === 'active'
    ? 'bg-emerald-500'
    : status === 'IDLE' || status === 'idle'
    ? 'bg-amber-400'
    : 'bg-red-500';
  const sizeClass = size === 'md' ? 'h-2.5 w-2.5' : 'h-2 w-2';
  return <span className={cn('inline-block rounded-full shrink-0', color, sizeClass)} />;
}

interface AgentBadgeProps {
  name: string;
  status: string;
  cost: number;
  model?: string;
  onClick?: () => void;
  compact?: boolean;
}

function AgentBadge({ name, status, cost, model, onClick, compact }: AgentBadgeProps) {
  const modelLabel = model ? MODEL_LABELS[model] || model : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card',
        'px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/60 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      )}
    >
      <span className="text-sm">{AGENT_EMOJI[name] || '🤖'}</span>
      <span className="font-medium text-foreground">{name}</span>
      <StatusDot status={status} />
      {modelLabel && !compact && (
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
          {modelLabel}
        </span>
      )}
      <span className="text-muted-foreground font-mono text-[11px]">
        ${Number(cost).toFixed(2)}
      </span>
    </button>
  );
}

export { AgentBadge, StatusDot, AGENT_EMOJI, MODEL_LABELS };
