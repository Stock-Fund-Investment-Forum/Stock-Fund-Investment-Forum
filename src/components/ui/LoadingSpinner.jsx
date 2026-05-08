/**
 * Loading spinner component
 */
import { cn } from '../../utils/classname';

export const LoadingSpinner = ({
  size = 'md',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-4 border-gray-200 border-t-blue-600',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};

export const FullScreenLoader = ({ message = '加载中...' }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-8 text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);
