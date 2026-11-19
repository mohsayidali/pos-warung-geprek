import React, { useMemo } from 'react';
import {
  Download,
  Printer,
  TrendingUp,
  Receipt,
  ShoppingBag,
  Calculator,
  Award,
  Clock,
} from 'lucide-react';
import {
  formatIDR,
  formatDateInput,
  formatDisplayDateShort,
} from '../utils/formatters';
import { RevenueBarChart, PeakHourBarChart } from './Charts';

const PERIOD_OPTIONS = ['Hari Ini', '7 Hari Terakhir', 'Bulan Ini', 'Kustom'];

export default function LaporanTab({
  orders,
  reportFilter,
  setReportFilter,
  reportStartDate,
  setReportStartDate,
  reportEndDate,
  setReportEndDate,
  reportPaymentFilter,
  setReportPaymentFilter,
  onExportExcel,
  onOpenPdfPreview,
}) {
  const [todayAnchor] = React.useState(() => formatDateInput(new Date()));

  const { startStr, endStr, periodLabel } = useMemo(() => {
    const todayStr = todayAnchor;
    const now = new Date(`${todayStr}T00:00:00`);

    if (reportFilter === 'Hari Ini') {
      return {
        startStr: todayStr,
        endStr: todayStr,
        periodLabel: `${formatDisplayDateShort(todayStr)} — ${formatDisplayDateShort(todayStr)}`,
      };
    }

    if (reportFilter === '7 Hari Terakhir') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      const sStr = formatDateInput(start);
      return {
        startStr: sStr,
        endStr: todayStr,
        periodLabel: `${formatDisplayDateShort(sStr)} — ${formatDisplayDateShort(todayStr)}`,
      };
    }

    if (reportFilter === 'Bulan Ini') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const sStr = formatDateInput(first);
      return {
        startStr: sStr,
        endStr: todayStr,
        periodLabel: `${formatDisplayDateShort(sStr)} — ${formatDisplayDateShort(todayStr)}`,
      };
    }

    const s = reportStartDate || todayStr;
    const e = reportEndDate || todayStr;
    const orderedStart = s <= e ? s : e;
    const orderedEnd = s <= e ? e : s;
    return {
      startStr: orderedStart,
      endStr: orderedEnd,
      periodLabel: `${formatDisplayDateShort(orderedStart)} — ${formatDisplayDateShort(orderedEnd)}`,
    };
  }, [reportFilter, reportStartDate, reportEndDate, todayAnchor]);

  const activeOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderDateStr = formatDateInput(new Date(o.date));
      const inRange = orderDateStr >= startStr && orderDateStr <= endStr;
      const matchPay =
        reportPaymentFilter === 'ALL' || o.method === reportPaymentFilter;
      return inRange && matchPay;
    });
  }, [orders, startStr, endStr, reportPaymentFilter]);

  const totalRevenue = useMemo(
    () => activeOrders.reduce((sum, o) => sum + o.total, 0),
    [activeOrders]
  );

  const totalItemsSold = useMemo(
    () =>
      activeOrders.reduce(
        (sum, o) =>
          sum +
          (o.items || []).reduce(
            (itemSum, item) => itemSum + (Number(item.qty) || 0),
            0
          ),
        0
      ),
    [activeOrders]
  );

  const avgPerTransaction =
    activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;

  const revenueChartData = useMemo(() => {
    if (reportFilter === 'Hari Ini') {
      const buckets = {};
      for (let h = 6; h <= 23; h++) {
        buckets[h] = 0;
      }
      activeOrders.forEach((o) => {
        const hour = new Date(o.date).getHours();
        buckets[hour] = (buckets[hour] || 0) + o.total;
      });
      return Object.keys(buckets)
        .map(Number)
        .sort((a, b) => a - b)
        .map((h) => {
          const label = `${String(h).padStart(2, '0')}:00`;
          return { key: label, label, tooltipLabel: label, total: buckets[h] };
        });
    }

    const dateTotals = {};
    activeOrders.forEach((o) => {
      const ds = formatDateInput(new Date(o.date));
      dateTotals[ds] = (dateTotals[ds] || 0) + o.total;
    });

    const days = [];
    const cursor = new Date(`${startStr}T00:00:00`);
    const endObj = new Date(`${endStr}T00:00:00`);
    let guard = 0;
    while (cursor <= endObj && guard < 120) {
      const ds = formatDateInput(cursor);
      const dd = String(cursor.getDate()).padStart(2, '0');
      const mm = String(cursor.getMonth() + 1).padStart(2, '0');
      days.push({
        key: ds,
        label: `${dd}/${mm}`,
        tooltipLabel: formatDisplayDateShort(ds),
        total: dateTotals[ds] || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
      guard += 1;
    }

    return days;
  }, [activeOrders, reportFilter, startStr, endStr]);

  const { peakHourData, busiestSummary } = useMemo(() => {
    const counts = {};
    for (let h = 6; h <= 22; h++) {
      counts[h] = 0;
    }

    activeOrders.forEach((o) => {
      const h = new Date(o.date).getHours();
      if (h >= 6 && h <= 22) {
        counts[h] += 1;
      }
    });

    const data = [];
    let maxCount = 0;
    let peakHour = null;

    for (let h = 6; h <= 22; h++) {
      const label = `${String(h).padStart(2, '0')}:00`;
      const count = counts[h];
      if (count > maxCount) {
        maxCount = count;
        peakHour = label;
      }
      data.push({ hour: h, label, count });
    }

    const summary =
      maxCount > 0 && peakHour
        ? `Jam tersibuk: ${peakHour} — ${maxCount} pesanan`
        : 'Jam tersibuk: Belum ada pesanan pada periode ini';

    return { peakHourData: data, busiestSummary: summary };
  }, [activeOrders]);

  const topMenus = useMemo(() => {
    const stats = {};
    activeOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        if (!stats[item.name]) {
          stats[item.name] = { qty: 0, omset: 0 };
        }
        const q = Number(item.qty) || 0;
        const p = Number(item.price) || 0;
        stats[item.name].qty += q;
        stats[item.name].omset += p * q;
      });
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, qty: data.qty, omset: data.omset }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [activeOrders]);

  const paymentBreakdown = useMemo(() => {
    const methods = [
      { key: 'Tunai', label: 'Tunai', colorClass: 'bg-emerald-500' },
      { key: 'QRIS', label: 'QRIS', colorClass: 'bg-sky-500' },
      { key: 'Transfer', label: 'Transfer', colorClass: 'bg-orange-500' },
    ];

    const grandTotal = activeOrders.reduce((s, o) => s + o.total, 0);

    return methods.map((m) => {
      const mOrders = activeOrders.filter((o) => o.method === m.key);
      const amount = mOrders.reduce((s, o) => s + o.total, 0);
      const pct = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0;
      return {
        ...m,
        count: mOrders.length,
        amount,
        pct,
      };
    });
  }, [activeOrders]);

  return (
    <div className="h-full overflow-y-auto pr-0.5 custom-scrollbar space-y-4 pb-20 md:pb-6">
      {/* Header & Kontrol Periode + Export */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-3.5 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2">
            {PERIOD_OPTIONS.map((opt) => {
              const active = reportFilter === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setReportFilter(opt)}
                  className={`px-3 py-2 sm:py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[var(--accent)] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {reportFilter === 'Kustom' && (
            <div className="grid grid-cols-[1fr_auto_1fr] sm:inline-flex items-center gap-1.5 w-full sm:w-auto">
              <input
                type="date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                className="w-full min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none focus:border-[var(--accent)] tabular-nums"
              />
              <span className="text-xs text-slate-400 dark:text-zinc-500">s/d</span>
              <input
                type="date"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                className="w-full min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none focus:border-[var(--accent)] tabular-nums"
              />
            </div>
          )}

          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 tabular-nums">
            Periode:{' '}
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {periodLabel}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <select
            value={reportPaymentFilter}
            onChange={(e) => setReportPaymentFilter(e.target.value)}
            className="col-span-2 sm:col-span-1 px-3 py-2 theme-ctrl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-100 outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="ALL">Semua Metode</option>
            <option value="Tunai">Tunai</option>
            <option value="QRIS">QRIS</option>
            <option value="Transfer">Transfer</option>
          </select>

          <button
            type="button"
            onClick={() => onExportExcel(activeOrders, periodLabel)}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 theme-ctrl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download size={14} />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPdfPreview(activeOrders, periodLabel)}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 theme-ctrl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer size={14} />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu KPI Utama */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold">
              Total Pendapatan
            </span>
            <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tabular-nums">
            {formatIDR(totalRevenue)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold">
              Jumlah Transaksi
            </span>
            <Receipt size={15} className="text-[var(--accent-text)]" />
          </div>
          <p className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tabular-nums">
            {activeOrders.length}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold">
              Item Terjual
            </span>
            <ShoppingBag size={15} className="text-orange-500" />
          </div>
          <p className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tabular-nums">
            {totalItemsSold}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold">
              Rata-rata / Nota
            </span>
            <Calculator size={15} className="text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tabular-nums">
            {formatIDR(avgPerTransaction)}
          </p>
        </div>
      </div>

      {/* 2 Grafik Batang Sejajar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                Pendapatan
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400">
                {reportFilter === 'Hari Ini'
                  ? 'Agregasi omset per jam operasional (06:00 - 23:00)'
                  : `Agregasi omset per tanggal (${reportFilter})`}
              </p>
            </div>
          </div>
          <RevenueBarChart data={revenueChartData} />
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                Jam Sibuk
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400">
                Distribusi jumlah pesanan pada jam operasional (06:00 - 22:00)
              </p>
            </div>
            <Clock size={16} className="text-[var(--accent-text)] flex-shrink-0" />
          </div>
          <PeakHourBarChart data={peakHourData} />
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 tabular-nums">
            {busiestSummary}
          </div>
        </div>
      </div>

      {/* Baris Analitik Bawah: Menu Terlaris & Metode Pembayaran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Menu Terlaris */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Award size={16} className="text-[var(--accent-text)]" />
              <span>Menu Terlaris</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Top 5
            </span>
          </div>

          {topMenus.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-8">
              Belum ada data penjualan menu pada periode ini.
            </p>
          ) : (
            <div className="space-y-2.5">
              {topMenus.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-100 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                        idx === 0
                          ? 'bg-[var(--accent)] text-white'
                          : idx === 1
                          ? 'bg-slate-800 dark:bg-zinc-200 text-white dark:text-zinc-900'
                          : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 tabular-nums">
                        {formatIDR(item.omset)}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent-soft-border)] text-[11px] font-bold whitespace-nowrap tabular-nums">
                    {item.qty} terjual
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metode Pembayaran Horizontal Progress Bars */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 theme-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
              Metode Pembayaran
            </h3>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium tabular-nums">
              {activeOrders.length} transaksi
            </span>
          </div>

          <div className="space-y-4">
            {paymentBreakdown.map((m) => (
              <div key={m.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs tabular-nums">
                  <div className="font-bold text-slate-800 dark:text-zinc-200">
                    <span>{m.label}</span>{' '}
                    <span className="text-slate-400 dark:text-zinc-500 font-semibold">
                      ({m.count}x)
                    </span>
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-zinc-100">
                    {formatIDR(m.amount)}
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${m.colorClass}`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
