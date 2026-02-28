'use client';

import { AgentMap } from '@/components/agent-trace/agent-map';

export default function AgentTracePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🔍 Agent Trace</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor your AI agents across the organization</p>
      </div>
      <AgentMap />
    </div>
  );
}
