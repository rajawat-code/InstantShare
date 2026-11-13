import React, { useEffect, useRef } from 'react';

/**
 * AnimatedHomeBackground - Premium Hyperlocal Peer-to-Peer Animated Background
 * Features:
 * 1. Ambient shifting Aurora glow orbs (Radiant Emerald, Mint & Warm Sunlight Gold).
 * 2. Precision architectural dot matrix grid.
 * 3. Luminous interactive peer-to-peer network nodes with pulsing glow halos.
 * 4. Glowing radar ripples on click and interactive cursor proximity beacon.
 */
export const AnimatedHomeBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Mouse tracking for proximity beacon
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 190, // Proximity detection radius
      active: false,
    };

    // Expanding ripple waves (e.g. from clicks)
    const ripples = [];

    // Peer network nodes representing hyperlocal items and neighbors
    const nodeCount = Math.min(Math.floor((width * height) / 17000), 70);
    const nodes = [];

    const colors = [
      'rgba(35, 107, 69, 0.85)',    // Forest Green
      'rgba(34, 197, 94, 0.9)',     // Radiant Mint
      'rgba(74, 222, 128, 0.85)',   // Light Emerald
      'rgba(250, 204, 21, 0.9)',    // Warm Amber / Sunlight Gold
    ];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.2 + 1.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        isAccent: Math.random() > 0.72, // ~28% warm gold hubs
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.025,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      if (clickX >= 0 && clickX <= width && clickY >= 0 && clickY <= height) {
        ripples.push({
          x: clickX,
          y: clickY,
          radius: 12,
          maxRadius: 210,
          opacity: 0.65,
          color: 'rgba(34, 197, 94,',
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    // Animation Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Glowing Expanding Radar Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2.4;
        r.opacity = Math.max(0, 0.65 * (1 - r.radius / r.maxRadius));

        if (r.opacity <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.shadowColor = 'rgba(34, 197, 94, 0.7)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${r.color} ${r.opacity})`;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 6]);
        ctx.stroke();

        // Secondary inner golden ripple ring
        if (r.radius > 25) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(250, 204, 21, ${r.opacity * 0.8})`;
          ctx.lineWidth = 1.2;
          ctx.shadowColor = 'rgba(250, 204, 21, 0.7)';
          ctx.shadowBlur = 8;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Interactive Proximity Aura around Cursor (Walking Distance Beacon)
      if (mouse.active) {
        ctx.save();
        const mouseGlow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius
        );
        mouseGlow.addColorStop(0, 'rgba(34, 197, 94, 0.14)');
        mouseGlow.addColorStop(0.45, 'rgba(250, 204, 21, 0.08)');
        mouseGlow.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glowing boundary ring
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 70, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.22)';
        ctx.shadowColor = 'rgba(34, 197, 94, 0.5)';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }

      // 3. Connect Nodes within Proximity (Glowing Peer-to-Peer Network Connections)
      const maxDist = 135;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.28;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);

            // Give connections involving gold hubs a warmer glowing tint
            if (nodes[i].isAccent || nodes[j].isAccent) {
              ctx.strokeStyle = `rgba(234, 179, 8, ${alpha * 1.3})`;
              ctx.shadowColor = 'rgba(250, 204, 21, 0.45)';
            } else {
              ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
              ctx.shadowColor = 'rgba(34, 197, 94, 0.4)';
            }
            ctx.shadowBlur = 4;
            ctx.lineWidth = 1.0;
            ctx.stroke();
            ctx.restore();
          }
        }

        // Connection to Mouse Beacon
        if (mouse.active) {
          const mdx = nodes[i].x - mouse.x;
          const mdy = nodes[i].y - mouse.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mDist < mouse.radius) {
            const mAlpha = (1 - mDist / mouse.radius) * 0.55;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(34, 197, 94, ${mAlpha})`;
            ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
            ctx.shadowBlur = 6;
            ctx.lineWidth = 1.3;
            ctx.stroke();
            ctx.restore();

            // Gentle magnetic pull toward cursor
            nodes[i].x -= mdx * 0.008;
            nodes[i].y -= mdy * 0.008;
          }
        }
      }

      // 4. Update and Draw Luminous Pulsing Nodes with Halos
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        // Bounce off canvas boundaries
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Gentle breathing glow pulse
        n.pulse += n.pulseSpeed;
        const glowPulse = 0.6 + Math.sin(n.pulse) * 0.4; // 0.2 to 1.0

        ctx.save();
        // Multi-ring glowing halo
        const haloGrad = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          n.radius * (3.5 + glowPulse * 1.5)
        );
        haloGrad.addColorStop(0, n.color.replace(/[\d\.]+\)$/g, `${0.45 * glowPulse})`));
        haloGrad.addColorStop(0.5, n.color.replace(/[\d\.]+\)$/g, `${0.12 * glowPulse})`));
        haloGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * (3.5 + glowPulse * 1.5), 0, Math.PI * 2);
        ctx.fill();

        // Neon Glow Shadow on core node
        ctx.shadowColor = n.isAccent ? 'rgba(250, 204, 21, 0.9)' : 'rgba(34, 197, 94, 0.85)';
        ctx.shadowBlur = n.isAccent ? 12 : 9;

        // Solid luminous core
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 selection:bg-transparent">
      {/* 1. Luminous Ambient Aurora Glow Blobs (Enhanced Radiance & Soft Diffusion) */}
      {/* Top Left: Emerald Aurora Pool */}
      <div
        className="absolute -top-32 -left-32 w-[580px] h-[580px] rounded-full bg-emerald-400/25 blur-[120px] pointer-events-none animate-pulse duration-[7000ms]"
        aria-hidden="true"
      />

      {/* Top Right: Warm Sunlight Gold Glow (Behind Hero Showcase) */}
      <div
        className="absolute top-10 right-0 w-[620px] h-[620px] rounded-full bg-amber-300/24 blur-[130px] pointer-events-none animate-pulse duration-[9000ms]"
        aria-hidden="true"
      />

      {/* Center Hero Radiant Pool */}
      <div
        className="absolute top-28 left-1/3 -translate-x-1/2 w-[540px] h-[360px] rounded-full bg-emerald-500/18 blur-[130px] pointer-events-none animate-pulse duration-[8000ms]"
        aria-hidden="true"
      />

      {/* Mid-Page Emerald/Teal Glow */}
      <div
        className="absolute top-1/2 left-1/4 w-[680px] h-[480px] rounded-full bg-emerald-600/14 blur-[150px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Lower Page Warm Sunlight Glow */}
      <div
        className="absolute bottom-48 right-1/4 w-[540px] h-[540px] rounded-full bg-amber-200/18 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      {/* 2. Precision Architectural Dot Matrix Grid Pattern */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(35,107,69,0.11)_1.3px,_transparent_1.3px)] [background-size:28px_28px] opacity-75"
        aria-hidden="true"
      />

      {/* 3. Subtle Vignette so edges blend seamlessly with page edges */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F8F8F5]/80 pointer-events-none"
        aria-hidden="true"
      />

      {/* 4. Interactive Peer-to-Peer Network & Radar Ripples Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default AnimatedHomeBackground;