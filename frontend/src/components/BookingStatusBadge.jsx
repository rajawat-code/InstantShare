import React from 'react';
import { Clock, CheckCircle2, PlayCircle, Archive, XCircle, AlertCircle } from 'lucide-react';

const statusConfig = {
  PENDING: {
    label: 'Pending Request',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
    icon: Clock,
  },
  ACCEPTED: {
    label: 'Accepted / Ready to Pay',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    icon: CheckCircle2,
  },
  CONFIRMED: {
    label: 'Confirmed & Paid',
    bgColor: 'bg-emerald-50',
    textColor: 'text-[#236B45]',
    borderColor: 'border-emerald-200',
    icon: CheckCircle2,
  },
  ACTIVE: {
    label: 'Item Handed Over (Active)',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200',
    icon: PlayCircle,
  },
  COMPLETED: {
    label: 'Completed / Returned',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
    icon: Archive,
  },
  REJECTED: {
    label: 'Declined by Owner',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    icon: AlertCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    icon: XCircle,
  },
};

export const BookingStatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  const config = statusConfig[status] || {
    label: status,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: Clock,
  };

  const IconComponent = config.icon;
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm gap-2 font-medium'
      : 'px-2.5 py-1 text-xs font-medium gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
};

export default BookingStatusBadge;

