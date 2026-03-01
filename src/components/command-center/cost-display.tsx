'use client';

import { DollarSign } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface CostData {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
}

export interface ConversationCostData {
  lastMessage?: CostData;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  messageCount: number;
}

interface CostDisplayProps {
  conversationCost: ConversationCostData | null;
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

function formatTokens(count: number): string {
  return count.toLocaleString();
}

function getCostColor(cost: number): string {
  if (cost < 0.10) return 'text-green-600 dark:text-green-400';
  if (cost < 1.00) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function CostDisplay({ conversationCost }: CostDisplayProps) {
  if (!conversationCost || conversationCost.totalCost === 0) {
    return null;
  }

  const { lastMessage, totalInputTokens, totalOutputTokens, totalCost, messageCount } = conversationCost;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-help transition-colors hover:bg-slate-200 dark:hover:bg-slate-800">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className={cn(
              "text-xs font-mono font-medium tabular-nums",
              getCostColor(totalCost)
            )}>
              {formatCost(totalCost)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="p-0 w-80 border-slate-200 dark:border-slate-800"
          sideOffset={8}
        >
          <div className="space-y-3 p-4">
            {/* Last Message Section */}
            {lastMessage && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <h4 className="text-xs font-semibold text-foreground">Last Message</h4>
                </div>
                <div className="space-y-1 pl-3.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Input:</span>
                    <span className="font-mono text-foreground">
                      {formatTokens(lastMessage.inputTokens)} tokens 
                      <span className="text-muted-foreground ml-1">
                        ({formatCost((lastMessage.inputTokens / 1_000_000) * 3.00)})
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Output:</span>
                    <span className="font-mono text-foreground">
                      {formatTokens(lastMessage.outputTokens)} tokens 
                      <span className="text-muted-foreground ml-1">
                        ({formatCost((lastMessage.outputTokens / 1_000_000) * 15.00)})
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-medium text-foreground">Total:</span>
                    <span className={cn(
                      "font-mono font-semibold",
                      getCostColor(lastMessage.totalCost)
                    )}>
                      {formatCost(lastMessage.totalCost)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Total Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                <h4 className="text-xs font-semibold text-foreground">This Conversation</h4>
              </div>
              <div className="space-y-1 pl-3.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Total Messages:</span>
                  <span className="font-mono text-foreground">{messageCount}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Total Tokens:</span>
                  <span className="font-mono text-foreground">
                    {formatTokens(totalInputTokens + totalOutputTokens)}
                    <span className="text-muted-foreground text-[10px] ml-1">
                      (in: {formatTokens(totalInputTokens)} / out: {formatTokens(totalOutputTokens)})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-medium text-foreground">Total Cost:</span>
                  <span className={cn(
                    "font-mono font-semibold",
                    getCostColor(totalCost)
                  )}>
                    {formatCost(totalCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="text-[10px] text-muted-foreground italic pt-2 border-t border-slate-200 dark:border-slate-800">
              Pricing: $3.00/M input tokens • $15.00/M output tokens
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
