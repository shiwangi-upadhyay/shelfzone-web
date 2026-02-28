'use client';

import { useState, useCallback } from 'react';
import { AgentSidebar } from '@/components/command-center/agent-sidebar';
import { ChatPanel } from '@/components/command-center/chat-panel';
import { TaskBoard } from '@/components/command-center/task-board';
import { useInstruct, useTraceStream } from '@/hooks/use-command-center';
import type { StreamMessage } from '@/hooks/use-command-center';

export default function CommandCenterPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StreamMessage[]>([]);

  const instruct = useInstruct(selectedAgentId);
  const { events, totalCost, isCompleted, tasks, reset } = useTraceStream(traceId);

  const handleSend = useCallback(
    (instruction: string) => {
      console.log('[CommandCenter] handleSend called', { instruction, selectedAgentId, isPending: instruct.isPending });
      if (!selectedAgentId) {
        console.log('[CommandCenter] BLOCKED: no selectedAgentId');
        return;
      }

      // Add user message
      const userMsg: StreamMessage = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        role: 'user',
        content: instruction,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Reset stream state for new instruction
      reset();

      instruct.mutate(instruction, {
        onSuccess: (data) => {
          console.log('[CommandCenter] instruct success', data);
          setTraceId(data.traceId);
        },
        onError: (err) => {
          console.error('[CommandCenter] instruct ERROR', err);
        },
      });
    },
    [selectedAgentId, instruct, reset]
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] rounded-xl border bg-background overflow-hidden relative">
      {/* Left: Agent sidebar */}
      <AgentSidebar selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} />

      {/* Center: Chat */}
      <ChatPanel
        messages={messages}
        events={events}
        totalCost={totalCost}
        isCompleted={isCompleted}
        isLoading={instruct.isPending || (!!traceId && !isCompleted)}
        onSend={handleSend}
        disabled={!selectedAgentId}
      />

      {/* Right: Task board */}
      <TaskBoard tasks={tasks} />
    </div>
  );
}
