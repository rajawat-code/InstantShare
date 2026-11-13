import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ShaderAnimation - WebGL/Three.js GPU-Accelerated Ripple & Gradient Shader
 * Renders dynamic concentric rings, liquid wave distortions, and chromatic glows.
 *
 * @param {string} className Tailwind classes for container positioning/dimensions
 * @param {number} speed Animation speed multiplier (default 1.0)
 * @param {number} opacity Overall shader transparency (default 0.9)
 * @param {boolean} interactive Enable mouse pointer displacement
 * @param {'blue'|'emerald'|'purple'} palette Color theme ('blue' is default)
 */
export function ShaderAnimation({
  className = 'w-full h-full absolute inset-0',
  speed = 1.0,
  opacity = 0.9,
  interactive = true,
  palette = 'blue',
}) {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Orthographic Camera for crisp full-canvas plane rendering
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const paletteId = palette === 'emerald' ? 1 : palette === 'purple' ? 2 : 0;

    // Uniforms
    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_speed: { value: speed },
      u_opacity: { value: opacity },
      u_palette: { value: paletteId },
    };

    // Vertex Shader: full-screen quad
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Fragment Shader: hypnotic concentric ripples + chromatic flow + liquid distortion
    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_speed;
      uniform float u_opacity;
      uniform int u_palette;
      varying vec2 vUv;

      void main() {
        // Normalized centered coordinates keeping aspect ratio
        vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        vec2 mouse = (u_mouse * 2.0 - 1.0);
        
        float t = u_time * 0.9 * u_speed;

        // Interactive subtle displacement toward mouse
        vec2 delta = st - mouse * 0.35;
        float dMouse = length(delta);

        // Distance from center with subtle liquid waviness
        float angle = atan(st.y, st.x);
        float wave = sin(angle * 5.0 + t * 1.2) * 0.06 + cos(angle * 3.0 - t * 0.8) * 0.04;
        float d = length(st) + wave;

        // Concentric circular ripples
        float ringFrequency = 14.0;
        float rings = sin(d * ringFrequency - t * 2.4);
        rings = abs(rings);
        float ringGlow = 0.07 / (rings + 0.06);

        // Secondary ripple echoing from pointer
        float mouseRipple = sin(dMouse * 18.0 - t * 3.0);
        mouseRipple = abs(mouseRipple);
        float mouseGlow = 0.04 / (mouseRipple + 0.08);

        // Multi-frequency energy waves
        float wave2 = sin(st.x * 6.0 + t) * cos(st.y * 6.0 + t) * 0.5 + 0.5;

        // Dynamic Palettes
        vec3 colCenter;
        vec3 colMid;
        vec3 colOuter;
        vec3 colGlow;

        if (u_palette == 1) {
          // Emerald Green / Forest / Mint (InstantShare Palette)
          colCenter = vec3(0.09, 0.45, 0.25);
          colMid    = vec3(0.14, 0.85, 0.48);
          colOuter  = vec3(0.04, 0.22, 0.12);
          colGlow   = vec3(0.85, 1.0, 0.88);
        } else if (u_palette == 2) {
          // Purple / Violet / Magenta
          colCenter = vec3(0.38, 0.08, 0.78);
          colMid    = vec3(0.92, 0.15, 0.75);
          colOuter  = vec3(0.15, 0.02, 0.35);
          colGlow   = vec3(1.0, 0.85, 0.98);
        } else {
          // Royal Azure Blue / Electric Cyan / Deep Violet (Default Demo Palette)
          colCenter = vec3(0.08, 0.38, 0.98);
          colMid    = vec3(0.0, 0.85, 0.92);
          colOuter  = vec3(0.48, 0.12, 0.88);
          colGlow   = vec3(0.85, 0.95, 1.0);
        }

        // Combine chromatic layers
        vec3 color = mix(colCenter, colOuter, smoothstep(0.0, 1.4, d));
        color = mix(color, colMid, wave2 * 0.45);
        color += colGlow * (ringGlow * 0.65 + mouseGlow * 0.45);

        // Soft radial edge falloff
        float alpha = clamp((ringGlow * 0.75 + 0.35) * u_opacity, 0.0, 1.0);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    // Material & Geometry
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      blending: THREE.NormalBlending,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;
      uniforms.u_mouse.value.set(mouseRef.current.x, mouseRef.current.y);

      uniforms.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Mouse move listener
    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mouseRef.current.targetX = Math.max(0, Math.min(1, x));
      mouseRef.current.targetY = Math.max(0, Math.min(1, y));
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      uniforms.u_resolution.value.set(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      geometry.dispose();
      material.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [speed, opacity, interactive, palette]);

  return <div ref={containerRef} className={className} />;
}

export default ShaderAnimation;
