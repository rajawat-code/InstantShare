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

  const quotedAmount = costCalculation.totalAmount;
  const platformFee = Math.round(quotedAmount * 0.1);
  const securityDeposit = Number(item?.deposit || 0);
  const totalPayable = quotedAmount + platformFee + securityDeposit;

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
        quotedAmount,
        platformFee,
        securityDeposit,
        totalPayable,
        totalAmount: totalPayable,
        deposit: securityDeposit,
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
          <div className="relative aspect-[16/10] w-full bg-slate-100 rounded-3xl overflow-hidden border border-[#E1E5E1] shadow-xs">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {/* Availability Pill */}
            <div className="absolute top-4 left-4">
              {item.available ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Available for Rent
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 backdrop-blur-xs">
                  Currently Rented Out
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/95 text-slate-700 border border-slate-200 shadow-xs backdrop-blur-xs">
                {item.category}
              </span>
            </div>
          </div>

          {/* Title, Location & Core Specs */}
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-[#E1E5E1]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {item.location}
                </span>

                {distInfo ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF3EE] text-[#236B45] border border-[#DCFCE7]">
                    <Navigation2 className="w-3 h-3 text-[#236B45] fill-[#236B45]" />
                    <span>{distInfo.formatted}</span>
                    <span className="text-slate-400 font-normal">({distInfo.walkingTime})</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={requestCurrentLocation}
                    className="inline-flex items-center gap-1 text-[11px] text-[#236B45] hover:underline cursor-pointer"
                  >
                    <Navigation2 className="w-3 h-3" />
                    <span>Check distance from me</span>
                  </button>
                )}
              </div>

              {item.rating && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {item.rating.toFixed(1)} ({item.reviewsCount || 0} reviews)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#252B27] leading-tight">
              {item.name}
            </h1>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Item Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Quick condition details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3 bg-[#F8F8F5] rounded-xl border border-[#E1E5E1]">
                <span className="text-slate-400 block text-[11px]">Rental Mode</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {item.rentalType === 'HOURLY' ? 'Hourly Rental' : 'Daily Rental'}
                </span>
              </div>
              <div className="p-3 bg-[#F8F8F5] rounded-xl border border-[#E1E5E1]">
                <span className="text-slate-400 block text-[11px]">Item Condition</span>
                <span className="font-semibold text-slate-800">{item.condition || 'Good'}</span>
              </div>
              <div className="p-3 bg-[#F8F8F5] rounded-xl border border-[#E1E5E1]">
                <span className="text-slate-400 block text-[11px]">Security Deposit</span>
                <span className="font-semibold text-slate-800">
                  {item.deposit ? formatCurrency(item.deposit) : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Owner Profile Card */}
          {owner && (
            <div className="bg-white p-6 rounded-2xl border border-[#E1E5E1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={owner.avatar}
                  alt={owner.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-50 flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-base">{owner.name}</h3>
                    <span className="text-[10px] bg-[#EEF3EE] text-[#236B45] font-semibold px-2 py-0.5 rounded-full">
                      Verified Owner
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{owner.location}</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic">
                    "{owner.bio}"
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-500 self-end sm:self-center">
                <div>Rating: <strong className="text-slate-800 font-semibold">{owner.rating} / 5.0</strong></div>
                <div className="text-[11px]">Member since {owner.memberSince}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Booking Request Form & Sticky Summary Widget */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-[#E1E5E1] p-6 shadow-sm sticky top-24 space-y-6">
            {/* Price display header */}
            <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-2xl font-bold text-[#236B45]">
                  {formatCurrency(item.rentalPrice)}
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  /{item.rentalType === 'HOURLY' ? 'hour' : 'day'}
                </span>
              </div>

              <div className="text-xs text-slate-500">
                {item.available ? (
                  <span className="text-emerald-700 font-medium">Ready for booking</span>
                ) : (
                  <span className="text-slate-500 font-medium">Currently unavailable</span>
                )}
              </div>
            </div>

            {/* Check if current user is owner */}
            {isOwner ? (
              <div className="bg-[#EEF3EE] border border-[#DCFCE7] rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center gap-2 font-semibold text-[#236B45]">
                  <Info className="w-4 h-4" />
                  <span>You are the owner of this listing</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Renters will use this form to send you rental requests. To manage or modify this
                  item, please visit your listings page.
                </p>
                <div className="flex gap-2 pt-1">
                  <Link
                    to={`/edit-item/${item.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#236B45] text-white rounded-xl font-medium hover:bg-[#1b5636] transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Listing</span>
                  </Link>
                  <Link
                    to="/my-listings"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                  >
                    <span>My Listings</span>
                  </Link>
                </div>
              </div>
            ) : !item.available ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  <span>Item currently rented out</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  This item is currently being rented by another member. Please check back later or
                  explore similar items in {item.category}.
                </p>
                <Link
                  to={`/explore?category=${encodeURIComponent(item.category)}`}
                  className="inline-block text-[#236B45] font-semibold underline mt-1"
                >
                  Explore similar items
                </Link>
              </div>
            ) : (
              /* Active Booking Request Form */
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900 text-base">Request to Rent</h3>
                  <p className="text-xs text-slate-500">
                    Specify your rental window. The owner will review your request.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Start Date & Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Rental Start Date & Time
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F8F8F5] border border-[#E1E5E1] rounded-xl focus:outline-none focus:border-[#236B45] text-slate-800"
                    />
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Rental Return Date & Time
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F8F8F5] border border-[#E1E5E1] rounded-xl focus:outline-none focus:border-[#236B45] text-slate-800"
                    />
                  </div>
                </div>

                {/* Notes to Owner */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Note for {owner ? owner.name.split(' ')[0] : 'Owner'} (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Briefly explain what you'll use it for..."
                    className="w-full px-3 py-2 text-xs bg-[#F8F8F5] border border-[#E1E5E1] rounded-xl focus:outline-none focus:border-[#236B45] text-slate-800 resize-none"
                  />
                </div>

                {/* Calculation Summary Box (Matching Backend API Breakdown) */}
                <div className="bg-[#F8F8F5] rounded-2xl p-4 border border-[#E1E5E1] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Rental Duration:</span>
                    <strong className="text-slate-800 font-semibold">
                      {costCalculation.durationText}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Rate:</span>
                    <span>
                      {formatCurrency(item.rentalPrice)} /{' '}
                      {item.rentalType === 'HOURLY' ? 'hour' : 'day'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Quoted Rental Amount:</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(quotedAmount)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Platform Fee (10%):</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(platformFee)}</span>
                    </div>

                    {securityDeposit > 0 && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Refundable Deposit:</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(securityDeposit)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-slate-900">
                    <div>
                      <span>Total Payable:</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Quoted + 10% fee + deposit</span>
                    </div>
                    <span className="text-base text-[#236B45]">
                      {formatCurrency(totalPayable)}
                    </span>
                  </div>
                </div>

                {/* Submit Request Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !costCalculation.isValid}
                  className="w-full py-3 bg-[#236B45] hover:bg-[#1b5636] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Send Rental Request</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  No payment is processed now. Owner approval is required first.
                </p>
              </form>
            )}

            {/* Platform Guarantee snippet */}
            <div className="pt-4 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-500">
              <ShieldCheck className="w-5 h-5 text-[#236B45] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-700 font-medium block">
                  Peer Handover Guarantee
                </strong>
                Inspect item condition during pickup. Both parties verify handover safely.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;

