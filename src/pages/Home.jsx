import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  Users,
  Repeat,
  PackagePlus,
} from 'lucide-react';
import ItemCard from '../components/ItemCard';
import CategoryFilter from '../components/CategoryFilter';
import { CATEGORIES } from '../data/mockData';
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredItems, setFeaturedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { dataVersion } = useUser();

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setIsLoading(true);
        const items = await apiService.getItems();
        // Take 6 prominent items for featured showcase
        setFeaturedItems(items.slice(0, 6));
      } catch (err) {
        console.error('Failed to load items:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeatured();
  }, [dataVersion]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const handleSelectCategory = (cat) => {
    if (cat === 'All') {
      navigate('/explore');
    } else {
      navigate(`/explore?category=${encodeURIComponent(cat)}`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="pt-6 sm:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline and Functional Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF3EE] text-[#236B45] text-xs font-semibold tracking-wide border border-[#DCFCE7]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Peer-to-Peer Community Platform</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#252B27] tracking-tight leading-[1.15]">
                Rent What You Need, <br className="hidden sm:inline" />
                <span className="text-[#236B45]">Share What You Own.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Access cameras, tools, projectors, camping gear, and party equipment from verified
                neighbors. Borrow for a few hours or days without spending a fortune buying new.
              </p>

              {/* Functional Search Bar in Hero */}
              <form
                onSubmit={handleHeroSearch}
                className="p-2 sm:p-2.5 bg-white rounded-2xl border border-[#E1E5E1] shadow-sm flex flex-col sm:flex-row gap-2 max-w-2xl"
              >
                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Try 'DSLR camera', 'projector', 'drill', 'camping tent'..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-[#252B27] placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-[#236B45] hover:bg-[#1b5636] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                >
                  <span>Search Gear</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Action Buttons & Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/explore"
                  className="px-5 py-2.5 bg-white border border-[#E1E5E1] hover:border-[#236B45] hover:bg-[#EEF3EE] text-slate-800 text-sm font-medium rounded-xl transition-all shadow-xs"
                >
                  Explore All Items
                </Link>
                <Link
                  to="/add-item"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#236B45] hover:bg-[#1b5636] text-white text-sm font-medium rounded-xl transition-all shadow-xs"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>List Your Item</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#236B45]" />
                  Zero upfront purchase cost
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#236B45]" />
                  Verified local owners
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#236B45]" />
                  Flexible hourly & daily slots
                </span>
              </div>
            </div>

            {/* Right Column: Authentic Photography of Real People & Gear */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-[#E1E5E1] shadow-lg bg-white">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
                  alt="People collaborating and sharing tools"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                      Community Spotlight
                    </div>
                    <p className="text-sm font-medium text-slate-100 leading-snug">
                      "I needed a high-res camera for our college showcase. Aarav lent me his Canon 90D
                      for just 4 hours. Smooth, friendly, and saved me ₹40,000!"
                    </p>
                    <div className="text-xs text-slate-300 pt-1">— Priya P., Student Filmmaker</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-bold text-[#236B45] uppercase tracking-wider">
              Browse Categories
            </span>
            <h2 className="text-2xl font-bold text-[#252B27] mt-1">
              Find exactly what you need
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-[#236B45] hover:text-[#1b5636] inline-flex items-center gap-1"
          >
            <span>View all categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory=""
          onSelectCategory={handleSelectCategory}
          variant="cards"
        />
      </section>

      {/* Featured Items Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-bold text-[#236B45] uppercase tracking-wider">
              Popular Nearby
            </span>
            <h2 className="text-2xl font-bold text-[#252B27] mt-1">
              Featured Rental Items
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-[#236B45] hover:text-[#1b5636] inline-flex items-center gap-1"
          >
            <span>Browse all 17 items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section (3 Clean Steps) */}
      <section className="bg-white border-y border-[#E1E5E1] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#236B45] uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#252B27] mt-2">
              How InstantShare Works
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Renting from verified people around you is fast, safe, and straightforward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-[#F8F8F5] p-6 rounded-2xl border border-[#E1E5E1] relative">
              <div className="w-10 h-10 rounded-xl bg-[#236B45] text-white font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Discover Nearby Items
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by category, hourly or daily rental options, and see exact items currently
                available in your neighborhood.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F8F8F5] p-6 rounded-2xl border border-[#E1E5E1] relative">
              <div className="w-10 h-10 rounded-xl bg-[#236B45] text-white font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Request a Rental
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick your start and end times. Total rental cost is calculated automatically. The owner
                reviews and approves your request.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F8F8F5] p-6 rounded-2xl border border-[#E1E5E1] relative">
              <div className="w-10 h-10 rounded-xl bg-[#236B45] text-white font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Pick up, Use & Return
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Meet up at the agreed spot, receive the item, use it for your project, and return it in
                good shape. Everybody wins!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Encouragement Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EEF3EE] rounded-3xl p-8 sm:p-12 border border-[#DCFCE7] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold text-[#236B45] uppercase tracking-wider">
              Earn from Idle Items
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#252B27]">
              Have gear gathering dust in your closet?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Drills, ladders, cameras, and party speakers often sit unused 95% of the year. Put them to
              work, meet neighborhood creators, and earn passive rental income securely.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              to="/add-item"
              className="px-6 py-3 bg-[#236B45] hover:bg-[#1b5636] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors text-center cursor-pointer"
            >
              List an Item for Rent
            </Link>
            <Link
              to="/my-listings"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-300 transition-colors text-center cursor-pointer"
            >
              Manage My Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

