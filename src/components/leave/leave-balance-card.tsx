import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LeaveBalance } from '@/hooks/use-leave';

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
}

export function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const usagePercentage = (balance.usedDays / balance.totalDays) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium capitalize">
          {balance.leaveType.replace('_', ' ')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{balance.remainingDays}</p>
            <p className="text-xs text-muted-foreground">
              of {balance.totalDays} days available
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{balance.usedDays}</p>
            <p className="text-xs text-muted-foreground">used</p>
          </div>
        </div>
        <Progress value={usagePercentage} className="h-2" />
      </CardContent>
    </Card>
  );
}
