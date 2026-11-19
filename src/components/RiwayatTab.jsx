import React, { useMemo, useState, useEffect } from 'react';
import {
  Search,
  Printer,
  ChefHat,
  Trash2,
  ReceiptText,
  X,
} from 'lucide-react';
import { formatIDR, formatDateInput } from '../utils/formatters';

export default function RiwayatTab({
  orders,
  historyStartDate,
  setHistoryStartDate,
  historyEndDate,
  setHistoryEndDate,
  historySearchQuery,
  setHistorySearchQuery,
  selectedPaymentFilter,
  setSelectedPaymentFilter,
  onOpenReceiptModal,
  onDeleteOrder,
}) {
  const [todayAnchor, setTodayAnchor] = useState(() => formatDateInput(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      const next = formatDateInput(new Date());
      setTodayAnchor((prev) => (prev === next ? prev : next));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const activePreset = useMemo(() => {
    if (!historyStartDate && !historyEndDate) return 'all';
    if (historyStartDate === todayAnchor && historyEndDate === todayAnchor) {
      return 'today';
    }
    const base = new Date(`${todayAnchor}T00:00:00`);
    const d7 = new Date(base);
    d7.setDate(d7.getDate() - 6);
    if (
      historyStartDate === formatDateInput(d7) &&
      historyEndDate === todayAnchor
    ) {
      return '7days';
    }
    const firstMonth = new Date(base.getFullYear(), base.getMonth(), 1);
    if (
      historyStartDate === formatDateInput(firstMonth) &&
      historyEndDate === todayAnchor
    ) {
      return 'month';
    }
    return 'custom';
  }, [historyStartDate, historyEndDate, todayAnchor]);

  const filteredOrders = useMemo(() => {
    const query = historySearchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      const orderDateStr = formatDateInput(new Date(o.date));
      const matchStart = !historyStartDate || orderDateStr >= historyStartDate;
      const matchEnd = !historyEndDate || orderDateStr <= historyEndDate;
      const matchPayment =
        selectedPaymentFilter === 'ALL' || o.method === selectedPaymentFilter;
      const matchQuery =
        !query ||
        o.id.toLowerCase().includes(query) ||
        (o.customerName && o.customerName.toLowerCase().includes(query)) ||
        (o.address && o.address.toLowerCase().includes(query));

      return matchStart && matchEnd && matchPayment && matchQuery;
    });
  }, [
    orders,
    historyStartDate,
    historyEndDate,
    historySearchQuery,
    selectedPaymentFilter,
  ]);

  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + o.total, 0),
    [filteredOrders]
  );

  const applyPreset = (preset) => {
    const now = new Date();
    const today = formatDateInput(now);
    if (preset === 'today') {
      setHistoryStartDate(today);
      setHistoryEndDate(today);
    } else if (preset === '7days') {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      setHistoryStartDate(formatDateInput(d));
      setHistoryEndDate(today);
    } else if (preset === 'month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      setHistoryStartDate(formatDateInput(first));
      setHistoryEndDate(today);
    } else if (preset === 'all') {
      setHistoryStartDate('');
      setHistoryEndDate('');
    }
  };

  const PRESETS = [
    { id: 'today', label: 'Hari Ini' },
    { id: '7days', label: '7 Hari' },
    { id: 'month', label: 'Bulan Ini' },
    { id: 'all', label: 'Semua' },
  ];

  const getOrderMeta = (order) => {
    const addrLower = (order.address || '').toLowerCase();
    const isDelivery = addrLower.startsWith('delivery');
    const isBungkus =
      addrLower.includes('bungkus') || addrLower.includes('takeaway');

    const methodBadgeClass =
      order.method === 'Tunai'
        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
        : order.method === 'QRIS'
        ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60'
        : 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60';

    const typeBadgeClass = isDelivery
      ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/60'
      : isBungkus
      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';

    return { isDelivery, methodBadgeClass, typeBadgeClass };
  };

  return (
    <div className="h-full flex flex-col overflow-hidden pb-16 md:pb-0">
      {/* Header & Ringkasan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 flex-shrink-0">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-zinc-100">
            Riwayat Transaksi
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400">
            Cetak ulang struk kasir atau tiket dapur kapan saja
          </p>
        </div>

        <div className="inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 theme-ctrl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 tabular-nums self-stretch sm:self-auto">
          <span>{filteredOrders.length} transaksi</span>
          <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline" aria-hidden="true">
            •
          </span>
          <span className="text-[var(--accent-text)] font-extrabold">
            {formatIDR(totalRevenue)}
          </span>
        </div>
      </div>

      {/* Bar Filter Tanggal & Pencarian (Proporsional di HP & Desktop) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-3 sm:p-3.5 mb-3 flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 w-full xl:w-auto">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 w-full lg:w-auto">
            <input
              type="date"
              value={historyStartDate}
              onChange={(e) => setHistoryStartDate(e.target.value)}
              className="w-full min-w-0 px-2.5 py-2 sm:py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none focus:border-[var(--accent)] tabular-nums"
            />
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-semibold px-0.5">
              s/d
            </span>
            <input
              type="date"
              value={historyEndDate}
              onChange={(e) => setHistoryEndDate(e.target.value)}
              className="w-full min-w-0 px-2.5 py-2 sm:py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none focus:border-[var(--accent)] tabular-nums"
            />
          </div>

          <div className="grid grid-cols-4 sm:flex sm:items-center gap-1.5 w-full lg:w-auto">
            {PRESETS.map((p) => {
              const isActive = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg border text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer text-center ${
                    isActive
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-xs'
                      : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 w-full xl:w-auto">
          <div className="relative w-full sm:w-56">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
            />
            <input
              type="text"
              placeholder="Cari no. struk / nama..."
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 sm:py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:border-[var(--accent)] outline-none"
            />
            {historySearchQuery && (
              <button
                type="button"
                onClick={() => setHistorySearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <select
            value={selectedPaymentFilter}
            onChange={(e) => setSelectedPaymentFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-100 outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="ALL">Semua Metode</option>
            <option value="Tunai">Tunai</option>
            <option value="QRIS">QRIS</option>
            <option value="Transfer">Transfer</option>
          </select>
        </div>
      </div>

      {/* TAMPILAN MOBILE (< md): Kartu Transaksi Tanpa Scroll Horizontal */}
      <div className="md:hidden flex-1 overflow-y-auto space-y-2.5 pr-0.5 custom-scrollbar pb-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card py-12 px-4 text-center flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
            <ReceiptText size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">
              Tidak ada transaksi ditemukan
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Sesuaikan rentang tanggal atau kata kunci pencarian.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const { isDelivery, methodBadgeClass, typeBadgeClass } =
              getOrderMeta(order);
            return (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-3.5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-[var(--accent-text)] tabular-nums">
                        {order.id}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${methodBadgeClass}`}
                      >
                        {order.method}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                      {new Date(order.date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      {new Date(order.date).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 tabular-nums">
                      {formatIDR(order.total)}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${typeBadgeClass}`}
                    >
                      {isDelivery ? 'Delivery' : order.address || 'Di Tempat'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    {order.customerName || 'Pelanggan'}
                  </p>
                  {isDelivery && (
                    <p className="text-[11px] font-medium text-violet-700 dark:text-violet-300">
                      Alamat: {order.address.replace(/^Delivery\s*-\s*/i, '')}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                    {(order.items || [])
                      .map((i) => `${i.qty}x ${i.name}`)
                      .join(', ')}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenReceiptModal(order, 'kasir')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Struk</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenReceiptModal(order, 'dapur')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <ChefHat size={13} />
                    <span>Dapur</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteOrder(order)}
                    className="p-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white cursor-pointer"
                    title="Hapus Nota"
                    aria-label={`Hapus ${order.id}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TAMPILAN TABLET / DESKTOP (md+): Tabel Riwayat Transaksi */}
      <div className="hidden md:flex flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card overflow-hidden flex-col">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-zinc-800/90 border-b border-slate-200 dark:border-zinc-800 z-10">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                <th className="py-3 px-4">No. Struk</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Pelanggan &amp; Pesanan</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-center">Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
                      <ReceiptText size={32} className="mb-2 opacity-50" />
                      <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">
                        Tidak ada transaksi ditemukan
                      </p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                        Sesuaikan rentang tanggal atau kata kunci pencarian.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const { isDelivery, methodBadgeClass, typeBadgeClass } =
                    getOrderMeta(order);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[var(--accent-text)] whitespace-nowrap tabular-nums">
                        {order.id}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300 whitespace-nowrap tabular-nums">
                        <div>
                          {new Date(order.date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                          {new Date(order.date).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[260px]">
                        <div className="font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {order.customerName || 'Pelanggan'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                          {(order.items || [])
                            .map((i) => `${i.qty}x ${i.name}`)
                            .join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[180px]">
                        <span
                          title={order.address || 'Di Tempat'}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${typeBadgeClass}`}
                        >
                          {isDelivery ? 'Delivery' : order.address || 'Di Tempat'}
                        </span>
                        {isDelivery && (
                          <div
                            title={order.address}
                            className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5"
                          >
                            {order.address.replace(/^Delivery\s*-\s*/i, '')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-zinc-100 whitespace-nowrap tabular-nums">
                        {formatIDR(order.total)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${methodBadgeClass}`}
                        >
                          {order.method}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenReceiptModal(order, 'kasir')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] font-bold transition-colors cursor-pointer"
                            title="Cetak Ulang Struk Kasir"
                          >
                            <Printer size={12} />
                            <span>Struk</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReceiptModal(order, 'dapur')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                            title="Cetak Ulang Tiket Dapur"
                          >
                            <ChefHat size={12} />
                            <span>Dapur</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteOrder(order)}
                            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white transition-colors cursor-pointer"
                            title="Hapus Nota"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
