/**
 * Loading skeleton component for UI placeholders
 */
import { cn } from '../../utils/classname';

export const Skeleton = ({ className, ...props }) => (
  <div
    className={cn(
      'animate-pulse rounded-lg bg-gray-200',
      className
    )}
    {...props}
  />
);

export const SkeletonText = ({ lines = 3, ...props }) => (
  <div className="space-y-2" {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={i === lines - 1 ? 'w-4/5 h-4' : 'h-4'}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ ...props }) => (
  <div className="bg-white rounded-lg p-4" {...props}>
    <Skeleton className="h-6 w-2/3 mb-4" />
    <SkeletonText lines={2} />
    <Skeleton className="h-4 w-1/3 mt-4" />
  </div>
);
