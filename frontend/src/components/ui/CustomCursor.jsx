import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * CustomCursor - Studio Minimalist Cursor
 * Desktop only, smoothly follows mouse, expands over clickable elements.
 */
export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Disable on touch devices or small screens
    if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer') ||
        target.role === 'button'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50 rounded-full border border-[#14281D] hidden md:block"
      animate={{
        x: mousePosition.x - (isHovering ? 20 : 7),
        y: mousePosition.y - (isHovering ? 20 : 7),
        width: isHovering ? 40 : 14,
        height: isHovering ? 40 : 14,
        backgroundColor: isHovering ? 'rgba(232, 89, 12, 0.15)' : 'rgba(20, 40, 29, 0.85)',
        borderColor: isHovering ? '#E8590C' : '#14281D',
      }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 400,
        mass: 0.2,
      }}
    />
  );
};

export default CustomCursor;