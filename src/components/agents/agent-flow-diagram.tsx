'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { Node, Edge } from 'reactflow';
import { MarkerType } from 'reactflow';

// Dynamic import to avoid SSR issues
const ReactFlow = dynamic(
  () => import('reactflow').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[700px] rounded-lg border border-border/60 bg-card flex items-center justify-center">
        <div className="text-muted-foreground">Loading Flow Diagram...</div>
      </div>
    ),
  }
);

const Background = dynamic(() => import('reactflow').then((mod) => mod.Background), { ssr: false });
const Controls = dynamic(() => import('reactflow').then((mod) => mod.Controls), { ssr: false });
const MiniMap = dynamic(() => import('reactflow').then((mod) => mod.MiniMap), { ssr: false });

interface AgentNodeData {
  emoji: string;
  name: string;
  model: string;
  role: string;
  description: string;
  isUser?: boolean;
  isMaster?: boolean;
}

// Custom agent node component
function AgentNode({ data }: { data: AgentNodeData }) {
  return (
    <div 
      className={`
        bg-card rounded-lg p-4 min-w-[220px] shadow-lg
        ${data.isUser ? 'border-2 border-blue-500' : ''}
        ${data.isMaster ? 'border-2 border-purple-500' : 'border-2 border-border/20'}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{data.emoji}</span>
        <div>
          <h3 className="font-bold text-sm">{data.name}</h3>
          <p className="text-[10px] text-muted-foreground font-mono">{data.model}</p>
        </div>
      </div>
      <p className="text-xs font-semibold text-primary mb-1">{data.role}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{data.description}</p>
    </div>
  );
}

const nodeTypes = { agent: AgentNode };

const agents = [
  {
    id: 'user',
    emoji: '👤',
    name: 'User (Boss)',
    model: 'human',
    role: 'Project Owner',
    description: 'Gives instructions, approves work',
    isUser: true,
  },
  {
    id: 'shiwangi',
    emoji: '🏗️',
    name: 'SHIWANGI',
    model: 'claude-sonnet-4-5',
    role: 'Master AI Architect',
    description: 'Delegates tasks, coordinates team, reports to Boss',
    isMaster: true,
  },
  {
    id: 'backendforge',
    emoji: '⚙️',
    name: 'BackendForge',
    model: 'claude-opus-4-6',
    role: 'Backend Developer',
    description: 'APIs, databases, server logic',
  },
  {
    id: 'uicraft',
    emoji: '🎨',
    name: 'UIcraft',
    model: 'claude-sonnet-4',
    role: 'Frontend Developer',
    description: 'React, UI components, styling',
  },
  {
    id: 'dataarchitect',
    emoji: '🗄️',
    name: 'DataArchitect',
    model: 'claude-opus-4-6',
    role: 'Database Architect',
    description: 'Schema design, migrations, data modeling',
  },
  {
    id: 'shieldops',
    emoji: '🛡️',
    name: 'ShieldOps',
    model: 'claude-opus-4-6',
    role: 'Security & DevOps',
    description: 'Security, deployment, infrastructure',
  },
  {
    id: 'portalengine',
    emoji: '🚀',
    name: 'PortalEngine',
    model: 'claude-opus-4-6',
    role: 'Agent Portal Developer',
    description: 'Agent management features',
  },
  {
    id: 'testrunner',
    emoji: '🧪',
    name: 'TestRunner',
    model: 'claude-sonnet-4',
    role: 'QA Engineer',
    description: 'Testing, verification, quality checks',
  },
  {
    id: 'docsmith',
    emoji: '📝',
    name: 'DocSmith',
    model: 'claude-haiku-4.5',
    role: 'Documentation Writer',
    description: 'Docs, logs, summaries',
  },
];

export function AgentFlowDiagram() {
  // Hierarchical layout: User -> SHIWANGI -> Sub-agents
  const nodes: Node[] = useMemo(() => [
    {
      id: 'user',
      type: 'agent',
      position: { x: 500, y: 0 },
      data: agents[0],
    },
    {
      id: 'shiwangi',
      type: 'agent',
      position: { x: 450, y: 180 },
      data: agents[1],
    },
    // Top row of sub-agents
    {
      id: 'backendforge',
      type: 'agent',
      position: { x: 50, y: 380 },
      data: agents[2],
    },
    {
      id: 'uicraft',
      type: 'agent',
      position: { x: 300, y: 380 },
      data: agents[3],
    },
    {
      id: 'dataarchitect',
      type: 'agent',
      position: { x: 550, y: 380 },
      data: agents[4],
    },
    {
      id: 'shieldops',
      type: 'agent',
      position: { x: 800, y: 380 },
      data: agents[5],
    },
    // Bottom row of sub-agents
    {
      id: 'portalengine',
      type: 'agent',
      position: { x: 175, y: 580 },
      data: agents[6],
    },
    {
      id: 'testrunner',
      type: 'agent',
      position: { x: 425, y: 580 },
      data: agents[7],
    },
    {
      id: 'docsmith',
      type: 'agent',
      position: { x: 675, y: 580 },
      data: agents[8],
    },
  ], []);

  const edges: Edge[] = useMemo(() => [
    // User -> SHIWANGI
    {
      id: 'user-shiwangi',
      source: 'user',
      target: 'shiwangi',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 3 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 },
      label: 'instruction',
      labelStyle: { fill: '#3b82f6', fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    // SHIWANGI -> Sub-agents (delegation)
    {
      id: 'shiwangi-backendforge',
      source: 'shiwangi',
      target: 'backendforge',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      label: 'delegate',
      labelStyle: { fill: '#8b5cf6', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    {
      id: 'shiwangi-uicraft',
      source: 'shiwangi',
      target: 'uicraft',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      label: 'delegate',
      labelStyle: { fill: '#8b5cf6', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    {
      id: 'shiwangi-dataarchitect',
      source: 'shiwangi',
      target: 'dataarchitect',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      label: 'delegate',
      labelStyle: { fill: '#8b5cf6', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    {
      id: 'shiwangi-shieldops',
      source: 'shiwangi',
      target: 'shieldops',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      label: 'delegate',
      labelStyle: { fill: '#8b5cf6', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    {
      id: 'shiwangi-portalengine',
      source: 'shiwangi',
      target: 'portalengine',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      label: 'delegate',
      labelStyle: { fill: '#8b5cf6', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    {
      id: 'shiwangi-testrunner',
      source: 'shiwangi',
      target: 'testrunner',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      label: 'delegate',
      labelStyle: { fill: '#8b5cf6', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    {
      id: 'shiwangi-docsmith',
      source: 'shiwangi',
      target: 'docsmith',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      label: 'delegate',
      labelStyle: { fill: '#8b5cf6', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    // Sub-agents -> SHIWANGI (report back)
    {
      id: 'backendforge-shiwangi',
      source: 'backendforge',
      target: 'shiwangi',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      label: 'report',
      labelStyle: { fill: '#10b981', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    {
      id: 'uicraft-shiwangi',
      source: 'uicraft',
      target: 'shiwangi',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      label: 'report',
      labelStyle: { fill: '#10b981', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    {
      id: 'dataarchitect-shiwangi',
      source: 'dataarchitect',
      target: 'shiwangi',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      label: 'report',
      labelStyle: { fill: '#10b981', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    {
      id: 'shieldops-shiwangi',
      source: 'shieldops',
      target: 'shiwangi',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      label: 'report',
      labelStyle: { fill: '#10b981', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    {
      id: 'portalengine-shiwangi',
      source: 'portalengine',
      target: 'shiwangi',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      label: 'report',
      labelStyle: { fill: '#10b981', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    {
      id: 'testrunner-shiwangi',
      source: 'testrunner',
      target: 'shiwangi',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      label: 'report',
      labelStyle: { fill: '#10b981', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    {
      id: 'docsmith-shiwangi',
      source: 'docsmith',
      target: 'shiwangi',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      label: 'report',
      labelStyle: { fill: '#10b981', fontSize: 9 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
    // SHIWANGI -> User (final report)
    {
      id: 'shiwangi-user',
      source: 'shiwangi',
      target: 'user',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 3, strokeDasharray: '8,4' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b', width: 20, height: 20 },
      label: 'final report',
      labelStyle: { fill: '#f59e0b', fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
    },
  ], []);

  return (
    <div className="h-[700px] rounded-lg border border-border/60 bg-card">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background gap={24} size={1} color="hsl(var(--border) / 0.2)" />
        <Controls
          className="!bg-card !border-border/60 !shadow-sm [&>button]:!bg-card [&>button]:!border-border/40 [&>button]:!text-muted-foreground"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-card !border-border/60"
          nodeColor={(node) => {
            if (node.data.isUser) return '#3b82f6';
            if (node.data.isMaster) return '#8b5cf6';
            return 'hsl(var(--muted))';
          }}
          maskColor="hsl(var(--background) / 0.8)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
