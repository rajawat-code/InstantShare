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
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';
import { formatCurrency, formatDateTime } from '../utils/pricing';

export const OwnerDashboard = () => {
  const { currentUser, showToast, dataVersion } = useUser();

  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    .filter((r) => r.status === 'COMPLETED' || r.status === 'ACTIVE')
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
      <div className="pb-4 border-b-2 border-[#14281D]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#F2B705]/20 border border-[#14281D]/20 text-[11px] font-mono font-bold text-[#14281D] mb-1">
            <span>● NEIGHBORHOOD SHED MANAGEMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#14281D] tracking-tight">
            Host & Lending Control
          </h1>
          <p className="text-xs sm:text-sm text-[#14281D]/70 font-sans mt-1">
            Rental requests, handover confirmations, and earnings for{' '}
            <strong className="text-[#14281D]">{currentUser.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/add-item"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14281D] hover:bg-[#E8590C] text-[#F6F1E9] text-xs font-bold rounded-xl border-2 border-[#14281D] shadow-hard btn-tactile transition-colors"
          >
            <Package className="w-4 h-4 text-[#F2B705]" />
            <span>List Another Tool</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Listings */}
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border-2 border-[#14281D] shadow-hard-sm space-y-2">
          <div className="flex items-center justify-between text-[#14281D]/70">
            <span className="text-xs font-mono font-bold uppercase">Total Listings</span>
            <div className="w-8 h-8 rounded-lg bg-white border border-[#14281D] text-[#14281D] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-[#14281D]">{totalListings}</div>
          <div className="text-[11px] font-mono text-[#14281D]/60">Items on shelf</div>
        </div>

        {/* Pending Requests */}
        <div className="bg-[#F2B705]/15 p-5 rounded-2xl border-2 border-[#14281D] shadow-hard-sm space-y-2">
          <div className="flex items-center justify-between text-[#14281D]">
            <span className="text-xs font-mono font-bold uppercase">Pending Requests</span>
            <div className="w-8 h-8 rounded-lg bg-[#F2B705] border border-[#14281D] text-[#14281D] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-[#14281D]">{pendingRequests}</div>
          <div className="text-[11px] font-mono text-[#14281D]/70">Awaiting approval</div>
        </div>

        {/* Active Rentals */}
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border-2 border-[#14281D] shadow-hard-sm space-y-2">
          <div className="flex items-center justify-between text-[#14281D]">
            <span className="text-xs font-mono font-bold uppercase">Active Borrows</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#14281D] text-[#14281D] flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-[#14281D]">{activeRentals}</div>
          <div className="text-[11px] font-mono text-[#14281D]/60">Currently with neighbors</div>
        </div>

        {/* Completed Rentals */}
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border-2 border-[#14281D] shadow-hard-sm space-y-2">
          <div className="flex items-center justify-between text-[#14281D]">
            <span className="text-xs font-mono font-bold uppercase">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-white border border-[#14281D] text-[#14281D] flex items-center justify-center">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-[#14281D]">{completedRentals}</div>
          <div className="text-[11px] font-mono text-[#14281D]/60">Safely returned</div>
        </div>

        {/* Total Revenue */}
        <div className="col-span-2 lg:col-span-1 bg-[#14281D] text-[#F6F1E9] p-5 rounded-2xl border-2 border-[#14281D] shadow-hard space-y-2">
          <div className="flex items-center justify-between text-[#F6F1E9]/80">
            <span className="text-xs font-mono font-bold uppercase text-[#F2B705]">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 text-[#F2B705] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-black text-[#F6F1E9]">
            {formatCurrency(totalEarnings)}
          </div>
          <div className="text-[11px] font-mono text-[#F6F1E9]/60">Neighborhood earnings</div>
        </div>
      </div>

      {/* Booking Requests Table & Workflow Actions */}
      <div className="bg-[#FAF8F5] rounded-3xl border-2 border-[#14281D] overflow-hidden shadow-hard">
        <div className="p-6 border-b-2 border-[#14281D]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-serif font-black text-[#14281D]">Rental Requests & Actions</h2>
            <p className="text-xs text-[#14281D]/70 font-sans mt-0.5">
              Review rental requests from neighbors, confirm porch handovers, and mark returned gear.
            </p>
          </div>
          <span className="text-xs font-mono text-[#14281D]/60">
            {requests.length} incoming records
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
                                className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-[#14281D] text-[#F6F1E9] border-2 border-[#14281D] shadow-hard-sm btn-tactile hover:bg-[#E8590C] transition-colors cursor-pointer"
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
                                className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono text-rose-700 bg-white border-2 border-rose-600 shadow-hard-sm btn-tactile hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {b.status === 'ACCEPTED' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleActionClick(
                                  b,
                                  'ACTIVE',
                                  'Mark as Handed Over',
                                  `Confirm that you have physically handed over ${b.itemName} to ${b.renterName}? Status will become ACTIVE.`,
                                  'primary'
                                )
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-[#E8590C] text-white border-2 border-[#14281D] shadow-hard-sm btn-tactile hover:bg-[#14281D] transition-colors cursor-pointer"
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
                              className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-[#14281D] text-[#F2B705] border-2 border-[#14281D] shadow-hard-sm btn-tactile hover:bg-[#E8590C] hover:text-white transition-colors cursor-pointer"
                            >
                              Mark Returned
                            </button>
                          )}

                          {(b.status === 'COMPLETED' ||
                            b.status === 'CANCELLED' ||
                            b.status === 'REJECTED') && (
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

                    {b.status === 'ACCEPTED' && (
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
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

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

