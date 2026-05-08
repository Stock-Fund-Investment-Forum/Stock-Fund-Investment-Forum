/**
 * Card component for content containers
 */
import { cn } from '../../utils/classname';

export const Card = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('px-6 py-4 border-b border-gray-200', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardBody = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('px-6 py-4', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50', className)}
    {...props}
  >
    {children}
  </div>
);
