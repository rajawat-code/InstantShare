import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Navigation2, Sparkles, MapPin, Layers, RotateCw, ExternalLink, Image } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Hyperlocal3DHub - Interactive 3D WebGL Neighborhood Radar for InstantShare
 * Showcases nearby rentable items orbiting in an interactive 3D spatial radar with
 * mouse parallax, drag rotation, and floating item pins.
 */
export const Hyperlocal3DHub = () => {
  const containerRef = useRef(null);
  const [activeView, setActiveView] = useState('3d'); // '3d' | 'photo'
  const [selectedPin, setSelectedPin] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (activeView !== '3d') return;

    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3.8, 8.2);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 3. Lighting (Studio + Hyperlocal Emerald & Amber Accents)
    const ambientLight = new THREE.AmbientLight(0xdcfce7, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(5, 8, 5);
    scene.add(mainLight);

    const greenPointLight = new THREE.PointLight(0x22c55e, 3.5, 15);
    greenPointLight.position.set(0, 1.5, 0);
    scene.add(greenPointLight);

    const warmAccentLight = new THREE.PointLight(0xfacc15, 2.0, 12);
    warmAccentLight.position.set(-4, 2, -3);
    scene.add(warmAccentLight);

    // 4. Root Interactive Group (Handles user rotation)
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 5. Radar Floor Grid & Concentric 200m Walking Rings
    // Center glowing pin/pedestal
    const pedestalGeo = new THREE.CylinderGeometry(0.3, 0.45, 0.2, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x052e16,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.1;
    worldGroup.add(pedestal);

    // Concentric Radar Rings representing walking distances
    const ringRadii = [
      { radius: 1.2, label: '50m', color: 0x22c55e, opacity: 0.7 },
      { radius: 2.3, label: '100m', color: 0x4ade80, opacity: 0.5 },
      { radius: 3.5, label: '200m', color: 0xfacc15, opacity: 0.65 },
    ];

    const radarRings = [];
    ringRadii.forEach(({ radius, color, opacity }) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = -0.18;
      worldGroup.add(ringMesh);
      radarRings.push(ringMesh);
    });

    // 6. Central Glowing Crystal Hub (InstantShare Core)
    const coreGroup = new THREE.Group();
    worldGroup.add(coreGroup);

    // Solid inner gem
    const gemGeo = new THREE.IcosahedronGeometry(0.75, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x14532d,
      emissiveIntensity: 0.6,
    });
    const coreGem = new THREE.Mesh(gemGeo, gemMat);
    coreGem.position.y = 0.85;
    coreGroup.add(coreGem);

    // Outer wireframe cage
    const wireGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x86efac,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireCage = new THREE.Mesh(wireGeo, wireMat);
    wireCage.position.y = 0.85;
    coreGroup.add(wireCage);

    // Orbiting gyroscope ring
    const gyroGeo = new THREE.TorusGeometry(1.3, 0.03, 16, 64);
    const gyroMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x713f12,
    });
    const gyroRing = new THREE.Mesh(gyroGeo, gyroMat);
    gyroRing.position.y = 0.85;
    gyroRing.rotation.x = Math.PI / 3;
    coreGroup.add(gyroRing);

    // 7. Sweeping Radar Beam
    const scanGeo = new THREE.ConeGeometry(3.5, 0.02, 32, 1, true, 0, Math.PI / 4);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const scanBeam = new THREE.Mesh(scanGeo, scanMat);
    scanBeam.rotation.x = -Math.PI / 2;
    scanBeam.position.y = -0.17;
    worldGroup.add(scanBeam);

    // 8. Nearby Rentable Item Nodes (Floating in 3D orbit)
    const itemsData = [
      {
        id: 'drill',
        name: 'Bosch Power Drill',
        category: 'Tools',
        distance: '145m away',
        price: '₹80/hr',
        color: 0xfacc15,
        radius: 2.3,
        speed: 0.7,
        angleOffset: 0.2,
        geometry: new THREE.CylinderGeometry(0.2, 0.2, 0.45, 6),
      },
      {
        id: 'camera',
        name: 'Sony Alpha DSLR',
        category: 'Electronics',
        distance: '80m away',
        price: '₹120/hr',
        color: 0x38bdf8,
        radius: 1.4,
        speed: 1.0,
        angleOffset: 2.1,
        geometry: new THREE.BoxGeometry(0.38, 0.28, 0.32),
      },
      {
        id: 'tent',
        name: '4-Person Camping Tent',
        category: 'Outdoors',
        distance: '190m away',
        price: '₹350/day',
        color: 0x4ade80,
        radius: 3.2,
        speed: 0.45,
        angleOffset: 4.2,
        geometry: new THREE.ConeGeometry(0.32, 0.45, 4),
      },
      {
        id: 'speaker',
        name: 'JBL PartyBox Speaker',
        category: 'Events',
        distance: '110m away',
        price: '₹150/hr',
        color: 0xf43f5e,
        radius: 2.0,
        speed: 0.85,
        angleOffset: 5.5,
        geometry: new THREE.DodecahedronGeometry(0.25),
      },
    ];

    const nodeMeshes = itemsData.map((item) => {
      const group = new THREE.Group();

      // Item 3D Mesh
      const mat = new THREE.MeshStandardMaterial({
        color: item.color,
        roughness: 0.2,
        metalness: 0.8,
        emissive: item.color,
        emissiveIntensity: 0.45,
      });
      const mesh = new THREE.Mesh(item.geometry, mat);
      mesh.castShadow = true;
      group.add(mesh);

      // Floating halo/pin base ring
      const haloGeo = new THREE.RingGeometry(0.35, 0.4, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: item.color,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = -0.4;
      group.add(halo);

      // Vertical tether line down to radar floor
      const tetherGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -0.4, 0),
      ]);
      const tetherMat = new THREE.LineBasicMaterial({
        color: item.color,
        transparent: true,
        opacity: 0.4,
      });
      const tether = new THREE.Line(tetherGeo, tetherMat);
      group.add(tether);

      worldGroup.add(group);
      return { group, mesh, data: item };
    });

    // 9. Floating Ambient Space/Dust Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = Math.random() * 5 - 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x86efac,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 10. Animation & Mouse Parallax System
    let animationFrameId;
    const clock = new THREE.Clock();
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const rotationState = {
      isUserDragging: false,
      prevMouseX: 0,
      prevMouseY: 0,
      targetRotationY: 0,
      currentRotationY: 0,
    };

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera tilt from mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      camera.position.x = mouse.x * 1.5;
      camera.position.y = 3.8 + mouse.y * 0.8;
      camera.lookAt(0, 0.4, 0);

      // Central core pulse and spin
      coreGem.rotation.y = elapsedTime * 0.4;
      coreGem.rotation.x = Math.sin(elapsedTime * 0.6) * 0.2;
      wireCage.rotation.y = -elapsedTime * 0.25;
      gyroRing.rotation.z = elapsedTime * 0.6;
      gyroRing.rotation.y = elapsedTime * 0.3;

      // Sweeping radar beam
      scanBeam.rotation.z = -elapsedTime * 1.2;

      // Radar rings gentle expansion ripple
      radarRings.forEach((ring, idx) => {
        const pulse = 1 + Math.sin(elapsedTime * 2 + idx * 1.2) * 0.015;
        ring.scale.set(pulse, pulse, 1);
      });

      // Orbiting Item Nodes
      nodeMeshes.forEach(({ group, mesh, data }) => {
        const angle = elapsedTime * data.speed * 0.4 + data.angleOffset;
        const x = Math.cos(angle) * data.radius;
        const z = Math.sin(angle) * data.radius;
        const hoverY = 0.4 + Math.sin(elapsedTime * 2 + data.angleOffset) * 0.12;

        group.position.set(x, hoverY, z);
        mesh.rotation.x = elapsedTime * 0.8;
        mesh.rotation.y = elapsedTime * 1.1;
      });

      // World Group auto-rotation (when not being manually dragged)
      if (!rotationState.isUserDragging) {
        rotationState.targetRotationY += 0.003;
      }
      rotationState.currentRotationY +=
        (rotationState.targetRotationY - rotationState.currentRotationY) * 0.08;
      worldGroup.rotation.y = rotationState.currentRotationY;

      // Drift floating ambient particles
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 11. Mouse Movement & Parallax Listener
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouse.targetX = x;
      mouse.targetY = -y;

      if (rotationState.isUserDragging) {
        const deltaX = e.clientX - rotationState.prevMouseX;
        rotationState.targetRotationY += deltaX * 0.008;
        rotationState.prevMouseX = e.clientX;
        rotationState.prevMouseY = e.clientY;
      }
    };

    const handleMouseDown = (e) => {
      rotationState.isUserDragging = true;
      setIsDragging(true);
      rotationState.prevMouseX = e.clientX;
      rotationState.prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      rotationState.isUserDragging = false;
      setIsDragging(false);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        rotationState.isUserDragging = true;
        rotationState.prevMouseX = e.touches[0].clientX;
        rotationState.prevMouseY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (rotationState.isUserDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - rotationState.prevMouseX;
        rotationState.targetRotationY += deltaX * 0.01;
        rotationState.prevMouseX = e.touches[0].clientX;
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);

    // 12. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      gemGeo.dispose();
      gemMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      gyroGeo.dispose();
      gyroMat.dispose();
      pedestalGeo.dispose();
      pedestalMat.dispose();
      scanGeo.dispose();
      scanMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeView]);

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] rounded-3xl overflow-hidden border border-emerald-900/30 bg-gradient-to-b from-[#061c12] via-[#04130c] to-[#020b07] shadow-2xl flex flex-col justify-between selection:bg-emerald-500/20">
      {/* Top Floating Glass HUD Bar */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 backdrop-blur-md text-emerald-300 text-xs font-semibold shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>200m Spatial Radar</span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400/80 font-mono">
            <span>● 4 items active</span>
          </span>
        </div>

        {/* View Switcher: 3D Radar vs Authentic Community Photo */}
        <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md text-xs">
          <button
            type="button"
            onClick={() => setActiveView('3d')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === '3d'
                ? 'bg-[#236B45] text-white shadow-xs font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#FACC15]" />
            <span>3D View</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('photo')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'photo'
                ? 'bg-[#236B45] text-white shadow-xs font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Image className="w-3 h-3" />
            <span>Photo</span>
          </button>
        </div>
      </div>

      {/* Main View Area: 3D Canvas OR Photo */}
      {activeView === '3d' ? (
        <div
          ref={containerRef}
          className={`relative flex-1 w-full h-full cursor-grab active:cursor-grabbing ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
        >
          {/* Floating Glassmorphic Item Badges pinned in 3D atmosphere */}
          <div className="pointer-events-none absolute top-14 right-4 z-10 animate-pulse duration-[4000ms]">
            <div className="px-3.5 py-2 rounded-2xl bg-black/60 border border-emerald-500/40 backdrop-blur-md text-white text-xs shadow-xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xs">
                ⚡
              </div>
              <div>
                <div className="font-semibold text-white leading-tight">Bosch Hammer Drill</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span>145m away</span>
                  <span>•</span>
                  <span className="text-amber-300 font-semibold">₹80/hr</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-16 left-4 z-10 hidden sm:block animate-pulse duration-[5000ms]">
            <div className="px-3.5 py-2 rounded-2xl bg-black/60 border border-emerald-500/40 backdrop-blur-md text-white text-xs shadow-xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-400/20 border border-sky-400/40 flex items-center justify-center text-sky-300 font-bold text-xs">
                📷
              </div>
              <div>
                <div className="font-semibold text-white leading-tight">Sony Alpha 7 III</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span>80m away</span>
                  <span>•</span>
                  <span className="text-sky-300 font-semibold">₹120/hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Alternative Community Photo View */
        <div className="relative flex-1 w-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
            alt="People collaborating and sharing tools"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
            <div className="text-white space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Verified Neighbor Sharing
              </div>
              <p className="text-sm font-medium text-slate-100 leading-snug">
                "Needed a drill for 2 hours to mount bookshelves. Found Vikram 145m away on our
                block. Picked it up in 3 minutes!"
              </p>
              <div className="text-xs text-slate-300 pt-1">— Aarav S., Green Park Neighbor</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Glass Footer with Interaction Hint & Deep Link */}
      <div className="relative z-10 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between gap-3 text-xs border-t border-emerald-900/30">
        <div className="flex items-center gap-2 text-emerald-300/80 text-[11px]">
          <RotateCw className="w-3.5 h-3.5 text-emerald-400 animate-spin duration-[8000ms]" />
          <span>Click & drag to rotate 3D hub • Mouse tilts camera</span>
        </div>

        <Link
          to="/explore?nearby=true&radius=200"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shadow-md flex-shrink-0"
        >
          <span>Find in 200m</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default Hyperlocal3DHub;