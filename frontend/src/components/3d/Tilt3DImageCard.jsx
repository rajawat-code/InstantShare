import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, MapPin, CheckCircle2, ShieldCheck, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Tilt3DImageCard - Continuous Organic Random 3D Tilt & Floating Motion Card
 *
 * Simulates a high-end physical photograph / equipment showcase floating in 3D space with:
 * - Multi-frequency random 3-dimensional tilt (RotateX, RotateY, RotateZ, TranslateY)
 * - Dynamic 3D lighting sheen/glare that shifts with tilt angle
 * - Multi-layer parallax elements popping out in true Z-space (translateZ)
 * - Dynamic ground shadow that scales/shifts with 3D elevation
 * - Interactive mouse influence blending
 */
export const Tilt3DImageCard = () => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const shadowRef = useRef(null);
  const glareRef = useRef(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Curated high-resolution authentic local gear & neighbor sharing photos
  const showcaseImages = [
    {
      src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85',
      title: 'Neighbors Sharing Gear',
      caption: 'Borrow from creators next door instead of buying new.',
      primaryItem: 'Bosch Hammer Drill',
      distance: '145m away',
      price: '₹80/hr',
      rating: '4.9 ★',
      badge: 'Popular Nearby',
      icon: '⚡',
    },
    {
      src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85',
      title: 'Photography & Production Gear',
      caption: 'Sony Alpha 7 III with 24-70mm GM Lens available for weekend shoots.',
      primaryItem: 'Sony Alpha 7 III Kit',
      distance: '80m away',
      price: '₹120/hr',
      rating: '5.0 ★',
      badge: 'Walking Distance',
      icon: '📷',
    },
    {
      src: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=85',
      title: 'Outdoor & Camping Equipment',
      caption: '4-person weatherproof tent, trekking poles & camp stoves.',
      primaryItem: 'Quechua 4P Camping Tent',
      distance: '190m away',
      price: '₹350/day',
      rating: '4.8 ★',
      badge: 'Ready for Pickup',
      icon: '⛺',
    },
  ];

  const currentImage = showcaseImages[activeImageIndex];

  useEffect(() => {
    let animationFrameId;
    let startTime = performance.now();

    // Mouse coordinates (normalized -1 to 1)
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isOver: false };

    // Smoothed tilt and float values
    const state = {
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      transX: 0,
      transY: 0,
    };

    const container = containerRef.current;
    const card = cardRef.current;
    const shadow = shadowRef.current;
    const glare = glareRef.current;

    if (!container || !card) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouse.targetX = x * 2; // -1 to 1
      mouse.targetY = y * 2;
      mouse.isOver = true;
    };

    const handleMouseEnter = () => {
      mouse.isOver = true;
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
      mouse.isOver = false;
      setIsHovered(false);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    const updateLoop = () => {
      const now = performance.now();
      // Reduced speed for gentle, calming motion
      const t = (now - startTime) * 0.00065;

      // Ultra-smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // 1. Gentle Multi-Frequency Pseudo-Random 3D Tilt (Reduced magnitude)
      const randomRotX =
        Math.sin(t * 0.62) * 2.4 +
        Math.cos(t * 0.98) * 1.2 +
        Math.sin(t * 0.35) * 0.6; // Max ~4.2 degrees

      const randomRotY =
        Math.cos(t * 0.55) * 3.2 +
        Math.sin(t * 0.82) * 1.6 +
        Math.cos(t * 0.38) * 0.8; // Max ~5.6 degrees

      const randomRotZ =
        Math.sin(t * 0.45) * 0.9 +
        Math.cos(t * 0.72) * 0.4; // Max ~1.3 degrees

      const randomFloatY =
        Math.sin(t * 0.75) * 3.2 +
        Math.cos(t * 1.15) * 1.2; // Max ~4.4px gentle float

      const randomFloatX =
        Math.cos(t * 0.48) * 1.8; // Max ~1.8px drift

      // 2. Gentle Cursor Parallax Influence
      const mouseInfluence = mouse.isOver ? 4.5 : 1.2;
      const targetRotX = randomRotX - mouse.y * mouseInfluence;
      const targetRotY = randomRotY + mouse.x * mouseInfluence;
      const targetRotZ = randomRotZ + (mouse.x * mouse.y) * 1.2;
      const targetTransY = randomFloatY - mouse.y * 3.5;
      const targetTransX = randomFloatX + mouse.x * 3.5;

      // Silky spring smoothing (lower factor for ultra-fluid easing)
      state.rotX += (targetRotX - state.rotX) * 0.035;
      state.rotY += (targetRotY - state.rotY) * 0.035;
      state.rotZ += (targetRotZ - state.rotZ) * 0.035;
      state.transX += (targetTransX - state.transX) * 0.035;
      state.transY += (targetTransY - state.transY) * 0.035;

      // 3. Apply 3D Matrix Transform to Card
      card.style.transform = `
        perspective(1200px)
        translate3d(${state.transX.toFixed(2)}px, ${state.transY.toFixed(2)}px, 0px)
        rotateX(${state.rotX.toFixed(2)}deg)
        rotateY(${state.rotY.toFixed(2)}deg)
        rotateZ(${state.rotZ.toFixed(2)}deg)
      `;

      // 4. Subtle Physical Contact Shadow
      if (shadow) {
        const shadowX = -state.rotY * 0.8;
        const shadowY = 24 + state.rotX * 0.6;
        const shadowBlur = 22 + Math.abs(state.transY) * 0.4;
        const shadowOpacity = Math.max(0.2, 0.38 - Math.abs(state.transY) * 0.005);
        shadow.style.transform = `translate3d(${shadowX.toFixed(2)}px, ${shadowY.toFixed(2)}px, 0px) scale(${1 - state.transY * 0.003})`;
        shadow.style.filter = `blur(${shadowBlur.toFixed(1)}px)`;
        shadow.style.opacity = shadowOpacity.toFixed(2);
      }

      // 5. Dynamic Glare / Specular Shine on Glass Surface
      if (glare) {
        const glareX = 50 + state.rotY * 2.2;
        const glareY = 50 - state.rotX * 2.2;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 75%)`;
      }

      animationFrameId = requestAnimationFrame(updateLoop);
    };

    animationFrameId = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % showcaseImages.length);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full py-4 sm:py-6 flex flex-col items-center justify-center cursor-pointer select-none"
      style={{ perspective: '1200px' }}
      title="Interactive 3D Floating Tilt Card • Hover & Move Cursor"
    >
      {/* Dynamic 3D Contact Shadow */}
      <div
        ref={shadowRef}
        className="absolute w-[86%] h-[75%] rounded-[3rem] bg-emerald-950/40 pointer-events-none transition-opacity"
        style={{ willChange: 'transform, filter, opacity' }}
      />

      {/* The 3D Floating Tilt Image Card */}
      <div
        ref={cardRef}
        className="relative w-full max-w-[500px] h-[400px] sm:h-[450px] md:h-[480px] rounded-3xl overflow-hidden border border-[#E1E5E1] bg-white shadow-2xl transition-shadow duration-300 group"
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Layer 0: High-Resolution Photo with Smooth Crossfade */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ transform: 'translateZ(0px)' }}
        >
          <img
            src={currentImage.src}
            alt={currentImage.title}
            className="w-full h-full object-cover object-center transform scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
          />

          {/* Deep Vignette Gradient for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#166534]/30 via-transparent to-transparent" />
        </div>

        {/* Layer 1: Dynamic Glare / Specular Sheen (Moves with Tilt) */}
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-300"
          style={{ transform: 'translateZ(1px)' }}
        />

        {/* Layer 2: 3D Popout - Top Left Trust Badge */}
        <div
          className="absolute top-5 left-5 z-20"
          style={{
            transform: 'translateZ(18px)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/40 text-[#166534] text-xs font-semibold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
            <ShieldCheck className="w-3.5 h-3.5 text-[#166534]" />
            <span>Hyperlocal 200m Hub</span>
          </div>
        </div>

        {/* Layer 3: 3D Popout - Top Right Photo Switcher */}
        <div
          className="absolute top-5 right-5 z-20 flex items-center gap-2"
          style={{
            transform: 'translateZ(20px)',
            transformStyle: 'preserve-3d',
          }}
        >
          <button
            type="button"
            onClick={handleNextImage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Switch Gear Photo"
          >
            <RefreshCw className="w-3 h-3 text-[#FACC15]" />
            <span>Next ({activeImageIndex + 1}/3)</span>
          </button>
        </div>

        {/* Layer 4: 3D Popout - Floating Item Price Badge */}
        <div
          className="absolute top-20 right-5 z-20 hidden sm:block"
          style={{
            transform: 'translateZ(26px)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-emerald-500/40 text-white text-xs shadow-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-sm shadow-md">
              {currentImage.icon}
            </div>
            <div>
              <div className="font-semibold text-white leading-tight">
                {currentImage.primaryItem}
              </div>
              <div className="text-[11px] text-emerald-300 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{currentImage.distance}</span>
                <span>•</span>
                <span className="text-[#FACC15] font-bold">{currentImage.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 5: 3D Popout - Bottom Content & Testimonial Overlay */}
        <div
          className="absolute bottom-0 inset-x-0 p-6 z-20 text-white flex flex-col justify-end space-y-3"
          style={{
            transform: 'translateZ(20px)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>{currentImage.title}</span>
            </div>

            <p className="text-sm font-medium text-slate-100 leading-snug drop-shadow-sm">
              "{currentImage.caption}"
            </p>
          </div>

          {/* Action Row & 3D Indicator */}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-300">
                Random 3D Tilt Motion Active
              </span>
            </div>

            <Link
              to="/explore?nearby=true"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#236B45] hover:bg-[#1b5636] text-white font-semibold transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <span>Explore Gear</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle Hint Below Card */}
      <div className="mt-3 text-center text-xs text-slate-500 flex items-center gap-2">
        <Sparkles className="w-3 h-3 text-[#236B45]" />
        <span>Continuous 3-dimensional tilt • Move cursor to interact</span>
      </div>
    </div>
  );
};

export default Tilt3DImageCard;