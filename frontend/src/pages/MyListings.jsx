import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  PackageOpen,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';
import { formatCurrency } from '../utils/pricing';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';

export const MyListings = () => {
  const { currentUser, showToast, dataVersion } = useUser();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const userItems = await apiService.getMyListings(currentUser.id);
        setListings(userItems);
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [currentUser.id, dataVersion]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await apiService.deleteItem(deleteTarget.id);
      showToast(`Deleted listing: "${deleteTarget.name}"`, 'success');
      setListings((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
      showToast('Error deleting item listing.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#14281D]/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#F2B705]/20 border border-[#14281D]/20 text-[11px] font-mono font-bold text-[#14281D] mb-1">
            <span>● NEIGHBORHOOD INVENTORY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#14281D] tracking-tight">
            My Gear Shelf
          </h1>
          <p className="text-xs sm:text-sm text-[#14281D]/70 font-sans mt-1">
            Manage equipment you've listed on InstantShare as{' '}
            <strong className="text-[#14281D]">{currentUser.name}</strong>
          </p>
        </div>

        <Link
          to="/add-item"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14281D] hover:bg-[#E8590C] text-[#F6F1E9] text-xs font-bold rounded-xl border-2 border-[#14281D] shadow-hard btn-tactile transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[#F2B705]" />
          <span>Add New Gear</span>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading your listings..." />
      ) : listings.length === 0 ? (
        <div className="bg-[#FAF8F5] rounded-3xl border-2 border-[#14281D] p-12 text-center max-w-lg mx-auto space-y-4 shadow-hard">
          <div className="w-16 h-16 rounded-2xl bg-[#F2B705] border-2 border-[#14281D] shadow-hard-sm text-[#14281D] flex items-center justify-center mx-auto transform -rotate-3">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-black text-[#14281D]">No gear on your shelf yet</h3>
            <p className="text-xs text-[#14281D]/70 leading-relaxed font-sans">
              You haven't listed any gear under {currentUser.name}'s profile. Start sharing your
              tools, camera, or outdoor gear with nearby neighbors!
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/add-item"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14281D] hover:bg-[#E8590C] text-[#F6F1E9] text-xs font-bold rounded-xl border-2 border-[#14281D] shadow-hard btn-tactile transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-[#F2B705]" />
              <span>List Your First Item</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-[#FAF8F5] rounded-2xl border-2 border-[#14281D] overflow-hidden flex flex-col justify-between shadow-hard hover:shadow-hard-lg transition-all"
            >
              {/* Media with status badge */}
              <div className="relative aspect-[16/10] bg-white overflow-hidden border-b-2 border-[#14281D]">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  {item.available ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#FAF8F5] text-[#14281D] border border-[#14281D]">
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#F2B705] text-[#14281D] border border-[#14281D]">
                      Rented Out
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#FAF8F5] text-[#14281D] border border-[#14281D]">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1 text-xs text-[#14281D]/60 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#E8590C]" />
                    <span>{item.location}</span>
                  </div>
                  <h3 className="font-serif font-black text-lg text-[#14281D] line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#14281D]/70 font-sans line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Price */}
                <div className="pt-2 border-t-2 border-[#14281D]/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#14281D]/60 block uppercase">Rental Rate</span>
                    <div className="text-lg font-serif font-black text-[#14281D]">
                      {formatCurrency(item.rentalPrice)}
                      <span className="text-xs font-mono font-normal text-[#14281D]/60 ml-1">
                        /{item.rentalType === 'HOURLY' ? 'hour' : 'day'}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/items/${item.id}`}
                    className="text-xs font-mono font-bold text-[#14281D] hover:text-[#E8590C] inline-flex items-center gap-1 underline"
                    title="View item public page"
                  >
                    <span>Public View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-white border-t-2 border-[#14281D] flex items-center justify-end gap-2">
                <Link
                  to={`/edit-item/${item.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold text-[#14281D] bg-[#FAF8F5] hover:bg-white border-2 border-[#14281D] shadow-hard-sm btn-tactile rounded-lg transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-[#14281D]" />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold text-rose-700 bg-white hover:bg-rose-50 border-2 border-rose-600 shadow-hard-sm btn-tactile rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Item Listing"
        message={`Are you sure you want to permanently remove "${deleteTarget?.name}"? Any past completed bookings will remain archived, but renters will no longer be able to find or book this item.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Listing'}
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default MyListings;

