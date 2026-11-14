import React, { useState, useEffect } from 'react';
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

  const [categoriesList, setCategoriesList] = useState(
    CATEGORIES.map((cat, idx) => ({ id: idx + 1, name: cat }))
  );

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0],
    categoryId: 1,
    rentalPrice: '',
    rentalType: 'DAILY',
    imageUrl: PRESET_IMAGES[0].url,
    location: currentUser.location || location?.areaName || 'Green Park, New Delhi',
    available: true,
    condition: 'Excellent',
    deposit: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location?.areaName && (!formData.location || formData.location === 'Agra, Uttar Pradesh')) {
      setFormData((prev) => ({ ...prev, location: location.areaName }));
    }
  }, [location?.areaName]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await apiService.getCategories();
        if (Array.isArray(cats) && cats.length > 0) {
          setCategoriesList(cats);
          setFormData((prev) => ({
            ...prev,
            category: prev.category || cats[0].name,
            categoryId: cats[0].id || 1,
          }));
        }
      } catch (err) {
        console.warn('Failed to load dynamic categories in AddItem:', err);
      }
    };
    fetchCats();
  }, []);

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
    if (name === 'category') {
      const matched = categoriesList.find((c) => c.name === value);
      setFormData((prev) => ({
        ...prev,
        category: value,
        categoryId: matched ? matched.id : 1,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
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
        title: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        categoryId: formData.categoryId || 1,
        rentalPrice: Number(formData.rentalPrice),
        rentalType: formData.rentalType,
        imageUrl: formData.imageUrl.trim(),
        imageUrls: [formData.imageUrl.trim()],
        location: formData.location.trim(),
        available: Boolean(formData.available),
        condition: formData.condition,
        deposit: formData.deposit ? Number(formData.deposit) : 0,
        securityDeposit: formData.deposit ? Number(formData.deposit) : 0,
        ownerId: currentUser?.id,
        ownerName: currentUser?.name || 'Verified Neighbor',
        ownerEmail: currentUser?.email,
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#236B45]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Listings</span>
        </Link>
        <span className="text-xs text-slate-400">
          Listing as <strong className="text-slate-700">{currentUser.name}</strong>
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-[#E1E5E1] p-6 sm:p-8 shadow-xs">
        <div className="pb-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-[#252B27]">List an Item for Rent</h1>
          <p className="text-xs text-slate-500 mt-1">
            Share your equipment with neighbors safely. Fill in the details below to publish your
            listing.
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
              placeholder="e.g. Sony Alpha A7 III with 28-70mm Lens"
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
                {categoriesList.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name}
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
                placeholder="e.g. 250"
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
                placeholder="e.g. 1000 (optional)"
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
              placeholder="Detail specifications, accessories included (batteries, cables, cases), usage tips, and any safety instructions..."
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
              placeholder="e.g. Agra, Uttar Pradesh"
              className={`w-full px-3.5 py-2.5 text-sm bg-[#F8F8F5] border rounded-xl focus:outline-none focus:border-[#236B45] ${
                errors.location ? 'border-rose-400' : 'border-[#E1E5E1]'
              }`}
            />
            {errors.location && <p className="text-xs text-rose-600 mt-1">{errors.location}</p>}
          </div>

          {/* Image URL & Preset Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 block">
                Item Image URL <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">Click a sample photo or paste your URL</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPresetImage(preset.url)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex-shrink-0 transition-colors cursor-pointer ${
                    formData.imageUrl === preset.url
                      ? 'border-[#236B45] bg-[#EEF3EE] text-[#236B45] font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
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
              <span>Mark this item as available for immediate rental requests</span>
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
              <PackagePlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Listing Item...' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;

