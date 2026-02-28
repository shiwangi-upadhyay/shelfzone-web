import { TableSkeleton } from '@/components/skeletons/page-skeletons';
export default function Loading() { return <div className="space-y-6"><div className="h-8 w-48 bg-accent animate-pulse rounded-md" /><TableSkeleton rows={8} cols={3} /></div>; }
