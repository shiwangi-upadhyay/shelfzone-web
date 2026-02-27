'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTodayAttendance, useCheckIn, useCheckOut } from '@/hooks/use-attendance';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export function ClockWidget() {
  const { data: todayAttendance, isLoading } = useTodayAttendance();
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();
  const { mutate: checkOut, isPending: isCheckingOut } = useCheckOut();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isCheckedIn = todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;
  const isCheckedOut = todayAttendance?.checkOutTime;

  const handleClock = () => {
    if (isCheckedIn) {
      checkOut();
    } else {
      checkIn();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Time Clock</CardTitle>
            <CardDescription>
              {format(currentTime, 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-3xl font-bold tabular-nums">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            {isCheckedIn && (
              <Badge variant="default" className="mt-1">
                <Clock className="mr-1 h-3 w-3" />
                Working
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayAttendance && (
          <div className="grid gap-4 md:grid-cols-2">
            {todayAttendance.checkInTime && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Check In</p>
                <p className="text-2xl font-bold">
                  {format(new Date(todayAttendance.checkInTime), 'HH:mm')}
                </p>
              </div>
            )}
            {todayAttendance.checkOutTime && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Check Out</p>
                <p className="text-2xl font-bold">
                  {format(new Date(todayAttendance.checkOutTime), 'HH:mm')}
                </p>
              </div>
            )}
            {todayAttendance.workingHours !== undefined && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Working Hours</p>
                <p className="text-2xl font-bold">
                  {todayAttendance.workingHours.toFixed(1)}h
                </p>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleClock}
          disabled={isCheckingIn || isCheckingOut || isCheckedOut || isLoading}
          className="w-full"
          size="lg"
          variant={isCheckedIn ? 'destructive' : 'default'}
        >
          {isCheckingIn || isCheckingOut ? (
            'Processing...'
          ) : isCheckedOut ? (
            <>
              <LogOut className="mr-2 h-5 w-5" />
              Already Checked Out Today
            </>
          ) : isCheckedIn ? (
            <>
              <LogOut className="mr-2 h-5 w-5" />
              Clock Out
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-5 w-5" />
              Clock In
            </>
          )}
        </Button>

        {todayAttendance?.status === 'late' && (
          <p className="text-sm text-orange-600">
            You checked in late today
          </p>
        )}
      </CardContent>
    </Card>
  );
}
