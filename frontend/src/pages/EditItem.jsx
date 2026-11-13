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
          lat: item.lat || 28.5585,
          lng: item.lng || 77.2029,
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
        lat: formData.lat || 28.5585,
        lng: formData.lng || 77.2029,
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
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#14281D]/70 hover:text-[#14281D]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to My Shelf</span>
        </Link>
        <span className="text-xs font-mono text-[#14281D]/60">
          Editing Item #{id}
        </span>
      </div>

      <div className="bg-[#FAF8F5] rounded-3xl border-2 border-[#14281D] p-6 sm:p-8 shadow-hard">
        <div className="pb-6 border-b-2 border-[#14281D]/10">
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#14281D]">Edit Gear Details</h1>
          <p className="text-xs sm:text-sm text-[#14281D]/70 font-sans mt-1">
            Update pricing, deposit, descriptions, or change status when your item is returned.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#14281D] block uppercase">
              Item Name <span className="text-[#E8590C]">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm font-medium bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none focus:shadow-hard ${
                errors.name ? 'border-rose-600' : 'border-[#14281D]'
              }`}
            />
            {errors.name && <p className="text-xs font-mono text-rose-600 mt-1">{errors.name}</p>}
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-[#14281D] block uppercase">
                Category <span className="text-[#E8590C]">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm font-bold bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-[#14281D] block uppercase">Item Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm font-bold bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none cursor-pointer"
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
              <label className="text-xs font-mono font-bold text-[#14281D] block uppercase">
                Rental Price (₹) <span className="text-[#E8590C]">*</span>
              </label>
              <input
                type="number"
                name="rentalPrice"
                min="1"
                value={formData.rentalPrice}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-sm font-mono font-medium bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none focus:shadow-hard ${
                  errors.rentalPrice ? 'border-rose-600' : 'border-[#14281D]'
                }`}
              />
              {errors.rentalPrice && (
                <p className="text-xs font-mono text-rose-600 mt-1">{errors.rentalPrice}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-[#14281D] block uppercase">
                Rate Type
              </label>
              <select
                name="rentalType"
                value={formData.rentalType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm font-bold bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="HOURLY">Hourly Rate</option>
                <option value="DAILY">Daily Rate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-[#14281D] block uppercase">
                Refundable Deposit (₹)
              </label>
              <input
                type="number"
                name="deposit"
                min="0"
                value={formData.deposit}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm font-mono font-medium bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#14281D] block uppercase">
              Description <span className="text-[#E8590C]">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm font-sans bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none focus:shadow-hard ${
                errors.description ? 'border-rose-600' : 'border-[#14281D]'
              }`}
            />
            {errors.description && (
              <p className="text-xs font-mono text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#14281D] block uppercase">
              Location / Neighborhood <span className="text-[#E8590C]">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm font-medium bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none focus:shadow-hard ${
                errors.location ? 'border-rose-600' : 'border-[#14281D]'
              }`}
            />
            {errors.location && <p className="text-xs font-mono text-rose-600 mt-1">{errors.location}</p>}
          </div>

          {/* Image URL */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-[#14281D] block uppercase">
              Item Image URL <span className="text-[#E8590C]">*</span>
            </label>
            <div className="flex gap-4 items-start">
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className={`flex-1 px-3.5 py-2.5 text-sm font-mono bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none focus:shadow-hard ${
                  errors.imageUrl ? 'border-rose-600' : 'border-[#14281D]'
                }`}
              />
              {formData.imageUrl && (
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#14281D] shadow-hard-sm bg-white flex-shrink-0">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            {errors.imageUrl && <p className="text-xs font-mono text-rose-600 mt-1">{errors.imageUrl}</p>}
          </div>

          {/* Availability Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#14281D] select-none">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="w-4 h-4 accent-[#14281D] text-[#14281D] rounded border-[#14281D] focus:ring-0"
              />
              <span>Item is available for new neighbor bookings</span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t-2 border-[#14281D]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-listings')}
              className="px-5 py-2.5 text-xs font-mono font-bold text-[#14281D] bg-white hover:bg-[#FAF8F5] border-2 border-[#14281D] shadow-hard-sm btn-tactile rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#14281D] hover:bg-[#E8590C] disabled:opacity-50 text-[#F6F1E9] text-xs font-bold rounded-xl border-2 border-[#14281D] shadow-hard btn-tactile transition-colors cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#F2B705]" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItem;

