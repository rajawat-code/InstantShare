import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/pricing';

export const ItemCard = ({ item }) => {
  const isHourly = item.rentalType === 'HOURLY';

  return (
    <div className="group bg-white rounded-2xl border border-[#E1E5E1] overflow-hidden flex flex-col hover:border-[#236B45]/40 hover:shadow-md transition-all duration-200">
      {/* Item Image with Badges */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
        />

        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
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

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/95 text-slate-700 border border-slate-200 shadow-xs backdrop-blur-xs">
            {item.category}
          </span>
        </div>
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
        </div>

        {/* Pricing & CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Rental Rate</div>
            <div className="flex items-baseline gap-1 mt-0.5">
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

