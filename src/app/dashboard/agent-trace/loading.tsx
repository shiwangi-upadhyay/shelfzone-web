import { TableSkeleton, StatsRowSkeleton } from '@/components/skeletons/page-skeletons';
export default function Loading() { return <div className="space-y-6"><StatsRowSkeleton /><TableSkeleton /></div>; }
