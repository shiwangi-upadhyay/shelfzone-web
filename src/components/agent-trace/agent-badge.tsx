'use client';

const AGENT_EMOJI: Record<string, string> = {
  SHIWANGI: '🏗️', BackendForge: '⚙️', DataArchitect: '🗄️',
  ShieldOps: '🛡️', PortalEngine: '🖥️', UIcraft: '🎨',
  TestRunner: '🧪', DocSmith: '📝',
};

interface AgentBadgeProps {
  name: string;
  status: string;
  cost: number;
  onClick?: () => void;
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'ACTIVE' ? 'bg-green-500' : status === 'IDLE' ? 'bg-yellow-500' : 'bg-red-500';
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export function AgentBadge({ name, status, cost, onClick }: AgentBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <span>{AGENT_EMOJI[name] || '🤖'}</span>
      <span>{name}</span>
      <StatusDot status={status} />
      <span className="text-muted-foreground">${Number(cost).toFixed(2)}</span>
    </button>
  );
}

export { StatusDot, AGENT_EMOJI };
