"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  UserCircle,
  KeyRound,
  DoorOpen,
  Globe,
  Gem,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { baseUrl, sendRequest } from "@/app/static/core_function";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";

export default function FormLogin() {
  const bgRef = useRef<HTMLDivElement>(null);
  // const [summonerId, setSummonerId] = useState("");
  // const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [payload,setPayload] = useState({username:'',password:''})
  const routers = useRouter()
  const {setUser} = useUser()

  // Atmospheric parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (window.innerWidth / 2 - e.pageX) / 50;
      const y = (window.innerHeight / 2 - e.pageY) / 50;
      if (bgRef.current) {
        bgRef.current.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async(e?:React.FormEvent)=>{
    e?.preventDefault()
    setLoading(true)
    setError(null)
    try{
        const response = await sendRequest(`${baseUrl}/authentication/login`,"POST",payload)
        const res = response as any
        const Dashboard = ['ADMINISTRATOR','SUPER USER'];
        if(res.result){
          setUser(res.users)
          console.log(res.users)
          if(Dashboard.includes(res.users?.role)){
            routers.push("/Pages/Admin")
            routers.refresh();
          }
          if(res.users?.role === 'USER'){
            routers.push("/Pages/User")
            routers.refresh()
          }
        }
    }catch(err){
      setError(err instanceof Error ? err.message : "Login failed");
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#161308] text-[#eae2cf] min-h-screen flex flex-col overflow-hidden selection:bg-[#ffd700] selection:text-[#705e00] relative">
      <style jsx global>{`
        @keyframes goldenPulse {
          0%,
          100% {
            box-shadow:
              0 0 15px rgba(233, 196, 0, 0.4),
              inset 0 0 10px rgba(255, 215, 0, 0.2);
          }
          50% {
            box-shadow:
              0 0 35px rgba(233, 196, 0, 0.7),
              inset 0 0 20px rgba(255, 215, 0, 0.5);
          }
        }
        @keyframes aetherFlow {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.1) rotate(2deg);
            opacity: 0.6;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.4;
          }
        }
        .golden-pulse {
          animation: goldenPulse 3s infinite ease-in-out;
        }
        .aether-bg-layer {
          animation: aetherFlow 10s infinite ease-in-out;
        }
        .glass-panel {
          background: rgba(17, 14, 5, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .input-glow:focus-within {
          border-bottom-color: #e9c400;
          box-shadow: 0 4px 12px -4px rgba(233, 196, 0, 0.5);
        }
        .metallic-shimmer {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
        }
      `}</style>

      {/* Background Cinematic Layer */}
      <div className="fixed inset-0 z-0">
        <div
          ref={bgRef}
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 aether-bg-layer"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCGTjyv7XxdSWIU7lUDYxhz-V-HGbZj8KsSBehOU1QSCiJRCYEZfeXPP3hQBR-7d3-NTB-qcki1hEIxX2Ruc3jXKdljzKBkmSN82x6vDRTgtb229o6e7uMUYwk6NBykOD1VbAw9GzwSsY32b1NMqjtG_G0-VVqVEjrSzgbgqljkS8FnPJUVvxnX2BVCP4c1SsOANZiZacNojbkv7huGfNKSCp3X3OQ_CAhVBrEey_sKKvaeeJoRVHXMNYPrP3Yjw9wvG3lNEZA7kHQ')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161308] via-transparent to-[#161308]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#161308]/40 via-transparent to-[#161308]/40" />
      </div>

      {/* Main Login Canvas */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] space-y-10">
          {/* Branding Area */}
          <div className="text-center space-y-2">
            <h1 className="font-sans text-4xl font-extrabold italic tracking-tighter uppercase text-[#ffe16d] drop-shadow-[0_0_12px_rgba(233,196,0,0.4)]">
              Welcome To The Game
            </h1>
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#d0c6ab]">
              Diki Maulana
            </p>
          </div>

          {/* Login Card */}
          <div className="glass-panel p-8 rounded-xl metallic-shimmer shadow-2xl relative group">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#e9c400]/30 rounded-tl-xl transition-all group-hover:border-[#ffe16d]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#e9c400]/30 rounded-br-xl transition-all group-hover:border-[#ffe16d]" />

            <form className="space-y-8" onSubmit={handleSubmit}>
              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              {/* Username Field */}
              <div className="space-y-2 group/field">
                <label className="text-xs font-mono tracking-[0.1em] text-[#e9c400]/70 flex items-center gap-2">
                  <UserCircle size={16} />
                  UserName
                </label>
                <div className="relative border-b border-[#4d4732] transition-all duration-300 input-glow">
                  <input
                    value={payload.username}
                    onChange={(e) => setPayload(prev=>({...prev,username:e.target.value}))}
                    className="w-full bg-transparent border-none focus:ring-0 text-[#eae2cf] py-2 px-1 placeholder:text-[#d0c6ab]/30"
                    placeholder="Identity Username..."
                    type="text"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 group/field">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-mono tracking-[0.1em] text-[#e9c400]/70 flex items-center gap-2">
                    <KeyRound size={16} />
                    Password
                  </label>
                  {/* <a
                    className="text-[10px] font-mono text-[#d0c6ab] hover:text-[#fff6df] transition-colors uppercase tracking-wider"
                    href="#"
                  >
                    Forgot Key?
                  </a> */}
                </div>
                <div className="relative border-b border-[#4d4732] transition-all duration-300 input-glow">
                  <input
                    value={payload.password}
                    onChange={(e) => setPayload(prev=>({...prev,password:e.target.value}))}
                    className="w-full bg-transparent border-none focus:ring-0 text-[#eae2cf] py-2 px-1 placeholder:text-[#d0c6ab]/30"
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ffd700] text-[#705e00] font-sans font-bold text-lg py-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 golden-pulse hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Opening..." : "Enter The Game"}
                <DoorOpen size={20} />
              </button>
            </form>

            {/* Additional Actions */}
            <div className="mt-8 text-center">
              <p className="text-[#d0c6ab]/80">
                New Player?{" "}
                <Link
                  className="text-[#ffe16d] font-bold hover:underline"
                  href="/Pages/Login/Register" // 🟢 Match the exact capital letters
                >
                  Register
                </Link>
              </p>
            </div>
          </div>

          {/* Global Stats/Footer Info */}
        </div>
      </main>

      {/* Footer Icons */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-6 text-[#d0c6ab]/60">
        <a className="hover:text-[#ffe16d] transition-colors" href="#">
          <Globe size={20} />
        </a>
        <a className="hover:text-[#ffe16d] transition-colors" href="#">
          <Gem size={20} />
        </a>
        <a className="hover:text-[#ffe16d] transition-colors" href="#">
          <HelpCircle size={20} />
        </a>
      </div>
    </div>
  );
}
