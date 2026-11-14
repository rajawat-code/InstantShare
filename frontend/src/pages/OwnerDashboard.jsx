import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  PlayCircle,
  Archive,
  CheckCircle2,
  XCircle,
  TrendingUp,
  User,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import BookingStatusBadge from '../components/BookingStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import ReviewModal from '../components/ReviewModal';
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';
import { formatCurrency, formatDateTime } from '../utils/pricing';

export const OwnerDashboard = () => {
  const { currentUser, showToast, dataVersion } = useUser();

  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);

  // Status Action Modal State
  const [actionConfirm, setActionConfirm] = useState(null); // { booking, newStatus, label, message }
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [userItems, ownerBookings] = await Promise.all([
          apiService.getMyListings(currentUser.id),
          apiService.getBookings(currentUser.id, 'owner'),
        ]);
        setListings(userItems);
        setRequests(ownerBookings);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser.id, dataVersion]);

  // Derived metrics
  const totalListings = listings.length;
  const pendingRequests = requests.filter((r) => r.status === 'PENDING').length;
  const activeRentals = requests.filter((r) => r.status === 'ACTIVE').length;
  const completedRentals = requests.filter((r) => r.status === 'COMPLETED').length;
  const totalEarnings = requests
    .filter((r) => r.status === 'COMPLETED' || r.status === 'ACTIVE' || r.status === 'CONFIRMED')
    .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

  const handleActionClick = (booking, newStatus, label, message, variant = 'primary') => {
    setActionConfirm({
      booking,
      newStatus,
      label,
      message,
      variant,
    });
  };

  const executeStatusChange = async () => {
    if (!actionConfirm) return;
    try {
      setIsProcessing(true);
      const { booking, newStatus } = actionConfirm;
      await apiService.updateBookingStatus(booking.id, newStatus);

      setRequests((prev) =>
        prev.map((r) => (r.id === booking.id ? { ...r, status: newStatus } : r))
      );

      const statusLabels = {
        ACCEPTED: 'Rental request ACCEPTED',
        REJECTED: 'Rental request DECLINED',
        ACTIVE: 'Item marked as HANDED OVER (Active)',
        COMPLETED: 'Item marked as RETURNED (Completed)',
      };

      showToast(statusLabels[newStatus] || 'Status updated', 'success');
      setActionConfirm(null);
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Error updating booking status.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#E1E5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#252B27] tracking-tight">
            Owner Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rental management, approval queue, and earnings for{' '}
            <strong className="text-slate-700">{currentUser.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/add-item"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#236B45] hover:bg-[#1b5636] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>List Another Item</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Listings */}
        <div className="bg-white p-5 rounded-2xl border border-[#E1E5E1] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Listings</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalListings}</div>
          <div className="text-[11px] text-slate-400">Items under management</div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-[#E1E5E1] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-medium">Pending Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-900">{pendingRequests}</div>
          <div className="text-[11px] text-amber-700/80">Awaiting your approval</div>
        </div>

        {/* Active Rentals */}
        <div className="bg-white p-5 rounded-2xl border border-[#E1E5E1] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-medium">Active Rentals</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-900">{activeRentals}</div>
          <div className="text-[11px] text-emerald-700/80">Handed over to renters</div>
        </div>

        {/* Completed Rentals */}
        <div className="bg-white p-5 rounded-2xl border border-[#E1E5E1] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-medium">Completed Rentals</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-900">{completedRentals}</div>
          <div className="text-[11px] text-blue-700/80">Returned in good order</div>
        </div>

        {/* Total Revenue */}
        <div className="col-span-2 lg:col-span-1 bg-[#EEF3EE] p-5 rounded-2xl border border-[#DCFCE7] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#236B45]">
            <span className="text-xs font-medium">Rental Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-white text-[#236B45] flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#236B45]">
            {formatCurrency(totalEarnings)}
          </div>
          <div className="text-[11px] text-[#236B45]/80">Active & completed total</div>
        </div>
      </div>

      {/* Booking Requests Table & Workflow Actions */}
      <div className="bg-white rounded-3xl border border-[#E1E5E1] overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#252B27]">Rental Requests & Actions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review rental requests from neighbors, confirm handovers, and close completed returns.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Showing {requests.length} incoming request records
          </span>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading rental requests..." />
        ) : requests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              No booking requests received yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When renters request to borrow your gear, their requests will appear here for you to
              accept or decline.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F8F5] text-slate-500 border-b border-[#E1E5E1]">
                  <tr>
                    <th className="py-3 px-5 font-semibold">Renter</th>
                    <th className="py-3 px-5 font-semibold">Item</th>
                    <th className="py-3 px-5 font-semibold">Duration & Dates</th>
                    <th className="py-3 px-5 font-semibold">Rental Amount</th>
                    <th className="py-3 px-5 font-semibold">Status</th>
                    <th className="py-3 px-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Renter */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              b.renterAvatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                            }
                            alt={b.renterName}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{b.renterName}</div>
                            <div className="text-[11px] text-slate-400">Renter</div>
                          </div>
                        </div>
                      </td>

                      {/* Item */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3 max-w-xs">
                          <img
                            src={b.itemImage}
                            alt={b.itemName}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/items/${b.itemId}`}
                              className="font-semibold text-slate-900 hover:text-[#236B45] line-clamp-1"
                            >
                              {b.itemName}
                            </Link>
                            {b.notes && (
                              <p className="text-[11px] text-slate-400 truncate italic">
                                "{b.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-5 text-slate-600">
                        <div className="font-medium text-slate-800">{b.duration}</div>
                        <div className="text-[11px] text-slate-400">
                          {formatDateTime(b.startDate)}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#236B45] text-sm">
                          {formatCurrency(b.totalAmount)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <BookingStatusBadge status={b.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleActionClick(
                                    b,
                                    'ACCEPTED',
                                    'Accept Request',
                                    `Accept ${b.renterName}'s rental request for ${b.itemName}? They will be notified that the item is approved and ready.`,
                                    'primary'
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#236B45] text-white hover:bg-[#1b5636] transition-colors cursor-pointer"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleActionClick(
                                    b,
                                    'REJECTED',
                                    'Decline Request',
                                    `Decline ${b.renterName}'s request? The booking status will be set to REJECTED.`,
                                    'danger'
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {(b.status === 'ACCEPTED' || b.status === 'CONFIRMED') && (
                            <button
                              type="button"
                              onClick={() =>
                                handleActionClick(
                                  b,
                                  'ACTIVE',
                                  'Mark as Handed Over',
                                  `Confirm that you have physically handed over ${b.itemName} to ${b.renterName}? Status will become ACTIVE on the backend.`,
                                  'primary'
                                )
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                              Mark Handed Over
                            </button>
                          )}

                          {b.status === 'ACTIVE' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleActionClick(
                                  b,
                                  'COMPLETED',
                                  'Mark as Returned',
                                  `Confirm that ${b.renterName} has returned ${b.itemName} in good condition? This will mark the rental as COMPLETED.`,
                                  'primary'
                                )
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer"
                            >
                              Mark Returned
                            </button>
                          )}

                          {b.status === 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => setReviewTarget(b)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                            >
                              Review Renter
                            </button>
                          )}

                          {(b.status === 'CANCELLED' || b.status === 'REJECTED') && (
                            <span className="text-xs text-slate-400 italic">No action needed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {requests.map((b) => (
                <div key={b.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.renterAvatar}
                        alt={b.renterName}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{b.renterName}</div>
                        <div className="text-xs text-slate-400">
                          {formatDateTime(b.startDate)}
                        </div>
                      </div>
                    </div>
                    <BookingStatusBadge status={b.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-3 bg-[#F8F8F5] p-3 rounded-xl border border-[#E1E5E1]">
                    <img
                      src={b.itemImage}
                      alt={b.itemName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-900 text-xs truncate">
                        {b.itemName}
                      </h4>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-slate-500">{b.duration}</span>
                        <span className="font-bold text-[#236B45]">
                          {formatCurrency(b.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Mobile */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {b.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleActionClick(
                              b,
                              'ACCEPTED',
                              'Accept Request',
                              `Accept rental for ${b.itemName}?`,
                              'primary'
                            )
                          }
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#236B45] text-white cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleActionClick(
                              b,
                              'REJECTED',
                              'Decline Request',
                              `Decline rental request?`,
                              'danger'
                            )
                          }
                          className="px-4 py-2 rounded-xl text-xs font-medium text-rose-600 bg-rose-50 cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {(b.status === 'ACCEPTED' || b.status === 'CONFIRMED') && (
                      <button
                        type="button"
                        onClick={() =>
                          handleActionClick(
                            b,
                            'ACTIVE',
                            'Mark as Handed Over',
                            `Confirm hand over for ${b.itemName}?`,
                            'primary'
                          )
                        }
                        className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white cursor-pointer"
                      >
                        Mark Handed Over
                      </button>
                    )}

                    {b.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleActionClick(
                            b,
                            'COMPLETED',
                            'Mark as Returned',
                            `Confirm returned for ${b.itemName}?`,
                            'primary'
                          )
                        }
                        className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white cursor-pointer"
                      >
                        Mark Returned
                      </button>
                    )}

                    {b.status === 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => setReviewTarget(b)}
                        className="w-full py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        Review Renter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Review Renter Modal (POST /api/reviews) */}
      <ReviewModal
        isOpen={Boolean(reviewTarget)}
        booking={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onReviewSubmitted={() => {
          showToast('Review submitted successfully!', 'success');
        }}
      />

      {/* Confirmation Dialog for Status Transitions */}
      <ConfirmDialog
        isOpen={Boolean(actionConfirm)}
        title={actionConfirm?.label || 'Confirm Action'}
        message={actionConfirm?.message || 'Proceed with this booking state change?'}
        confirmText={isProcessing ? 'Updating...' : actionConfirm?.label || 'Confirm'}
        cancelText="Cancel"
        confirmVariant={actionConfirm?.variant || 'primary'}
        onConfirm={executeStatusChange}
        onCancel={() => setActionConfirm(null)}
      />
    </div>
  );
};

export default OwnerDashboard;

