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
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Bookings' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

export const MyBookings = () => {
  const { currentUser, showToast, dataVersion } = useUser();
  const [bookings, setBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

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
      <div className="pb-4 border-b-2 border-[#14281D]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#F2B705]/20 border border-[#14281D]/20 text-[11px] font-mono font-bold text-[#14281D] mb-1">
            <span>● BORROWING HISTORY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#14281D] tracking-tight">
            My Borrow Requests
          </h1>
          <p className="text-xs sm:text-sm text-[#14281D]/70 font-sans mt-1">
            Track equipment you have requested or borrowed as{' '}
            <strong className="text-[#14281D]">{currentUser.name}</strong>
          </p>
        </div>

        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14281D] hover:bg-[#E8590C] text-[#F6F1E9] text-xs font-bold rounded-xl border-2 border-[#14281D] shadow-hard btn-tactile transition-colors self-start sm:self-auto"
        >
          <span>Browse Neighborhood</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border-2 border-[#14281D] ${
                isSelected
                  ? 'bg-[#14281D] text-[#F6F1E9] shadow-hard-sm'
                  : 'bg-[#FAF8F5] text-[#14281D] hover:bg-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-white/20 text-[#F2B705]' : 'bg-[#14281D]/10 text-[#14281D]'
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
        <div className="bg-[#FAF8F5] rounded-3xl border-2 border-[#14281D] shadow-hard p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F2B705] border-2 border-[#14281D] shadow-hard-sm text-[#14281D] flex items-center justify-center mx-auto transform -rotate-3">
            <PackageSearch className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-black text-[#14281D]">
              No {selectedStatus !== 'ALL' ? selectedStatus.toLowerCase() : ''} bookings found
            </h3>
            <p className="text-xs text-[#14281D]/70 font-sans leading-relaxed">
              {selectedStatus === 'ALL'
                ? `You haven't requested any items yet under ${currentUser.name}. Explore neighborhood gear to make your first rental request!`
                : `There are currently no bookings with status "${selectedStatus}".`}
            </p>
          </div>
          {selectedStatus === 'ALL' && (
            <div className="pt-2">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14281D] hover:bg-[#E8590C] text-[#F6F1E9] text-xs font-bold rounded-xl border-2 border-[#14281D] shadow-hard btn-tactile transition-colors"
              >
                <span>Browse Neighborhood Gear</span>
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
            />
          ))}
        </div>
      )}

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

