'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAgentSessions } from '@/hooks/use-trace-sessions';
import { useSessionEvents } from '@/hooks/use-session-events';
import { useAgentStats, useAgentCostBreakdown } from '@/hooks/use-agent-stats';
import { ConversationStream } from './conversation-stream';
import { CostBreakdown } from './cost-breakdown';
import { RawLogViewer } from './raw-log-viewer';
import { LiveIndicator } from './live-indicator';

interface AgentDetailPanelProps {
  agentId: string | null;
  agentName?: string;
  agentEmoji?: string;
  model?: string;
  ownerName?: string;
  status?: 'active' | 'idle' | 'offline';
  onClose: () => void;
}

export function AgentDetailPanel({
  agentId,
  agentName,
  agentEmoji,
  model,
  ownerName,
  status = 'idle',
  onClose,
}: AgentDetailPanelProps) {
  const isOpen = !!agentId;

  // Fetch latest session for this agent
  const { data: sessionsData, isLoading: sessionsLoading } = useAgentSessions(
    agentId || '',
    { limit: 1 }
  );
  const latestSession = sessionsData?.[0];

  // Fetch events for the latest session
  const { data: eventsData, isLoading: eventsLoading } = useSessionEvents(
    latestSession?.id || ''
  );

  // Fetch stats and cost breakdown
  const { data: stats, isLoading: statsLoading } = useAgentStats(agentId || '');
  const { data: breakdown, isLoading: breakdownLoading } = useAgentCostBreakdown(
    agentId || ''
  );

  const isActive = status === 'active';

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            {agentEmoji && <span className="text-3xl">{agentEmoji}</span>}
            <div className="flex-1 min-w-0">
              <SheetTitle className="flex items-center gap-2">
                {agentName || 'Agent'}
                <LiveIndicator isLive={isActive} />
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {model && <span>{model}</span>}
                {ownerName && (
                  <>
                    <span>•</span>
                    <span>Owner: {ownerName}</span>
                  </>
                )}
              </div>
            </div>
            <Badge
              variant={
                status === 'active'
                  ? 'default'
                  : status === 'offline'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {status}
            </Badge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="conversation" className="mt-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="costs">Cost & Usage</TabsTrigger>
            <TabsTrigger value="logs">Raw Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="conversation" className="mt-4">
            <ConversationStream
              events={eventsData || []}
              isLoading={eventsLoading}
              emptyMessage="No conversation events yet"
            />
          </TabsContent>

          <TabsContent value="costs" className="mt-4">
            <CostBreakdown
              stats={stats}
              breakdown={breakdown}
              isLoading={statsLoading || breakdownLoading}
            />
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <RawLogViewer events={eventsData || []} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
