import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { HandDrawnArrow } from './HandDrawnSVGs';

const placeholders = [
  "Rent a pressure washer for Sunday...",
  "Borrow a Sony A7 camera for the weekend...",
  "Rent a 4-person camping tent...",
  "Borrow a Bosch hammer drill for 2 hours...",
  "Rent a 1080p projector for movie night...",
  "Borrow a lawn mower from across the lane...",
];

export const RotatingSearchBar = ({ initialValue = '', onSearchSubmit }) => {
  const [query, setQuery] = useState(initialValue);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Typewriter effect for human studio feel
  useEffect(() => {
    const fullText = placeholders[placeholderIndex];
    let timeout;

    if (!isDeleting && displayedPlaceholder.length < fullText.length) {
      timeout = setTimeout(() => {
        setDisplayedPlaceholder(fullText.slice(0, displayedPlaceholder.length + 1));
      }, 55);
    } else if (!isDeleting && displayedPlaceholder.length === fullText.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2400);
    } else if (isDeleting && displayedPlaceholder.length > 0) {
      timeout = setTimeout(() => {
        setDisplayedPlaceholder(fullText.slice(0, displayedPlaceholder.length - 1));
      }, 30);
    } else if (isDeleting && displayedPlaceholder.length === 0) {
      setIsDeleting(false);
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }

    return () => clearTimeout(timeout);
  }, [displayedPlaceholder, isDeleting, placeholderIndex]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (onSearchSubmit) {
      onSearchSubmit(trimmed);
    } else if (trimmed) {
      navigate(`/explore?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      {/* Hand-drawn arrow pointing to the search bar (Custom Detail 3) */}
      <div className="absolute -top-7 right-3 hidden sm:block">
        <HandDrawnArrow />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-white border-2 border-[#14281D] rounded-2xl p-2 shadow-hard-lg flex items-center gap-2 transition-all focus-within:border-[#E8590C] focus-within:shadow-hard-xl"
      >
        <div className="pl-3 text-[#14281D]">
          <Search className="w-5 h-5 text-[#14281D]" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={displayedPlaceholder || "Search cameras, drills, tents..."}
          className="w-full py-2.5 px-2 text-sm sm:text-base font-sans text-[#14281D] placeholder:text-[#4A5B52]/60 focus:outline-none bg-transparent"
        />

        <button
          type="submit"
          className="btn-tactile px-5 sm:px-6 py-3 rounded-xl bg-[#E8590C] hover:bg-[#d44e06] text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider border-2 border-[#14281D] shadow-hard-sm flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
        >
          <span>Find Gear</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default RotatingSearchBar;