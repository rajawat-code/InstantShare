import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Trash2 } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';

export const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, showToast, dataVersion } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0],
    rentalPrice: '',
    rentalType: 'DAILY',
    imageUrl: '',
    location: '',
    available: true,
    condition: 'Excellent',
    deposit: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true);
        const item = await apiService.getItemById(id);
        if (!item) {
          setLoadError('Item not found.');
          return;
        }

        // Verify owner permission
        if (item.ownerId !== currentUser.id) {
          setLoadError('You can only edit items that you own. Switch your demo user profile to edit this item.');
          return;
        }

        setFormData({
          name: item.name || '',
          description: item.description || '',
          category: item.category || CATEGORIES[0],
          rentalPrice: item.rentalPrice || '',
          rentalType: item.rentalType || 'DAILY',
          imageUrl: item.imageUrl || '',
          location: item.location || '',
          available: item.available !== undefined ? item.available : true,
          condition: item.condition || 'Excellent',
          deposit: item.deposit || '',
        });
      } catch (err) {
        console.error('Error loading item for edit:', err);
        setLoadError('Unable to load item details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id, currentUser.id, dataVersion]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Item name is required.';
    if (!formData.description.trim()) errs.description = 'Description is required.';
    else if (formData.description.trim().length < 15)
      errs.description = 'Please provide at least 15 characters describing the item.';

    if (!formData.category) errs.category = 'Category is required.';

    if (!formData.rentalPrice || Number(formData.rentalPrice) <= 0) {
      errs.rentalPrice = 'Rental price must be greater than zero.';
    }

    if (!formData.imageUrl.trim()) {
      errs.imageUrl = 'Image URL is required.';
    }

    if (!formData.location.trim()) {
      errs.location = 'Approximate location is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const updatedFields = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        rentalPrice: Number(formData.rentalPrice),
        rentalType: formData.rentalType,
        imageUrl: formData.imageUrl.trim(),
        location: formData.location.trim(),
        available: Boolean(formData.available),
        condition: formData.condition,
        deposit: formData.deposit ? Number(formData.deposit) : 0,
      };

      await apiService.updateItem(id, updatedFields);
      showToast('Item listing updated successfully!', 'success');
      navigate('/my-listings');
    } catch (err) {
      console.error('Error updating item:', err);
      showToast('Failed to update listing.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading item for editing..." />;
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-600">{loadError}</p>
        <Link
          to="/my-listings"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#236B45] text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Listings</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/my-listings"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#236B45]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Listings</span>
        </Link>
        <span className="text-xs text-slate-400">
          Editing Item #{id}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-[#E1E5E1] p-6 sm:p-8 shadow-xs">
        <div className="pb-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-[#252B27]">Edit Item Listing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Update your item pricing, rental availability, or description.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 block">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm bg-[#F8F8F5] border rounded-xl focus:outline-none focus:border-[#236B45] ${
                errors.name ? 'border-rose-400' : 'border-[#E1E5E1]'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 block">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F5] border border-[#E1E5E1] rounded-xl focus:outline-none focus:border-[#236B45] cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 block">Item Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F5] border border-[#E1E5E1] rounded-xl focus:outline-none focus:border-[#236B45] cursor-pointer"
              >
                <option value="Like New">Like New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          {/* Pricing & Duration Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 block">
                Rental Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="rentalPrice"
                min="1"
                value={formData.rentalPrice}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-sm bg-[#F8F8F5] border rounded-xl focus:outline-none focus:border-[#236B45] ${
                  errors.rentalPrice ? 'border-rose-400' : 'border-[#E1E5E1]'
                }`}
              />
              {errors.rentalPrice && (
                <p className="text-xs text-rose-600 mt-1">{errors.rentalPrice}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 block">
                Rental Rate Type
              </label>
              <select
                name="rentalType"
                value={formData.rentalType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F5] border border-[#E1E5E1] rounded-xl focus:outline-none focus:border-[#236B45] cursor-pointer"
              >
                <option value="HOURLY">Hourly Rate</option>
                <option value="DAILY">Daily Rate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 block">
                Refundable Deposit (₹)
              </label>
              <input
                type="number"
                name="deposit"
                min="0"
                value={formData.deposit}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F5] border border-[#E1E5E1] rounded-xl focus:outline-none focus:border-[#236B45]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 block">
              Item Description & Inclusions <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm bg-[#F8F8F5] border rounded-xl focus:outline-none focus:border-[#236B45] ${
                errors.description ? 'border-rose-400' : 'border-[#E1E5E1]'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 block">
              Approximate Location / City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm bg-[#F8F8F5] border rounded-xl focus:outline-none focus:border-[#236B45] ${
                errors.location ? 'border-rose-400' : 'border-[#E1E5E1]'
              }`}
            />
            {errors.location && <p className="text-xs text-rose-600 mt-1">{errors.location}</p>}
          </div>

          {/* Image URL */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-800 block">
              Item Image URL <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-4 items-start">
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className={`flex-1 px-3.5 py-2.5 text-sm bg-[#F8F8F5] border rounded-xl focus:outline-none focus:border-[#236B45] ${
                  errors.imageUrl ? 'border-rose-400' : 'border-[#E1E5E1]'
                }`}
              />
              {formData.imageUrl && (
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            {errors.imageUrl && <p className="text-xs text-rose-600 mt-1">{errors.imageUrl}</p>}
          </div>

          {/* Availability Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="w-4 h-4 text-[#236B45] rounded border-slate-300 focus:ring-[#236B45]"
              />
              <span>Item is available for new rental bookings</span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-listings')}
              className="px-5 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#236B45] hover:bg-[#1b5636] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItem;

