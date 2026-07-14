'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerStats, GachaItem, HistoryLog, InventoryItem } from '@/app/static/Types';
import { useAuth } from '@/app/context/AuthContext';
import { baseUrl, sendRequest, socketUrl } from '@/app/static/core_function';
import Carousel from '@/app/components/Carousel';
import { useSocket } from '@/app/context/socketContext';
import HistoryTable, { HistoryEntry } from '@/app/components/HistoryTable';
import Image from 'next/image';

const DASHBOARD_REFRESH_KEY = 'dashboard_refreshed';

export default function Dashboard() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { token, user, updateCoins } = useAuth();
  const { socket } = useSocket();
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeModal, setActiveModal] = useState<'inventory' | 'history' | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [listEvent, setListEvent] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [lastGacha, setLastGacha] = useState<HistoryEntry | null>(null);

  // Guard against double-firing in React Strict Mode (dev only)
  const hasCheckedRefresh = useRef(false);

  // One-time refresh per login session — forces the browser to re-read
  // fresh cookies/tokens instead of relying on stale cached client state.
  useEffect(() => {
    if (hasCheckedRefresh.current) return;
    hasCheckedRefresh.current = true;

    const alreadyRefreshed = sessionStorage.getItem(DASHBOARD_REFRESH_KEY);
    if (!alreadyRefreshed) {
      sessionStorage.setItem(DASHBOARD_REFRESH_KEY, 'true');
      window.location.reload();
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await sendRequest(`${baseUrl}/history`, 'GET', undefined, 'history', { token: true }, token ?? undefined);
      const res = response as any;
      if (res.result) {
        const normalized = res.data.map((entry: any) => {
          const rolls = Array.isArray(entry.result_gacha)
            ? entry.result_gacha
            : typeof entry.result_gacha === 'string'
              ? JSON.parse(entry.result_gacha)
              : [];

          return {
            ...entry,
            result_gacha: rolls.map((item: any) => ({
              ...item,
              drop_rate: parseFloat(item.drop_rate),
            })),
          };
        });
        const mostRecent = normalized.reduce((latest: any, entry: any) => {
          if (!latest) return entry;
          const entryDate = new Date(entry.gacha_date);
          const latestDate = new Date(latest.gacha_date);
          return entryDate > latestDate ? entry : latest;
        }, null);
        setLastGacha(mostRecent);
        setHistory(normalized);
      }
    } catch (err) {
      console.error('fetch History:', err);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await sendRequest(`${baseUrl}/inventory`, 'GET', undefined, 'inventory', { token: true }, token ?? undefined);
      const res = response as any;
      if (res.result) {
        const normalized = res.data.map((item: any) => ({
          ...item,
          images: `${socketUrl}/src/assets/items/${item.images}`,
        }));
        setInventory(normalized);
      }
    } catch (err) {
      console.error('fetch Inventory:', err);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const onGachaResult = (payload: { remaining_coins: number }) => {
      updateCoins(payload.remaining_coins);
    };
    socket.on('gacha_result', onGachaResult);
    return () => {
      socket.off('gacha_result', onGachaResult);
    };
  }, [socket, updateCoins]);

  const fetchEvent = async () => {
    try {
      const req = await sendRequest(`${baseUrl}/Events`, 'GET', undefined, 'events', { token: true }, token ?? undefined);
      const res = req as any;
      setListEvent(
        res.data
          .filter((item: any) => item.active)
          .map((event: any) => ({
            id: event.id,
            event_name: event.event_name,
            description: event.description,
            start: event.start,
            end: event.end,
            active: event.active,
            drop_rate: event.drop_rate,
            legendaris: event.legendaris,
            langka: event.langka,
            biasa: event.biasa,
            images: event.images.map((img: string) => `${socketUrl}/src/assets/events/${img}`),
          })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const bannerImages = listEvent.flatMap((event) => event.images ?? []);

  useEffect(() => {
    if (!token) return;
    fetchEvent();
    fetchHistory();
    fetchInventory();
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [token]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await sendRequest(`${baseUrl}/authentication/logout`, 'POST', undefined, 'logout', { token: true }, token ?? undefined);
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      // Clear the refresh flag so the NEXT login session forces
      // a fresh reload again (instead of staying stuck at "already refreshed").
      sessionStorage.removeItem(DASHBOARD_REFRESH_KEY);
      router.push('/Pages/Login');
      router.refresh();
    }
  };

  const getRarityBadgeStyles = (rarity: InventoryItem['rarity']) => {
    switch (rarity) {
      case 'Legendaris':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Langka':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Biasa':
      default:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0a] text-[#e5e5e0] font-sans antialiased selection:bg-yellow-500 selection:text-black">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-neutral-900 bg-[#12120e]">
        <h1 className="text-2xl font-black tracking-wider text-white uppercase">Gacha</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1a1a14] px-4 py-2 rounded-md border border-neutral-800">
            <span className="text-yellow-500 font-bold">🪙</span>
            <span className="font-mono text-sm tracking-wide">
              {(user?.coins ?? 0).toLocaleString('en-US')} Coins
            </span>
          </div>
          <button className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white">🔔</button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full border-2 border-yellow-500/50 bg-neutral-800 overflow-hidden block focus:outline-none focus:border-yellow-400 transition-colors"
            />

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-800 bg-[#12120e] shadow-xl z-20 py-1 animate-fade-in">
                <div className="px-4 py-2 border-b border-neutral-900">
                  <p className="text-xs text-neutral-400 font-medium">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate">{user?.user}</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-900 hover:text-red-300 font-semibold transition-colors flex items-center gap-2"
                >
                  <span>🚪</span> {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div>
          <p className="text-xs tracking-widest text-yellow-500 uppercase font-semibold">
            Selamat Datang, {user?.user}
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight mt-1 text-white">Takdir Menantimu</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative overflow-hidden rounded-xl border border-neutral-800 min-h-[320px] group">
            <div className="absolute inset-0">
              <Carousel images={bannerImages} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 pointer-events-none" />
            <div className="relative z-10 h-full p-8 flex flex-col justify-between pointer-events-none">
              <div className="pointer-events-auto">
                <span className="inline-block bg-yellow-500/10 text-yellow-500 text-xs font-bold px-2.5 py-1 rounded-md border border-yellow-500/20 uppercase tracking-widest mb-4 animate-pulse">
                  Live Now
                </span>
                <h3 className="text-3xl font-black text-white tracking-tight">Gacha Games</h3>
                <p className="text-neutral-300 text-sm max-w-md mt-2 leading-relaxed">
                  Masuki gerbang dimensi dan panggil pahlawan legendaris untuk memperkuat pasukanmu.
                </p>
              </div>
              <button
                onClick={() => router.push('/Pages/User/summon')}
                className="mt-6 self-start flex items-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-3.5 rounded-lg shadow-lg shadow-yellow-500/10 transition-all transform active:scale-95 pointer-events-auto"
              >
                Time To Gacha <span className="text-lg">→</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('inventory')}
            className="text-left overflow-hidden rounded-xl border border-neutral-800 bg-gradient-to-b from-[#161612] to-[#10100d] p-8 flex flex-col justify-between hover:border-neutral-700 transition-all group relative"
          >
            <div className="w-12 h-12 rounded-lg bg-neutral-900 flex items-center justify-center border border-neutral-800 text-xl group-hover:border-yellow-500/50 transition-colors">
              📦
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">Inventory Gacha</h3>
              <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                Lihat koleksi artefak dan pahlawan yang telah kamu kumpulkan.
              </p>
            </div>
          </button>
        </div>

        <button
          onClick={() => setActiveModal('history')}
          className="w-full text-left rounded-xl border border-neutral-800 bg-[#12120e] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-neutral-900 flex items-center justify-center text-xl border border-neutral-800">
              🕒
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">History Gacha</h3>
              <p className="text-neutral-400 text-xs mt-0.5">Catatan perjalanan pemanggilanmu di seluruh dimensi.</p>
            </div>
          </div>
          <div className="text-right sm:text-right">
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block mb-1">Terakhir</span>
            <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/5 border border-yellow-500/10 px-2.5 py-1 rounded">
              {lastGacha?.gacha_date ?? 'Belum ada riwayat'}
            </span>
          </div>
        </button>
      </main>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12120e] border border-neutral-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-neutral-900 flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight text-white capitalize">
                {activeModal === 'inventory' ? 'Inventory' : 'History'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-neutral-500 hover:text-white font-bold transition-colors text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {activeModal === 'inventory' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inventory.map((item, index) => (
                    <div
                      key={`${item.item_name}-${index}`}
                      className="p-4 rounded-xl bg-[#1a1a14] border border-neutral-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.images ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#13110e] border border-neutral-800 flex-shrink-0">
                            <Image
                              src={item.images}
                              alt={item.item_name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#13110e] border border-neutral-800 flex-shrink-0" />
                        )}

                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{item.item_name}</p>
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                            Qty: {item.qty}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-mono font-black px-2.5 py-0.5 rounded whitespace-nowrap ${getRarityBadgeStyles(
                          item.rarity,
                        )}`}
                      >
                        {item.rarity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <HistoryTable data={history} loading={false} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}