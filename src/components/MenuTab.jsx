import React, { useState, useMemo } from 'react';
import { Plus, Edit3, Trash2, Utensils, Search, X } from 'lucide-react';
import { formatIDR, isImageSource } from '../utils/formatters';

function MenuRowThumb({ image, name }) {
  const [imgErr, setImgErr] = useState(false);

  if (isImageSource(image) && !imgErr) {
    return (
      <img
        src={image}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgErr(true)}
        className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl object-cover border border-slate-200 dark:border-zinc-700 flex-shrink-0"
      />
    );
  }

  if (typeof image === 'string' && image.trim() !== '' && !isImageSource(image)) {
    return (
      <div className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-soft-border)] flex items-center justify-center text-xl flex-shrink-0">
        {image}
      </div>
    );
  }

  return (
    <div className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-soft-border)] flex items-center justify-center text-[var(--accent-text)] flex-shrink-0">
      <Utensils size={16} />
    </div>
  );
}

export default function MenuTab({
  menus,
  categoriesList,
  onOpenMenuModal,
  onToggleMenuAvailability,
  onDeleteMenu,
}) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMenus = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return menus.filter((m) => {
      const matchCat =
        selectedCategory === 'Semua' || m.category === selectedCategory;
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.category && m.category.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [menus, selectedCategory, searchQuery]);

  return (
    <div className="h-full flex flex-col overflow-hidden pb-16 md:pb-0">
      {/* Header Kelola Menu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 flex-shrink-0">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-zinc-100">
            Kelola Menu
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400">
            Atur daftar produk, harga, kategori, dan status ketersediaan
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-52">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
            />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 theme-ctrl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:border-[var(--accent)] outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenMenuModal(null)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 theme-ctrl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Menu</span>
          </button>
        </div>
      </div>

      {/* Baris Filter Kategori Pil */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2.5 custom-scrollbar flex-shrink-0">
        <button
          type="button"
          onClick={() => setSelectedCategory('Semua')}
          className={`px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-[15px] font-bold whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer ${
            selectedCategory === 'Semua'
              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
              : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          Semua ({menus.length})
        </button>
        {categoriesList.map((cat) => {
          const count = menus.filter((m) => m.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-[15px] font-bold whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* TAMPILAN MOBILE (< md): Kartu Menu */}
      <div className="md:hidden flex-1 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar pb-4">
        {filteredMenus.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card py-12 px-4 text-center flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
            <Utensils size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">
              Belum ada menu ditemukan
            </p>
            <button
              type="button"
              onClick={() => onOpenMenuModal(null)}
              className="mt-3 px-4 py-2 theme-ctrl bg-[var(--accent)] text-white text-xs font-bold cursor-pointer"
            >
              + Tambah Menu Pertama
            </button>
          </div>
        ) : (
          filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <MenuRowThumb
                  key={`${menu.id}-${menu.image}`}
                  image={menu.image}
                  name={menu.name}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                    {menu.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    <span className="truncate">{menu.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-extrabold text-[var(--accent-text)] tabular-nums whitespace-nowrap">
                      {formatIDR(menu.price)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onToggleMenuAvailability(menu.id, menu.isAvailable)
                  }
                  className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                    menu.isAvailable
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60'
                  }`}
                >
                  {menu.isAvailable ? 'Tersedia' : 'Habis'}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenMenuModal(menu)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 cursor-pointer"
                  title="Edit Menu"
                >
                  <Edit3 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteMenu(menu.id)}
                  className="p-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                  title="Hapus Menu"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TAMPILAN TABLET / DESKTOP (md+): Tabel Daftar Menu */}
      <div className="hidden md:flex flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card overflow-hidden flex-col">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-zinc-800/90 border-b border-slate-200 dark:border-zinc-800 z-10">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                <th className="py-3 px-4">Menu</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredMenus.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
                      <Utensils size={32} className="mb-2 opacity-50" />
                      <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">
                        Belum ada menu pada kategori ini
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenMenuModal(null)}
                        className="mt-3 px-3.5 py-2 theme-ctrl bg-[var(--accent)] text-white text-xs font-bold cursor-pointer"
                      >
                        + Tambah Menu Pertama
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMenus.map((menu) => (
                  <tr
                    key={menu.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        <MenuRowThumb
                          key={`${menu.id}-${menu.image}`}
                          image={menu.image}
                          name={menu.name}
                        />
                        <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
                          {menu.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                        {menu.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-extrabold text-slate-900 dark:text-zinc-100 whitespace-nowrap tabular-nums">
                      {formatIDR(menu.price)}
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleMenuAvailability(menu.id, menu.isAvailable)
                        }
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                          menu.isAvailable
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                            : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60 hover:bg-red-100 dark:hover:bg-red-900/50'
                        }`}
                        title="Klik untuk ubah status ketersediaan"
                      >
                        {menu.isAvailable ? 'Tersedia' : 'Habis'}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenMenuModal(menu)}
                          className="p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
                          title="Edit Menu"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteMenu(menu.id)}
                          className="p-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white transition-colors cursor-pointer"
                          title="Hapus Menu"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
