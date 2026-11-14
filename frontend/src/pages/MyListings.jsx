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
        const ownerId = currentUser?.id ?? storageService.getCurrentUserId();
        const ownerEmail = currentUser?.email;
        const userItems = await apiService.getMyListings(ownerId, ownerEmail);
        setListings(Array.isArray(userItems) ? userItems : []);
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [currentUser?.id, currentUser?.email, dataVersion]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E5E1]">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252B27] tracking-tight">
              My Item Listings
            </h1>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#EEF3EE] text-[#236B45] border border-[#DCFCE7]">
              {listings.length} {listings.length === 1 ? 'equipment listed' : 'equipments listed'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Equipment listed by <strong className="text-slate-700">{currentUser?.name}</strong> •{' '}
            <span>{listings.length} items shared with your community</span>
          </p>
        </div>

        <Link
          to="/add-item"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#236B45] hover:bg-[#1b5636] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Item</span>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading your listings..." />
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E1E5E1] p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EEF3EE] text-[#236B45] flex items-center justify-center mx-auto">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">No items listed yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You haven't listed any gear under {currentUser.name}'s profile. Start sharing your
              tools, camera, or outdoor equipment with nearby neighbors!
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/add-item"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#236B45] hover:bg-[#1b5636] text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your First Item</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E1E5E1] overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
            >
              {/* Media with status badge */}
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  {item.available ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                      Rented Out
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/95 text-slate-700 border border-slate-200">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.location}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Price */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Rental Rate</span>
                    <div className="text-base font-bold text-[#236B45]">
                      {formatCurrency(item.rentalPrice)}
                      <span className="text-xs font-normal text-slate-500">
                        /{item.rentalType === 'HOURLY' ? 'hour' : 'day'}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/items/${item.id}`}
                    className="text-xs text-slate-500 hover:text-[#236B45] inline-flex items-center gap-1"
                    title="View item public page"
                  >
                    <span>Public View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-[#F8F8F5] border-t border-[#E1E5E1] flex items-center justify-end gap-2">
                <Link
                  to={`/edit-item/${item.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
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

