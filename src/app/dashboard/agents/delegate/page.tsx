'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDelegation, Delegation } from '@/hooks/use-delegation';
import { DelegationCard } from '@/components/command-center/delegation-card';
import { useApiKeyStatus } from '@/hooks/use-api-key';

export default function DelegationTestPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [delegations, setDelegations] = useState<Delegation[]>([]);

  const { sendWithDelegation, isLoading, error } = useDelegation();
  const { data: keyStatus } = useApiKeyStatus();

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    // Clear previous results
    setResponse('');
    setDelegations([]);

    // Send message with delegation support
    const result = await sendWithDelegation(
      'SHIWANGI', // Hardcoded for now
      null,
      message
    );

    if (result) {
      setResponse(result.message);
      setDelegations(result.delegations || []);
    }

    setMessage('');
  };

  if (!keyStatus?.hasKey) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            No Anthropic API key configured
          </p>
          <Button onClick={() => router.push('/dashboard/settings/api-keys')}>
            Configure API Key
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Phase 3: Real Multi-Agent Delegation</h1>
        <p className="text-sm text-muted-foreground">
          Test SHIWANGI delegating tasks to sub-agents via REAL Anthropic API calls
        </p>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {/* Delegation Cards */}
        {delegations.map((delegation, idx) => (
          <DelegationCard
            key={idx}
            agentName={delegation.agentName}
            instruction={delegation.instruction}
            reason={delegation.reason}
            status="complete"
          />
        ))}

        {/* Final Response */}
        {response && (
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-semibold mb-2 text-primary">
              SHIWANGI Response:
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {response}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Try: Build a new API endpoint for user profiles"
          className="min-h-[80px] resize-none"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !message.trim()}
          size="icon"
          className="h-[80px] w-[80px]"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 rounded-lg border bg-muted/50">
        <p className="text-xs text-muted-foreground">
          <strong>Test Instructions:</strong> SHIWANGI will analyze your request and delegate to appropriate sub-agents.
          Try asking for backend work, frontend components, database changes, tests, or documentation.
        </p>
      </div>
    </div>
  );
}
