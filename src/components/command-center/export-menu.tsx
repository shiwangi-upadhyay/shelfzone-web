'use client';

import { Download, FileText, FileJson } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ExportMenuProps {
  conversationId: string | null;
  disabled?: boolean;
}

export function ExportMenu({ conversationId, disabled }: ExportMenuProps) {
  const handleExport = async (format: 'markdown' | 'json') => {
    if (!conversationId) return;

    try {
      // Get auth token
      const stored = localStorage.getItem('shelfzone-auth');
      const token = stored ? JSON.parse(stored)?.state?.accessToken : null;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/command-center/conversations/${conversationId}/export?format=${format}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `conversation.${format === 'json' ? 'json' : 'md'}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      // Download file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export conversation. Please try again.');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || !conversationId}
          className="h-8 gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="text-xs">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport('markdown')} className="gap-2">
          <FileText className="h-4 w-4" />
          <span>Markdown (.md)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2">
          <FileJson className="h-4 w-4" />
          <span>JSON (.json)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
