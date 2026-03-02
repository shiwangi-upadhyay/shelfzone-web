import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ActivitySidebar } from '../activity-sidebar';

// Mock EventSource
class MockEventSource {
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  
  constructor(public url: string, public options?: any) {
    // Simulate connection after a tick
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  close() {
    // Mock close
  }

  sendMessage(data: string) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }));
    }
  }

  triggerError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
}

// Replace global EventSource
let mockEventSource: MockEventSource | null = null;
(global as any).EventSource = class {
  constructor(url: string, options?: any) {
    mockEventSource = new MockEventSource(url, options);
    return mockEventSource;
  }
};

describe('ActivitySidebar', () => {
  beforeEach(() => {
    mockEventSource = null;
    localStorage.setItem('shelfzone-auth', JSON.stringify({ 
      state: { 
        accessToken: 'test-token-123',
        refreshToken: 'refresh-token-456'
      } 
    }));
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render with initial state', () => {
    render(<ActivitySidebar />);

    expect(screen.getByText('Live Activity')).toBeInTheDocument();
    expect(screen.getByText('No activity yet')).toBeInTheDocument();
  });

  it('should show connected status when SSE connects', async () => {
    render(<ActivitySidebar />);

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  it('should display delegation start event', async () => {
    render(<ActivitySidebar />);

    await waitFor(() => {
      expect(mockEventSource).not.toBeNull();
    });

    // Send a delegation start event
    mockEventSource!.sendMessage(
      JSON.stringify({
        type: 'delegation_start',
        timestamp: Date.now(),
        data: {
          agentId: 'agent-1',
          agentName: 'BackendForge',
          task: 'Build API endpoint',
          status: 'started',
          traceSessionId: 'trace-123',
        },
      })
    );

    await waitFor(() => {
      expect(screen.getByText('BackendForge started')).toBeInTheDocument();
      expect(screen.getByText('Build API endpoint')).toBeInTheDocument();
    });
  });

  it('should display delegation complete event', async () => {
    render(<ActivitySidebar />);

    await waitFor(() => {
      expect(mockEventSource).not.toBeNull();
    });

    mockEventSource!.sendMessage(
      JSON.stringify({
        type: 'delegation_complete',
        timestamp: Date.now(),
        data: {
          agentId: 'agent-1',
          agentName: 'BackendForge',
          status: 'completed',
          traceSessionId: 'trace-123',
        },
      })
    );

    await waitFor(() => {
      expect(screen.getByText('BackendForge completed')).toBeInTheDocument();
    });
  });

  it('should display delegation error event', async () => {
    render(<ActivitySidebar />);

    await waitFor(() => {
      expect(mockEventSource).not.toBeNull();
    });

    mockEventSource!.sendMessage(
      JSON.stringify({
        type: 'delegation_error',
        timestamp: Date.now(),
        data: {
          agentId: 'agent-1',
          agentName: 'BackendForge',
          error: 'API rate limit exceeded',
          status: 'error',
          traceSessionId: 'trace-123',
        },
      })
    );

    await waitFor(() => {
      expect(screen.getByText('BackendForge failed')).toBeInTheDocument();
      expect(screen.getByText('API rate limit exceeded')).toBeInTheDocument();
    });
  });

  it('should display token update event', async () => {
    render(<ActivitySidebar />);

    await waitFor(() => {
      expect(mockEventSource).not.toBeNull();
    });

    mockEventSource!.sendMessage(
      JSON.stringify({
        type: 'token_update',
        timestamp: Date.now(),
        data: {
          agentId: 'agent-1',
          tokenUsage: {
            used: 45000,
            limit: 200000,
            percentage: 22.5,
          },
        },
      })
    );

    await waitFor(() => {
      expect(screen.getByText('Token usage updated')).toBeInTheDocument();
      expect(screen.getByText('45,000 / 200,000 tokens')).toBeInTheDocument();
    });
  });

  it('should show disconnected status on error', async () => {
    render(<ActivitySidebar />);

    await waitFor(() => {
      expect(mockEventSource).not.toBeNull();
    });

    // Trigger error
    mockEventSource!.triggerError();

    await waitFor(() => {
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
      expect(screen.getByText('Connection lost. Reconnecting...')).toBeInTheDocument();
    });
  });

  it('should limit events to last 50', async () => {
    render(<ActivitySidebar />);

    await waitFor(() => {
      expect(mockEventSource).not.toBeNull();
    });

    // Send 60 events
    for (let i = 0; i < 60; i++) {
      mockEventSource!.sendMessage(
        JSON.stringify({
          type: 'delegation_complete',
          timestamp: Date.now() + i,
          data: {
            agentId: 'agent-1',
            agentName: `Agent-${i}`,
            status: 'completed',
            traceSessionId: `trace-${i}`,
          },
        })
      );
    }

    // Wait for all events to process
    await waitFor(() => {
      const events = screen.getAllByText(/Agent-\d+ completed/);
      // Should only show last 50
      expect(events.length).toBeLessThanOrEqual(50);
    });
  });

  it('should show error when auth token missing', () => {
    localStorage.clear();
    render(<ActivitySidebar />);

    expect(screen.getByText('Not authenticated')).toBeInTheDocument();
  });

  it('should construct SSE URL with token', async () => {
    render(<ActivitySidebar />);

    await waitFor(() => {
      expect(mockEventSource).not.toBeNull();
    });

    const expectedUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/command-center/activity/stream?token=test-token-123`;
    expect(mockEventSource!.url).toBe(expectedUrl);
  });
});
