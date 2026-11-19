import React, { useState } from 'react';
import {
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  MessageSquare,
  Tag,
  Utensils,
  ChevronUp,
  MapPin,
} from 'lucide-react';
import { formatIDR, isImageSource } from '../utils/formatters';

function MenuThumbnail({ image, name }) {
  const [imgError, setImgError] = useState(false);

  if (isImageSource(image) && !imgError) {
    return (
      <img
        src={image}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    );
  }

  if (typeof image === 'string' && image.trim() !== '' && !isImageSource(image)) {
    return (
      <div className="w-full h-full bg-[var(--accent-soft)] flex items-center justify-center text-3xl select-none">
        {image}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-text)]">
      <Utensils size={22} />
    </div>
  );
}

function CartItemCard({
  item,
  isNoteOpen,
  onToggleNote,
  onUpdateQty,
  onUpdateQtyDirect,
  onUpdateItemNote,
  onRemoveFromCart,
}) {
  const qtyNum = Number(item.qty) || 0;
  const lineTotal = item.price * qtyNum;
  const hasNote = Boolean(item.note && item.note.trim() !== '');

  const qtyControl = (
    <div className="flex items-center gap-0.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-0.5">
      <button
        type="button"
        onClick={() => onUpdateQty(item.cartId, -1)}
        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
        aria-label="Kurangi jumlah"
      >
        <Minus size={11} />
      </button>
      <input
        type="number"
        min="1"
        value={item.qty}
        onChange={(e) =>
          onUpdateQtyDirect(
            item.cartId,
            e.target.value === ''
              ? ''
              : Math.max(1, parseInt(e.target.value, 10) || 1)
          )
        }
        onBlur={() => {
          if (!item.qty || Number(item.qty) < 1) {
            onUpdateQtyDirect(item.cartId, 1);
          }
        }}
        className="w-7 text-center text-xs font-bold text-slate-900 dark:text-zinc-100 bg-transparent outline-none tabular-nums"
      />
      <button
        type="button"
        onClick={() => onUpdateQty(item.cartId, 1)}
        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
        aria-label="Tambah jumlah"
      >
        <Plus size={11} />
      </button>
      <button
        type="button"
        onClick={() => onRemoveFromCart(item.cartId)}
        className="w-6 h-6 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
        aria-label="Hapus item"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );

  const noteButton = (
    <button
      type="button"
      onClick={() => onToggleNote(item.cartId)}
      title={hasNote ? `Catatan: ${item.note}` : 'Tambah catatan'}
      aria-label={hasNote ? `Edit catatan: ${item.note}` : 'Tambah catatan'}
      className={`relative inline-flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
        hasNote
          ? 'bg-[var(--accent-soft)] border-[var(--accent-soft-border)] text-[var(--accent-text)]'
          : isNoteOpen
          ? 'bg-slate-900 dark:bg-zinc-100 border-slate-900 dark:border-zinc-100 text-white dark:text-zinc-900'
          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-600'
      }`}
    >
      <MessageSquare size={12} />
      <span className="hidden sm:inline">{hasNote ? 'Catatan ✓' : 'Catatan'}</span>
      {hasNote && (
        <span
          className="sm:hidden w-1.5 h-1.5 rounded-full bg-[var(--accent)] absolute -top-0.5 -right-0.5"
          aria-hidden="true"
        />
      )}
    </button>
  );

  return (
    <div className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
      {/* Tampilan Mobile (< sm): Nama menu penuh di atas, harga & kontrol sejajar di bawah */}
      <div className="sm:hidden space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-snug">
            {item.name}
          </h4>
          {hasNote && !isNoteOpen && (
            <span className="text-[10px] font-semibold text-[var(--accent-text)] truncate max-w-[110px]">
              “{item.note}”
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 tabular-nums">
            {formatIDR(item.price)} &times; {qtyNum} ={' '}
            <span className="text-[var(--accent-text)] font-bold">
              {formatIDR(lineTotal)}
            </span>
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {noteButton}
            {qtyControl}
          </div>
        </div>
      </div>

      {/* Tampilan Tablet / Desktop (sm+): 1 baris padat muat 3 item tanpa scroll */}
      <div className="hidden sm:flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-tight truncate">
            {item.name}
          </h4>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums truncate">
            {formatIDR(item.price)} &times; {qtyNum} ={' '}
            <span className="text-[var(--accent-text)] font-bold">
              {formatIDR(lineTotal)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {noteButton}
          {qtyControl}
        </div>
      </div>

      {isNoteOpen && (
        <div className="mt-1.5">
          <input
            type="text"
            placeholder="Cth: Sambal pisah / Level 5 / Tanpa es"
            value={item.note}
            onChange={(e) => onUpdateItemNote(item.cartId, e.target.value)}
            autoFocus
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:border-[var(--accent)] outline-none"
          />
        </div>
      )}
    </div>
  );
}

export default function KasirTab({
  menus,
  filteredMenus,
  categoriesList,
  selectedCategoryTab,
  setSelectedCategoryTab,
  menuSearchQuery,
  setMenuSearchQuery,
  cart,
  onAddToCart,
  onUpdateQty,
  onUpdateQtyDirect,
  onUpdateItemNote,
  onRemoveFromCart,
  onClearCart,
  customerName,
  setCustomerName,
  orderType,
  setOrderType,
  deliveryAddress,
  setDeliveryAddress,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  subTotal,
  calculatedDiscount,
  totalTagihan,
  onOpenCheckout,
  theme,
}) {
  const [expandedNotes, setExpandedNotes] = useState({});
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const toggleNoteEditor = (cartId) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [cartId]: !prev[cartId],
    }));
  };

  const totalItemsInCart = cart.reduce(
    (sum, item) => sum + (Number(item.qty) || 0),
    0
  );

  const isDeliveryMissingName =
    orderType === 'Delivery' && !customerName.trim();
  const isDeliveryMissingAddress =
    orderType === 'Delivery' && !deliveryAddress.trim();
  const isDeliveryIncomplete = isDeliveryMissingName || isDeliveryMissingAddress;

  const showMenuImages = theme?.showMenuImages !== false;
  const density = theme?.density || 'normal';
  const cardBodyPadding =
    density === 'compact'
      ? 'p-2'
      : density === 'comfortable'
      ? 'p-3'
      : 'p-2.5';
  const menuTitleClass =
    density === 'comfortable' ? 'text-[13px]' : 'text-xs';

  const renderCartItems = () => {
    if (cart.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-slate-400 dark:text-zinc-500">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-2.5 text-slate-300 dark:text-zinc-600">
            <ShoppingCart size={24} />
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
            Keranjang masih kosong
          </p>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
            Ketuk kartu menu untuk menambah pesanan
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 pr-0.5 custom-scrollbar">
        {cart.map((item) => (
          <CartItemCard
            key={item.cartId}
            item={item}
            isNoteOpen={Boolean(expandedNotes[item.cartId])}
            onToggleNote={toggleNoteEditor}
            onUpdateQty={onUpdateQty}
            onUpdateQtyDirect={onUpdateQtyDirect}
            onUpdateItemNote={onUpdateItemNote}
            onRemoveFromCart={onRemoveFromCart}
          />
        ))}
      </div>
    );
  };

  const renderCartFooter = () => (
    <div className="pt-2.5 mt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2 flex-shrink-0">
      {/* Nama Pemesan & Diskon */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label
            className={`text-[11px] block mb-0.5 ${
              orderType === 'Delivery'
                ? 'font-bold text-[var(--accent-text)]'
                : 'font-semibold text-slate-600 dark:text-zinc-400'
            }`}
          >
            {orderType === 'Delivery' ? 'Nama Pemesan *' : 'Nama Pemesan'}
          </label>
          <input
            type="text"
            placeholder={
              orderType === 'Delivery' ? 'Wajib diisi (Delivery)' : 'Pelanggan'
            }
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border outline-none ${
              isDeliveryMissingName
                ? 'border-[var(--accent-soft-border)] bg-[var(--accent-soft)] text-slate-900 dark:text-zinc-100 focus:border-[var(--accent)]'
                : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--accent)]'
            }`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
              <Tag size={10} className="text-[var(--accent-text)]" />
              <span>Diskon</span>
            </label>
            <div className="flex border border-slate-200 dark:border-zinc-700 rounded-md overflow-hidden text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setDiscountType('rp')}
                className={`px-1.5 py-0.5 cursor-pointer ${
                  discountType === 'rp'
                    ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                }`}
              >
                Rp
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('percent')}
                className={`px-1.5 py-0.5 cursor-pointer ${
                  discountType === 'percent'
                    ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                }`}
              >
                %
              </button>
            </div>
          </div>
          <input
            type="number"
            min="0"
            placeholder={discountType === 'rp' ? '0' : '0%'}
            value={discountValue || ''}
            onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
            className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--accent)] outline-none tabular-nums"
          />
        </div>
      </div>

      {/* Pilihan Tipe Pesanan 3 Opsi: Di Tempat / Bungkus / Delivery */}
      <div className="grid grid-cols-3 gap-1.5">
        {['Di Tempat', 'Bungkus', 'Delivery'].map((type) => {
          const active = orderType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`py-1.5 px-2 rounded-full text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-600'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* Alamat Tujuan Wajib saat Delivery */}
      {orderType === 'Delivery' && (
        <div>
          <label className="text-[11px] font-bold text-[var(--accent-text)] flex items-center gap-1 mb-0.5">
            <MapPin size={11} />
            <span>Alamat Tujuan *</span>
          </label>
          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Wajib diisi: Jl. / No. Rumah / Patokan"
            className={`w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border outline-none ${
              isDeliveryMissingAddress
                ? 'border-[var(--accent-soft-border)] bg-[var(--accent-soft)] text-slate-900 dark:text-zinc-100 focus:border-[var(--accent)]'
                : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--accent)]'
            }`}
          />
        </div>
      )}

      {/* Ringkasan Subtotal / Diskon & Total */}
      <div className="pt-0.5 space-y-0.5">
        {calculatedDiscount > 0 && (
          <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            <span>Subtotal {formatIDR(subTotal)}</span>
            <span className="text-[var(--accent-text)] font-semibold">
              - {formatIDR(calculatedDiscount)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
            Total
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 tabular-nums">
            {formatIDR(totalTagihan)}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={cart.length === 0 || isDeliveryIncomplete}
        onClick={() => {
          setIsMobileCartOpen(false);
          onOpenCheckout();
        }}
        className="w-full py-2.5 px-4 theme-ctrl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 dark:disabled:text-zinc-600 text-white text-sm font-bold transition-colors cursor-pointer disabled:cursor-not-allowed min-h-[44px]"
      >
        {cart.length > 0 && isDeliveryMissingName && isDeliveryMissingAddress
          ? 'Isi Nama & Alamat Delivery'
          : cart.length > 0 && isDeliveryMissingName
          ? 'Isi Nama Pemesan Dahulu'
          : cart.length > 0 && isDeliveryMissingAddress
          ? 'Isi Alamat Delivery Dahulu'
          : 'Bayar Sekarang'}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full w-full overflow-hidden pb-16 md:pb-0">
      {/* PANEL KIRI: Katalog Menu (3 Kolom Ringkas) */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Header Kasir + Pencarian */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 flex-shrink-0">
          <div className="flex items-baseline justify-between sm:block">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-zinc-100 leading-tight">
              Kasir
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400">
              Ketuk menu untuk menambah
            </p>
          </div>
          <div className="relative w-full sm:w-56">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
            />
            <input
              type="text"
              placeholder="Cari menu..."
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 sm:py-1.5 text-xs font-medium theme-ctrl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:border-[var(--accent)] outline-none"
            />
            {menuSearchQuery && (
              <button
                type="button"
                onClick={() => setMenuSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Baris Filter Kategori Pil Horizontal */}
        {menus.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-2 custom-scrollbar flex-shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('Semua')}
              className={`px-3 py-1.5 sm:py-1 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer ${
                selectedCategoryTab === 'Semua'
                  ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              Semua ({menus.length})
            </button>
            {categoriesList.map((cat) => {
              const count = menus.filter((m) => m.category === cat).length;
              const isActive = selectedCategoryTab === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryTab(cat)}
                  className={`px-3 py-1.5 sm:py-1 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Grid Kartu Menu: Maksimal 3 Kolom Menyamping dengan Ukuran Ringkas */}
        <div className="flex-1 overflow-y-auto pr-0.5 custom-scrollbar">
          {filteredMenus.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-10 text-center flex flex-col items-center justify-center">
              <Utensils size={34} className="text-slate-300 dark:text-zinc-600 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                {menus.length === 0 ? 'Belum ada data menu' : 'Menu tidak ditemukan'}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                {menus.length === 0
                  ? 'Tambahkan menu terlebih dahulu melalui tab Menu.'
                  : 'Ubah kata kunci pencarian atau pilih kategori lain.'}
              </p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 gap-2.5 ${
                cart.length > 0 ? 'pb-20 md:pb-6' : 'pb-6'
              }`}
            >
              {filteredMenus.map((menu) => (
                <div
                  key={menu.id}
                  onClick={() => menu.isAvailable && onAddToCart(menu)}
                  className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card overflow-hidden flex flex-col transition-all ${
                    menu.isAvailable
                      ? 'cursor-pointer hover:border-[var(--accent-soft-border)] hover:shadow-sm active:scale-[0.98]'
                      : 'opacity-50 grayscale cursor-not-allowed'
                  }`}
                >
                  {showMenuImages && (
                    <div className="h-20 sm:h-22 w-full overflow-hidden relative bg-[var(--accent-soft)] flex-shrink-0">
                      <MenuThumbnail image={menu.image} name={menu.name} />
                      {!menu.isAvailable && (
                        <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`${cardBodyPadding} flex-1 flex flex-col justify-between gap-1.5`}>
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 truncate">
                          {menu.category}
                        </p>
                        {!showMenuImages && !menu.isAvailable && (
                          <span className="text-[10px] font-bold text-red-500 uppercase">
                            Habis
                          </span>
                        )}
                      </div>
                      <h3
                        className={`${menuTitleClass} font-bold text-slate-900 dark:text-zinc-100 leading-snug line-clamp-2 mt-0.5`}
                      >
                        {menu.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-0.5">
                      <span className="text-xs sm:text-sm font-extrabold text-[var(--accent-text)] tabular-nums">
                        {formatIDR(menu.price)}
                      </span>
                      <button
                        type="button"
                        disabled={!menu.isAvailable}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (menu.isAvailable) onAddToCart(menu);
                        }}
                        aria-label={`Tambah ${menu.name}`}
                        className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-text)] hover:bg-[var(--accent)] hover:text-white flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PANEL KANAN: Sidebar Keranjang Diperlebar (Muat 3 Item Tanpa Scroll) */}
      <aside className="hidden md:flex md:w-[420px] lg:w-[470px] xl:w-[510px] flex-shrink-0 flex-col h-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-3.5 overflow-hidden">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-zinc-100">
              Keranjang
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-[11px] font-bold tabular-nums">
              {totalItemsInCart} Item
            </span>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-[var(--accent-text)] transition-colors cursor-pointer"
            >
              Kosongkan
            </button>
          )}
        </div>

        {renderCartItems()}
        {renderCartFooter()}
      </aside>

      {/* FLOATING CART BUTTON (Mobile < md) */}
      {!isMobileCartOpen && cart.length > 0 && (
        <div className="md:hidden fixed bottom-[68px] left-3 right-3 z-30">
          <button
            type="button"
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-xl flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center relative">
                <ShoppingCart size={16} />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-zinc-950 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {totalItemsInCart}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] block text-white/80 font-semibold uppercase leading-none">
                  Lihat Keranjang
                </span>
                <span className="text-sm font-extrabold tabular-nums">
                  {formatIDR(totalTagihan)}
                </span>
              </div>
            </div>
            <ChevronUp size={18} />
          </button>
        </div>
      )}

      {/* MOBILE CART DRAWER */}
      {isMobileCartOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileCartOpen(false)}
          />
          <div className="relative bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl max-h-[90vh] flex flex-col p-3.5 pb-5 shadow-2xl">
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-zinc-700 mx-auto mb-2.5 flex-shrink-0" />
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                  Keranjang
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-[11px] font-bold tabular-nums">
                  {totalItemsInCart} Item
                </span>
              </div>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-[var(--accent-text)] cursor-pointer px-2 py-1"
                  >
                    Kosongkan
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileCartOpen(false)}
                  className="p-2 rounded-full border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer"
                  aria-label="Tutup keranjang"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {renderCartItems()}
            {renderCartFooter()}
          </div>
        </div>
      )}
    </div>
  );
}
