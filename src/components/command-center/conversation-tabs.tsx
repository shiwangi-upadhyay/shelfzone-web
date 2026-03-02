'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Edit2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useConversationTabs,
  useCreateTab,
  useUpdateTab,
  useDeleteTab,
} from '@/hooks/use-conversation-tabs';
import { cn } from '@/lib/utils';

interface ConversationTabsProps {
  onTabChange?: (tabId: string) => void;
}

export function ConversationTabs({ onTabChange }: ConversationTabsProps) {
  const { data: tabs, isLoading } = useConversationTabs();
  const createTab = useCreateTab();
  const updateTab = useUpdateTab();
  const deleteTab = useDeleteTab();

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const activeTab = tabs?.find((t: any) => t.isActive);

  const handleCreateTab = () => {
    if (tabs && tabs.length >= 5) {
      alert('Maximum 5 tabs allowed');
      return;
    }
    createTab.mutate({});
  };

  const handleSwitchTab = (tabId: string) => {
    if (activeTab?.id === tabId) return;

    updateTab.mutate(
      { id: tabId, data: { isActive: true } },
      {
        onSuccess: () => {
          onTabChange?.(tabId);
        },
      }
    );
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs && tabs.length === 1) {
      alert('Cannot close the last tab');
      return;
    }
    if (confirm('Close this tab?')) {
      deleteTab.mutate(tabId);
    }
  };

  const handleStartEdit = (tab: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setEditingTitle(tab.title);
  };

  const handleSaveEdit = (tabId: string) => {
    if (editingTitle.trim()) {
      updateTab.mutate(
        { id: tabId, data: { title: editingTitle.trim() } },
        {
          onSuccess: () => {
            setEditingTabId(null);
            setEditingTitle('');
          },
        }
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingTabId(null);
    setEditingTitle('');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isTyping) return;

      // Ctrl+N: New tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateTab();
        return;
      }

      // Ctrl+W: Close current tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (activeTab && tabs && tabs.length > 1) {
          if (confirm('Close this tab?')) {
            deleteTab.mutate(activeTab.id);
          }
        }
        return;
      }

      // Ctrl+1/2/3: Switch to tab by index
      if ((e.ctrlKey || e.metaKey) && /^[1-5]$/.test(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (tabs && tabs[index]) {
          handleSwitchTab(tabs[index].id);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTab, deleteTab]);

  if (isLoading) {
    return (
      <div className="border-b border-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="h-8 w-32 animate-pulse bg-muted rounded" />
          <div className="h-8 w-32 animate-pulse bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto">
        {tabs?.map((tab: any) => (
          <div
            key={tab.id}
            className={cn(
              'group relative flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all',
              'hover:bg-accent',
              tab.isActive && 'bg-accent border border-border'
            )}
            onClick={() => handleSwitchTab(tab.id)}
          >
            <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />

            {editingTabId === tab.id ? (
              <Input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => handleSaveEdit(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit(tab.id);
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="h-6 w-32 px-2 text-sm"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm font-medium truncate max-w-[120px]">
                {tab.title}
              </span>
            )}

            <button
              className="opacity-0 group-hover:opacity-100 hover:text-primary"
              onClick={(e) => handleStartEdit(tab, e)}
            >
              <Edit2 className="h-3 w-3" />
            </button>

            <button
              className={cn(
                'hover:text-destructive transition-opacity',
                tabs.length === 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
              )}
              onClick={(e) => handleCloseTab(tab.id, e)}
              disabled={tabs.length === 1}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {(!tabs || tabs.length < 5) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleCreateTab}
            disabled={createTab.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {tabs && tabs.length >= 5 && (
          <span className="text-xs text-muted-foreground px-2">
            Max tabs reached
          </span>
        )}
      </div>
    </div>
  );
}
