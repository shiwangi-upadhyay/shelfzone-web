'use client';

import { AgentMap } from '@/components/agent-trace/agent-map';

export default function AgentTracePage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold tracking-tight">Agent Trace</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Monitor AI agents across the organization</p>
      </div>
      <AgentMap />
    </div>
  );
}
