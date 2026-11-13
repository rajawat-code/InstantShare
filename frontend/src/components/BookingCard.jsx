import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, XCircle } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';
import { formatCurrency, formatDateTime } from '../utils/pricing';

export const BookingCard = ({ booking, onCancelRequest }) => {
  const isPending = booking.status === 'PENDING';

  return (
    <div className="bg-[#FAF8F5] rounded-2xl border-2 border-[#14281D] p-5 shadow-hard hover:shadow-hard-lg transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
      {/* Left: Thumbnail & Core info */}
      <div className="flex items-start gap-4 flex-1">
        <img
          src={booking.itemImage}
          alt={booking.itemName}
          className="w-20 h-20 rounded-xl object-cover border-2 border-[#14281D] shadow-hard-sm flex-shrink-0"
        />

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <BookingStatusBadge status={booking.status} size="sm" />
            <span className="text-xs font-mono text-[#14281D]/60">#{booking.id}</span>
          </div>

          <h4 className="font-serif font-black text-[#14281D] text-lg leading-snug">
            {booking.itemName}
          </h4>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#14281D]/70 pt-1 font-sans">
            <span className="inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#E8590C]" />
              Neighbor: <strong className="font-bold text-[#14281D]">{booking.ownerName}</strong>
            </span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#14281D]/60" />
              {booking.duration}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Dates */}
      <div className="w-full md:w-auto bg-white rounded-xl p-3 border-2 border-[#14281D] shadow-hard-sm text-xs space-y-1 min-w-[210px] font-mono">
        <div className="flex items-center justify-between text-[#14281D]/70">
          <span className="font-bold uppercase text-[10px]">Pickup:</span>
          <span className="text-[#14281D] font-bold">{formatDateTime(booking.startDate)}</span>
        </div>
        <div className="flex items-center justify-between text-[#14281D]/70">
          <span className="font-bold uppercase text-[10px]">Return:</span>
          <span className="text-[#14281D] font-bold">{formatDateTime(booking.endDate)}</span>
        </div>
      </div>

      {/* Right: Total amount and actions */}
      <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t-2 md:border-t-0 border-[#14281D]/10">
        <div className="text-left md:text-right">
          <div className="text-[11px] font-mono font-bold text-[#14281D]/60 uppercase">Rental Total</div>
          <div className="text-xl font-serif font-black text-[#14281D]">
            {formatCurrency(booking.totalAmount)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPending && onCancelRequest && (
            <button
              type="button"
              onClick={() => onCancelRequest(booking)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold text-rose-700 bg-white hover:bg-rose-50 border-2 border-rose-600 shadow-hard-sm btn-tactile rounded-lg transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}

          <Link
            to={`/items/${booking.itemId}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-mono font-bold text-[#14281D] bg-white hover:bg-[#FAF8F5] border-2 border-[#14281D] shadow-hard-sm btn-tactile rounded-lg transition-colors cursor-pointer"
          >
            <span>View Gear</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;

