'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, Trash2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApiKeyStatus, useSetApiKey, useDeleteApiKey } from '@/hooks/use-api-key';
import { toast } from 'sonner';

export default function ApiKeysSettingsPage() {
  const { data: status, isLoading } = useApiKeyStatus();
  const setKey = useSetApiKey();
  const deleteKey = useDeleteApiKey();

  const [inputValue, setInputValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    const val = inputValue.trim();
    if (!val) return;
    setKey.mutate(val, {
      onSuccess: () => {
        toast.success('API key saved and verified.');
        setInputValue('');
        setIsEditing(false);
      },
      onError: (err: any) => {
        toast.error(err?.message || 'Invalid API key. Please check and try again.');
      },
    });
  };

  const handleDelete = () => {
    deleteKey.mutate(undefined, {
      onSuccess: () => {
        toast.success('API key removed.');
        setShowDeleteConfirm(false);
      },
      onError: () => toast.error('Failed to remove API key.'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-r-transparent" />
      </div>
    );
  }

  const hasKey = status?.hasKey ?? false;
  const showInput = !hasKey || isEditing;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API Key Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your Anthropic API key to use the Command Center and interact with your AI agents.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-xl border bg-card">
        {hasKey && !isEditing ? (
          /* Key is set — show status */
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <KeyRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Anthropic API Key</p>
                  <p className="font-mono text-xs text-muted-foreground">{status?.keyPrefix || 'sk-ant-•••'}</p>
                </div>
              </div>
              {status?.isValid ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> Valid
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/40 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300">
                  <XCircle className="h-3 w-3" /> Invalid
                </span>
              )}
            </div>

            {status?.lastVerified && (
              <p className="text-xs text-muted-foreground">
                Last verified: {new Date(status.lastVerified).toLocaleString()}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Update Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove Key
              </Button>
            </div>
          </div>
        ) : (
          /* No key or editing — show input */
          <div className="p-6 space-y-5">
            {!hasKey && (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Lock className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">No API key configured</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  Add your Anthropic API key to start using the Command Center.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="sk-ant-api03-..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pr-10 font-mono text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!inputValue.trim() || setKey.isPending} size="sm">
                {setKey.isPending ? 'Verifying…' : 'Save & Verify'}
              </Button>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setInputValue(''); }}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold">Remove API Key?</h3>
            <p className="text-xs text-muted-foreground">
              This will remove your Anthropic API key. You won&apos;t be able to use the Command Center until you add a new key.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteKey.isPending}
              >
                {deleteKey.isPending ? 'Removing…' : 'Remove'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
