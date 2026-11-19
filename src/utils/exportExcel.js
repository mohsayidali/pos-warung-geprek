export const exportOrdersToExcel = ({
  ordersToExport,
  settings,
  periodLabel,
  paymentFilter = 'ALL',
}) => {
  const paymentMethods =
    paymentFilter === 'ALL' ? ['Tunai', 'QRIS', 'Transfer'] : [paymentFilter];

  let tablesHtml = '';
  paymentMethods.forEach((method) => {
    const methodOrders = ordersToExport.filter((o) => o.method === method);
    if (methodOrders.length === 0) return;

    const methodTotal = methodOrders.reduce((sum, o) => sum + o.total, 0);

    tablesHtml += `
      <h3 style="color:#dc2626; margin-top:25px; font-family:sans-serif;">METODE PEMBAYARAN: ${method.toUpperCase()} (${methodOrders.length} Transaksi)</h3>
      <table border="1" style="border-collapse:collapse; width:100%; font-family:sans-serif; text-align:left; font-size:12px;">
        <thead>
          <tr style="background-color:#0f172a; color:#ffffff;">
            <th style="padding:10px;">ID Pesanan</th>
            <th style="padding:10px;">Tanggal & Waktu</th>
            <th style="padding:10px;">Pelanggan</th>
            <th style="padding:10px;">Tipe / Meja</th>
            <th style="padding:10px;">Detail Rincian Pesanan</th>
            <th style="padding:10px; text-align:right;">Diskon</th>
            <th style="padding:10px; text-align:right;">Total Tagihan</th>
          </tr>
        </thead>
        <tbody>
          ${methodOrders
            .map(
              (o) => `
            <tr>
              <td style="padding:8px; font-weight:bold; color:#dc2626;">${o.id}</td>
              <td style="padding:8px;">${new Date(o.date).toLocaleDateString('id-ID')} ${new Date(o.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
              <td style="padding:8px; font-weight:bold;">${o.customerName}</td>
              <td style="padding:8px;">${o.address}</td>
              <td style="padding:8px;">${(o.items || []).map((i) => `${i.qty}x ${i.name} ${i.note ? '[' + i.note + ']' : ''}`).join(', ')}</td>
              <td style="padding:8px; text-align:right; color:#ef4444;">${o.discountAmount ? 'Rp ' + o.discountAmount.toLocaleString('id-ID') : '-'}</td>
              <td style="padding:8px; text-align:right; font-weight:bold; color:#10b981;">Rp ${o.total.toLocaleString('id-ID')}</td>
            </tr>
          `
            )
            .join('')}
          <tr style="background-color:#f8fafc; font-weight:bold;">
            <td colspan="6" style="padding:10px; text-align:right;">TOTAL PEMBAYARAN ${method.toUpperCase()}:</td>
            <td style="padding:10px; text-align:right; color:#10b981; font-size:14px;">Rp ${methodTotal.toLocaleString('id-ID')}</td>
          </tr>
        </tbody>
      </table>
    `;
  });

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family:sans-serif; padding:20px;">
      <h2 style="color:#0f172a; margin-bottom:5px;">${settings.storeName || 'Warung Cobek Geprek'} - LAPORAN PENJUALAN</h2>
      <p style="margin-top:0; color:#64748b; font-size:12px;">
        <b>Telp Admin:</b> ${settings.phone || '-'} | <b>Periode:</b> ${periodLabel} | <b>Filter Metode Bayar:</b> ${paymentFilter} | <b>Dicetak:</b> ${new Date().toLocaleString('id-ID')}
      </p>
      <hr style="border:1px solid #e2e8f0; margin:15px 0;"/>
      <div style="margin-bottom:20px; font-size:14px;">
        <span style="background-color:#dcfce7; color:#15803d; padding:8px 12px; font-weight:bold; border-radius:6px; display:inline-block;">
          TOTAL OMSET: Rp ${ordersToExport.reduce((s, o) => s + o.total, 0).toLocaleString('id-ID')}
        </span>
        &nbsp;&nbsp;
        <span style="background-color:#f1f5f9; color:#334155; padding:8px 12px; font-weight:bold; border-radius:6px; display:inline-block;">
          TOTAL TRANSAKSI: ${ordersToExport.length} Nota
        </span>
      </div>
      ${tablesHtml || '<p style="color:#64748b;">Tidak ada transaksi pada periode ini.</p>'}
    </body>
    </html>
  `;

  const blob = new Blob([excelTemplate], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const safeStore = (settings.storeName || 'POS').replace(/\s+/g, '_');
  const safePeriod = periodLabel.replace(/[^a-zA-Z0-9_-]+/g, '_');
  link.download = `Laporan_${safeStore}_${safePeriod}.xlsx`;
  link.click();
};
