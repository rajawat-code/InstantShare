import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, ArrowRight, Navigation2, Footprints, Heart } from 'lucide-react';
import { formatCurrency } from '../utils/pricing';
import { useLocation } from '../context/LocationContext';
import { useUser } from '../context/UserContext';
import { heartPop } from '../utils/animations';

export const ItemCard = ({ item, customDistance = null, showWalkTime = true, featured = false }) => {
  const isHourly = item.rentalType === 'HOURLY';
  const { getDistanceToItem, hasLocation } = useLocation();
  const { users } = useUser();
  const [isLiked, setIsLiked] = useState(false);

  // Find owner name if available
  const owner = users?.find((u) => u.id === item.ownerId);

  // Compute distance
  const distanceInfo =
    customDistance ||
    (item.distanceFormatted
      ? {
          formatted: item.distanceFormatted,
          meters: item.distanceMeters,
          walkingTime: item.walkingTime,
        }
      : hasLocation && item.lat !== undefined && item.lng !== undefined
      ? getDistanceToItem(item.lat, item.lng)
      : null);

  const isUltraClose = distanceInfo && distanceInfo.meters <= 200;

  return (
    <motion.div
      whileHover={{ y: -4, x: -2, boxShadow: '6px 6px 0px #14281D' }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`group bg-white rounded-2xl border-2 border-[#14281D] overflow-hidden flex flex-col shadow-hard relative transition-all ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      {/* Item Image with Tactile Badges */}
      <div className="relative aspect-[4/3] w-full bg-[#FAF7F2] overflow-hidden border-b-2 border-[#14281D]">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top-Left: Distance Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {distanceInfo ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border border-[#14281D] shadow-hard-sm ${
                isUltraClose
                  ? 'bg-[#F2B705] text-[#14281D]'
                  : 'bg-white text-[#14281D]'
              }`}
            >
              <Navigation2 className="w-3 h-3 text-[#E8590C] fill-[#E8590C]" />
              <span>{distanceInfo.formatted}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white text-[#14281D] border border-[#14281D] shadow-hard-sm">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span>Available</span>
            </span>
          )}
        </div>

        {/* Top-Right: Wishlist Heart Pop Button */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <motion.button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            variants={heartPop}
            animate={isLiked ? 'popped' : 'idle'}
            className="w-8 h-8 rounded-full bg-white border-2 border-[#14281D] shadow-hard-sm flex items-center justify-center hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            aria-label="Save to wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isLiked ? 'fill-[#E8590C] text-[#E8590C]' : 'text-[#14281D]'
              }`}
            />
          </motion.button>
        </div>

        {/* Bottom Bar: Walking Time Banner */}
        {distanceInfo?.walkingTime && showWalkTime && (
          <div className="absolute bottom-2 left-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-[#14281D]/90 text-white backdrop-blur-xs border border-white/20">
              <Footprints className="w-3.5 h-3.5 text-[#F2B705]" />
              <span>{distanceInfo.walkingTime}</span>
              <span className="text-white/60">• {item.location}</span>
            </span>
          </div>
        )}

        {/* Slide-up "Borrow Now" Overlay Button on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-20 hidden sm:flex items-center justify-center">
          <Link
            to={`/items/${item.id}`}
            className="btn-tactile w-full py-2.5 rounded-xl bg-[#F2B705] text-[#14281D] font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#14281D] shadow-hard-sm flex items-center justify-center gap-1.5"
          >
            <span>Borrow From Neighbor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs font-mono text-[#4A5B52] mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[#E8590C]">
              {item.category}
            </span>
            {item.rating && (
              <span className="inline-flex items-center gap-1 font-bold text-[#14281D] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#14281D]/20">
                <Star className="w-3.5 h-3.5 text-[#E8590C] fill-[#E8590C]" />
                <span>{item.rating}</span>
                <span className="text-[#4A5B52]">({item.reviewsCount || 12})</span>
              </span>
            )}
          </div>

          {/* Item Name */}
          <Link to={`/items/${item.id}`} className="group-hover:text-[#E8590C] transition-colors">
            <h3 className="font-display font-bold text-base sm:text-lg text-[#14281D] line-clamp-1 leading-snug">
              {item.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-[#4A5B52] line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Footer: Owner Avatar & Price Pill */}
        <div className="pt-3 border-t border-[#14281D]/15 flex items-center justify-between">
          {/* Owner Info */}
          <div className="flex items-center gap-2 min-w-0">
            {owner?.avatar ? (
              <img
                src={owner.avatar}
                alt={owner.name}
                className="w-7 h-7 rounded-lg object-cover border border-[#14281D]"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-[#DCE5DD] text-[#14281D] font-bold text-xs flex items-center justify-center border border-[#14281D]">
                {owner?.name?.charAt(0) || 'N'}
              </div>
            )}
            <div className="truncate text-xs">
              <div className="font-bold text-[#14281D] truncate leading-tight">
                {owner?.name || 'Local Neighbor'}
              </div>
              <div className="text-[10px] text-[#4A5B52] font-mono truncate">
                {owner?.location?.split(',')[0] || 'Nearby'}
              </div>
            </div>
          </div>

          {/* Price Badge in Space Grotesk Mono */}
          <div className="text-right flex-shrink-0">
            <div className="font-mono text-base font-extrabold text-[#14281D] leading-none">
              {formatCurrency(item.rentalPrice)}
            </div>
            <div className="font-mono text-[10px] text-[#4A5B52] uppercase font-bold mt-0.5">
              per {isHourly ? 'hour' : 'day'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Shimmer Skeleton Loader for Listings
export const ItemCardSkeleton = () => (
  <div className="bg-white rounded-2xl border-2 border-[#14281D] p-3 shadow-hard animate-pulse space-y-3">
    <div className="aspect-[4/3] w-full bg-[#FAF7F2] rounded-xl border border-[#14281D]/20" />
    <div className="h-4 bg-[#EDE6DC] rounded w-1/3" />
    <div className="h-6 bg-[#EDE6DC] rounded w-3/4" />
    <div className="h-4 bg-[#EDE6DC] rounded w-full" />
    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
      <div className="w-8 h-8 rounded-lg bg-[#EDE6DC]" />
      <div className="w-16 h-6 rounded bg-[#EDE6DC]" />
    </div>
  </div>
);

export default ItemCard;