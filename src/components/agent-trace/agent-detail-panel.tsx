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
      <SheetContent className="w-full sm:w-[560px] sm:max-w-[560px] p-0 flex flex-col border-l border-border/60">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/40">
          <SheetTitle className="flex items-center gap-2.5 text-base">
            <span className="text-lg">{AGENT_EMOJI[agentName] || '🤖'}</span>
            <span className="font-semibold">{agentName}</span>
            {status && <StatusDot status={status} size="md" />}
          </SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="conversation" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-2 bg-muted/40 h-8">
            <TabsTrigger value="conversation" className="text-xs h-7 data-[state=active]:shadow-sm">
              Conversation
            </TabsTrigger>
            <TabsTrigger value="cost" className="text-xs h-7 data-[state=active]:shadow-sm">
              Cost & Usage
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs h-7 data-[state=active]:shadow-sm">
              Raw Logs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="conversation" className="flex-1 overflow-hidden mt-0">
            <ConversationTab sessionId={sessionId} />
          </TabsContent>
          <TabsContent value="cost" className="flex-1 overflow-hidden mt-0">
            <CostTab agentId={agentId} />
          </TabsContent>
          <TabsContent value="logs" className="flex-1 overflow-hidden mt-0">
            <RawLogsTab sessionId={sessionId} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
