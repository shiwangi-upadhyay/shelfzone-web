'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LeaveRequest, useCancelLeave } from '@/hooks/use-leave';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LeaveRequestTableProps {
  requests: LeaveRequest[];
  loading?: boolean;
}

export function LeaveRequestTable({ requests, loading }: LeaveRequestTableProps) {
  const { mutate: cancelLeave } = useCancelLeave();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No leave requests found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Leave Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium capitalize">
                {request.leaveType.replace('_', ' ')}
              </TableCell>
              <TableCell>
                {format(new Date(request.startDate), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                {format(new Date(request.endDate), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                {request.numberOfDays}
                {request.isHalfDay && ' (Half)'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === 'approved'
                      ? 'default'
                      : request.status === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {request.reason}
              </TableCell>
              <TableCell className="text-right">
                {request.status === 'pending' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Leave Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this leave request? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No, keep it</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => cancelLeave(request.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, cancel
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {request.reviewComments && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {request.reviewComments}
                  </p>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
