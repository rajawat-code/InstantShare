import React from 'react';
import { Clock, CheckCircle2, PlayCircle, Archive, XCircle, AlertCircle } from 'lucide-react';

const statusConfig = {
  PENDING: {
    label: 'Pending Approval',
    bgColor: 'bg-[#F2B705]/20',
    textColor: 'text-[#14281D]',
    borderColor: 'border-[#14281D]',
    icon: Clock,
  },
  ACCEPTED: {
    label: 'Ready for Pickup',
    bgColor: 'bg-[#E8590C]/15',
    textColor: 'text-[#14281D]',
    borderColor: 'border-[#14281D]',
    icon: CheckCircle2,
  },
  ACTIVE: {
    label: 'Handed Over (Active)',
    bgColor: 'bg-[#14281D]',
    textColor: 'text-[#F6F1E9]',
    borderColor: 'border-[#14281D]',
    icon: PlayCircle,
  },
  COMPLETED: {
    label: 'Returned & Closed',
    bgColor: 'bg-white',
    textColor: 'text-[#14281D]',
    borderColor: 'border-[#14281D]',
    icon: Archive,
  },
  REJECTED: {
    label: 'Declined by Owner',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-900',
    borderColor: 'border-rose-700',
    icon: AlertCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    bgColor: 'bg-gray-200',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-500',
    icon: XCircle,
  },
};

export const BookingStatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  const config = statusConfig[status] || {
    label: status,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-[#14281D]',
    icon: Clock,
  };

  const IconComponent = config.icon;
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-xs gap-2 font-bold'
      : 'px-2.5 py-1 text-xs font-bold gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-md font-mono border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses} shadow-xs`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
};

export default BookingStatusBadge;

