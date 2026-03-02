'use client';

import { useState, useEffect } from 'react';
import { Settings, History, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SystemPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string | null;
  agentName: string;
}

interface AgentDetail {
  id: string;
  name: string;
  systemPrompt: string | null;
  model: string;
}

export function SystemPromptDialog({
  open,
  onOpenChange,
  agentId,
  agentName,
}: SystemPromptDialogProps) {
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch agent details
  const { data: agentData, isLoading } = useQuery({
    queryKey: ['agent-detail', agentId],
    queryFn: async () => {
      if (!agentId) return null;
      const response = await api.get<{ data: AgentDetail }>(
        `/api/agent-portal/agents/${agentId}/detail`
      );
      return response.data;
    },
    enabled: open && !!agentId,
  });

  // Update edited prompt when agent data loads
  useEffect(() => {
    if (agentData?.systemPrompt) {
      setEditedPrompt(agentData.systemPrompt);
    } else {
      setEditedPrompt('');
    }
  }, [agentData]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (newPrompt: string) => {
      if (!agentId) throw new Error('No agent selected');
      await api.put(`/api/agent-portal/agents/${agentId}`, {
        systemPrompt: newPrompt,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-detail', agentId] });
      setIsEditing(false);
      alert('System prompt updated successfully');
    },
    onError: (error: any) => {
      console.error('Save failed:', error);
      alert('Failed to save system prompt. ' + (error.response?.data?.message || error.message));
    },
  });

  const handleSave = () => {
    if (editedPrompt.trim()) {
      saveMutation.mutate(editedPrompt.trim());
    }
  };

  const handleCancel = () => {
    setEditedPrompt(agentData?.systemPrompt || '');
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <DialogTitle>System Prompt: {agentName}</DialogTitle>
          </div>
          <DialogDescription>
            View and edit the system prompt for this agent. Changes will apply to all future conversations.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-r-transparent" />
          </div>
        )}

        {!isLoading && agentData && (
          <div className="flex-1 min-h-0 space-y-4">
            {/* Model Info */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Model:</span>
              <Badge variant="outline">{agentData.model}</Badge>
            </div>

            {/* Prompt Editor */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                    placeholder="Enter system prompt..."
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={saveMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saveMutation.isPending || !editedPrompt.trim()}
                    >
                      {saveMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-r-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <ScrollArea className="h-[300px] rounded-lg border bg-muted/30 p-4">
                    <pre className="font-mono text-sm whitespace-pre-wrap">
                      {agentData.systemPrompt || '(No system prompt configured)'}
                    </pre>
                  </ScrollArea>
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      Edit Prompt
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Note */}
            <div className="text-xs text-muted-foreground border-t pt-3">
              <p>
                <strong>Note:</strong> System prompts define how the agent behaves. Changes apply immediately to new conversations.
                Test your changes in a new conversation before using in production.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
