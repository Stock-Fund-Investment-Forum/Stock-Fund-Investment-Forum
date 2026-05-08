/**
 * Alert component for displaying messages
 */
import { X } from 'lucide-react';
import { cn } from '../../utils/classname';

export const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  className,
  ...props
}) => {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconClasses = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ',
  };

  return (
    <div
      className={cn(
        'border rounded-lg p-4 flex items-start gap-4',
        typeClasses[type],
        className
      )}
      {...props}
    >
      <span className="flex-shrink-0 font-bold">
        {iconClasses[type]}
      </span>
      <div className="flex-1">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition"
          aria-label="关闭"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};
