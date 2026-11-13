import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PackagePlus,
  Navigation2,
  Footprints,
  Sparkles,
  MapPin,
} from 'lucide-react';
import ItemCard, { ItemCardSkeleton } from '../components/ItemCard';
import CategoryFilter from '../components/CategoryFilter';
import NearbyDiscoverySection from '../components/NearbyDiscoverySection';
import StudioHeroCollage from '../components/ui/StudioHeroCollage';
import RotatingSearchBar from '../components/ui/RotatingSearchBar';
import { MarkerUnderline } from '../components/ui/HandDrawnSVGs';
import HowItWorksSteps from '../components/ui/HowItWorksSteps';
import NeighborhoodMapSection from '../components/ui/NeighborhoodMapSection';
import TrustSection from '../components/ui/TrustSection';
import { CATEGORIES } from '../data/mockData';
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';
import { useLocation } from '../context/LocationContext';
import { fadeUp, staggerContainer } from '../utils/animations';

export const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { dataVersion } = useUser();
  const { requestCurrentLocation, hasLocation, radius } = useLocation();

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setIsLoading(true);
        const items = await apiService.getItems();
        setFeaturedItems(items.slice(0, 7)); // 7 items for bento layout
      } catch (err) {
        console.error('Failed to load items:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeatured();
  }, [dataVersion]);

  const handleSelectCategory = (cat) => {
    if (cat === 'All') {
      navigate('/explore');
    } else {
      navigate(`/explore?category=${encodeURIComponent(cat)}`);
    }
  };

  const scrollToNearby = () => {
    const el = document.getElementById('nearby-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    if (!hasLocation) {
      requestCurrentLocation();
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION (Asymmetric Left-Aligned Editorial + Collage) */}
      <section className="pt-8 sm:pt-14 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Big Editorial Headline & Rotating Search */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer(0.08)}
              className="lg:col-span-7 space-y-6"
            >
              {/* Neighborhood Badge */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14281D] text-[#F6F1E9] text-xs font-mono font-bold tracking-wider border border-[#14281D] shadow-hard-sm">
                  <span className="w-2 h-2 rounded-full bg-[#F2B705] animate-pulse" />
                  <span>500M WALKING PROXIMITY</span>
                </span>
                <span className="text-xs font-mono font-semibold text-[#4A5B52]">
                  New Delhi • Green Park
                </span>
              </motion.div>

              {/* Main Headline with Hand-Drawn Marker Highlight */}
              <motion.h1
                variants={fadeUp}
                className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-[#14281D] tracking-tight leading-[1.08]"
              >
                Need a drill for one afternoon? <br className="hidden sm:inline" />
                Your{' '}
                <span className="relative inline-block text-[#14281D]">
                  neighbor
                  <MarkerUnderline className="absolute -bottom-2 left-0 w-full" color="#F2B705" />
                </span>{' '}
                already has one.
              </motion.h1>

              {/* Human, Friendly Description */}
              <motion.p
                variants={fadeUp}
                className="text-base sm:text-lg text-[#4A5B52] max-w-xl leading-relaxed font-normal"
              >
                Access pressure washers, cameras, ladders, projectors, and camping gear living on your block. Borrow for a few hours, walk across the street, return it safe.
              </motion.p>

              {/* Rotating Typewriter Search Bar + Hand-Drawn Arrow */}
              <motion.div variants={fadeUp} className="pt-2">
                <RotatingSearchBar />
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={scrollToNearby}
                  className="btn-tactile inline-flex items-center gap-2 px-5 py-3 bg-[#14281D] hover:bg-[#1E3A2F] text-[#F6F1E9] text-xs sm:text-sm font-mono font-bold uppercase tracking-wider rounded-xl border-2 border-[#14281D] shadow-hard-sm cursor-pointer"
                >
                  <Navigation2 className="w-4 h-4 text-[#F2B705] fill-[#F2B705]" />
                  <span>Items within 200m</span>
                </button>

                <Link
                  to="/explore"
                  className="btn-tactile px-5 py-3 bg-white hover:bg-[#FAF7F2] text-[#14281D] text-xs sm:text-sm font-mono font-bold uppercase tracking-wider rounded-xl border-2 border-[#14281D] shadow-hard-sm"
                >
                  Browse Full Aisle
                </Link>

                <Link
                  to="/add-item"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold text-[#E8590C] hover:underline"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>Lend what you own →</span>
                </Link>
              </motion.div>

              {/* Micro Trust Points */}
              <motion.div
                variants={fadeUp}
                className="pt-4 border-t-2 border-[#14281D]/15 flex flex-wrap gap-5 text-xs text-[#4A5B52] font-semibold"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1E3A2F]" />
                  Zero buying cost
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1E3A2F]" />
                  Walking distance pickup
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1E3A2F]" />
                  Verified local neighbors
                </span>
              </motion.div>
            </motion.div>

            {/* Right Column: Asymmetric Human Photo Collage */}
            <div className="lg:col-span-5">
              <StudioHeroCollage />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION (Horizontal Scrolling Strip with Tactile Tiles) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E8590C]">
              Browse Neighborhood Aisles
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14281D] mt-1">
              What do you need for this weekend?
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-mono font-bold text-[#14281D] hover:text-[#E8590C] inline-flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View All Aisles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tactile Tiles Strip */}
        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory="All"
          onSelectCategory={handleSelectCategory}
          variant="tiles"
        />
      </section>

      {/* 3. MASONRY / BENTO LISTINGS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#E8590C] uppercase tracking-wider">
              <span>● Available Right Now</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#14281D] mt-1">
              Freshly Listed on Your Block
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5B52] mt-1">
              No delivery waiting. Walk over, borrow for a few hours, return when you're done.
            </p>
          </div>
          <Link
            to="/explore"
            className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border-2 border-[#14281D] text-xs font-mono font-bold uppercase tracking-wider text-[#14281D] shadow-hard-sm"
          >
            <span>Explore All 38 Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Bento Grid Layout (Featured item wide, others standard) */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <ItemCardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                featured={index === 0} // First card is featured bento width on tablets
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. CORE FEATURE: Hyperlocal Nearby Discovery Section (200m Radius Focus) */}
      <section id="nearby-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <NearbyDiscoverySection
          title="Items Within Walking Distance"
          subtitle="InstantShare prioritizes items located under 500m away so you never need a delivery truck."
        />
      </section>

      {/* 5. INTERACTIVE NEIGHBORHOOD MAP (Custom Detail 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NeighborhoodMapSection />
      </section>

      {/* 6. HOW IT WORKS (4 Steps Connected with Tactile Numbers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E8590C]">
            How Community Borrowing Works
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#14281D] mt-1.5">
            Borrowing from a neighbor in 4 simple steps
          </h2>
          <p className="mt-2 text-sm text-[#4A5B52]">
            Forget expensive one-off purchases and zero customer support. Renting locally is fast and human.
          </p>
        </div>

        <HowItWorksSteps />
      </section>

      {/* 7. TRUST SECTION (Neighbor Stories, Animated Counters & Trust Seal) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TrustSection />
      </section>

      {/* 8. LEND YOUR GEAR BANNER (Editorial Kraft Paper Styling) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#14281D] text-[#F6F1E9] rounded-3xl p-8 sm:p-12 border-2 border-[#14281D] shadow-hard-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Subtle background doodle stamp */}
          <div className="absolute -right-8 -bottom-8 font-mono text-8xl font-black text-white/[0.04] select-none pointer-events-none">
            SHARING
          </div>

          <div className="space-y-3 max-w-xl text-center md:text-left relative z-10">
            <span className="font-mono text-xs font-bold text-[#F2B705] uppercase tracking-wider">
              Put idle tools to work
            </span>
            <h3 className="font-display text-2xl sm:text-4xl font-bold text-white">
              Have tools sitting in your closet 50 weeks a year?
            </h3>
            <p className="text-sm text-[#DCE5DD] leading-relaxed">
              Drills, ladders, camping tents, and speakers gather dust 95% of the time. Help your neighbors build and explore, meet local creators, and earn passive rental income safely.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
            <Link
              to="/add-item"
              className="btn-tactile px-6 py-3.5 bg-[#E8590C] hover:bg-[#d44e06] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl border-2 border-white/40 shadow-hard-sm text-center"
            >
              List an Item for Rent
            </Link>
            <Link
              to="/my-listings"
              className="btn-tactile px-6 py-3.5 bg-white hover:bg-[#FAF7F2] text-[#14281D] font-mono text-xs font-bold uppercase tracking-wider rounded-xl border-2 border-[#14281D] shadow-hard-sm text-center"
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