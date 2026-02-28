'use client';

import { AGENT_EMOJI, StatusDot } from './agent-badge';

interface AgentNode {
  id: string;
  name: string;
  status: string;
  totalCost: number;
}

interface AgentTreeProps {
  agents: AgentNode[];
  onAgentClick: (agent: AgentNode) => void;
}

export function AgentTree({ agents, onAgentClick }: AgentTreeProps) {
  if (!agents.length) return null;

  // First agent is master, rest are sub-agents
  const master = agents[0];
  const subs = agents.slice(1);

  return (
    <div className="pl-4">
      {/* Master */}
      <button
        onClick={() => onAgentClick(master)}
        className="flex items-center gap-2 rounded-xl border-2 border-primary/30 bg-card p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-full text-left mb-2"
      >
        <span className="text-lg">{AGENT_EMOJI[master.name] || '🤖'}</span>
        <span className="font-semibold text-sm">{master.name}</span>
        <span className="text-xs text-muted-foreground">(Master)</span>
        <StatusDot status={master.status} />
        <span className="ml-auto text-xs font-medium font-mono">${Number(master.totalCost).toFixed(2)}</span>
      </button>

      {/* Sub-agents with tree lines */}
      <div className="ml-6">
        {subs.map((agent, i) => (
          <div
            key={agent.id}
            className="relative pl-6 pb-1"
            style={{ paddingTop: '2px' }}
          >
            {/* Vertical line */}
            <div
              className="absolute left-0 border-l-2 border-border"
              style={{ top: 0, bottom: i === subs.length - 1 ? '50%' : 0 }}
            />
            {/* Horizontal line */}
            <div
              className="absolute left-0 top-1/2 w-6 border-t-2 border-border"
              style={{ transform: 'translateY(-50%)' }}
            />
            <button
              onClick={() => onAgentClick(agent)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-full text-left"
            >
              <span>{AGENT_EMOJI[agent.name] || '🤖'}</span>
              <span className="font-medium text-sm">{agent.name}</span>
              <StatusDot status={agent.status} />
              <span className="ml-auto text-xs text-muted-foreground font-mono">${Number(agent.totalCost).toFixed(2)}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
