import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text'
}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded h-4',
        variant === 'default' && 'rounded-xl',
        className,
      )}
      {...props}
    />
  )
}

function ProductCardSkeleton() {
  return (
    <div className="bg-surface border border-white/8 rounded-2xl overflow-hidden">
      <Skeleton className="aspect-product w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2 h-3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton variant="text" className="w-28 h-5" />
          <Skeleton variant="circular" className="h-9 w-9" />
        </div>
      </div>
    </div>
  )
}

function BlogCardSkeleton() {
  return (
    <div className="bg-surface border border-white/8 rounded-2xl overflow-hidden">
      <Skeleton className="aspect-card w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton variant="text" className="w-1/4 h-3" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="text" className="w-1/3 h-3" />
      </div>
    </div>
  )
}

export { Skeleton, ProductCardSkeleton, BlogCardSkeleton }
