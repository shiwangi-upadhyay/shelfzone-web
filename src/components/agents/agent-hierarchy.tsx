'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Crown, Loader2, GitBranch } from 'lucide-react';

interface SubAgent {
  id: string;
  name: string;
  slug: string;
  model: string;
  description: string | null;
  status: string;
  type: string;
  role: string;
}

interface MasterAgent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  model: string;
  status: string;
  role: string;
  creator: { id: string; email: string };
  children: SubAgent[];
}

export function AgentHierarchy() {
  const { data, isLoading } = useQuery({
    queryKey: ['agent-hierarchy'],
    queryFn: () => api.get<{ data: MasterAgent[] }>('/api/agent-portal/agents/hierarchy'),
  });

  const hierarchy = (data as any)?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (hierarchy.length === 0) {
    return (
      <div className="text-center py-12">
        <Bot className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <p className="mt-4 text-muted-foreground">No agents configured.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {hierarchy.map((master: MasterAgent) => (
        <div key={master.id} className="relative">
          {/* Owner label */}
          <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <span className="font-medium">Shiwangi Upadhyay</span>
            <Badge variant="outline" className="text-xs">Owner / Super Admin</Badge>
          </div>

          {/* Connecting line from owner to master */}
          <div className="ml-4 border-l-2 border-muted-foreground/20 pl-6 pb-2">
            {/* Master agent card */}
            <div className="relative">
              <div className="absolute -left-[31px] top-4 w-6 h-px bg-muted-foreground/20" />
              <Link href={`/dashboard/agents/${master.id}`}>
                <Card className="border-2 border-primary/40 hover:border-primary/60 transition-colors bg-primary/5 max-w-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Crown className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{master.name}</span>
                          <Badge variant="default" className="text-xs">Master Agent</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{master.description}</p>
                        <p className="text-xs font-mono text-muted-foreground/70 mt-1">{master.model}</p>
                      </div>
                      <Badge variant={master.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {master.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Sub-agents */}
            {master.children.length > 0 && (
              <div className="ml-8 mt-2 border-l-2 border-muted-foreground/15 pl-6 space-y-2">
                {master.children.map((child, idx) => (
                  <div key={child.id} className="relative">
                    <div className="absolute -left-[31px] top-4 w-6 h-px bg-muted-foreground/15" />
                    {/* Last item connector */}
                    {idx === master.children.length - 1 && (
                      <div className="absolute -left-[31px] top-4 bottom-0 w-px bg-background" />
                    )}
                    <Link href={`/dashboard/agents/${child.id}`}>
                      <Card className="hover:border-muted-foreground/40 transition-colors max-w-lg">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                              <Bot className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{child.name}</span>
                                <span className="text-xs text-muted-foreground">— {child.description}</span>
                              </div>
                              <p className="text-xs font-mono text-muted-foreground/70">{child.model}</p>
                            </div>
                            <Badge variant={child.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                              {child.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
