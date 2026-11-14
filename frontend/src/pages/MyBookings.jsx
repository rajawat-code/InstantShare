import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  RotateCcw,
  Clock,
  CheckCircle2,
  PackageSearch,
} from 'lucide-react';
import BookingCard from '../components/BookingCard';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import DemoPaymentModal from '../components/DemoPaymentModal';
import ReviewModal from '../components/ReviewModal';
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Bookings' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'ACCEPTED', label: 'Ready to Pay' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'ACTIVE', label: 'Active (Handed Over)' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'REJECTED', label: 'Rejected' },
];

export const MyBookings = () => {
  const { currentUser, showToast, dataVersion } = useUser();
  const [bookings, setBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [isReceiptOnly, setIsReceiptOnly] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  const handlePayNow = (booking, receiptMode = false) => {
    setIsReceiptOnly(Boolean(receiptMode));
    setPaymentTarget(booking);
  };

  const handleReviewBooking = (booking) => {
    setReviewTarget(booking);
  };

  const handleReviewSuccess = (review) => {
    showToast('Review submitted successfully! Thank you for rating.', 'success');
  };

  const handlePaymentSuccess = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CONFIRMED' } : b))
    );
    showToast('Payment confirmed! Rental status updated to CONFIRMED.', 'success');
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getBookings(currentUser.id, 'renter');
        setBookings(data);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser.id, dataVersion]);

  const handleCancelBooking = (booking) => {
    setCancelTarget(booking);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setIsCancelling(true);
      await apiService.updateBookingStatus(cancelTarget.id, 'CANCELLED');
      showToast(`Booking #${cancelTarget.id} has been cancelled.`, 'info');
      setBookings((prev) =>
        prev.map((b) => (b.id === cancelTarget.id ? { ...b, status: 'CANCELLED' } : b))
      );
      setCancelTarget(null);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      showToast('Could not cancel booking.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (selectedStatus === 'ALL') return true;
    return b.status === selectedStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#E1E5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#252B27] tracking-tight">
            My Rental Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track equipment you have requested or rented as{' '}
            <strong className="text-slate-700">{currentUser.name}</strong>
          </p>
        </div>

        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#236B45] hover:bg-[#1b5636] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <span>Find More Items</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.id === 'ALL'
              ? bookings.length
              : bookings.filter((b) => b.status === tab.id).length;
          const isSelected = selectedStatus === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#236B45] text-white shadow-xs'
                  : 'bg-white border border-[#E1E5E1] text-slate-600 hover:bg-[#EEF3EE]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <LoadingSpinner label="Fetching your bookings..." />
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E1E5E1] p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EEF3EE] text-[#236B45] flex items-center justify-center mx-auto">
            <PackageSearch className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">
              No {selectedStatus !== 'ALL' ? selectedStatus.toLowerCase() : ''} bookings found
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {selectedStatus === 'ALL'
                ? `You haven't requested any items yet under ${currentUser.name}. Explore neighborhood gear to make your first rental request!`
                : `There are currently no bookings with status "${selectedStatus}".`}
            </p>
          </div>
          {selectedStatus === 'ALL' && (
            <div className="pt-2">
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#236B45] hover:bg-[#1b5636] text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <span>Browse Rental Marketplace</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancelRequest={handleCancelBooking}
              onPayNow={handlePayNow}
              onReview={handleReviewBooking}
            />
          ))}
        </div>
      )}

      {/* Review Experience Modal (POST /api/reviews) */}
      <ReviewModal
        isOpen={Boolean(reviewTarget)}
        booking={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onReviewSubmitted={handleReviewSuccess}
      />

      {/* Demo Mode Payment Gateway Checkout Modal */}
      <DemoPaymentModal
        isOpen={Boolean(paymentTarget)}
        booking={paymentTarget}
        isReceiptOnly={isReceiptOnly}
        onClose={() => { setPaymentTarget(null); setIsReceiptOnly(false); }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        title="Cancel Booking Request"
        message={`Are you sure you want to cancel your rental request for "${cancelTarget?.itemName}"? The owner will be notified.`}
        confirmText={isCancelling ? 'Cancelling...' : 'Yes, Cancel Request'}
        cancelText="Keep Booking"
        confirmVariant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};

export default MyBookings;

