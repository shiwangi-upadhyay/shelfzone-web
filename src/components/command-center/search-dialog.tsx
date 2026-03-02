'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  content: string;
  agentName: string;
  tabTitle: string;
  timestamp: string;
  conversationId: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // TODO: Implement actual search API call (Phase 5.2)
      // For now, show a placeholder message
      setResults([]);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    handleSearch(value);
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 px-0 text-base"
              autoFocus
            />
            {query && (
              <button
                onClick={() => handleQueryChange('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          {!query && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-sm">Type to search across all conversations</p>
              <p className="text-xs mt-2 opacity-60">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl</kbd> +{' '}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">K</kbd> anytime to open search
              </p>
            </div>
          )}

          {query && isSearching && (
            <div className="text-center py-12">
              <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-current border-r-transparent" />
            </div>
          )}

          {query && !isSearching && results.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Search feature coming in Phase 5.2</p>
              <p className="text-xs mt-2 opacity-60">
                Full-text search across all conversations will be available soon
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  onClick={handleClose}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {result.agentName}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {result.tabTitle}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{result.content}</p>
                      <time className="text-xs text-muted-foreground mt-1 block">
                        {new Date(result.timestamp).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
