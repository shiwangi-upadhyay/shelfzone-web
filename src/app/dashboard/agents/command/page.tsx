'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentSidebar } from '@/components/command-center/agent-sidebar';
import { ChatPanel } from '@/components/command-center/chat-panel';
import { TaskBoard } from '@/components/command-center/task-board';
import { useInstruct, useTraceStream } from '@/hooks/use-command-center';
import { useApiKeyStatus } from '@/hooks/use-api-key';
import { ApiError } from '@/lib/api';
import type { StreamMessage } from '@/hooks/use-command-center';

export default function CommandCenterPage() {
  const router = useRouter();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const { data: keyStatus, isLoading: keyLoading } = useApiKeyStatus();
  const instruct = useInstruct(selectedAgentId);
  const { events, totalCost, isCompleted, tasks, reset } = useTraceStream(traceId);

  const hasValidKey = keyStatus?.hasKey && keyStatus?.isValid;

  const handleSend = useCallback(
    (instruction: string) => {
      if (!selectedAgentId || !hasValidKey) return;

      const userMsg: StreamMessage = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        role: 'user',
        content: instruction,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setApiKeyError(null);
      reset();

      instruct.mutate(instruction, {
        onSuccess: (data) => {
          setTraceId(data.traceId);
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 403) {
            setApiKeyError('Your API key is invalid or expired. Please update it in settings.');
          }
        },
      });
    },
    [selectedAgentId, hasValidKey, instruct, reset]
  );

  // Loading state
  if (keyLoading) {
    return (
      <div className="flex h-[calc(100vh-7rem)] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-r-transparent" />
      </div>
    );
  }

  // Gate: no valid key
  if (!hasValidKey) {
    return (
      <div className="flex h-[calc(100vh-7rem)] items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">Set your Anthropic API key to start using your agents</h2>
          <p className="text-sm text-muted-foreground">
            The Command Center uses your personal API key to interact with AI agents. Your key is encrypted and never shared.
          </p>
          <Button onClick={() => router.push('/dashboard/settings/api-keys')}>
            Go to API Key Settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] rounded-xl border bg-background overflow-hidden relative">
      {apiKeyError && (
        <div className="absolute top-0 inset-x-0 z-10 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-300 text-center">
          {apiKeyError}{' '}
          <button
            onClick={() => router.push('/dashboard/settings/api-keys')}
            className="underline font-medium hover:text-red-900 dark:hover:text-red-100"
          >
            Update settings
          </button>
        </div>
      )}

      <AgentSidebar selectedAgentId={selectedAgentId} onSelectAgent={setSelectedAgentId} />

      <ChatPanel
        messages={messages}
        events={events}
        totalCost={totalCost}
        isCompleted={isCompleted}
        isLoading={instruct.isPending || (!!traceId && !isCompleted)}
        onSend={handleSend}
        disabled={!selectedAgentId || !!apiKeyError}
      />

      <TaskBoard tasks={tasks} />
    </div>
  );
}
