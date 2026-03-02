import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CostBreakdown } from '../cost-breakdown';
import { api } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CostBreakdown', () => {
  it('should render loading state initially', () => {
    vi.mocked(api.get).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<CostBreakdown />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading costs...')).toBeInTheDocument();
  });

  it('should display cost breakdown when data loads', async () => {
    const mockData = {
      data: {
        tabId: 'tab-1',
        tabName: 'Project Alpha',
        totalCost: 0.0075,
        agents: [
          {
            agentId: 'agent-1',
            agentName: 'BackendForge',
            totalCost: 0.005,
            totalTokens: 1500,
            tokensIn: 1000,
            tokensOut: 500,
            messageCount: 5,
          },
          {
            agentId: 'agent-2',
            agentName: 'UIcraft',
            totalCost: 0.0025,
            totalTokens: 800,
            tokensIn: 500,
            tokensOut: 300,
            messageCount: 3,
          },
        ],
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockData);

    render(<CostBreakdown />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Cost Breakdown')).toBeInTheDocument();
    });

    // Check total
    expect(screen.getByText('$0.0075')).toBeInTheDocument();

    // Check tab name
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();

    // Check agent names
    expect(screen.getByText('BackendForge')).toBeInTheDocument();
    expect(screen.getByText('UIcraft')).toBeInTheDocument();

    // Check agent costs
    expect(screen.getByText('$0.0050')).toBeInTheDocument();
    expect(screen.getByText('$0.0025')).toBeInTheDocument();

    // Check percentages
    expect(screen.getByText('66.7%')).toBeInTheDocument(); // BackendForge
    expect(screen.getByText('33.3%')).toBeInTheDocument(); // UIcraft

    // Check token counts
    expect(screen.getByText('1,500 tokens')).toBeInTheDocument();
    expect(screen.getByText('800 tokens')).toBeInTheDocument();

    // Check message counts
    expect(screen.getByText('5 messages')).toBeInTheDocument();
    expect(screen.getByText('3 messages')).toBeInTheDocument();

    // Check token breakdown
    expect(screen.getByText('↓ 1,000 in')).toBeInTheDocument();
    expect(screen.getByText('↑ 500 out')).toBeInTheDocument();
  });

  it('should display empty state when no agents', async () => {
    const mockData = {
      data: {
        tabId: 'tab-1',
        tabName: 'Empty Tab',
        totalCost: 0,
        agents: [],
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockData);

    render(<CostBreakdown />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('No costs yet')).toBeInTheDocument();
    });

    expect(screen.getByText('Costs will appear as you use agents')).toBeInTheDocument();
  });

  it('should display error state on API failure', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

    render(<CostBreakdown />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Failed to load cost breakdown')).toBeInTheDocument();
    });
  });

  it('should color-code agents by cost percentage', async () => {
    const mockData = {
      data: {
        tabId: 'tab-1',
        tabName: 'Test Tab',
        totalCost: 0.01,
        agents: [
          {
            agentId: 'agent-1',
            agentName: 'HighCostAgent',
            totalCost: 0.006, // 60% - should be red
            totalTokens: 1000,
            tokensIn: 600,
            tokensOut: 400,
            messageCount: 2,
          },
          {
            agentId: 'agent-2',
            agentName: 'MediumCostAgent',
            totalCost: 0.003, // 30% - should be amber
            totalTokens: 500,
            tokensIn: 300,
            tokensOut: 200,
            messageCount: 1,
          },
          {
            agentId: 'agent-3',
            agentName: 'LowCostAgent',
            totalCost: 0.001, // 10% - should be green
            totalTokens: 200,
            tokensIn: 100,
            tokensOut: 100,
            messageCount: 1,
          },
        ],
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockData);

    const { container } = render(<CostBreakdown />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('HighCostAgent')).toBeInTheDocument();
    });

    // Check that progress bars have correct colors (via class names)
    const progressBars = container.querySelectorAll('.bg-red-500, .bg-amber-500, .bg-green-500');
    expect(progressBars.length).toBe(3);
  });

  it('should format numbers with commas', async () => {
    const mockData = {
      data: {
        tabId: 'tab-1',
        tabName: 'Test Tab',
        totalCost: 0.05,
        agents: [
          {
            agentId: 'agent-1',
            agentName: 'HighUsageAgent',
            totalCost: 0.05,
            totalTokens: 125000,
            tokensIn: 75000,
            tokensOut: 50000,
            messageCount: 100,
          },
        ],
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockData);

    render(<CostBreakdown />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('125,000 tokens')).toBeInTheDocument();
    });

    expect(screen.getByText('↓ 75,000 in')).toBeInTheDocument();
    expect(screen.getByText('↑ 50,000 out')).toBeInTheDocument();
    expect(screen.getByText('100 messages')).toBeInTheDocument();
  });

  it('should handle singular message count', async () => {
    const mockData = {
      data: {
        tabId: 'tab-1',
        tabName: 'Test Tab',
        totalCost: 0.001,
        agents: [
          {
            agentId: 'agent-1',
            agentName: 'SingleMessageAgent',
            totalCost: 0.001,
            totalTokens: 100,
            tokensIn: 60,
            tokensOut: 40,
            messageCount: 1,
          },
        ],
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockData);

    render(<CostBreakdown />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('1 message')).toBeInTheDocument();
    });
  });

  it('should call API with correct endpoint', async () => {
    const mockData = {
      data: {
        tabId: null,
        tabName: null,
        totalCost: 0,
        agents: [],
      },
    };

    vi.mocked(api.get).mockResolvedValue(mockData);

    render(<CostBreakdown />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/command-center/costs/current-tab');
    });
  });
});
