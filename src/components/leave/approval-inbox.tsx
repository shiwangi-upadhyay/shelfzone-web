'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { LeaveRequest, usePendingApprovals, useReviewLeave } from '@/hooks/use-leave';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ApprovalInbox() {
  const { data, isLoading } = usePendingApprovals();
  const { mutate: reviewLeave, isPending } = useReviewLeave();
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<'approved' | 'rejected'>('approved');

  const pendingRequests = data?.data || [];

  const handleReview = () => {
    if (!selectedRequest) return;

    reviewLeave(
      {
        id: selectedRequest.id,
        status: action,
        reviewComments: reviewComments || undefined,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedRequest(null);
          setReviewComments('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>
          {pendingRequests.length} leave request{pendingRequests.length !== 1 ? 's' : ''} awaiting
          your review
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No pending approvals</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request: LeaveRequest) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.employee?.firstName} {request.employee?.lastName}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {request.employee?.employeeCode}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">
                      {request.leaveType.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.startDate), 'MMM dd')} -{' '}
                      {format(new Date(request.endDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {request.numberOfDays}
                      {request.isHalfDay && ' (Half)'}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{request.reason}</p>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog
                        open={dialogOpen && selectedRequest?.id === request.id}
                        onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (open) {
                            setSelectedRequest(request);
                            setAction('approved');
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setAction('approved');
                            }}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {action === 'approved' ? 'Approve' : 'Reject'} Leave Request
                            </DialogTitle>
                            <DialogDescription>
                              {request.employee?.firstName} {request.employee?.lastName} has
                              requested {request.numberOfDays} day(s) of {request.leaveType}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Reason:</p>
                              <p className="text-sm text-muted-foreground">{request.reason}</p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Comments (optional):
                              </label>
                              <Textarea
                                value={reviewComments}
                                onChange={(e) => setReviewComments(e.target.value)}
                                placeholder="Add your comments here..."
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleReview} disabled={isPending}>
                              {isPending ? 'Processing...' : 'Confirm'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={dialogOpen && selectedRequest?.id === request.id}
                        onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (open) {
                            setSelectedRequest(request);
                            setAction('rejected');
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setAction('rejected');
                            }}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
