import React, { useRef, useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Landmark,
  Printer,
  Bluetooth,
  ChefHat,
  Edit3,
  Image as ImageIcon,
  Settings,
  RefreshCw,
  Trash2,
  LogOut,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Palette,
  Store,
  Database,
  Sun,
  Moon,
  Check,
  RotateCcw,
  Save,
} from 'lucide-react';
import { formatIDR, isImageSource } from '../utils/formatters';
import { THEME_PRESETS } from '../utils/theme';

/* 1. MODAL PEMBAYARAN (CHECKOUT) */
export function CheckoutModal({
  isOpen,
  onClose,
  customerName,
  orderType,
  deliveryAddress,
  totalTagihan,
  calculatedDiscount,
  paymentMethod,
  setPaymentMethod,
  cashGiven,
  setCashGiven,
  kembalian,
  isCashSufficient,
  settings,
  submittingOrder,
  onConfirmPay,
}) {
  if (!isOpen) return null;

  const orderTypeDisplay =
    orderType === 'Delivery' && deliveryAddress?.trim()
      ? `Delivery - ${deliveryAddress.trim()}`
      : orderType;

  const quickNominals = [
    { label: 'Uang Pas', value: totalTagihan },
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
  ];

  const methods = [
    {
      id: 'Tunai',
      title: 'Tunai',
      desc: 'Uang & kembalian',
      icon: Banknote,
    },
    {
      id: 'QRIS',
      title: 'QRIS',
      desc: 'Scan QR toko',
      icon: QrCode,
    },
    {
      id: 'Transfer',
      title: 'Transfer',
      desc: 'Mutasi rekening',
      icon: Landmark,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 dark:border-zinc-800">
        {/* Banner Gelap Atas */}
        <div className="bg-zinc-950 text-white px-5 sm:px-6 py-4 sm:py-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
          >
            <X size={16} />
          </button>
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 text-center px-8 truncate">
            Total Tagihan · {customerName.trim() || 'Pelanggan'} ({orderTypeDisplay})
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-center text-white mt-1 tabular-nums">
            {formatIDR(totalTagihan)}
          </h3>
          {calculatedDiscount > 0 && (
            <p className="text-center text-[11px] font-semibold text-emerald-400 mt-1 tabular-nums">
              Sudah termasuk diskon -{formatIDR(calculatedDiscount)}
            </p>
          )}
        </div>

        {/* Konten Pembayaran */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 sm:space-y-5 custom-scrollbar">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-2">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {methods.map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id);
                      setCashGiven(totalTagihan);
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-slate-900 dark:text-zinc-100'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        active
                          ? 'text-[var(--accent-text)] mb-1.5'
                          : 'text-slate-500 dark:text-zinc-400 mb-1.5'
                      }
                    />
                    <div className="text-xs font-extrabold">{m.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight mt-0.5">
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {paymentMethod === 'Tunai' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
                  Nominal Cepat
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {quickNominals.map((nom) => (
                    <button
                      key={nom.label}
                      type="button"
                      onClick={() => setCashGiven(nom.value)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer tabular-nums ${
                        cashGiven === nom.value
                          ? 'bg-slate-900 dark:bg-zinc-100 border-slate-900 dark:border-zinc-100 text-white dark:text-zinc-900'
                          : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      {nom.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
                  Uang Diterima (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cashGiven || ''}
                  onChange={(e) => setCashGiven(Math.max(0, Number(e.target.value)))}
                  placeholder="Masukkan nominal uang diterima"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-lg font-extrabold text-slate-900 dark:text-zinc-100 focus:border-[var(--accent)] outline-none tabular-nums"
                />
              </div>

              {!isCashSufficient && cashGiven > 0 && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs font-bold text-red-700 dark:text-red-300 text-center tabular-nums">
                  Uang tunai kurang {formatIDR(totalTagihan - cashGiven)}
                </div>
              )}

              {isCashSufficient && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between tabular-nums">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    Kembalian
                  </span>
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatIDR(Math.max(0, kembalian))}
                  </span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'QRIS' && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-2xl">
              <div className="bg-white p-3 rounded-2xl border-2 border-[var(--accent)] shadow-sm mb-2.5">
                {settings.qrisPic ? (
                  <img
                    src={settings.qrisPic}
                    alt="QRIS Warung"
                    referrerPolicy="no-referrer"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs font-semibold text-slate-400 text-center px-4">
                    Belum ada gambar QRIS. Atur di menu Pengaturan.
                  </div>
                )}
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                Minta pelanggan memindai QRIS di atas
              </p>
            </div>
          )}

          {paymentMethod === 'Transfer' && (
            <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 text-center space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                Transfer ke Rekening
              </p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                {settings.bankName || 'BCA'}
              </p>
              <p className="inline-block px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-sky-200 dark:border-sky-800 text-sm font-mono font-bold text-sky-700 dark:text-sky-300 select-all">
                {settings.bankAccount || '-'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Tombol Konfirmasi */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
          <button
            type="button"
            disabled={!isCashSufficient || submittingOrder}
            onClick={onConfirmPay}
            className="w-full py-3.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-slate-300 dark:disabled:bg-zinc-800 disabled:text-slate-500 dark:disabled:text-zinc-600 text-white text-sm font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed tabular-nums min-h-[46px]"
          >
            <CreditCard size={17} />
            <span>
              {submittingOrder
                ? 'Menyimpan Transaksi...'
                : `Konfirmasi Bayar ${formatIDR(totalTagihan)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* 2. MODAL STRUK GABUNGAN (STRUK KASIR | STRUK DAPUR) */
export function UnifiedReceiptModal({
  isOpen,
  order,
  activeTab,
  setActiveTab,
  settings,
  onClose,
  onPrintCashierBT,
  onPrintKitchenBT,
}) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto print-modal-overlay">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 flex flex-col my-auto print:shadow-none print:border-none print:rounded-none">
        {/* Header Tab Switcher (No-print) */}
        <div className="bg-zinc-950 text-white px-4 py-3 flex items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-full border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('kasir')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'kasir'
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Struk Kasir
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dapur')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'dapur'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Struk Dapur
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
              title="Cetak via Browser / PDF"
            >
              <Printer size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-800 hover:bg-red-600 text-zinc-200 hover:text-white cursor-pointer"
              title="Tutup"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Preview Konten Thermal (Tetap Kertas Putih Akurat) */}
        <div className="p-4 sm:p-6 max-h-[68vh] overflow-y-auto bg-slate-100 dark:bg-zinc-950 custom-scrollbar print:p-0 print:max-h-none print:overflow-visible print:bg-white">
          <div className="bg-white text-black p-5 rounded-xl border border-slate-200 font-mono text-xs shadow-xs mx-auto max-w-[340px] print-receipt-area print:border-none print:shadow-none">
            {activeTab === 'kasir' ? (
              <>
                <div className="text-center border-b-2 border-dashed border-slate-300 pb-3 mb-3">
                  <h2 className="text-base font-black uppercase tracking-wide">
                    {settings.storeName || 'WARUNG COBEK GEPREK'}
                  </h2>
                  {settings.phone && (
                    <p className="text-[11px] font-semibold mt-0.5">
                      Telp: {settings.phone}
                    </p>
                  )}
                  <p className="text-[10px] mt-1 text-slate-600">
                    ID: {order.id} ·{' '}
                    {new Date(order.date).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="mb-3 text-[11px] space-y-0.5">
                  <p>
                    <span className="font-bold">Pelanggan:</span>{' '}
                    {order.customerName || 'Pelanggan'}
                  </p>
                  <p>
                    <span className="font-bold">Tipe/Meja:</span>{' '}
                    {order.address || 'Di Tempat'}
                  </p>
                </div>

                <div className="border-y-2 border-dashed border-slate-300 py-3 mb-3 space-y-2">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx}>
                      <div className="font-bold">{item.name}</div>
                      <div className="flex justify-between text-[11px] tabular-nums">
                        <span>
                          {item.qty} x {formatIDR(item.price)}
                        </span>
                        <span className="font-bold">
                          {formatIDR(item.price * item.qty)}
                        </span>
                      </div>
                      {item.note && (
                        <div className="text-[10px] italic text-slate-600 pl-2">
                          * {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-[11px] tabular-nums">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatIDR(order.subTotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600 font-bold">
                      <span>Diskon</span>
                      <span>-{formatIDR(order.discountAmount)}</span>
                    </div>
                  )}
                  {order.extraCharge > 0 && (
                    <div className="flex justify-between">
                      <span>Biaya Tambahan</span>
                      <span>{formatIDR(order.extraCharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-2 mt-2 border-t border-slate-300">
                    <span>TOTAL</span>
                    <span>{formatIDR(order.total)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dashed border-slate-300">
                    <span>Metode Bayar</span>
                    <span className="font-bold uppercase">{order.method}</span>
                  </div>
                  {order.method === 'Tunai' && (
                    <>
                      <div className="flex justify-between">
                        <span>Tunai</span>
                        <span>{formatIDR(order.cashGiven)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Kembali</span>
                        <span>{formatIDR(order.kembalian)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center mt-4 pt-3 border-t border-dashed border-slate-300">
                  <p className="font-bold">*** TERIMA KASIH ***</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Simpan struk ini sebagai bukti pembayaran.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center border-b-2 border-dashed border-slate-400 pb-3 mb-3">
                  <h2 className="text-base font-black uppercase tracking-wider">
                    *** TIKET DAPUR / KOKI ***
                  </h2>
                  <p className="text-xs font-bold mt-1">{order.id}</p>
                  <p className="text-[11px] text-slate-600">
                    {new Date(order.date).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {new Date(order.date).toLocaleDateString('id-ID')}
                  </p>
                </div>

                <div className="mb-3 p-2.5 rounded-lg bg-slate-100 text-xs space-y-0.5">
                  <p className="font-black uppercase">
                    PEMESAN: {order.customerName || 'Pelanggan'}
                  </p>
                  <p className="font-bold">
                    TIPE: {order.address || 'Di Tempat'}
                  </p>
                </div>

                <div className="space-y-2.5 border-b-2 border-dashed border-slate-400 pb-4 mb-3">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx}>
                      <div className="text-sm font-black flex items-start gap-2">
                        <span className="px-1.5 py-0.5 bg-black text-white rounded text-xs">
                          {item.qty}x
                        </span>
                        <span>{item.name}</span>
                      </div>
                      {item.note && (
                        <div className="mt-1 pl-8 text-xs font-bold text-red-600 italic">
                          &gt;&gt;&gt; Catatan: {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-center font-black uppercase text-xs">
                  HARAP SEGERA DISIAPKAN!
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer 2 Tombol Cetak Langsung (No-print) */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-2 gap-2.5 no-print">
          <button
            type="button"
            onClick={() => onPrintCashierBT(order)}
            className="py-3 px-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bluetooth size={14} />
            <span>Cetak Struk</span>
          </button>

          <button
            type="button"
            onClick={() => onPrintKitchenBT(order)}
            className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ChefHat size={14} />
            <span>Cetak Dapur</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* 3. MODAL TAMBAH / EDIT MENU */
export function MenuFormModal({
  isOpen,
  editingMenu,
  menuForm,
  setMenuForm,
  categoriesList,
  isCustomCategoryMode,
  setIsCustomCategoryMode,
  customCategoryInput,
  setCustomCategoryInput,
  onImageUpload,
  onSave,
  onClose,
}) {
  const menuImageRef = useRef(null);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Edit3 size={18} className="text-[var(--accent-text)]" />
            <span>{editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
              Nama Menu
            </label>
            <input
              type="text"
              value={menuForm.name}
              onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
              placeholder="Cth: Ayam Geprek Sambal Ijo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--accent)] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Harga (Rp)
              </label>
              <input
                type="number"
                value={menuForm.price}
                onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                placeholder="15000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--accent)] outline-none tabular-nums"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Kategori
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategoryMode(!isCustomCategoryMode)}
                  className="text-[11px] font-bold text-[var(--accent-text)] hover:underline cursor-pointer"
                >
                  {isCustomCategoryMode ? 'Pilih Daftar' : '+ Baru'}
                </button>
              </div>
              {isCustomCategoryMode ? (
                <input
                  type="text"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  placeholder="Kategori baru..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--accent)] outline-none"
                />
              ) : (
                <select
                  value={menuForm.category}
                  onChange={(e) => {
                    if (e.target.value === 'NEW') {
                      setIsCustomCategoryMode(true);
                    } else {
                      setMenuForm({ ...menuForm, category: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--accent)] outline-none"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="NEW">+ Kategori Baru...</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
              Gambar Menu (Upload Foto / Emoji)
            </label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => menuImageRef.current?.click()}
                className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:border-[var(--accent)] flex items-center justify-center text-2xl cursor-pointer overflow-hidden flex-shrink-0"
              >
                {isImageSource(menuForm.image) ? (
                  <img
                    src={menuForm.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  menuForm.image || (
                    <ImageIcon size={18} className="text-slate-400 dark:text-zinc-500" />
                  )
                )}
              </div>
              <input
                type="file"
                ref={menuImageRef}
                accept="image/*"
                onChange={(e) =>
                  onImageUpload(e, (url) => setMenuForm({ ...menuForm, image: url }))
                }
                className="hidden"
              />
              <input
                type="text"
                value={typeof menuForm.image === 'string' ? menuForm.image : ''}
                onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                placeholder="Ketik emoji 🍗 atau klik kotak di kiri"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--accent)] outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          className="w-full mt-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
        >
          {editingMenu ? 'Simpan Perubahan' : 'Tambahkan Menu'}
        </button>
      </div>
    </div>
  );
}

/* 4. MODAL PENGATURAN TERSTRUKTUR (PROFIL & BAYAR | TAMPILAN & TEMA | SISTEM & DATA) */
function SettingsModalBody({
  onClose,
  settings,
  onSaveSettings,
  onImageUpload,
  onRequestReset,
  onLogout,
  theme,
  onUpdateTheme,
  onResetTheme,
  btStatus,
  onConnectBluetooth,
  userEmail,
}) {
  const [activeSection, setActiveSection] = useState('profil');
  const [draft, setDraft] = useState(() => ({ ...settings }));
  const [saving, setSaving] = useState(false);
  const [logoErr, setLogoErr] = useState(false);
  const profilePicRef = useRef(null);
  const qrisPicRef = useRef(null);

  const isDirty =
    draft.storeName !== settings.storeName ||
    draft.phone !== settings.phone ||
    draft.profilePic !== settings.profilePic ||
    draft.qrisPic !== settings.qrisPic ||
    draft.bankName !== settings.bankName ||
    draft.bankAccount !== settings.bankAccount;

  const handleSaveProfile = async () => {
    setSaving(true);
    await onSaveSettings(draft);
    setSaving(false);
  };

  const SECTION_TABS = [
    { id: 'profil', label: 'Profil & Bayar', icon: Store },
    { id: 'tema', label: 'Tampilan & Tema', icon: Palette },
    { id: 'sistem', label: 'Sistem & Data', icon: Database },
  ];

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="w-full sm:max-w-2xl bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Modal */}
        <div className="bg-zinc-950 text-white px-5 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings size={17} className="text-[var(--accent-text)]" />
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
              Pengaturan Warung &amp; Tampilan
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Sub-Tab Navigasi */}
        <div className="px-4 sm:px-5 pt-3 pb-2.5 bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0">
          <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 dark:bg-zinc-800 p-1 rounded-xl">
            {SECTION_TABS.map((t) => {
              const Icon = t.icon;
              const active = activeSection === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveSection(t.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon
                    size={13}
                    className={active ? 'text-[var(--accent-text)]' : ''}
                  />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Konten Tab Aktif */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          {/* TAB 1: PROFIL & PEMBAYARAN */}
          {activeSection === 'profil' && (
            <div className="space-y-4">
              {/* Identitas Warung */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  Identitas Usaha &amp; Struk
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div
                    onClick={() => profilePicRef.current?.click()}
                    className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--accent)] cursor-pointer flex-shrink-0 bg-white dark:bg-zinc-900 flex items-center justify-center group"
                  >
                    {isImageSource(draft.profilePic) && !logoErr ? (
                      <img
                        key={draft.profilePic}
                        src={draft.profilePic}
                        alt="Logo Warung"
                        referrerPolicy="no-referrer"
                        onError={() => setLogoErr(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Flame size={28} className="text-[var(--accent-text)]" />
                    )}
                    <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold text-center px-1">
                      Ganti Logo
                    </div>
                    <input
                      type="file"
                      ref={profilePicRef}
                      accept="image/*"
                      onChange={(e) =>
                        onImageUpload(e, (url) => {
                          setLogoErr(false);
                          setDraft((prev) => ({ ...prev, profilePic: url }));
                        })
                      }
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                        Nama Usaha / Warung
                      </label>
                      <input
                        type="text"
                        value={draft.storeName}
                        onChange={(e) =>
                          setDraft({ ...draft, storeName: e.target.value })
                        }
                        placeholder="Warung Cobek Geprek"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 focus:border-[var(--accent)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                        No. Telepon / WA (Tampil di Struk)
                      </label>
                      <input
                        type="text"
                        value={draft.phone || ''}
                        onChange={(e) =>
                          setDraft({ ...draft, phone: e.target.value })
                        }
                        placeholder="0812-3456-7890"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:border-[var(--accent)] outline-none tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Pembayaran QRIS & Bank */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  Info Pembayaran (QRIS &amp; Transfer Bank)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1.5">
                      Gambar QRIS Warung
                    </label>
                    <div
                      onClick={() => qrisPicRef.current?.click()}
                      className="h-36 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[var(--accent)] flex flex-col items-center justify-center p-3 cursor-pointer"
                    >
                      {draft.qrisPic ? (
                        <img
                          src={draft.qrisPic}
                          alt="QRIS"
                          referrerPolicy="no-referrer"
                          className="max-h-20 object-contain mb-2"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-zinc-500 mb-2">
                          Belum ada foto QRIS
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-[10px] font-bold">
                        Klik Upload QRIS
                      </span>
                      <input
                        type="file"
                        ref={qrisPicRef}
                        accept="image/*"
                        onChange={(e) =>
                          onImageUpload(e, (url) =>
                            setDraft((prev) => ({ ...prev, qrisPic: url }))
                          )
                        }
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                        Nama Bank
                      </label>
                      <input
                        type="text"
                        value={draft.bankName}
                        onChange={(e) =>
                          setDraft({ ...draft, bankName: e.target.value })
                        }
                        placeholder="BCA / BRI / Mandiri"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-zinc-100 focus:border-[var(--accent)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                        No. Rekening &amp; Atas Nama
                      </label>
                      <input
                        type="text"
                        value={draft.bankAccount}
                        onChange={(e) =>
                          setDraft({ ...draft, bankAccount: e.target.value })
                        }
                        placeholder="1234567890 a/n Warung Geprek"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-900 dark:text-zinc-100 focus:border-[var(--accent)] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KUSTOMISASI TEMA & TAMPILAN */}
          {activeSection === 'tema' && (
            <div className="space-y-4">
              {/* Mode Permukaan: Terang / Gelap */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800 dark:text-zinc-100">
                      Mode Tampilan
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Sesuaikan kenyamanan mata kasir siang &amp; malam
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'light', label: 'Mode Terang', icon: Sun },
                    { id: 'dark', label: 'Mode Gelap', icon: Moon },
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = theme.mode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onUpdateTheme({ mode: m.id })}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-colors cursor-pointer ${
                          active
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                            : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <Icon size={15} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Warna Aksen Utama */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-zinc-100">
                    Warna Aksen Utama
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Berlaku untuk tombol aksi, menu aktif, grafik, dan sorotan harga
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.values(THEME_PRESETS).map((preset) => {
                    const active = theme.accent === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onUpdateTheme({ accent: preset.id })}
                        className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-colors cursor-pointer ${
                          active
                            ? 'border-[var(--accent)] bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs'
                            : 'border-slate-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/60 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-4 h-4 rounded-full flex-shrink-0 border border-black/15"
                            style={{ backgroundColor: preset.swatch }}
                          />
                          <span className="truncate">{preset.label}</span>
                        </div>
                        {active && (
                          <Check
                            size={14}
                            className="text-[var(--accent-text)] flex-shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gaya Header, Radius & Kepadatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-zinc-100">
                    Gaya Header Atas
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'dark', label: 'Gelap' },
                      { id: 'accent', label: 'Aksen' },
                      { id: 'surface', label: 'Minimalis' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onUpdateTheme({ headerStyle: opt.id })}
                        className={`py-2 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                          theme.headerStyle === opt.id
                            ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-zinc-100">
                    Sudut Kartu &amp; Tombol
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'sharp', label: 'Tegas' },
                      { id: 'modern', label: 'Modern' },
                      { id: 'soft', label: 'Lembut' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onUpdateTheme({ radius: opt.id })}
                        className={`py-2 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                          theme.radius === opt.id
                            ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kepadatan Menu & Toggle Fitur */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-3">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-zinc-100 mb-2">
                    Kepadatan Kartu Menu Kasir
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'compact', label: 'Ringkas' },
                      { id: 'normal', label: 'Normal' },
                      { id: 'comfortable', label: 'Lega (Sentuh)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onUpdateTheme({ density: opt.id })}
                        className={`py-2 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                          theme.density === opt.id
                            ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/60 space-y-2.5">
                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                        Tampilkan Foto Menu di Kasir
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Matikan untuk tampilan teks cepat &amp; muat lebih banyak menu
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={theme.showMenuImages !== false}
                      onChange={(e) =>
                        onUpdateTheme({ showMenuImages: e.target.checked })
                      }
                      className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                        Tampilkan Jam WIB di Header
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Menampilkan penunjuk waktu real-time pada layar desktop
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={theme.showClock !== false}
                      onChange={(e) =>
                        onUpdateTheme({ showClock: e.target.checked })
                      }
                      className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                    />
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/60 flex justify-end">
                  <button
                    type="button"
                    onClick={onResetTheme}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reset Tema Default</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SISTEM, PRINTER, AKUN & RESET */}
          {activeSection === 'sistem' && (
            <div className="space-y-4">
              {/* Printer & Akun */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Printer Thermal Bluetooth
                    </h3>
                    <p className="text-xs font-bold mt-1.5 text-slate-900 dark:text-zinc-100">
                      Status:{' '}
                      <span
                        className={
                          btStatus === 'Terhubung'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500 dark:text-zinc-400'
                        }
                      >
                        {btStatus}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onConnectBluetooth}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold cursor-pointer"
                  >
                    <Bluetooth size={14} />
                    <span>
                      {btStatus === 'Terhubung'
                        ? 'Printer Siap Digunakan'
                        : 'Hubungkan Printer BT'}
                    </span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Sesi Akun Aktif
                    </h3>
                    <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 mt-1.5 truncate">
                      {userEmail || 'Kasir Warung'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-red-600 hover:border-red-600 hover:text-white text-slate-800 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Keluar Akun (Logout)</span>
                  </button>
                </div>
              </div>

              {/* Pembersihan & Reset Data */}
              <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-red-700 dark:text-red-400">
                  Zona Berbahaya (Pembersihan Data)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onRequestReset('transactions')}
                    className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-orange-300 dark:border-orange-800/70 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-600 dark:text-orange-400">
                      <RefreshCw size={14} />
                      <span>Clear Riwayat Transaksi</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                      Menghapus semua nota &amp; omset. Katalog menu &amp; profil aman.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestReset('factory')}
                    className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-red-300 dark:border-red-800/70 hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-600 dark:text-red-400">
                      <Trash2 size={14} />
                      <span>Reset Total Aplikasi</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                      Mengosongkan profil warung, katalog menu, dan seluruh omset.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Sticky Modal */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 flex items-center justify-between gap-2.5 flex-shrink-0">
          {activeSection === 'profil' ? (
            <>
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                {isDirty ? 'Ada perubahan belum disimpan' : 'Data tersinkron'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={!isDirty || saving}
                  onClick={handleSaveProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 dark:disabled:text-zinc-600 text-white text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <Save size={14} />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                {activeSection === 'tema'
                  ? 'Perubahan tema langsung diterapkan'
                  : 'Pengaturan perangkat & akun'}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold cursor-pointer"
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SettingsModal(props) {
  if (!props.isOpen) return null;
  return <SettingsModalBody {...props} />;
}

/* 5. MODAL KONFIRMASI RESET / HAPUS */
export function ConfirmResetModal({ config, onCancel, onConfirm }) {
  if (!config.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[80] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400 mb-3">
          {config.type === 'factory' ? (
            <ShieldAlert size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
        </div>

        <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 mb-1.5">
          {config.type === 'factory'
            ? 'Konfirmasi Reset Total'
            : config.type === 'transactions'
            ? 'Clear Semua Transaksi?'
            : `Hapus Order ${config.payload?.id}?`}
        </h3>

        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-5">
          {config.type === 'factory'
            ? 'Tindakan ini akan MENGHAPUS SEMUA DATA: Profil Warung, Katalog Menu, dan Omset dikosongkan total.'
            : config.type === 'transactions'
            ? 'Semua riwayat pesanan & laporan keuangan akan dihapus. Katalog Menu tetap aman.'
            : `Nota pesanan ${config.payload?.id} atas nama "${config.payload?.customerName}" (${formatIDR(config.payload?.total || 0)}) akan dihapus permanen.`}
        </p>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white cursor-pointer"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

/* 6. MODAL PREVIEW & CETAK PDF LAPORAN A4 MULTI-HALAMAN (EKSEKUTIF + REKAP BAYAR + TABEL PADAT) */
export function PdfReportModal({
  isOpen,
  onClose,
  orders,
  periodLabel,
  paymentFilter,
  setPaymentFilter,
  settings,
  printedAtLabel,
}) {
  if (!isOpen) return null;

  const filteredOrders = orders.filter(
    (o) => paymentFilter === 'ALL' || o.method === paymentFilter
  );
  const totalOmset = filteredOrders.reduce((s, o) => s + o.total, 0);
  const totalDiskon = filteredOrders.reduce(
    (s, o) => s + (Number(o.discountAmount) || 0),
    0
  );
  const totalItemsSold = filteredOrders.reduce(
    (s, o) =>
      s +
      (o.items || []).reduce((itemSum, i) => itemSum + (Number(i.qty) || 0), 0),
    0
  );
  const avgNota =
    filteredOrders.length > 0 ? totalOmset / filteredOrders.length : 0;

  const topStats = {};
  filteredOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      if (!topStats[item.name]) topStats[item.name] = { qty: 0, omset: 0 };
      const q = Number(item.qty) || 0;
      topStats[item.name].qty += q;
      topStats[item.name].omset += (Number(item.price) || 0) * q;
    });
  });
  const topMenus = Object.entries(topStats)
    .map(([name, d]) => ({ name, qty: d.qty, omset: d.omset }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const paymentSummary = ['Tunai', 'QRIS', 'Transfer'].map((method) => {
    const mOrders = filteredOrders.filter((o) => o.method === method);
    const mTotal = mOrders.reduce((s, o) => s + o.total, 0);
    const pct = totalOmset > 0 ? ((mTotal / totalOmset) * 100).toFixed(1) : '0.0';
    return {
      method,
      count: mOrders.length,
      pct,
      total: mTotal,
    };
  });

  return (
    <div className="fixed inset-0 bg-black/90 z-[70] flex flex-col backdrop-blur-md overflow-hidden print-modal-overlay">
      {/* Top Toolbar Preview (No-print) */}
      <div className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800 px-4 sm:px-5 py-3 flex flex-wrap justify-between items-center gap-2.5 text-white no-print flex-shrink-0">
        <div className="flex items-center gap-2">
          <Printer className="text-[var(--accent-text)]" size={18} />
          <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">
            Preview PDF (A4)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-white outline-none"
          >
            <option value="ALL">Semua Metode</option>
            <option value="Tunai">Tunai</option>
            <option value="QRIS">QRIS</option>
            <option value="Transfer">Transfer</option>
          </select>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 sm:px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Printer size={15} />
            <span>Cetak / Simpan PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-300 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Konten Kertas A4 (Tetap Putih Cetak Resmi) */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 custom-scrollbar print:p-0 print:overflow-visible">
        <div className="w-full max-w-[210mm] bg-white text-slate-900 p-5 sm:p-6 md:p-8 relative font-sans shadow-2xl print:shadow-none mx-auto rounded-xl print:rounded-none print:w-full print-area min-h-[297mm]">
          {/* 1. KOP LAPORAN RESMI */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b-2 border-slate-900 pb-3.5 mb-4">
            <div className="flex items-center gap-3.5">
              {isImageSource(settings.profilePic) && (
                <img
                  src={settings.profilePic}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 aspect-square max-w-[44px] max-h-[44px] rounded-xl object-cover border border-slate-300 flex-shrink-0"
                  alt="Logo"
                />
              )}
              <div>
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-wide leading-tight">
                  {settings.storeName || 'Warung Cobek Geprek'}
                </h1>
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Laporan Penjualan Resmi
                </p>
                {settings.phone && (
                  <p className="text-[10px] text-slate-500">
                    Telp / WA: {settings.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="sm:text-right text-[11px] tabular-nums space-y-0.5">
              <p className="font-bold text-slate-800">Periode: {periodLabel}</p>
              <p className="text-slate-600">
                Metode Bayar: <span className="font-semibold">{paymentFilter}</span>
              </p>
              <p className="text-[10px] text-slate-400">Dicetak: {printedAtLabel}</p>
            </div>
          </div>

          {/* 2. RINGKASAN EKSEKUTIF (4 KPI) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 print-page-break">
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Total Omset Bersih
              </p>
              <p className="text-sm font-black text-emerald-700 mt-0.5 tabular-nums">
                {formatIDR(totalOmset)}
              </p>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Transaksi / Porsi
              </p>
              <p className="text-sm font-black text-slate-900 mt-0.5 tabular-nums">
                {filteredOrders.length} Nota · {totalItemsSold} Item
              </p>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Total Diskon
              </p>
              <p className="text-sm font-black text-red-600 mt-0.5 tabular-nums">
                {formatIDR(totalDiskon)}
              </p>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Rata-rata / Nota
              </p>
              <p className="text-sm font-black text-slate-900 mt-0.5 tabular-nums">
                {formatIDR(avgNota)}
              </p>
            </div>
          </div>

          {/* 3. REKAP METODE PEMBAYARAN & TOP 5 MENU TERLARIS (2 KOLOM SEJAJAR) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 print-page-break">
            {/* Rekap Metode Bayar */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-900 text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                Rekap Metode Pembayaran
              </div>
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-1.5 px-2.5">Metode</th>
                    <th className="py-1.5 px-2 text-right">Nota</th>
                    <th className="py-1.5 px-2 text-right">Porsi</th>
                    <th className="py-1.5 px-2.5 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {paymentSummary.map((row) => (
                    <tr key={row.method}>
                      <td className="py-1.5 px-2.5 font-bold text-slate-800">
                        {row.method}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-600">
                        {row.count}x
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-500">
                        {row.pct}%
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                        {formatIDR(row.total)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black border-t border-slate-300">
                    <td className="py-1.5 px-2.5">TOTAL</td>
                    <td className="py-1.5 px-2 text-right">
                      {filteredOrders.length}x
                    </td>
                    <td className="py-1.5 px-2 text-right">100%</td>
                    <td className="py-1.5 px-2.5 text-right text-emerald-700">
                      {formatIDR(totalOmset)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Top 5 Menu Terlaris */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-900 text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                Top 5 Menu Terlaris
              </div>
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-1.5 px-2 w-6">#</th>
                    <th className="py-1.5 px-2">Nama Menu</th>
                    <th className="py-1.5 px-2 text-right">Qty</th>
                    <th className="py-1.5 px-2.5 text-right">Omset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {topMenus.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-slate-400">
                        Belum ada data menu terjual
                      </td>
                    </tr>
                  ) : (
                    topMenus.map((item, idx) => (
                      <tr key={item.name}>
                        <td className="py-1.5 px-2 font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2 font-bold text-slate-800 truncate max-w-[130px]">
                          {item.name}
                        </td>
                        <td className="py-1.5 px-2 text-right font-semibold text-red-600">
                          {item.qty}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                          {formatIDR(item.omset)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. TABEL RINCIAN TRANSAKSI PADAT MULTI-HALAMAN */}
          <div className="mb-4 overflow-x-auto">
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-t-lg text-[10px] font-bold uppercase tracking-wider flex justify-between items-center print-keep-with-next min-w-[600px]">
              <span>Rincian Transaksi ({filteredOrders.length} Nota)</span>
              <span className="text-emerald-400 tabular-nums">
                Total: {formatIDR(totalOmset)}
              </span>
            </div>

            <table className="w-full min-w-[600px] text-left text-[10px] border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px] border-b border-slate-300">
                  <th className="py-1.5 px-2 w-[74px]">No. Struk</th>
                  <th className="py-1.5 px-2 w-[82px]">Waktu</th>
                  <th className="py-1.5 px-2 w-[135px]">Pelanggan &amp; Tipe</th>
                  <th className="py-1.5 px-2">Rincian Item</th>
                  <th className="py-1.5 px-2 w-[58px]">Metode</th>
                  <th className="py-1.5 px-2 text-right w-[62px]">Diskon</th>
                  <th className="py-1.5 px-2 text-right w-[78px]">Total Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-8 text-center text-xs text-slate-400"
                    >
                      Tidak ada transaksi untuk periode dan filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="print-page-break align-top">
                      <td className="py-1.5 px-2 font-mono font-bold text-red-600 whitespace-nowrap tabular-nums">
                        {o.id}
                      </td>
                      <td className="py-1.5 px-2 text-slate-600 whitespace-nowrap tabular-nums">
                        <div>
                          {new Date(o.date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {new Date(o.date).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="font-bold text-slate-900 leading-tight">
                          {o.customerName || 'Pelanggan'}
                        </div>
                        <div className="text-[9px] text-slate-500 leading-tight mt-0.5">
                          {o.address || 'Di Tempat'}
                        </div>
                      </td>
                      <td className="py-1.5 px-2 text-slate-700 leading-snug">
                        {(o.items || [])
                          .map(
                            (i) =>
                              `${i.qty}x ${i.name}${i.note ? ` [${i.note}]` : ''}`
                          )
                          .join(', ')}
                      </td>
                      <td className="py-1.5 px-2 font-semibold text-slate-700 whitespace-nowrap">
                        {o.method}
                      </td>
                      <td className="py-1.5 px-2 text-right text-red-600 whitespace-nowrap tabular-nums">
                        {o.discountAmount
                          ? `-${formatIDR(o.discountAmount)}`
                          : '-'}
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold text-slate-900 whitespace-nowrap tabular-nums">
                        {formatIDR(o.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredOrders.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-300 font-black text-[10px] tabular-nums">
                    <td colSpan="5" className="py-2 px-2 text-right uppercase">
                      Grand Total ({filteredOrders.length} Transaksi)
                    </td>
                    <td className="py-2 px-2 text-right text-red-600">
                      {totalDiskon > 0 ? `-${formatIDR(totalDiskon)}` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right text-emerald-700">
                      {formatIDR(totalOmset)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* 5. TANDA TANGAN */}
          <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-end text-[11px] print-page-break">
            <div className="text-slate-400 text-[10px]">
              Dokumen ini dihasilkan otomatis oleh Sistem POS{' '}
              {settings.storeName || 'Warung Cobek Geprek'}.
            </div>
            <div className="text-center w-48">
              <p className="text-slate-500 mb-9">Penanggung Jawab,</p>
              <p className="font-bold text-slate-900 underline uppercase">
                {settings.storeName || 'Warung Cobek Geprek'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
