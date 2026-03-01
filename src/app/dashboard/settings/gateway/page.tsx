'use client';

import { useState } from 'react';
import {
  Key,
  Copy,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  useGatewayKeyStatus,
  useCreateGatewayKey,
  useRegenerateGatewayKey,
  useTestGatewayConnection,
} from '@/hooks/use-gateway-key';
import { toast } from 'sonner';

const GATEWAY_URL = 'http://157.10.98.227:3001/api/gateway/v1';

export default function GatewaySettingsPage() {
  const { data: status, isLoading } = useGatewayKeyStatus();
  const createKey = useCreateGatewayKey();
  const regenerateKey = useRegenerateGatewayKey();
  const testConnection = useTestGatewayConnection();

  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showFullKey, setShowFullKey] = useState(false);
  const [cliOpen, setCliOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);

  const handleGenerateKey = () => {
    createKey.mutate(undefined, {
      onSuccess: (response: any) => {
        const fullKey = response?.data?.fullKey || response?.fullKey;
        setNewlyGeneratedKey(fullKey);
        toast.success('Gateway API key generated successfully!');
      },
      onError: (err: any) => {
        toast.error(err?.message || 'Failed to generate key.');
      },
    });
  };

  const handleRegenerateKey = () => {
    regenerateKey.mutate(undefined, {
      onSuccess: (response: any) => {
        const fullKey = response?.data?.fullKey || response?.fullKey;
        setNewlyGeneratedKey(fullKey);
        setShowRegenerateConfirm(false);
        toast.success('Gateway API key regenerated successfully!');
      },
      onError: (err: any) => {
        toast.error(err?.message || 'Failed to regenerate key.');
        setShowRegenerateConfirm(false);
      },
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard!');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(GATEWAY_URL);
    toast.success('Gateway URL copied to clipboard!');
  };

  const handleCopyCliCommands = () => {
    const key = newlyGeneratedKey || status?.fullKey || '{your-api-key}';
    const commands = `openclaw config set providers.shelfzone.apiKey "${key}"
openclaw config set providers.shelfzone.baseUrl "${GATEWAY_URL}"`;
    navigator.clipboard.writeText(commands);
    toast.success('CLI commands copied to clipboard!');
  };

  const handleCopyJsonConfig = () => {
    const key = newlyGeneratedKey || status?.fullKey || '{your-api-key}';
    const config = {
      models: {
        providers: {
          shelfzone: {
            baseUrl: GATEWAY_URL,
            apiKey: key,
            api: 'anthropic-messages',
          },
        },
      },
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast.success('JSON config copied to clipboard!');
  };

  const handleTestConnection = () => {
    testConnection.mutate(undefined, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success(
            `✓ Connection successful! (Latency: ${response.latencyMs}ms)`
          );
        } else {
          toast.error(`✗ Connection failed: ${response.error || 'Unknown error'}`);
        }
      },
      onError: (err: any) => {
        toast.error(`✗ Connection failed: ${err?.message || 'Unknown error'}`);
      },
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
  const displayKey = newlyGeneratedKey || status?.fullKey || status?.keyPrefix || '';
  const maskedKey = displayKey.includes('...')
    ? displayKey
    : displayKey
    ? `${displayKey.slice(0, 15)}...${displayKey.slice(-4)}`
    : 'No key generated';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gateway Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your ShelfZone Gateway API key to connect OpenClaw and other tools.
        </p>
      </div>

      {/* Gateway API Key */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Gateway API Key</p>
              {hasKey || newlyGeneratedKey ? (
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs text-muted-foreground">
                    {(showFullKey && displayKey) || maskedKey}
                  </p>
                  {displayKey && (
                    <button
                      onClick={() => setShowFullKey(!showFullKey)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showFullKey ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No key generated</p>
              )}
            </div>
          </div>
        </div>

        {newlyGeneratedKey && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
              ⚠️ Save this key now! You won't be able to see it again.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {hasKey || newlyGeneratedKey ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyKey(displayKey)}
                disabled={!displayKey}
              >
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRegenerateConfirm(true)}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Regenerate
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={handleGenerateKey} disabled={createKey.isPending}>
              {createKey.isPending ? 'Generating...' : 'Generate Key'}
            </Button>
          )}
        </div>
      </Card>

      {/* Connection Status */}
      {hasKey && (
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">Connection Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                {status?.status === 'active' ? (
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" /> Inactive
                  </Badge>
                )}
              </div>

              {status?.lastSeen && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Last Seen</span>
                  <span className="text-xs">
                    {new Date(status.lastSeen).toLocaleString()}
                  </span>
                </div>
              )}

              {status?.callsToday !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Calls Today</span>
                  <span className="text-xs font-mono">{status.callsToday}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Gateway URL */}
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-3">Gateway URL</h3>
          <div className="flex items-center gap-2">
            <Input
              value={GATEWAY_URL}
              readOnly
              className="font-mono text-xs flex-1"
            />
            <Button variant="outline" size="sm" onClick={handleCopyUrl}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Setup Instructions */}
      {(hasKey || newlyGeneratedKey) && (
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Setup Instructions</h3>

          {/* CLI Commands */}
          <Collapsible open={cliOpen} onOpenChange={setCliOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full text-left hover:bg-muted/50 p-3 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  {cliOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">CLI Commands</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCliCommands();
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto font-mono">
                <code>
                  {`openclaw config set providers.shelfzone.apiKey "${displayKey || '{your-api-key}'}"\nopenclaw config set providers.shelfzone.baseUrl "${GATEWAY_URL}"`}
                </code>
              </pre>
            </CollapsibleContent>
          </Collapsible>

          {/* JSON Config */}
          <Collapsible open={jsonOpen} onOpenChange={setJsonOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full text-left hover:bg-muted/50 p-3 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  {jsonOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">JSON Config</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyJsonConfig();
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto font-mono">
                <code>
                  {JSON.stringify(
                    {
                      models: {
                        providers: {
                          shelfzone: {
                            baseUrl: GATEWAY_URL,
                            apiKey: displayKey || '{your-api-key}',
                            api: 'anthropic-messages',
                          },
                        },
                      },
                    },
                    null,
                    2
                  )}
                </code>
              </pre>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Test Connection */}
      {hasKey && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Test Connection</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Verify that your gateway is accessible
              </p>
            </div>
            <Button
              onClick={handleTestConnection}
              disabled={testConnection.isPending}
              size="sm"
            >
              <Zap className="h-3.5 w-3.5 mr-1" />
              {testConnection.isPending ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </Card>
      )}

      {/* Regenerate confirmation dialog */}
      {showRegenerateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold">Regenerate API Key?</h3>
            <p className="text-xs text-muted-foreground">
              This will invalidate your current key. Any integrations using the old
              key will stop working until you update them with the new key.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRegenerateConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRegenerateKey}
                disabled={regenerateKey.isPending}
              >
                {regenerateKey.isPending ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
