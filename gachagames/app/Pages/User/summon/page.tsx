'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { baseUrl, sendRequest, socketUrl } from '@/app/static/core_function';

interface GachaItem {
  item_name: string;
  description: string;
  rarity: string;
  images: string;
  drop_rate: string;
  event_name: string;
}

export default function SummonPage() {
  const router = useRouter();
  const { user, updateCoins, token } = useAuth();
  const [isRolling, setIsRolling] = useState(false);
  const [pulledItems, setPulledItems] = useState<GachaItem[]>([]);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);

  const handleSummon = async (cost: number) => {
    try {
      setPulledItems([]);
      setRevealedCards([]);

      const exactCoinCost = cost * 10; 

      if ((user?.coins ?? 0) >= exactCoinCost) {
        setIsRolling(true);
        
        const payload = {
          username: user?.user,
          times: cost
        };

        const res = await sendRequest(
          `${socketUrl}/items/gacha`,
          "POST",
          payload,
          "gacha",
          { token: true },
          token ?? undefined
        );

        const result = res as any;
        console.log(result);

        if (result.result && result.data?.rolls) {
          updateCoins(result.data.remaining_coins);
          setPulledItems(result.data.rolls);
          console.log(result.data.rolls)
          setTimeout(() => {
            setRevealedCards(new Array(result.data.rolls.length).fill(true));
          }, 600);
        } else {
          alert('Gacha failed to process properly.');
          setIsRolling(false);
        }
      } else {
        alert('Saldo koin tidak mencukupi untuk melakukan summon.');
      }
    } catch (err: any) {
      setIsRolling(false);
      try {
        const error = JSON.parse(err.message);
        console.log("isi dari err : ", error.error);
        alert(error.error);
      } catch {
        alert(err.message || 'An error occurred during summoning.');
      }
    }
  };

  const closeOverlay = () => {
    setIsRolling(false);
    setPulledItems([]);
    setRevealedCards([]);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendaris':
        return 'text-amber-400 border-amber-500 shadow-amber-500/20';
      case 'langka':
        return 'text-purple-400 border-purple-500 shadow-purple-500/20';
      case 'biasa':
      default:
        return 'text-neutral-300 border-neutral-600 shadow-neutral-500/10';
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
          Summoning Probability: <span className={`${getRarityColor(String(user?.rarity))} font-bold`}>{user?.drop_rate}</span>
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
            disabled={isRolling}
            onClick={() => handleSummon(1)}
            className="bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-4 rounded-xl text-center transition-all group active:scale-98 disabled:opacity-50"
          >
            <span className="block font-black text-white text-base tracking-wide group-hover:text-yellow-500 transition-colors">Gacha 1x</span>
            <span className="inline-block text-xs text-neutral-400 font-mono mt-1">🪙 10 Coins</span>
          </button>

          {/* Summon Multi discounted */}
          <button 
            disabled={isRolling}
            onClick={() => handleSummon(5)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black p-4 rounded-xl text-center transition-all relative font-black group active:scale-98 shadow-xl shadow-yellow-500/10 disabled:opacity-50"
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

      {/* --- GACHA SHOWCASE OVERLAY --- */}
      {isRolling && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-hidden animate-fadeIn">
          
          {/* Portal Background Atmosphere inside overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse" />

          {pulledItems.length === 0 ? (
            /* Loading State */
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-mono tracking-widest text-purple-400 uppercase animate-pulse">
                Opening Dimension Breach...
              </p>
            </div>
          ) : (
            /* Card Row Display (Mobile Legend Style) */
            <div className="w-full max-w-7xl flex flex-col items-center z-10">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-400 uppercase tracking-widest mb-12 text-center animate-bounce">
                Congratulation This Your Reward !
              </h3>

              {/* Horizontally forced row container */}
              <div className="w-full flex flex-row flex-nowrap items-center justify-start md:justify-center gap-4 px-4 overflow-x-auto overflow-y-hidden pb-6 scrollbar-thin">
                {pulledItems.map((item, index) => (
                  <div
                    key={index}
                    style={{ 
                      animationDelay: `${index * 150}ms`,
                    }}
                    className="w-48 h-72 relative perspective-1000 animate-slideUpAndFade flex-shrink-0"
                  >
                    {/* Card Inner Wrapper */}
                    <div 
                      className={`w-full h-full relative duration-700 transform-style-3d ${
                        revealedCards[index] ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* CARD BACK SIDE */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl border-2 border-purple-500/40 bg-gradient-to-br from-neutral-900 to-purple-950/80 flex flex-col items-center justify-center p-4 backface-hidden shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                        <div className="w-10 h-10 border border-dashed border-purple-400/30 rounded-full flex items-center justify-center animate-spin [animation-duration:8s]">
                          <span className="text-lg">🔮</span>
                        </div>
                        <span className="text-[9px] font-mono tracking-wider text-purple-400 mt-4 uppercase">
                          Summoning
                        </span>
                      </div>

                      {/* CARD FRONT SIDE (REVEALED ITEM) */}
                      <div className={`absolute inset-0 w-full h-full rounded-2xl border-2 bg-neutral-900 p-3 flex flex-col items-center justify-between backface-hidden rotate-y-180 shadow-2xl ${getRarityColor(item.rarity)}`}>
                        {/* Rarity & Event Header Tags */}
                        <div className="w-full flex items-center justify-between text-[8px] font-mono tracking-wider uppercase opacity-80">
                          <span className="truncate max-w-[65px]">{item.event_name || 'Event'}</span>
                          <span className="font-bold border border-current px-1 rounded">
                            {item.rarity}
                          </span>
                        </div>

                        {/* Item Art Image */}
                        <div className="w-full h-28 my-1.5 relative overflow-hidden bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-center">
                          {item.images ? (
                            <img 
                              src={`${socketUrl || ''}/src/assets/items/${item.images}`} 
                              alt={item.item_name}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                                if(e.currentTarget.parentElement) {
                                  e.currentTarget.parentElement.innerHTML = '<span class="text-2xl">⚔️</span>';
                                }
                              }}
                            />
                          ) : (
                            <span className="text-2xl">⚔️</span>
                          )}
                        </div>

                        {/* Info details Section */}
                        <div className="w-full text-center">
                          <h4 className="font-black text-xs text-white line-clamp-1 tracking-wide">
                            {item.item_name}
                          </h4>
                          <p className="text-[9px] text-neutral-400 mt-0.5 line-clamp-2 leading-tight font-sans">
                            {item.description}
                          </p>
                        </div>

                        {/* Rate Metric footer */}
                        <div className="w-full pt-1 border-t border-neutral-800 text-center">
                          <span className="text-[8px] font-mono text-neutral-500">
                            Rate: {item.drop_rate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button to close display overlay */}
              <button
                onClick={closeOverlay}
                className="mt-10 bg-white hover:bg-neutral-200 text-black font-black text-sm px-8 py-3 rounded-xl tracking-wider uppercase shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Claim Rewards
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tailwind Utility Animation Injectors */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpAndFade {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slideUpAndFade {
          animation: slideUpAndFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Custom mini horizontal scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.3);
          border-radius: 99px;
        }
      `}</style>
    </div>
  );
}