'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { baseUrl, sendRequest, socketUrl } from '@/app/static/core_function';

export default function SummonPage() {
  const router = useRouter();
  const { user, updateCoins,token } = useAuth();
  const handleSummon = async (cost: number) => {
    try{
      if ((user?.coins ?? 0) >= cost) {
      const payload = {
        username:user?.user,
        times:cost
      }
      const res = await sendRequest(`${socketUrl}/items/gacha`,"POST",payload,"gacha",{token:true},token??undefined)
      const result = res as any;
      console.log(result)
      if(result.result){
        updateCoins(result.data.remaining_coins);
      }
      alert('Portal Dimensi Terbuka! (Gacha Animation Triggered)');
    } else {
      alert('Saldo koin tidak mencukupi untuk melakukan summon.');
    }
    }catch(err:any){
      const error = JSON.parse(err.message)
      console.log("isi dari err : ",error.error)
      alert(error.error)
    }
    
  };

  return (
    <div className="min-h-screen bg-[#070705] text-[#e5e5e0] font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Dynamic Cosmic Portal Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar Navigation */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/80 to-transparent relative z-10">
        <button 
          onClick={() => router.push('/Pages/User')}
          className="text-sm font-bold tracking-wide text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Kembali Ke Dashboard
        </button>
        
        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-neutral-800 backdrop-blur-md">
          <span className="text-yellow-500 font-bold font-mono text-sm">🪙 {(user?.coins ?? 0).toLocaleString('en-US')}</span>
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full transition-colors">
            {user?.user}
          </button>
        </div>
      </header>

      {/* Main Summoning Interface */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 text-center max-w-xl mx-auto">
        <h2 className="text-5xl font-black text-white tracking-tight uppercase drop-shadow-md">
          Celestial Breach
        </h2>
        <p className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase mt-2">
          Summoning Probability: <span className="text-purple-400 font-bold">SSR 2.5%</span>
        </p>

        {/* Summon Portal Placeholder Structure */}
        <div className="w-64 h-64 my-10 relative flex items-center justify-center rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-black shadow-[0_0_50px_rgba(147,51,234,0.15)] group hover:border-purple-500/50 transition-all duration-700">
          <div className="absolute inset-2 rounded-2xl border border-dashed border-neutral-800 group-hover:rotate-45 transition-transform duration-1000" />
          <div className="text-3xl text-purple-400/70 animate-spin [animation-duration:12s]">🔮</div>
        </div>

        {/* Action Buttons Container */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Summon Single */}
          <button 
            onClick={() => handleSummon(1)}
            className="bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-4 rounded-xl text-center transition-all group active:scale-98"
          >
            <span className="block font-black text-white text-base tracking-wide group-hover:text-yellow-500 transition-colors">Gacha 1x</span>
            <span className="inline-block text-xs text-neutral-400 font-mono mt-1">🪙 10 Coins</span>
          </button>

          {/* Summon Multi discounted */}
          <button 
            onClick={() => handleSummon(5)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black p-4 rounded-xl text-center transition-all relative font-black group active:scale-98 shadow-xl shadow-yellow-500/10"
          >
            <span className="absolute -top-2.5 right-3 bg-purple-600 text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              10% Off
            </span>
            <span className="block text-base tracking-wide">Gacha 5x</span>
            <span className="inline-block text-xs font-mono opacity-80 mt-1">
              <span className="line-through mr-1 opacity-50">50</span> 🪙 50 Coins
            </span>
          </button>
        </div>

        <p className="text-xs text-neutral-500 font-mono mt-8">
          Available Balance: 🪙 {(user?.coins ?? 0).toLocaleString('en-US')}
        </p>
      </main>

    </div>
  );
}