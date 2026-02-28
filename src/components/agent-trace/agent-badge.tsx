import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AgentBadgeProps {
  name: string;
  emoji?: string;
  cost?: number;
  status?: 'active' | 'idle' | 'offline';
  onClick?: () => void;
  className?: string;
}

const statusColors = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  offline: 'bg-gray-500',
};

const statusDots = {
  active: '🟢',
  idle: '💤',
  offline: '🔴',
};

export function AgentBadge({
  name,
  emoji,
  cost,
  status = 'idle',
  onClick,
  className,
}: AgentBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "cursor-pointer hover:bg-accent transition-colors flex items-center gap-1.5 px-2 py-1",
        className
      )}
      onClick={onClick}
    >
      {emoji && <span className="text-sm">{emoji}</span>}
      <span className="text-xs font-medium">{name}</span>
      <span className="text-xs">{statusDots[status]}</span>
      {cost !== undefined && (
        <span className="text-xs text-muted-foreground ml-1">
          ${Number(cost).toFixed(4)}
        </span>
      )}
    </Badge>
  );
}
