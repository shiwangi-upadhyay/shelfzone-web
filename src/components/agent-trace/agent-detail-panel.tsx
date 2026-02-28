'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AGENT_EMOJI, StatusDot } from './agent-badge';
import { ConversationTab } from './conversation-tab';
import { CostTab } from './cost-tab';
import { RawLogsTab } from './raw-logs-tab';

interface AgentDetailPanelProps {
  open: boolean;
  onClose: () => void;
  agentName: string;
  agentId: string | null;
  sessionId: string | null;
  status?: string;
}

export function AgentDetailPanel({ open, onClose, agentName, agentId, sessionId, status }: AgentDetailPanelProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:w-[600px] sm:max-w-[600px] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <span className="text-xl">{AGENT_EMOJI[agentName] || '🤖'}</span>
            <span>{agentName}</span>
            {status && <StatusDot status={status} />}
          </SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="conversation" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="conversation">💬 Conversation</TabsTrigger>
            <TabsTrigger value="cost">📊 Cost & Usage</TabsTrigger>
            <TabsTrigger value="logs">📋 Raw Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="conversation" className="flex-1 overflow-hidden">
            <ConversationTab sessionId={sessionId} />
          </TabsContent>
          <TabsContent value="cost" className="flex-1 overflow-hidden">
            <CostTab agentId={agentId} />
          </TabsContent>
          <TabsContent value="logs" className="flex-1 overflow-hidden">
            <RawLogsTab sessionId={sessionId} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
