import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  History,
  UtensilsCrossed,
  BarChart2,
  Bluetooth,
  Settings,
  Smartphone,
  Flame,
  Sun,
  Moon,
} from 'lucide-react';
import { isImageSource } from '../utils/formatters';

const NAV_TABS = [
  { id: 'pos', label: 'Kasir', icon: ShoppingCart },
  { id: 'riwayat', label: 'Riwayat', icon: History },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'laporan', label: 'Laporan', icon: BarChart2 },
];

const getWibTimeString = () => {
  try {
    const formatted = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
    return `${formatted} WIB`;
  } catch {
    return `${new Date().toLocaleTimeString('en-GB', { hour12: false })} WIB`;
  }
};

function StoreLogo({ profilePic, storeName }) {
  const [logoError, setLogoError] = useState(false);

  if (isImageSource(profilePic) && !logoError) {
    return (
      <img
        src={profilePic}
        alt={storeName || 'Warung Cobek Geprek'}
        referrerPolicy="no-referrer"
        onError={() => setLogoError(true)}
        className="w-full h-full rounded-full object-cover bg-zinc-900"
      />
    );
  }

  return (
    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-[var(--accent-text)]">
      <Flame size={16} />
    </div>
  );
}

export default function Header({
  activeTab,
  setActiveTab,
  settings,
  theme,
  onToggleThemeMode,
  btStatus,
  onConnectBluetooth,
  onOpenSettings,
  deferredPrompt,
  onInstallPWA,
}) {
  const [wibTime, setWibTime] = useState(getWibTimeString);

  useEffect(() => {
    const timer = setInterval(() => {
      setWibTime(getWibTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const headerStyle = theme?.headerStyle || 'dark';
  const isSurfaceHeader = headerStyle === 'surface';
  const isAccentHeader = headerStyle === 'accent';

  const headerShellClass = isAccentHeader
    ? 'bg-[var(--accent)] text-white border-black/15'
    : isSurfaceHeader
    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 border-slate-200 dark:border-zinc-800'
    : 'bg-zinc-950 text-white border-zinc-800';

  const subtitleClass = isAccentHeader
    ? 'text-white/80'
    : isSurfaceHeader
    ? 'text-slate-500 dark:text-zinc-400'
    : 'text-zinc-400';

  const navContainerClass = isAccentHeader
    ? 'bg-black/20 border-white/15'
    : isSurfaceHeader
    ? 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
    : 'bg-zinc-900 border-zinc-800';

  const utilBtnClass = isAccentHeader
    ? 'bg-black/20 border-white/20 text-white hover:bg-black/30'
    : isSurfaceHeader
    ? 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700'
    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700';

  const mobileNavShellClass = isAccentHeader
    ? 'bg-[var(--accent)] border-black/15 text-white'
    : isSurfaceHeader
    ? 'bg-white/95 dark:bg-zinc-900/95 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200'
    : 'bg-zinc-950/95 border-zinc-800 text-zinc-300';

  return (
    <>
      <header
        className={`${headerShellClass} border-b sticky top-0 z-30 flex-shrink-0 transition-colors`}
      >
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Kiri: Logo + Nama Warung + Subjudul */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 flex-shrink-0 shadow-sm ${
                isAccentHeader ? 'bg-white/90' : 'bg-[var(--accent)]'
              }`}
            >
              <StoreLogo
                key={settings.profilePic}
                profilePic={settings.profilePic}
                storeName={settings.storeName}
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight truncate whitespace-nowrap">
                {settings.storeName || 'Warung Cobek Geprek'}
              </h1>
              <p className={`text-[10px] sm:text-[11px] font-medium truncate whitespace-nowrap ${subtitleClass}`}>
                Kasir &amp; Struk Otomatis
              </p>
            </div>
          </div>

          {/* Tengah: Jam Digital Real-Time WIB (Opsional di Tema) */}
          {theme?.showClock !== false && (
            <div
              className={`hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-semibold tabular-nums whitespace-nowrap flex-shrink-0 ${navContainerClass}`}
            >
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{wibTime}</span>
            </div>
          )}

          {/* Kanan: 4 Tab Navigasi Utama + Utilitas Pojok Kanan */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <nav
              className={`hidden md:flex items-center gap-1 p-1 rounded-full border ${navContainerClass}`}
            >
              {NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 lg:px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? isAccentHeader
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'bg-[var(--accent)] text-white shadow-sm'
                        : isSurfaceHeader
                        ? 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-zinc-700/60'
                        : isAccentHeader
                        ? 'text-white/80 hover:text-white hover:bg-black/15'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              {deferredPrompt && (
                <button
                  type="button"
                  onClick={onInstallPWA}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="Install Aplikasi PWA"
                >
                  <Smartphone size={14} />
                  <span>Install</span>
                </button>
              )}

              <button
                type="button"
                onClick={onConnectBluetooth}
                title="Koneksi Bluetooth Thermal Printer"
                className={`flex items-center justify-center gap-1.5 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  btStatus === 'Terhubung'
                    ? isSurfaceHeader
                      ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                      : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                    : utilBtnClass
                }`}
              >
                <Bluetooth size={15} />
                <span className="hidden sm:inline">
                  {btStatus === 'Terhubung'
                    ? 'BT Siap'
                    : btStatus === 'Menghubungkan...'
                    ? 'Menghubungkan...'
                    : 'Printer BT'}
                </span>
              </button>

              <button
                type="button"
                onClick={onToggleThemeMode}
                title={
                  theme?.mode === 'dark'
                    ? 'Ganti ke Mode Terang'
                    : 'Ganti ke Mode Gelap'
                }
                aria-label="Ganti Mode Gelap / Terang"
                className={`min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 p-2 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${utilBtnClass}`}
              >
                {theme?.mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                title="Pengaturan Warung, Tema & Akun"
                aria-label="Pengaturan"
                className={`min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 p-2 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${utilBtnClass}`}
              >
                <Settings size={17} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav (< md) - Docked rapi dengan safe-area bottom & target sentuh 44px+ */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-md px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] grid grid-cols-4 gap-1 shadow-lg ${mobileNavShellClass}`}
      >
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl text-[10px] font-bold transition-colors min-h-[44px] cursor-pointer ${
                isActive
                  ? isAccentHeader
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'bg-[var(--accent)] text-white shadow-xs'
                  : isSurfaceHeader
                  ? 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  : isAccentHeader
                  ? 'text-white/80 hover:text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon size={17} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
