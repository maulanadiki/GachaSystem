"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Wallet,
  Gem,
  Star,
  Wand2,
  ShieldUser,
  AtSign,
  Lock,
  ShieldCheck,
  Check,
  Zap,
} from "lucide-react";
import { baseUrl, sendRequest } from "@/app/static/core_function";

export default function FormRegister() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    role:"USER"
  });
  const [acceptedPact, setAcceptedPact] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  // Atmospheric floating particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5,
    });

    const init = () => {
      particles = Array.from({ length: 60 }, createParticle);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.fillStyle = `rgba(233, 196, 0, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!acceptedPact) {
      setError("You must accept the Ancient Pact to continue");
      return;
    }
    setLoading(true);
    try {
      const response = await sendRequest(`${baseUrl}/authentication/register`,"POST",form)
      const res = response as any
      if (!res.result) throw new Error("Registration failed");
      window.location.href = "/login";
    } catch (err) {
      const failed = JSON.parse((err as any).message)
      setError(err instanceof Error ? failed.error : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#161308] text-[#eae2cf] font-sans selection:bg-[#ffd700] selection:text-[#705e00] min-h-screen overflow-x-hidden relative">
      <style jsx global>{`
        @keyframes pulseGold {
          0%,
          100% {
            box-shadow: 0 0 10px rgba(233, 196, 0, 0.4), inset 0 0 5px rgba(255, 225, 109, 0.2);
          }
          50% {
            box-shadow: 0 0 25px rgba(233, 196, 0, 0.7), inset 0 0 10px rgba(255, 225, 109, 0.4);
          }
        }
        .animate-pulse-gold {
          animation: pulseGold 3s infinite ease-in-out;
        }
        .glass-panel {
          background: rgba(22, 19, 8, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .metallic-gradient {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
        }
        .register-input:focus {
          outline: none;
          border-color: #ffe16d !important;
          box-shadow: 0 4px 12px -2px rgba(233, 196, 0, 0.3);
        }
      `}</style>

      {/* Atmospheric Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#161308] via-transparent to-[#161308]/50" />
      </div>

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#161308]/40 backdrop-blur-xl border-b border-white/10 shadow-[0_0_15px_rgba(233,196,0,0.2)]">
        <div className="text-2xl font-extrabold italic tracking-tighter text-[#ffe16d]">
          Aether Summon
        </div>
        <div className="flex items-center gap-4 text-[#d0c6ab]">
          <button className="hover:text-[#ffe16d] transition-colors active:scale-95 duration-150">
            <Wallet size={20} />
          </button>
          <button className="hover:text-[#ffe16d] transition-colors active:scale-95 duration-150">
            <Gem size={20} />
          </button>
          <button className="hover:text-[#ffe16d] transition-colors active:scale-95 duration-150">
            <Star size={20} />
          </button>
        </div>
      </header>

      {/* Main Registration Canvas */}
      <main className="relative z-10 min-h-screen flex items-center justify-center pt-20 pb-12 px-6">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl w-full items-center">
          {/* Branding/Lore Section */}
          <div className="hidden lg:flex flex-col space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-[#ffe16d] uppercase tracking-[0.2em]">
                Initiation Phase
              </span>
              <h1 className="text-5xl font-extrabold tracking-tight leading-tight text-[#fff6df]">
                Manifest Your Destiny
              </h1>
            </div>
            <p className="text-[#d0c6ab] max-w-md text-lg leading-relaxed">
              The astral planes align once every millennium. Step through the gate, bind your soul
              to the Aether, and command the legends of the old world.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border border-[#fff6df]/20">
                <div className="w-12 h-12 rounded-full bg-[#fff6df]/10 flex items-center justify-center text-[#e9c400]">
                  <Wand2 size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#e9c400] leading-none">100k+</div>
                  <div className="text-xs uppercase tracking-widest text-[#d0c6ab] opacity-60">
                    Summoners Active
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="w-full max-w-md mx-auto">
            <div className="glass-panel rounded-xl p-8 metallic-gradient relative overflow-hidden shadow-2xl">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#fff6df]/10 rounded-full blur-[80px]" />

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#fff6df] mb-1">Create Account</h2>
                <p className="text-[#d0c6ab]">Enter your details to begin the ritual.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                {/* Summoner Name */}
                <div className="space-y-1">
                  <label className="text-xs font-mono tracking-[0.1em] text-[#d0c6ab] ml-1">
                    CHOSEN YOUR USERNAME
                  </label>
                  <div className="relative">
                    <ShieldUser
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999077]"
                    />
                    <input
                      value={form.username}
                      onChange={handleChange("username")}
                      className="register-input w-full bg-[#110e05] border-0 border-b-2 border-[#999077]/30 text-[#eae2cf] py-3 pl-10 pr-4 transition-all duration-300 focus:bg-[#1f1b10] placeholder:text-[#4d4732]"
                      placeholder="GamerTag_42"
                      type="text"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-mono tracking-[0.1em] text-[#d0c6ab] ml-1">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <AtSign
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999077]"
                    />
                    <input
                      value={form.email}
                      onChange={handleChange("email")}
                      className="register-input w-full bg-[#110e05] border-0 border-b-2 border-[#999077]/30 text-[#eae2cf] py-3 pl-10 pr-4 transition-all duration-300 focus:bg-[#1f1b10] placeholder:text-[#4d4732]"
                      placeholder="summoner@aether.com"
                      type="email"
                    />
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono tracking-[0.1em] text-[#d0c6ab] ml-1">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999077]"
                      />
                      <input
                        value={form.password}
                        onChange={handleChange("password")}
                        className="register-input w-full bg-[#110e05] border-0 border-b-2 border-[#999077]/30 text-[#eae2cf] py-3 pl-10 pr-4 transition-all duration-300 focus:bg-[#1f1b10] placeholder:text-[#4d4732]"
                        placeholder="••••••••"
                        type="password"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono tracking-[0.1em] text-[#d0c6ab] ml-1">
                      CONFIRM
                    </label>
                    <div className="relative">
                      <ShieldCheck
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999077]"
                      />
                      <input
                        value={form.confirm}
                        onChange={handleChange("confirm")}
                        className="register-input w-full bg-[#110e05] border-0 border-b-2 border-[#999077]/30 text-[#eae2cf] py-3 pl-10 pr-4 transition-all duration-300 focus:bg-[#1f1b10] placeholder:text-[#4d4732]"
                        placeholder="••••••••"
                        type="password"
                      />
                    </div>
                  </div>
                </div>

                {/* Pact Checkbox */}
                <div className="flex items-start gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAcceptedPact((v) => !v)}
                    className={`relative flex items-center justify-center h-5 w-5 rounded border ${
                      acceptedPact ? "bg-[#ffd700] border-[#ffd700]" : "border-[#999077]/50 bg-[#1f1b10]"
                    } transition-colors cursor-pointer shrink-0`}
                  >
                    {acceptedPact && <Check size={14} className="text-[#705e00]" />}
                  </button>
                  <label
                    className="text-sm text-[#d0c6ab] leading-tight cursor-pointer"
                    onClick={() => setAcceptedPact((v) => !v)}
                  >
                    I accept the{" "}
                    <span className="text-[#ffe16d] underline underline-offset-4 decoration-[#ffe16d]/30 hover:decoration-[#ffe16d] transition-all">
                      Ancient Pact
                    </span>{" "}
                    (Terms &amp; Conditions)
                  </label>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full relative overflow-hidden bg-[#ffd700] text-[#705e00] py-4 font-bold text-lg rounded-lg animate-pulse-gold active:scale-[0.98] transition-all duration-150 disabled:opacity-60"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? "Opening..." : "Begin Journey"}
                      <Zap size={18} className="transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </button>
                </div>

                <div className="text-center pt-4">
                  <p className="text-[#d0c6ab] text-sm">
                    Already bound to a soul?{" "}
                    <a
                      className="text-[#e3b5ff] hover:text-[#f3daff] transition-colors font-bold"
                      href="/login"
                    >
                      Login Here
                    </a>
                  </p>
                </div>
              </form>
            </div>

            {/* Footer Links */}
            <div className="mt-8 flex justify-center gap-8 text-[#d0c6ab]/40 text-xs font-mono uppercase tracking-widest">
              <a className="hover:text-[#ffe16d] transition-colors" href="#">
                Lore
              </a>
              <a className="hover:text-[#ffe16d] transition-colors" href="#">
                Support
              </a>
              <a className="hover:text-[#ffe16d] transition-colors" href="#">
                Discord
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Side Decoration */}
      <div className="hidden lg:block fixed right-0 bottom-0 z-0 p-12 opacity-20 pointer-events-none">
        <div className="relative w-64 h-64 border-8 border-[#e9c400]/20 rounded-full animate-[spin_60s_linear_infinite]">
          <div className="absolute inset-0 border-2 border-dashed border-[#fff6df]/40 rounded-full scale-110" />
          <div className="absolute top-1/2 left-0 -translate-x-1/2 w-4 h-4 bg-[#fff6df] rounded-full blur-sm" />
        </div>
      </div>

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" />
    </div>
  );
}