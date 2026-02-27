'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/use-dashboard';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Calendar,
  User,
  AlertCircle 
} from 'lucide-react';

const iconMap = {
  attendance: Clock,
  leave: Calendar,
  payroll: FileText,
  approval: CheckCircle,
  rejection: XCircle,
  reminder: Bell,
  user: User,
  default: AlertCircle,
};

export function ActivityFeed() {
  const { data: notifications, isLoading } = useNotifications();

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activities = notifications?.data || [];

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No recent activity
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity: any) => {
                const IconComponent = iconMap[activity.type as keyof typeof iconMap] || iconMap.default;
                
                return (
                  <div
                    key={activity.id}
                    className={`flex items-start space-x-4 rounded-lg p-3 transition-colors ${
                      !activity.read
                        ? 'bg-primary/5 border border-primary/10'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className={`rounded-full p-2 ${
                      !activity.read ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <IconComponent className={`h-4 w-4 ${
                        !activity.read ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm ${
                        !activity.read ? 'font-medium' : ''
                      }`}>
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
