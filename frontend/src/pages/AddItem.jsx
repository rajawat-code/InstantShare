import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  PackagePlus,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';
import { useLocation } from '../context/LocationContext';

// Quick sample image options for convenience
const PRESET_IMAGES = [
  {
    name: 'Camera Kit',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Projector',
    url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Power Tool',
    url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bicycle',
    url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Camping Tent',
    url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bluetooth Speaker',
    url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Air Fryer',
    url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
  },
];

export const AddItem = () => {
  const navigate = useNavigate();
  const { currentUser, showToast } = useUser();
  const { location } = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0],
    rentalPrice: '',
    rentalType: 'DAILY',
    imageUrl: PRESET_IMAGES[0].url,
    location: currentUser.location || 'Agra, Uttar Pradesh',
    available: true,
    condition: 'Excellent',
    deposit: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } else if (
      !formData.imageUrl.startsWith('http://') &&
      !formData.imageUrl.startsWith('https://')
    ) {
      errs.imageUrl = 'Image URL must start with http:// or https://';
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

  const handleSelectPresetImage = (url) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    if (errors.imageUrl) {
      setErrors((prev) => ({ ...prev, imageUrl: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const newItem = {
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
        ownerId: currentUser.id,
        lat: location?.lat || 28.5585,
        lng: location?.lng || 77.2029,
      };

      await apiService.createItem(newItem);
      showToast('Item listed successfully!', 'success');
      navigate('/my-listings');
    } catch (err) {
      console.error('Error creating item:', err);
      showToast('Failed to create item. Please check inputs.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/my-listings"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#14281D]/70 hover:text-[#14281D]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to My Listings</span>
        </Link>
        <span className="text-xs font-mono text-[#14281D]/60">
          Listing as <strong className="text-[#14281D]">{currentUser.name}</strong>
        </span>
      </div>

      <div className="bg-[#FAF8F5] rounded-3xl border-2 border-[#14281D] p-6 sm:p-8 shadow-hard">
        <div className="pb-6 border-b-2 border-[#14281D]/10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#F2B705]/20 border border-[#14281D]/20 text-[11px] font-mono font-bold text-[#14281D] mb-2">
            <span>● NEIGHBORHOOD SHED REGISTRATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#14281D]">List Gear on Your Shelf</h1>
          <p className="text-xs sm:text-sm text-[#14281D]/70 mt-1 font-sans">
            Got a drill, DSLR camera, camping tent, or projector sitting idle? Put it to work for your neighbors.
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
              placeholder="e.g. Sony Alpha A7 III or Bosch Cordless Drill"
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
                placeholder="e.g. 250"
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
                <option value="HOURLY">Per Hour</option>
                <option value="DAILY">Per Day</option>
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
                placeholder="e.g. 1000 (optional)"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-medium bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#14281D] block uppercase">
              Description & What's In The Box <span className="text-[#E8590C]">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detail specifications, accessories included (batteries, cables, cases), usage tips, and any neighborhood pickup instructions..."
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
              Approximate Location / Street <span className="text-[#E8590C]">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Green Park Main or Malviya Nagar"
              className={`w-full px-3.5 py-2.5 text-sm font-medium bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none focus:shadow-hard ${
                errors.location ? 'border-rose-600' : 'border-[#14281D]'
              }`}
            />
            {errors.location && <p className="text-xs font-mono text-rose-600 mt-1">{errors.location}</p>}
          </div>

          {/* Image URL & Preset Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-[#14281D] block uppercase">
                Item Photo <span className="text-[#E8590C]">*</span>
              </label>
              <span className="text-xs font-mono text-[#14281D]/60">Select preset or paste clean URL</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPresetImage(preset.url)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border-2 border-[#14281D] flex-shrink-0 transition-all cursor-pointer ${
                    formData.imageUrl === preset.url
                      ? 'bg-[#14281D] text-[#F6F1E9] shadow-hard-sm'
                      : 'bg-white text-[#14281D] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="flex gap-4 items-start">
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
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
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
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
              <span>Mark this item as available for immediate neighbor bookings</span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t-2 border-[#14281D]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-listings')}
              className="px-5 py-2.5 text-xs font-bold font-mono text-[#14281D] hover:bg-[#FAF8F5] border-2 border-[#14281D] shadow-hard-sm btn-tactile rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#14281D] hover:bg-[#E8590C] disabled:opacity-50 text-[#F6F1E9] text-xs font-bold rounded-xl border-2 border-[#14281D] shadow-hard btn-tactile transition-colors cursor-pointer flex items-center gap-2"
            >
              <PackagePlus className="w-4 h-4 text-[#F2B705]" />
              <span>{isSubmitting ? 'Adding to Neighborhood...' : 'Publish to Neighborhood'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;

