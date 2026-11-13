import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  User,
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Share2,
  Info,
  Edit,
  Navigation2,
  Footprints,
} from 'lucide-react';
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';
import { useLocation } from '../context/LocationContext';
import {
  formatCurrency,
  calculateRentalCost,
  getDefaultBookingDates,
} from '../utils/pricing';
import LoadingSpinner from '../components/LoadingSpinner';

export const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, showToast, dataVersion } = useUser();
  const { getDistanceToItem, hasLocation, requestCurrentLocation } = useLocation();

  const [item, setItem] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking Form State
  const defaultDates = getDefaultBookingDates();
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [bookingNotes, setBookingNotes] = useState('');
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchItemAndOwner = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const itemData = await apiService.getItemById(id);
        setItem(itemData);

        if (itemData && itemData.ownerId) {
          const ownerData = await apiService.getUserById(itemData.ownerId);
          setOwner(ownerData);
        }

        // Adjust default end date based on rental type
        if (itemData) {
          const dates = getDefaultBookingDates(itemData.rentalType);
          setStartDate(dates.start);
          setEndDate(dates.end);
        }
      } catch (err) {
        console.error('Failed to load item:', err);
        setError('This item could not be found or may have been deleted.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemAndOwner();
  }, [id, dataVersion]);

  // Dynamic cost calculation based on selected dates
  const costCalculation = item
    ? calculateRentalCost(startDate, endDate, item.rentalPrice, item.rentalType)
    : { units: 0, durationText: '', totalAmount: 0, isValid: false, error: null };

  const isOwner = item && currentUser && currentUser.id === item.ownerId;

  // Distance from user to this item
  const distInfo =
    item?.lat !== undefined && item?.lng !== undefined
      ? getDistanceToItem(item.lat, item.lng)
      : null;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!item.available) {
      setFormError('This item is currently marked as unavailable for rent.');
      return;
    }

    if (isOwner) {
      setFormError('You cannot request to rent an item that you own.');
      return;
    }

    if (!startDate || !endDate) {
      setFormError('Please select both start and end rental times.');
      return;
    }

    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const now = new Date();

    if (startObj < now) {
      setFormError('Rental start time must be in the future.');
      return;
    }

    if (endObj <= startObj) {
      setFormError('Rental end time must be after the start time.');
      return;
    }

    if (!costCalculation.isValid) {
      setFormError(costCalculation.error || 'Please choose a valid rental duration.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newBooking = {
        itemId: item.id,
        itemName: item.name,
        itemImage: item.imageUrl,
        ownerId: item.ownerId,
        ownerName: owner ? owner.name : 'Item Owner',
        renterId: currentUser.id,
        renterName: currentUser.name,
        renterAvatar: currentUser.avatar,
        startDate,
        endDate,
        duration: costCalculation.durationText,
        durationUnits: costCalculation.units,
        rentalRate: item.rentalPrice,
        rentalType: item.rentalType,
        totalAmount: costCalculation.totalAmount,
        notes: bookingNotes.trim() || 'No special notes provided.',
      };

      await apiService.createBooking(newBooking);
      showToast('Rental request submitted successfully! Status is PENDING.', 'success');
      navigate('/my-bookings');
    } catch (err) {
      console.error('Error submitting booking:', err);
      setFormError('Failed to submit booking request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading item details..." size="lg" />;
  }

  if (error || !item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Item Not Found</h2>
        <p className="text-sm text-slate-600">{error || 'Unable to display item details.'}</p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#236B45] text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#236B45] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>

        <span className="text-xs text-slate-400">
          Listed in <strong className="text-slate-600">{item.category}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media & Full Specs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Large Image */}
          <div className="relative aspect-[16/10] w-full bg-white rounded-2xl overflow-hidden border-2 border-[#14281D] shadow-hard-lg">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {/* Availability Pill */}
            <div className="absolute top-4 left-4">
              {item.available ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#FAF8F5] text-[#14281D] border-2 border-[#14281D] shadow-hard-sm">
                  <span className="w-2 h-2 rounded-full bg-[#14281D] animate-ping"></span>
                  Ready to Borrow
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#F2B705] text-[#14281D] border-2 border-[#14281D] shadow-hard-sm">
                  Currently with a Neighbor
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#FAF8F5] text-[#14281D] border-2 border-[#14281D] shadow-hard-sm">
                {item.category}
              </span>
            </div>
          </div>

          {/* Title, Location & Core Specs */}
          <div className="space-y-4 bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border-2 border-[#14281D] shadow-hard">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#14281D]/80 font-medium">
                  <MapPin className="w-4 h-4 text-[#E8590C]" />
                  {item.location}
                </span>

                {distInfo ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-[#F2B705]/20 text-[#14281D] border border-[#14281D]">
                    <Navigation2 className="w-3 h-3 text-[#14281D] fill-[#14281D]" />
                    <span>{distInfo.formatted}</span>
                    <span className="text-[#14281D]/60 font-normal">({distInfo.walkingTime})</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={requestCurrentLocation}
                    className="inline-flex items-center gap-1 text-[11px] text-[#E8590C] font-bold hover:underline cursor-pointer"
                  >
                    <Navigation2 className="w-3 h-3" />
                    <span>Check distance from me</span>
                  </button>
                )}
              </div>

              {item.rating && (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#14281D] bg-white px-2 py-0.5 rounded border border-[#14281D]">
                  <Star className="w-3.5 h-3.5 text-[#F2B705] fill-[#F2B705]" />
                  {item.rating.toFixed(1)} ({item.reviewsCount || 0} reviews)
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#14281D] leading-tight">
              {item.name}
            </h1>

            <div className="border-t-2 border-[#14281D]/10 pt-4 space-y-2">
              <h3 className="text-[11px] font-mono font-bold text-[#14281D]/60 uppercase tracking-wider">
                About this gear
              </h3>
              <p className="text-sm text-[#14281D]/80 leading-relaxed whitespace-pre-line font-sans">
                {item.description}
              </p>
            </div>

            {/* Quick condition details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t-2 border-[#14281D]/10 text-xs">
              <div className="p-3 bg-white rounded-xl border-2 border-[#14281D] shadow-hard-sm">
                <span className="text-[#14281D]/60 block text-[11px] font-mono font-bold uppercase">Rental Mode</span>
                <span className="font-bold text-[#14281D] capitalize mt-0.5 block">
                  {item.rentalType === 'HOURLY' ? 'Hourly Rental' : 'Daily Rental'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border-2 border-[#14281D] shadow-hard-sm">
                <span className="text-[#14281D]/60 block text-[11px] font-mono font-bold uppercase">Condition</span>
                <span className="font-bold text-[#14281D] mt-0.5 block">{item.condition || 'Well Maintained'}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border-2 border-[#14281D] shadow-hard-sm">
                <span className="text-[#14281D]/60 block text-[11px] font-mono font-bold uppercase">Security Deposit</span>
                <span className="font-bold font-mono text-[#14281D] mt-0.5 block">
                  {item.deposit ? formatCurrency(item.deposit) : 'Zero deposit'}
                </span>
              </div>
            </div>
          </div>

          {/* Owner Profile Card */}
          {owner && (
            <div className="bg-[#FAF8F5] p-6 rounded-2xl border-2 border-[#14281D] shadow-hard flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={owner.avatar}
                  alt={owner.name}
                  className="w-14 h-14 rounded-xl border-2 border-[#14281D] shadow-hard-sm object-cover flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-black text-lg text-[#14281D]">{owner.name}</h3>
                    <span className="text-[10px] bg-[#F2B705] text-[#14281D] border border-[#14281D] font-mono font-bold px-2 py-0.5 rounded-full">
                      Trusted Neighbor
                    </span>
                  </div>
                  <p className="text-xs text-[#14281D]/70 font-sans mt-0.5">{owner.location}</p>
                  <p className="text-xs text-[#14281D]/80 mt-1 line-clamp-1 italic font-serif">
                    "{owner.bio}"
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-[#14281D]/70 self-end sm:self-center font-mono">
                <div>Rating: <strong className="text-[#14281D] font-bold">{owner.rating} / 5.0</strong></div>
                <div className="text-[11px]">Neighbor since {owner.memberSince}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Booking Request Form & Sticky Summary Widget */}
        <div className="lg:col-span-5">
          <div className="bg-[#FAF8F5] rounded-3xl border-2 border-[#14281D] p-6 sm:p-7 shadow-hard-lg sticky top-24 space-y-6">
            {/* Price display header */}
            <div className="flex items-baseline justify-between pb-4 border-b-2 border-[#14281D]/10">
              <div>
                <span className="text-3xl font-serif font-black text-[#14281D]">
                  {formatCurrency(item.rentalPrice)}
                </span>
                <span className="text-xs font-mono font-bold text-[#14281D]/60 ml-1">
                  /{item.rentalType === 'HOURLY' ? 'hour' : 'day'}
                </span>
              </div>

              <div className="text-xs font-mono">
                {item.available ? (
                  <span className="text-[#14281D] font-bold bg-[#F2B705]/20 border border-[#14281D] px-2.5 py-1 rounded-md">
                    Ready on the porch
                  </span>
                ) : (
                  <span className="text-[#14281D]/60 font-medium">Currently rented</span>
                )}
              </div>
            </div>

            {/* Check if current user is owner */}
            {isOwner ? (
              <div className="bg-white border-2 border-[#14281D] shadow-hard-sm rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-[#14281D]">
                  <Info className="w-4 h-4 text-[#E8590C]" />
                  <span>You are the owner of this listing</span>
                </div>
                <p className="text-[#14281D]/70 leading-relaxed">
                  Neighbors will use this panel to send you booking requests. To adjust availability or rates, edit your listing below.
                </p>
                <div className="flex gap-2 pt-1">
                  <Link
                    to={`/edit-item/${item.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14281D] text-[#F6F1E9] border-2 border-[#14281D] shadow-hard-sm btn-tactile rounded-xl font-bold hover:bg-[#E8590C] transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Listing</span>
                  </Link>
                  <Link
                    to="/my-listings"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-[#14281D] shadow-hard-sm btn-tactile text-[#14281D] rounded-xl font-bold hover:bg-[#FAF8F5] transition-colors"
                  >
                    <span>My Shelf</span>
                  </Link>
                </div>
              </div>
            ) : !item.available ? (
              <div className="bg-white border-2 border-[#14281D] shadow-hard-sm rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#14281D]">
                  <AlertCircle className="w-4 h-4 text-[#E8590C]" />
                  <span>Item currently borrowed by a neighbor</span>
                </div>
                <p className="text-[#14281D]/70 leading-relaxed font-sans">
                  This item is out on loan right now. Check back soon or search for others nearby.
                </p>
                <Link
                  to={`/explore?category=${encodeURIComponent(item.category)}`}
                  className="inline-block text-[#E8590C] font-bold underline mt-1"
                >
                  Explore similar gear nearby
                </Link>
              </div>
            ) : (
              /* Active Booking Request Form */
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-xl text-[#14281D]">Borrow this gear</h3>
                  <p className="text-xs text-[#14281D]/70 font-sans">
                    Choose your dates. Your neighbor will confirm within a couple hours.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-600 text-rose-800 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Start Date & Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#14281D] uppercase block">
                    Pick-up Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-medium bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none text-[#14281D]"
                  />
                </div>

                {/* End Date & Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#14281D] uppercase block">
                    Return Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-medium bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none text-[#14281D]"
                  />
                </div>

                {/* Notes to Owner */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#14281D] uppercase block">
                    Note for {owner ? owner.name.split(' ')[0] : 'Neighbor'}
                  </label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="E.g., Shooting a local event on Saturday morning..."
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none text-[#14281D] resize-none font-sans"
                  />
                </div>

                {/* Calculation Summary Box */}
                <div className="bg-white rounded-2xl p-4 border-2 border-[#14281D] shadow-hard-sm space-y-2 text-xs font-sans">
                  <div className="flex items-center justify-between text-[#14281D]/80">
                    <span>Rental Duration:</span>
                    <strong className="text-[#14281D] font-mono font-bold">
                      {costCalculation.durationText}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[#14281D]/80">
                    <span>Rate:</span>
                    <span className="font-mono">
                      {formatCurrency(item.rentalPrice)} /{' '}
                      {item.rentalType === 'HOURLY' ? 'hour' : 'day'}
                    </span>
                  </div>

                  {item.deposit && (
                    <div className="flex items-center justify-between text-[#14281D]/80">
                      <span>Refundable Deposit:</span>
                      <span className="font-mono">{formatCurrency(item.deposit)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t-2 border-[#14281D]/10 flex items-center justify-between font-bold text-sm text-[#14281D]">
                    <span className="font-serif">Total Estimate:</span>
                    <span className="text-xl font-serif font-black text-[#E8590C]">
                      {formatCurrency(costCalculation.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Submit Request Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !costCalculation.isValid}
                  className="w-full py-3.5 bg-[#14281D] hover:bg-[#E8590C] disabled:opacity-50 disabled:cursor-not-allowed text-[#F6F1E9] text-sm font-bold rounded-xl border-2 border-[#14281D] shadow-hard btn-tactile transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Sending request to neighbor...</span>
                  ) : (
                    <>
                      <span>Send Borrow Request</span>
                      <ShieldCheck className="w-4 h-4 text-[#F2B705]" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-[#14281D]/60 font-sans">
                  No payment processed upfront. Neighbor confirmation required.
                </p>
              </form>
            )}

            {/* Platform Guarantee snippet */}
            <div className="pt-4 border-t-2 border-[#14281D]/10 flex items-start gap-3 text-xs text-[#14281D]/70 font-sans">
              <ShieldCheck className="w-5 h-5 text-[#E8590C] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#14281D] font-bold block">InstantShare Neighbor Pledge</strong>
                <span>Verified ID, secure escrow, and \$1,000 community gear protection on every borrow. Inspect item condition during porch handover.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;

