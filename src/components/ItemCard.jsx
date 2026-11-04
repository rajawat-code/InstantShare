import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, ArrowRight, Navigation2, Footprints } from 'lucide-react';
import { formatCurrency } from '../utils/pricing';
import { useLocation } from '../context/LocationContext';
import { useUser } from '../context/UserContext';

export const ItemCard = ({ item, customDistance = null, showWalkTime = true }) => {
  const isHourly = item.rentalType === 'HOURLY';
  const { getDistanceToItem, hasLocation } = useLocation();
  const { users } = useUser();

  // Find owner name if available
  const owner = users?.find((u) => u.id === item.ownerId);

  // Compute or use passed distance
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
    <div className="group bg-white rounded-2xl border border-[#E1E5E1] overflow-hidden flex flex-col hover:border-[#236B45]/50 hover:shadow-md transition-all duration-200">
      {/* Item Image with Badges */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top-Left: Distance Badge or Availability */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {distanceInfo ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs backdrop-blur-xs transition-colors ${
                isUltraClose
                  ? 'bg-[#236B45] text-white border border-[#236B45]'
                  : 'bg-white/95 text-slate-800 border border-slate-200'
              }`}
            >
              <Navigation2 className="w-3 h-3 text-[#FACC15] fill-[#FACC15]" />
              <span>{distanceInfo.formatted}</span>
            </span>
          ) : (
            <div>
              {item.available ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50/95 text-emerald-800 border border-emerald-200 backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse"></span>
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100/95 text-slate-700 border border-slate-300 backdrop-blur-xs">
                  Currently Rented
                </span>
              )}
            </div>
          )}
        </div>

        {/* Top-Right: Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/95 text-slate-700 border border-slate-200 shadow-xs backdrop-blur-xs">
            {item.category}
          </span>
        </div>

        {/* Bottom Banner on Image if distance & walking time known */}
        {distanceInfo && showWalkTime && distanceInfo.walkingTime && (
          <div className="absolute bottom-2 left-3 right-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/60 text-white backdrop-blur-xs">
              <Footprints className="w-3 h-3 text-emerald-400" />
              <span>{distanceInfo.walkingTime}</span>
              <span className="text-slate-300">• {item.location}</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location and Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="inline-flex items-center gap-1 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              {item.location}
            </span>
            {item.rating && (
              <span className="inline-flex items-center gap-1 font-medium text-slate-700 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {item.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Item Title */}
          <Link to={`/items/${item.id}`} className="block group-hover:text-[#236B45] transition-colors">
            <h3 className="font-semibold text-base text-[#252B27] line-clamp-2 leading-snug">
              {item.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Owner info snippet if available */}
          {owner && (
            <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <img
                  src={owner.avatar}
                  alt={owner.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>Owner: <strong className="text-slate-700 font-medium">{owner.name}</strong></span>
              </div>
              {item.available && (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Ready now
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Rental Rate</div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-[#236B45]">
                {formatCurrency(item.rentalPrice)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                /{isHourly ? 'hour' : 'day'}
              </span>
            </div>
          </div>

          <Link
            to={`/items/${item.id}`}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 bg-[#EEF3EE] hover:bg-[#236B45] hover:text-white transition-all cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
