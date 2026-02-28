import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  isLive?: boolean;
  className?: string;
}

export function LiveIndicator({ isLive = false, className }: LiveIndicatorProps) {
  if (!isLive) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-500 animate-ping opacity-75" />
      </div>
      <span className="text-xs font-medium text-green-500">LIVE</span>
    </div>
  );
}
