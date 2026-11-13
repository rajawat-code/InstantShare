import React from 'react';
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Layers } from 'lucide-react';

export default function DemoOne() {
  return (
    <div className="min-h-screen bg-[#070B14] p-4 sm:p-8 flex flex-col justify-center items-center space-y-6">
      {/* Top Header Controls */}
      <div className="w-full max-w-5xl flex items-center justify-between text-white text-xs">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all font-medium text-white shadow-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to InstantShare</span>
        </Link>

        <div className="flex items-center gap-2 text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Three.js WebGL Shader Animation</span>
        </div>
      </div>

      {/* The Exact User Snippet Component */}
      <div className="w-full max-w-5xl">
        <div className="relative flex h-[650px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border bg-blue-700">
          <ShaderAnimation />
          <span className="absolute pointer-events-none z-10 text-center text-7xl leading-none font-semibold tracking-tighter whitespace-pre-wrap text-white">
            Shader Animation
          </span>
        </div>
      </div>

      {/* Interactive Controls & Description */}
      <div className="w-full max-w-5xl p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-zinc-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-white text-sm">GPU-Accelerated Concentric Ripple Shader</div>
          <p className="text-zinc-400 mt-0.5">
            Move your cursor across the canvas to interact with the magnetic ripple distortion.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>GLSL WebGL Active</span>
        </div>
      </div>
    </div>
  );
}

