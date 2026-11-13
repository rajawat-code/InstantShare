import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, XCircle, CreditCard, Star } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';
import { formatCurrency, formatDateTime } from '../utils/pricing';

export const BookingCard = ({ booking, onCancelRequest, onPayNow, onReview }) => {
  const isPending = booking.status === 'PENDING';
  const isAccepted = booking.status === 'ACCEPTED' || booking.isAcceptedByOwner;
  const isCompleted = booking.status === 'COMPLETED';

  return (
    <div className="bg-white rounded-2xl border border-[#E1E5E1] p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
      {/* Left: Thumbnail & Core info */}
      <div className="flex items-start gap-4 flex-1">
        <img
          src={booking.itemImage}
          alt={booking.itemName}
          className="w-20 h-20 rounded-xl object-cover border border-slate-100 flex-shrink-0"
        />

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <BookingStatusBadge status={booking.status} size="sm" />
            <span className="text-xs text-slate-400">ID #{booking.id}</span>
          </div>

          <h4 className="font-semibold text-slate-900 text-base leading-snug">
            {booking.itemName}
          </h4>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 pt-1">
            <span className="inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Owner: <strong className="font-medium text-slate-700">{booking.ownerName}</strong>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {booking.duration}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Dates */}
      <div className="w-full md:w-auto bg-[#F8F8F5] rounded-xl p-3 border border-[#E1E5E1] text-xs space-y-1 min-w-[210px]">
        <div className="flex items-center justify-between text-slate-500">
          <span className="font-medium">From:</span>
          <span className="text-slate-800 font-medium">{formatDateTime(booking.startDate)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500">
          <span className="font-medium">To:</span>
          <span className="text-slate-800 font-medium">{formatDateTime(booking.endDate)}</span>
        </div>
      </div>

      {/* Right: Total amount and actions */}
      <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
        <div className="text-left md:text-right">
          <div className="text-xs text-slate-400">Total Rental Cost</div>
          <div className="text-lg font-bold text-[#236B45]">
            {formatCurrency(booking.totalAmount)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAccepted && onPayNow && (
            <button
              type="button"
              onClick={() => onPayNow(booking)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#236B45] hover:bg-[#1b5636] rounded-lg shadow-xs transition-colors cursor-pointer animate-pulse"
              title="Owner accepted your request. Complete demo checkout."
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Demo Pay</span>
            </button>
          )}

          {isCompleted && onReview && (
            <button
              type="button"
              onClick={() => onReview(booking)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Post a review for this completed rental"
            >
              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Review</span>
            </button>
          )}

          {isPending && onCancelRequest && (
            <button
              type="button"
              onClick={() => onCancelRequest(booking)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}

          <Link
            to={`/items/${booking.itemId}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-[#236B45] hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <span>Item Details</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;

