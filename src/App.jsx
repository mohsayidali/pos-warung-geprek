import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Moon, Sun, ShoppingCart, BarChart2, Settings, Plus, Minus, 
  Trash2, Printer, ChefHat, Image as ImageIcon, Download, 
  CreditCard, X, MapPin, ChevronUp, Edit3, CheckCircle2,
  Clock, TrendingUp, Calendar, Bluetooth, Smartphone, RefreshCw,
  AlertTriangle, ShieldAlert
} from 'lucide-react';

// --- NATIVE SVG AREA CHART ---
const SimpleAreaChart = ({ data, isDark }) => {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.total), 1000);
  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * (width - paddingX * 2);
    const y = height - paddingBottom - (d.total / maxVal) * (height - paddingTop - paddingBottom);
    return { x, y, name: d.name, total: d.total };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <line x1={paddingX} y1={paddingTop} x2={width - paddingX} y2={paddingTop} stroke={isDark ? '#3f3f46' : '#e2e8f0'} strokeDasharray="4 4" />
        <line x1={paddingX} y1={(height - paddingBottom + paddingTop) / 2} x2={width - paddingX} y2={(height - paddingBottom + paddingTop) / 2} stroke={isDark ? '#3f3f46' : '#e2e8f0'} strokeDasharray="4 4" />
        <line x1={paddingX} y1={height - paddingBottom} x2={width - paddingX} y2={height - paddingBottom} stroke={isDark ? '#3f3f46' : '#e2e8f0'} />

        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i} className="group">
            <circle cx={p.x} cy={p.y} r="5" fill="#f97316" stroke={isDark ? '#18181b' : '#ffffff'} strokeWidth="2" className="transition-all group-hover:r-7 cursor-pointer" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fill={isDark ? '#f4f4f5' : '#1e293b'} fontSize="10" fontWeight="bold">
              {p.total >= 1000000 ? `${(p.total / 1000000).toFixed(1)}M` : p.total >= 1000 ? `${(p.total / 1000).toFixed(0)}k` : p.total}
            </text>
            <text x={p.x} y={height - 10} textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize="10" fontWeight="600">
              {p.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// --- NATIVE SVG DONUT CHART ---
const SimpleDonutChart = ({ data, colors, isDark }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let accumulatedPercent = 0;

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
        {data.map((slice, i) => {
          const slicePercent = slice.value / total;
          const startPercent = accumulatedPercent;
          accumulatedPercent += slicePercent;

          const [startX, startY] = getCoordinatesForPercent(startPercent);
          const [endX, endY] = getCoordinatesForPercent(accumulatedPercent);
          const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

          const pathData = slicePercent >= 0.999
            ? `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0`
            : `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0 Z`;

          return (
            <path key={i} d={pathData} fill={colors[i % colors.length]} className="transition-opacity hover:opacity-80 cursor-pointer" />
          );
        })}
        <circle cx="0" cy="0" r="0.6" fill={isDark ? '#18181b' : '#ffffff'} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs font-bold opacity-60">Total</span>
        <span className="text-sm font-black text-orange-500">{total} trx</span>
      </div>
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('pos');
  const [isReady, setIsReady] = useState(false);

  // --- STATE: PWA INSTALL PROMPT ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    setIsReady(true);
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // --- STATE: BLUETOOTH THERMAL PRINTER ---
  const [btDevice, setBtDevice] = useState(null);
  const [btPrintChar, setBtPrintChar] = useState(null);
  const [btStatus, setBtStatus] = useState('Terputus');

  const connectBluetoothPrinter = async () => {
    if (!navigator.bluetooth) {
      alert('Browser Anda belum mendukung Web Bluetooth. Gunakan Google Chrome di Android / Laptop.');
      return;
    }
    try {
      setBtStatus('Menghubungkan...');
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          '49535343-fe7d-4158-6b44-508a0d9cd86e',
          '00001101-0000-1000-8000-00805f9b34fb'
        ]
      });
      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();
      let foundChar = null;

      for (const service of services) {
        try {
          const chars = await service.getCharacteristics();
          for (const c of chars) {
            if (c.properties.write || c.properties.writeWithoutResponse) {
              foundChar = c;
              break;
            }
          }
        } catch (e) {}
        if (foundChar) break;
      }

      if (foundChar) {
        setBtDevice(device);
        setBtPrintChar(foundChar);
        setBtStatus('Terhubung');
      } else {
        setBtStatus('Printer Ditemukan');
      }
    } catch (err) {
      console.error(err);
      setBtStatus('Terputus');
    }
  };

  const printViaBluetooth = async (orderReceipt) => {
    if (!btPrintChar) {
      await connectBluetoothPrinter();
    }
    if (!btPrintChar) {
      window.print();
      return;
    }
    try {
      const encoder = new TextEncoder();
      const init = '\x1B\x40';
      const center = '\x1B\x61\x01';
      const left = '\x1B\x61\x00';
      const boldOn = '\x1B\x45\x01';
      const boldOff = '\x1B\x45\x00';
      const fontDouble = '\x1D\x21\x11';
      const fontNormal = '\x1D\x21\x00';
      const feed = '\x0A\x0A\x0A';

      let text = init + center + boldOn + fontDouble + (settings.storeName || 'NAMA WARUNG').toUpperCase() + '\n' + fontNormal + boldOff;
      if (settings.phone) text += 'Telp: ' + settings.phone + '\n';
      text += 'ID: ' + orderReceipt.id + '\n';
      text += new Date(orderReceipt.date).toLocaleString('id-ID') + '\n';
      text += '--------------------------------\n' + left;
      text += 'Pelanggan: ' + orderReceipt.customerName + '\n';
      text += 'Meja/Alamat: ' + orderReceipt.address + '\n';
      text += '--------------------------------\n';
      text += boldOn + 'QTY ITEM              TOTAL\n' + boldOff;
      
      orderReceipt.items.forEach(item => {
        const name = item.name.substring(0, 14).padEnd(14, ' ');
        const qtyStr = String(item.qty).padStart(3, ' ');
        const totalStr = formatIDR(item.price * item.qty).replace('Rp', '').trim().padStart(11, ' ');
        text += `${qtyStr}x ${name} ${totalStr}\n`;
        if (item.note) text += `    * ${item.note}\n`;
      });

      text += '--------------------------------\n';
      text += `Subtotal    : ${formatIDR(orderReceipt.subTotal)}\n`;
      if (orderReceipt.extraCharge > 0) text += `Biaya Extra : ${formatIDR(orderReceipt.extraCharge)}\n`;
      text += boldOn + `TOTAL       : ${formatIDR(orderReceipt.total)}\n` + boldOff;
      text += `Bayar (${orderReceipt.method}): ${formatIDR(orderReceipt.cashGiven || orderReceipt.total)}\n`;
      if (orderReceipt.method === 'Tunai') text += `Kembali     : ${formatIDR(orderReceipt.kembalian || 0)}\n`;
      text += '--------------------------------\n' + center;
      text += '*** TERIMA KASIH ***\n\n' + feed;

      const data = encoder.encode(text);
      const chunkSize = 100;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        if (btPrintChar.properties.writeWithoutResponse) {
          await btPrintChar.writeValueWithoutResponse(chunk);
        } else {
          await btPrintChar.writeValue(chunk);
        }
      }
    } catch (e) {
      alert('Cetak Bluetooth Gagal, Mengalihkan ke Cetak Standar: ' + e.message);
      window.print();
    }
  };

  // --- STATE: PENGATURAN LOCALSTORAGE ---
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('cgb_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      storeName: 'Warung Cobek Geprek',
      phone: '0812-3456-7890',
      profilePic: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150&q=80',
      qrisPic: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
      bankName: 'BCA',
      bankAccount: '1234567890 a/n Bapak Geprek'
    };
  });

  useEffect(() => {
    localStorage.setItem('cgb_settings', JSON.stringify(settings));
  }, [settings]);

  // --- STATE: MENU MANAGEMENT LOCALSTORAGE ---
  const [menus, setMenus] = useState(() => {
    const saved = localStorage.getItem('cgb_menus');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, name: 'Ayam Geprek Cobek Batu', price: 15000, category: 'Makanan', image: '🍗', isAvailable: true },
      { id: 2, name: 'Ayam Geprek Bakar', price: 18000, category: 'Makanan', image: '🔥', isAvailable: true },
      { id: 3, name: 'Indomie Geprek', price: 12000, category: 'Makanan', image: '🍜', isAvailable: true },
      { id: 4, name: 'Es Teh Manis', price: 4000, category: 'Minuman', image: '🍹', isAvailable: true },
      { id: 5, name: 'Kol Goreng', price: 5000, category: 'Tambahan', image: '🥬', isAvailable: true },
      { id: 6, name: 'Tahu / Tempe', price: 2000, category: 'Tambahan', image: '🧆', isAvailable: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem('cgb_menus', JSON.stringify(menus));
  }, [menus]);

  // --- STATE: MENU MANAGEMENT MODAL ---
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuForm, setMenuForm] = useState({ name: '', price: '', category: 'Makanan', image: '🍽️', isAvailable: true });
  const menuImageRef = useRef(null);

  // --- STATE: KASIR & KERANJANG ---
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [extraCharge, setExtraCharge] = useState(0);
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [cashGiven, setCashGiven] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [currentOrderReceipt, setCurrentOrderReceipt] = useState(null);

  // --- STATE: DAPUR & LAPORAN LOCALSTORAGE ---
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('cgb_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'ORD-1001', date: new Date(2026, 10, 4, 12, 42).toISOString(), customerName: 'Zahwa', address: 'Dine-in', items: [{name: 'Ayam Geprek Cobek Batu', qty: 2, price: 15000}], subTotal: 30000, extraCharge: 0, total: 30000, method: 'Tunai', status: 'Selesai' },
      { id: 'ORD-1002', date: new Date(2026, 10, 4, 14, 42).toISOString(), customerName: 'Santri Putra', address: 'Kamar B', items: [{name: 'Indomie Geprek', qty: 3, price: 12000, note: 'Pedas mampus'}], subTotal: 36000, extraCharge: 2000, total: 38000, method: 'QRIS', status: 'Dimasak' },
      { id: 'ORD-1003', date: new Date(2026, 10, 4, 16, 12).toISOString(), customerName: 'Budi', address: 'Takeaway', items: [{name: 'Ayam Geprek Bakar', qty: 1, price: 18000}, {name: 'Es Teh Manis', qty: 1, price: 4000}], subTotal: 22000, extraCharge: 0, total: 22000, method: 'Transfer', status: 'Masuk' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cgb_orders', JSON.stringify(orders));
  }, [orders]);

  // --- CUSTOM RESET & DELETE MODAL STATE ---
  const [resetModalConfig, setResetModalConfig] = useState({ isOpen: false, type: '', payload: null });

  const executeClearTransactions = () => {
    setOrders([]);
    setCart([]);
    localStorage.setItem('cgb_orders', JSON.stringify([]));
    setResetModalConfig({ isOpen: false, type: '', payload: null });
  };

  const executeFactoryReset = () => {
    const emptySettings = {
      storeName: '',
      phone: '',
      profilePic: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150&q=80',
      qrisPic: '',
      bankName: '',
      bankAccount: ''
    };
    setOrders([]);
    setMenus([]);
    setCart([]);
    setSettings(emptySettings);

    localStorage.setItem('cgb_orders', JSON.stringify([]));
    localStorage.setItem('cgb_menus', JSON.stringify([]));
    localStorage.setItem('cgb_settings', JSON.stringify(emptySettings));
    setResetModalConfig({ isOpen: false, type: '', payload: null });
  };

  const executeDeleteSingleOrder = (orderId) => {
    const updated = orders.filter(o => o.id !== orderId);
    setOrders(updated);
    localStorage.setItem('cgb_orders', JSON.stringify(updated));
    setResetModalConfig({ isOpen: false, type: '', payload: null });
  };

  const [reportFilter, setReportFilter] = useState('Harian');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('ALL');
  
  const [selectedYearFilter, setSelectedYearFilter] = useState('ALL');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('ALL');

  const profilePicRef = useRef(null);
  const qrisPicRef = useRef(null);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const availableYears = useMemo(() => {
    const setY = new Set();
    orders.forEach(o => {
      const d = new Date(o.date);
      setY.add(d.getFullYear().toString());
    });
    return Array.from(setY).sort().reverse();
  }, [orders]);

  const activeOrdersForReport = useMemo(() => {
    return orders.filter(o => {
      const d = new Date(o.date);
      const yr = d.getFullYear().toString();
      const mo = (d.getMonth() + 1).toString().padStart(2, '0');
      const matchYear = selectedYearFilter === 'ALL' || yr === selectedYearFilter;
      const matchMonth = selectedMonthFilter === 'ALL' || mo === selectedMonthFilter;
      const matchPayment = selectedPaymentFilter === 'ALL' || o.method === selectedPaymentFilter;
      return matchYear && matchMonth && matchPayment;
    });
  }, [orders, selectedYearFilter, selectedMonthFilter, selectedPaymentFilter]);

  // KERANJANG LOGIC
  const addToCart = (menu) => {
    if (!menu.isAvailable) return;
    const existingIndex = cart.findIndex(item => item.id === menu.id && item.note === '');
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].qty += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...menu, qty: 1, note: '', cartId: Date.now() + Math.random() }]);
    }
  };

  const updateQty = (cartId, delta) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const currentQty = Number(item.qty) || 1;
        const newQty = currentQty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const updateQtyDirect = (cartId, value) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        return { ...item, qty: value };
      }
      return item;
    }));
  };

  const updateItemNote = (cartId, note) => {
    setCart(cart.map(item => item.cartId === cartId ? { ...item, note } : item));
  };

  const removeFromCart = (cartId) => setCart(cart.filter(item => item.cartId !== cartId));
  
  const subTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * (Number(item.qty) || 0)), 0), [cart]);
  const totalTagihan = subTotal + Number(extraCharge || 0);
  const kembalian = cashGiven - totalTagihan;
  const isCashSufficient = paymentMethod !== 'Tunai' || cashGiven >= totalTagihan;

  const handleCheckout = () => {
    if (isCashSufficient && customerName.trim() !== '') {
      const nextNum = orders.reduce((max, o) => {
        const num = parseInt(o.id.replace(/[^0-9]/g, ''), 10);
        return !isNaN(num) && num > max ? num : max;
      }, 1000) + 1;

      const newOrder = {
        id: `ORD-${nextNum}`,
        date: new Date().toISOString(),
        customerName: customerName,
        address: deliveryNote || 'Dine-in / Takeaway',
        items: [...cart],
        subTotal,
        extraCharge: Number(extraCharge || 0),
        total: totalTagihan,
        method: paymentMethod,
        cashGiven: paymentMethod === 'Tunai' ? cashGiven : totalTagihan,
        kembalian: paymentMethod === 'Tunai' ? kembalian : 0,
        status: 'Masuk' 
      };
      
      setOrders([newOrder, ...orders]);
      setCurrentOrderReceipt(newOrder);
      setShowCheckout(false);
      setShowReceipt(true);
    }
  };

  const resetTransaction = () => {
    setCart([]);
    setCustomerName('');
    setDeliveryNote('');
    setExtraCharge(0);
    setCashGiven(0);
    setShowReceipt(false);
    setIsMobileCartOpen(false);
    setCurrentOrderReceipt(null);
  };

  // MENU MANAGEMENT LOGIC
  const handleOpenMenuModal = (menu = null) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuForm({ ...menu });
    } else {
      setEditingMenu(null);
      setMenuForm({ name: '', price: '', category: 'Makanan', image: '🍽️', isAvailable: true });
    }
    setShowMenuModal(true);
  };

  const handleSaveMenu = () => {
    if (!menuForm.name || !menuForm.price) return;
    
    if (editingMenu) {
      setMenus(menus.map(m => m.id === editingMenu.id ? { ...menuForm, id: m.id, price: Number(menuForm.price) } : m));
    } else {
      setMenus([...menus, { ...menuForm, id: Date.now(), price: Number(menuForm.price) }]);
    }
    setShowMenuModal(false);
  };

  const handleDeleteMenu = (id) => {
    setMenus(menus.filter(m => m.id !== id));
  };

  const toggleMenuAvailability = (id) => {
    setMenus(menus.map(m => m.id === id ? { ...m, isAvailable: !m.isAvailable } : m));
  };

  const handleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        callback(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // DAPUR LOGIC
  const updateOrderStatus = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  // LAPORAN & EXPORT LOGIC
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPaymentFilter, setExportPaymentFilter] = useState('ALL');
  const [showPdfReportModal, setShowPdfReportModal] = useState(false);

  const filteredOrdersForExport = useMemo(() => {
    return activeOrdersForReport.filter(o => {
      return exportPaymentFilter === 'ALL' || o.method === exportPaymentFilter;
    });
  }, [activeOrdersForReport, exportPaymentFilter]);

  const handleExportExcel = () => {
    const yearText = selectedYearFilter === 'ALL' ? 'Semua Tahun' : selectedYearFilter;
    const monthText = selectedMonthFilter === 'ALL' ? 'Semua Bulan' : selectedMonthFilter;
    const paymentMethods = exportPaymentFilter === 'ALL' ? ['Tunai', 'QRIS', 'Transfer'] : [exportPaymentFilter];

    let tablesHtml = '';
    paymentMethods.forEach(method => {
      const methodOrders = filteredOrdersForExport.filter(o => o.method === method);
      if (methodOrders.length === 0) return;

      const methodTotal = methodOrders.reduce((sum, o) => sum + o.total, 0);

      tablesHtml += `
        <h3 style="color:#f97316; margin-top:25px; font-family:sans-serif;">METODE PEMBAYARAN: ${method.toUpperCase()} (${methodOrders.length} Transaksi)</h3>
        <table border="1" style="border-collapse:collapse; width:100%; font-family:sans-serif; text-align:left; font-size:12px;">
          <thead>
            <tr style="background-color:#1e293b; color:#ffffff;">
              <th style="padding:10px;">ID Pesanan</th>
              <th style="padding:10px;">Tanggal & Waktu</th>
              <th style="padding:10px;">Pelanggan</th>
              <th style="padding:10px;">Alamat / Meja</th>
              <th style="padding:10px;">Detail Rincian Pesanan</th>
              <th style="padding:10px; text-align:right;">Total Tagihan</th>
            </tr>
          </thead>
          <tbody>
            ${methodOrders.map(o => `
              <tr>
                <td style="padding:8px; font-weight:bold; color:#f97316;">${o.id}</td>
                <td style="padding:8px;">${new Date(o.date).toLocaleDateString('id-ID')} ${new Date(o.date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</td>
                <td style="padding:8px; font-weight:bold;">${o.customerName}</td>
                <td style="padding:8px;">${o.address}</td>
                <td style="padding:8px;">${o.items.map(i => `${i.qty}x ${i.name} ${i.note ? '['+i.note+']' : ''}`).join(', ')}</td>
                <td style="padding:8px; text-align:right; font-weight:bold; color:#10b981;">Rp ${o.total.toLocaleString('id-ID')}</td>
              </tr>
            `).join('')}
            <tr style="background-color:#f8fafc; font-weight:bold;">
              <td colspan="5" style="padding:10px; text-align:right;">TOTAL PEMBAYARAN ${method.toUpperCase()}:</td>
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
        <h2 style="color:#1e293b; margin-bottom:5px;">${settings.storeName || 'Aplikasi POS'} - LAPORAN PENJUALAN</h2>
        <p style="margin-top:0; color:#64748b; font-size:12px;">
          <b>Telp Admin:</b> ${settings.phone || '-'} | <b>Periode:</b> ${monthText} ${yearText} | <b>Filter Metode Bayar:</b> ${exportPaymentFilter} | <b>Dicetak:</b> ${new Date().toLocaleString('id-ID')}
        </p>
        <hr style="border:1px solid #e2e8f0; margin:15px 0;"/>
        <div style="margin-bottom:20px; font-size:14px;">
          <span style="background-color:#dcfce7; color:#15803d; padding:8px 12px; font-weight:bold; border-radius:6px; display:inline-block;">
            TOTAL OMSET: Rp ${filteredOrdersForExport.reduce((s,o)=>s+o.total,0).toLocaleString('id-ID')}
          </span>
          &nbsp;&nbsp;
          <span style="background-color:#f1f5f9; color:#334155; padding:8px 12px; font-weight:bold; border-radius:6px; display:inline-block;">
            TOTAL TRANSAKSI: ${filteredOrdersForExport.length} Nota
          </span>
        </div>
        ${tablesHtml}
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_${(settings.storeName || 'POS').replace(/\s+/g, '_')}_${selectedYearFilter}_${selectedMonthFilter}.xlsx`;
    link.click();
    setShowExportModal(false);
  };

  const chartData = useMemo(() => {
    const aggregated = {};
    const sortedOrders = [...activeOrdersForReport].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedOrders.forEach(o => {
      const d = new Date(o.date);
      let key = '';

      if (reportFilter === 'Harian') {
        key = `${d.getHours().toString().padStart(2, '0')}:00`;
      } else if (reportFilter === 'Mingguan') {
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        key = days[d.getDay()];
      } else if (reportFilter === 'Bulanan') {
        key = `Mg ${Math.ceil(d.getDate() / 7)}`;
      }

      if (key) {
        aggregated[key] = (aggregated[key] || 0) + o.total;
      }
    });

    if (Object.keys(aggregated).length === 0) {
      if (reportFilter === 'Harian') return [{ name: '09:00', total: 0 }, { name: '12:00', total: 0 }, { name: '18:00', total: 0 }];
      if (reportFilter === 'Mingguan') return [{ name: 'Sen', total: 0 }, { name: 'Rab', total: 0 }, { name: 'Jum', total: 0 }];
      if (reportFilter === 'Bulanan') return [{ name: 'Mg 1', total: 0 }, { name: 'Mg 2', total: 0 }, { name: 'Mg 3', total: 0 }];
    }

    let result = Object.keys(aggregated).map(k => ({ name: k, total: aggregated[k] }));

    if (reportFilter === 'Harian') {
      result.sort((a, b) => parseInt(a.name) - parseInt(b.name));
    } else if (reportFilter === 'Mingguan') {
      const dayOrder = { 'Sen': 1, 'Sel': 2, 'Rab': 3, 'Kam': 4, 'Jum': 5, 'Sab': 6, 'Min': 7 };
      result.sort((a, b) => (dayOrder[a.name] || 0) - (dayOrder[b.name] || 0));
    } else if (reportFilter === 'Bulanan') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [activeOrdersForReport, reportFilter]);

  const totalOmset = useMemo(() => {
    return activeOrdersForReport.reduce((sum, o) => sum + o.total, 0);
  }, [activeOrdersForReport]);
  
  const pieData = useMemo(() => {
    return [
      { name: 'Tunai', value: activeOrdersForReport.filter(o=>o.method === 'Tunai').length || 0 },
      { name: 'QRIS', value: activeOrdersForReport.filter(o=>o.method === 'QRIS').length || 0 },
      { name: 'Transfer', value: activeOrdersForReport.filter(o=>o.method === 'Transfer').length || 0 }
    ].filter(d => d.value > 0);
  }, [activeOrdersForReport]);
  
  const COLORS = ['#10b981', '#0ea5e9', '#f97316'];

  const topMenus = useMemo(() => {
    const counts = {};
    activeOrdersForReport.forEach(o => {
      o.items.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + item.qty;
      });
    });
    return Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 3);
  }, [activeOrdersForReport]);

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const isDark = theme === 'dark';
  const t = {
    bg: isDark ? 'bg-zinc-950' : 'bg-slate-50',
    text: isDark ? 'text-zinc-100' : 'text-slate-800',
    textMuted: isDark ? 'text-zinc-400' : 'text-slate-500',
    glassCard: isDark 
      ? 'bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 shadow-xl shadow-black/20' 
      : 'bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-200/50',
    glassPanel: isDark
      ? 'bg-zinc-950/80 backdrop-blur-2xl border-zinc-800'
      : 'bg-white/90 backdrop-blur-2xl border-slate-200',
    input: isDark 
      ? 'bg-zinc-950/50 border-zinc-700 text-white focus:border-orange-500 focus:bg-zinc-900' 
      : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-orange-500 focus:bg-white',
    btnPrimary: 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300',
    btnSuccess: 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300',
    badgeGreen: isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    badgeOrange: isDark ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-orange-100 text-orange-700 border border-orange-200',
    badgeRed: isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-100 text-red-700 border border-red-200',
  };

  return (
    <div className={`min-h-screen w-full font-sans transition-colors duration-300 ease-in-out ${t.bg} ${t.text} pb-28 md:pb-0 overflow-x-hidden ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* HEADER */}
      <header className={`flex justify-between items-center px-6 py-4 border-b sticky top-0 z-30 transition-colors duration-300 ${t.glassCard} rounded-none border-t-0 border-x-0`}>
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => profilePicRef.current.click()}>
            <img src={settings.profilePic} alt="Logo" className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Edit3 size={16} className="text-white"/>
            </div>
            <input type="file" ref={profilePicRef} onChange={e => handleImageUpload(e, url => setSettings({...settings, profilePic: url}))} accept="image/*" className="hidden" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black uppercase tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500 drop-shadow-sm whitespace-nowrap">
              {settings.storeName || 'NAMA WARUNG'}
            </h1>
            <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${t.textMuted}`}>
              <CheckCircle2 size={10} className="text-emerald-500"/> {settings.phone || 'Sistem Kasir Aktif'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 items-center">

          {deferredPrompt && (
            <button 
              onClick={handleInstallPWA}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-orange-500/30 active:scale-95 transition-all"
            >
              <Smartphone size={14}/> Install App PWA
            </button>
          )}

          <button 
            onClick={connectBluetoothPrinter} 
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              btStatus === 'Terhubung' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30 hover:bg-orange-500 hover:text-white'
            }`}
            title="Sambungkan Thermal Bluetooth Printer"
          >
            <Bluetooth size={14}/> {btStatus === 'Terhubung' ? 'Printer BT Ready' : 'Hubungkan BT Printer'}
          </button>
          
          <nav className={`hidden md:flex p-1.5 rounded-2xl border transition-colors duration-300 ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-slate-100/50 border-slate-200'}`}>
            {[
              { id: 'pos', icon: ShoppingCart, label: 'Kasir' },
              { id: 'dapur', icon: ChefHat, label: 'Dapur' },
              { id: 'laporan', icon: BarChart2, label: 'Laporan' },
              { id: 'pengaturan', icon: Settings, label: 'Setelan' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 ${
                  activeTab === tab.id ? 'bg-white dark:bg-zinc-800 text-orange-500 shadow-sm' : `text-zinc-500 hover:text-orange-500 hover:bg-zinc-500/5`
                }`}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </nav>
          <button 
            onClick={toggleTheme} 
            className={`p-3 rounded-2xl border transition-all duration-300 hover:border-orange-500 active:scale-90 ${t.glassCard}`}
          >
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-[1500px] mx-auto p-4 md:p-6 animate-in fade-in duration-300" key={activeTab}>
        
        {/* TAB: POS KASIR */}
        {activeTab === 'pos' && (
          <div className="flex flex-col lg:flex-row gap-6 relative">
            <div className="flex-1">
              {menus.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border flex flex-col items-center justify-center ${t.glassCard}`}>
                  <ShoppingCart size={48} className="text-orange-500 opacity-40 mb-3" />
                  <h3 className="font-black text-lg">Katalog Menu Masih Kosong</h3>
                  <p className="text-xs opacity-70 mt-1 max-w-sm">Aplikasi dalam kondisi Reset Pabrik. Silakan masuk ke tab <b>Setelan</b> untuk menambahkan daftar makanan & minuman.</p>
                  <button onClick={() => setActiveTab('pengaturan')} className={`mt-5 px-6 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider ${t.btnPrimary}`}>
                    + Tambah Menu Baru
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {menus.map((menu) => (
                    <div 
                      key={menu.id} 
                      onClick={() => menu.isAvailable && addToCart(menu)}
                      className={`rounded-3xl border p-5 flex flex-col items-center text-center transition-all duration-300 ${t.glassCard} 
                        ${menu.isAvailable 
                          ? 'cursor-pointer hover:border-orange-500 hover:shadow-orange-500/20 hover:-translate-y-1 active:scale-95 active:translate-y-0' 
                          : 'opacity-50 grayscale cursor-not-allowed'}`}
                    >
                      <div className="text-5xl mb-4 h-16 flex items-center justify-center drop-shadow-md">
                        {typeof menu.image === 'string' && (menu.image.startsWith('http') || menu.image.startsWith('blob:') || menu.image.startsWith('data:')) 
                          ? <img src={menu.image} className="h-16 w-16 object-cover rounded-2xl shadow-sm" alt={menu.name} /> 
                          : menu.image}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider mb-2 px-2 py-0.5 rounded-full ${t.badgeOrange}`}>
                        {menu.category}
                      </span>
                      <h3 className="font-bold text-sm mb-1.5 leading-tight">{menu.name}</h3>
                      <p className="text-orange-500 font-black text-base">{formatIDR(menu.price)}</p>
                      {!menu.isAvailable && <span className={`text-[10px] px-3 py-1 rounded-full mt-3 font-bold uppercase ${t.badgeRed}`}>Habis</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:flex w-[420px] flex-col sticky top-[100px] h-[calc(100vh-130px)]">
              <div className={`flex-1 rounded-3xl border p-5 flex flex-col transition-colors duration-300 ${t.glassCard}`}>
                <h2 className="text-xl font-black border-b pb-4 mb-4 flex items-center gap-3 border-zinc-500/20">
                  <div className="p-2 bg-orange-500/10 rounded-xl"><ShoppingCart className="text-orange-500" size={24}/></div>
                  Keranjang Pesanan
                </h2>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className={`text-center h-full flex flex-col items-center justify-center ${t.textMuted}`}>
                      <ShoppingCart size={64} className="mb-4 opacity-10" />
                      <p className="font-bold text-sm">Keranjang masih kosong</p>
                      <p className="text-xs mt-1 opacity-70">Pilih menu di sebelah kiri</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.cartId} className={`p-4 rounded-2xl border transition-colors ${isDark ? 'bg-zinc-950/50 border-zinc-800/50' : 'bg-slate-50/50 border-slate-200/50'} hover:border-orange-500/30`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 pr-3">
                            <h4 className="text-sm font-bold leading-tight mb-1">{item.name}</h4>
                            <p className="text-sm font-black text-orange-500">{formatIDR(item.price * (Number(item.qty) || 0))}</p>
                          </div>
                          
                          <div className={`flex items-center gap-1 rounded-xl p-1 border shadow-sm ${t.glassCard}`}>
                            <button onClick={() => updateQty(item.cartId, -1)} className="p-1.5 rounded-lg hover:bg-zinc-500/10 hover:text-orange-500 transition-colors active:scale-90"><Minus size={14}/></button>
                            
                            <input 
                              type="number" 
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateQtyDirect(item.cartId, e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1))}
                              onBlur={() => { if (!item.qty || Number(item.qty) < 1) updateQtyDirect(item.cartId, 1); }}
                              className="w-16 text-center text-sm font-black bg-transparent outline-none text-orange-500 focus:bg-orange-500/10 rounded py-0.5 px-1 border border-transparent focus:border-orange-500/40"
                            />

                            <button onClick={() => updateQty(item.cartId, 1)} className="p-1.5 rounded-lg hover:bg-zinc-500/10 hover:text-orange-500 transition-colors active:scale-90"><Plus size={14}/></button>
                            <button onClick={() => removeFromCart(item.cartId)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 ml-0.5 transition-colors active:scale-90"><Trash2 size={14}/></button>
                          </div>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Catatan (Misal: Pedas level 10)" 
                          value={item.note}
                          onChange={(e) => updateItemNote(item.cartId, e.target.value)}
                          className={`w-full text-xs p-2.5 rounded-xl border outline-none transition-all ${t.input}`}
                        />
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-zinc-500/20 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black mb-1.5 block uppercase tracking-wider text-orange-500">Nama Pemesan *</label>
                      <input type="text" placeholder="Wajib diisi" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full p-3 text-sm rounded-xl border outline-none transition-all ${t.input}`} />
                    </div>

                    {/* REVISI ALAMAT / MEJA: PILIHAN OPSI CEPAT + INPUT MANUAL */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider opacity-70">Alamat / Meja</label>
                        <div className="flex gap-1.5">
                          {['Dine-in', 'Takeaway'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setDeliveryNote(opt)}
                              className={`text-[9px] font-black px-2 py-0.5 rounded-md border transition-all active:scale-95 ${
                                deliveryNote === opt 
                                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                                  : isDark ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-orange-500/50' : 'bg-slate-200 text-slate-700 border-slate-300 hover:border-orange-500/50'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Dine-in / Takeaway / Ketik manual (Pondok, Kamar B, dll)" 
                        value={deliveryNote} 
                        onChange={e => setDeliveryNote(e.target.value)} 
                        className={`w-full p-3 text-sm rounded-xl border outline-none transition-all ${t.input}`} 
                      />
                    </div>
                  </div>
                  
                  <div className={`flex justify-between items-center p-4 rounded-2xl border mb-2 shadow-inner ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
                    <span className="font-bold text-sm uppercase tracking-wider opacity-80">Total Tagihan</span>
                    <span className="text-2xl font-black text-orange-500 drop-shadow-sm">{formatIDR(totalTagihan)}</span>
                  </div>
                  
                  <button 
                    disabled={cart.length === 0 || !customerName.trim()}
                    onClick={() => setShowCheckout(true)}
                    className={`w-full py-4 rounded-2xl text-lg flex justify-center items-center gap-2 ${t.btnPrimary} disabled:opacity-50 disabled:grayscale`}
                  >
                    Lanjut Pembayaran
                  </button>
                </div>
              </div>
            </div>

            {/* FLOATING CART BUTTON (MOBILE) */}
            {!isMobileCartOpen && cart.length > 0 && (
              <div className="lg:hidden fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-10">
                <button 
                  onClick={() => setIsMobileCartOpen(true)}
                  className={`w-full p-4 rounded-3xl flex justify-between items-center ${t.btnPrimary}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl relative backdrop-blur-sm">
                      <ShoppingCart size={24} />
                      <span className="absolute -top-2 -right-2 bg-zinc-900 text-orange-500 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-orange-500">
                        {cart.reduce((a,b)=>a + (Number(b.qty) || 0), 0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] block opacity-80 uppercase tracking-widest font-bold">Total Belanja</span>
                      <span className="text-xl font-black">{formatIDR(totalTagihan)}</span>
                    </div>
                  </div>
                  <ChevronUp size={28} className="animate-bounce" />
                </button>
              </div>
            )}

            {/* MOBILE CART DRAWER */}
            {isMobileCartOpen && (
              <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-300">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileCartOpen(false)}></div>
                <div className={`rounded-t-[2rem] relative max-h-[90vh] flex flex-col shadow-2xl transition-transform slide-in-from-bottom-full duration-300 border-t ${t.glassPanel}`}>
                  <div className="flex justify-between items-center p-5 border-b border-zinc-500/20">
                    <h2 className="text-xl font-black flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-xl"><ShoppingCart className="text-orange-500" size={20}/></div>
                      Keranjang
                    </h2>
                    <button onClick={() => setIsMobileCartOpen(false)} className={`p-2.5 rounded-full border transition-colors hover:bg-zinc-500/20 active:scale-90 ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-slate-100 border-slate-300'}`}><X size={20} /></button>
                  </div>
                  
                  <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                    {cart.map(item => (
                      <div key={item.cartId} className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 pr-2">
                            <h4 className="text-sm font-bold leading-tight mb-1">{item.name}</h4>
                            <p className="text-sm font-black text-orange-500">{formatIDR(item.price * (Number(item.qty) || 0))}</p>
                          </div>
                          <div className={`flex items-center gap-1 rounded-xl p-1 border shadow-sm ${t.glassCard}`}>
                            <button onClick={() => updateQty(item.cartId, -1)} className="p-1.5 active:scale-90"><Minus size={14}/></button>
                            <input 
                              type="number" 
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateQtyDirect(item.cartId, e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1))}
                              onBlur={() => { if (!item.qty || Number(item.qty) < 1) updateQtyDirect(item.cartId, 1); }}
                              className="w-14 text-center text-sm font-black bg-transparent outline-none text-orange-500 focus:bg-orange-500/10 rounded py-0.5"
                            />
                            <button onClick={() => updateQty(item.cartId, 1)} className="p-1.5 active:scale-90"><Plus size={14}/></button>
                          </div>
                        </div>
                        <input type="text" placeholder="Catatan opsional..." value={item.note} onChange={(e) => updateItemNote(item.cartId, e.target.value)} className={`w-full text-xs p-3 rounded-xl border outline-none ${t.input}`} />
                      </div>
                    ))}
                  </div>
                  
                  <div className={`p-5 border-t shadow-[0_-10px_20px_rgba(0,0,0,0.05)] ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
                    <div className="space-y-3 mb-3">
                      <input type="text" placeholder="Nama Pemesan *" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full p-3.5 text-sm font-bold rounded-xl border outline-none ${t.input}`} />
                      
                      {/* REVISI ALAMAT / MEJA MOBILE DRAWER */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold opacity-70 uppercase">Alamat / Meja</span>
                          <div className="flex gap-1.5">
                            {['Dine-in', 'Takeaway'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setDeliveryNote(opt)}
                                className={`text-[9px] font-black px-2 py-0.5 rounded-md border transition-all active:scale-95 ${
                                  deliveryNote === opt 
                                    ? 'bg-orange-500 text-white border-orange-500' 
                                    : isDark ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-slate-200 text-slate-700 border-slate-300'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                        <input type="text" placeholder="Dine-in / Takeaway / Ketik manual" value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} className={`w-full p-3 text-sm rounded-xl border outline-none ${t.input}`} />
                      </div>
                    </div>
                    <button 
                      disabled={cart.length === 0 || !customerName.trim()}
                      onClick={() => { setIsMobileCartOpen(false); setShowCheckout(true); }}
                      className={`w-full py-4 rounded-2xl flex justify-between items-center px-6 text-lg disabled:opacity-50 disabled:grayscale ${t.btnPrimary}`}
                    >
                      <span>Lanjut Bayar</span>
                      <span className="font-black bg-black/20 px-3 py-1 rounded-xl">{formatIDR(totalTagihan)}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: DAPUR (KDS) */}
        {activeTab === 'dapur' && (
          <div className="animate-in fade-in h-full">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 rounded-2xl"><ChefHat className="text-orange-500" size={28}/></div>
              Kanban Dapur
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Masuk', 'Dimasak', 'Selesai'].map(statusFilter => (
                <div key={statusFilter} className={`p-5 rounded-3xl border flex flex-col h-[75vh] transition-colors duration-300 ${t.glassCard}`}>
                  <div className={`flex justify-between items-center mb-5 pb-4 border-b border-zinc-500/20`}>
                    <h3 className={`font-black uppercase tracking-wider text-sm
                      ${statusFilter === 'Masuk' ? 'text-red-500' : statusFilter === 'Dimasak' ? 'text-orange-500' : 'text-emerald-500'}
                    `}>{statusFilter}</h3>
                    <span className={`text-xs font-black px-3 py-1 rounded-full 
                      ${statusFilter === 'Masuk' ? t.badgeRed : statusFilter === 'Dimasak' ? t.badgeOrange : t.badgeGreen}`}>
                      {orders.filter(o => o.status === statusFilter).length}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                    {orders.filter(o => o.status === statusFilter).map((order) => (
                      <div key={order.id} className={`p-4 rounded-2xl border border-l-4 shadow-sm transition-all duration-300 hover:shadow-md ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}
                        ${statusFilter === 'Masuk' ? 'border-l-red-500' : statusFilter === 'Dimasak' ? 'border-l-orange-500' : 'border-l-emerald-500'}`}
                      >
                        <div className="flex justify-between items-start mb-3 border-b border-zinc-500/10 pb-3">
                          <div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-600'}`}>{order.id}</span>
                            <p className="text-base font-black mt-2 text-orange-500">{order.customerName}</p>
                            <p className="text-[10px] font-bold uppercase opacity-70 flex items-center gap-1 mt-0.5"><MapPin size={12}/> {order.address}</p>
                          </div>
                          <span className={`text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded-lg ${t.badgeOrange}`}>
                            <Clock size={12}/> {new Date(order.date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <ul className="text-sm space-y-2.5 mb-4">
                          {order.items.map((item, idx) => (
                            <li key={idx} className={`p-2.5 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                              <div className="font-bold flex gap-2.5">
                                <span className="text-orange-500 bg-orange-500/10 px-2 rounded-md">{item.qty}x</span> {item.name}
                              </div>
                              {item.note && <div className={`text-[11px] font-bold italic mt-2 px-2.5 py-1.5 rounded-lg ${t.badgeRed}`}>Catatan: {item.note}</div>}
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-3 mt-auto">
                          {statusFilter === 'Masuk' && (
                            <button onClick={() => updateOrderStatus(order.id, 'Dimasak')} className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 ${t.btnPrimary}`}>Mulai Masak</button>
                          )}
                          {statusFilter === 'Dimasak' && (
                            <button onClick={() => updateOrderStatus(order.id, 'Selesai')} className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 ${t.btnSuccess}`}>Selesai / Antar</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: LAPORAN */}
        {activeTab === 'laporan' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-500/20 pb-5">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <div className="p-2.5 bg-orange-500/10 rounded-2xl"><TrendingUp className="text-orange-500" size={28}/></div>
                  Dashboard Laporan
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-colors shadow-sm ${t.glassCard}`}>
                  <span className={`text-xs font-bold pl-2 flex items-center gap-1.5 ${t.textMuted}`}>
                    <Calendar size={14} className="text-orange-500" /> Filter:
                  </span>
                  
                  <select 
                    value={selectedYearFilter} 
                    onChange={e => setSelectedYearFilter(e.target.value)} 
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-all ${isDark ? 'bg-zinc-900 text-orange-400 border-zinc-700' : 'bg-white text-orange-600 border-slate-300'}`}
                  >
                    <option value="ALL">Semua Tahun</option>
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>

                  <select 
                    value={selectedMonthFilter} 
                    onChange={e => setSelectedMonthFilter(e.target.value)} 
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-all ${isDark ? 'bg-zinc-900 text-white border-zinc-700' : 'bg-white text-slate-800 border-slate-300'}`}
                  >
                    <option value="ALL">Semua Bulan</option>
                    <option value="01">Januari</option>
                    <option value="02">Februari</option>
                    <option value="03">Maret</option>
                    <option value="04">April</option>
                    <option value="05">Mei</option>
                    <option value="06">Juni</option>
                    <option value="07">Juli</option>
                    <option value="08">Agustus</option>
                    <option value="09">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>
                </div>

                <button onClick={() => setShowExportModal(true)} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider ${t.btnSuccess}`}>
                  <Download size={16}/> EXPORT
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <div className={`p-6 rounded-3xl border flex flex-col justify-center transition-colors duration-300 ${t.glassCard}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${t.textMuted}`}>Total Omset</p>
                <h3 className="text-2xl md:text-4xl font-black text-emerald-500 drop-shadow-sm">{formatIDR(totalOmset)}</h3>
              </div>
              <div className={`p-6 rounded-3xl border flex flex-col justify-center transition-colors duration-300 ${t.glassCard}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${t.textMuted}`}>Total Transaksi</p>
                <h3 className="text-2xl md:text-4xl font-black drop-shadow-sm">{activeOrdersForReport.length} Nota</h3>
              </div>
              <div className={`col-span-2 md:col-span-1 p-6 rounded-3xl border flex flex-col justify-center transition-colors duration-300 ${t.glassCard}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${t.textMuted}`}>Rata-rata / Nota</p>
                <h3 className="text-2xl md:text-4xl font-black text-orange-500 drop-shadow-sm">{formatIDR(activeOrdersForReport.length > 0 ? totalOmset / activeOrdersForReport.length : 0)}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 p-6 rounded-3xl border transition-colors duration-300 ${t.glassCard}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-xs uppercase tracking-wider opacity-80">📈 Tren Omset (Urutan Waktu Kiri ke Kanan)</h3>
                  <select value={reportFilter} onChange={e => setReportFilter(e.target.value)} className={`px-3 py-1 rounded-lg text-xs font-bold border outline-none ${t.input}`}>
                    <option>Harian</option><option>Mingguan</option><option>Bulanan</option>
                  </select>
                </div>
                <div className="h-72 w-full">
                  <SimpleAreaChart data={chartData} isDark={isDark} />
                </div>
              </div>

              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border transition-colors duration-300 ${t.glassCard}`}>
                  <h3 className="font-black mb-4 text-xs uppercase tracking-wider opacity-80">💳 Metode Bayar</h3>
                  <div className="py-2">
                    {pieData.length > 0 ? (
                      <SimpleDonutChart data={pieData} colors={COLORS} isDark={isDark} />
                    ) : (
                      <p className="text-xs opacity-50 text-center py-8">Belum ada data</p>
                    )}
                  </div>
                  <div className="flex justify-center gap-4 text-[10px] font-black uppercase tracking-wider mt-4">
                    {['Tunai', 'QRIS', 'Transfer'].map((name, i) => (
                      <span key={name} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: COLORS[i]}}/> {name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border transition-colors duration-300 ${t.glassCard}`}>
                  <h3 className="font-black mb-5 text-xs uppercase tracking-wider opacity-80">🏆 Top 3 Menu Terlaris</h3>
                  <div className="space-y-3.5">
                    {topMenus.length === 0 ? <p className="text-xs opacity-50 text-center py-4">Belum ada data</p> : 
                      topMenus.map(([name, count], idx) => (
                        <div key={idx} className={`flex justify-between items-center p-3.5 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="font-bold text-xs flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-sm ${idx===0?'bg-gradient-to-br from-yellow-400 to-yellow-600':idx===1?'bg-gradient-to-br from-slate-300 to-slate-500':'bg-gradient-to-br from-amber-600 to-amber-800'}`}>{idx+1}</span>
                            {name}
                          </span>
                          <span className={`font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg ${t.badgeOrange}`}>{count}x</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* TABEL RINCIAN TRANSAKSI */}
            <div className={`p-6 rounded-3xl border transition-colors duration-300 ${t.glassCard}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-500/20">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                    📋 Riwayat Transaksi ({activeOrdersForReport.length} Nota)
                  </h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${t.textMuted}`}>Filter Bayar:</span>
                  <select 
                    value={selectedPaymentFilter} 
                    onChange={e => setSelectedPaymentFilter(e.target.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer ${isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                  >
                    <option value="ALL">Semua Metode</option>
                    <option value="Tunai">💵 Tunai</option>
                    <option value="QRIS">📱 QRIS</option>
                    <option value="Transfer">💳 Transfer</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-slate-200 text-slate-500'} font-black uppercase text-[10px] tracking-wider`}>
                      <th className="py-3 px-4">No. Order / Tanggal & Waktu</th>
                      <th className="py-3 px-4">Pelanggan</th>
                      <th className="py-3 px-4">Pesanan</th>
                      <th className="py-3 px-4">Metode Bayar</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-500/10">
                    {activeOrdersForReport.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 opacity-40 font-bold">
                          Tidak ada transaksi pada periode ini
                        </td>
                      </tr>
                    ) : (
                      activeOrdersForReport.map((order) => (
                        <tr key={order.id} className={`hover:bg-zinc-500/5 transition-colors ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                          <td className="py-3.5 px-4">
                            <span className="font-black text-orange-500 block">{order.id}</span>
                            <span className="text-[10px] opacity-70">
                              {new Date(order.date).toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'})} • {new Date(order.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold">
                            <div>{order.customerName}</div>
                            <div className="text-[10px] opacity-60 font-normal">{order.address}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="max-w-[220px] truncate">
                              {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              order.method === 'Tunai' ? t.badgeGreen : order.method === 'QRIS' ? t.badgeOrange : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {order.method === 'Tunai' ? '💵 Tunai' : order.method === 'QRIS' ? '📱 QRIS' : '💳 Transfer'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-sm text-emerald-500">
                            {formatIDR(order.total)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => { setCurrentOrderReceipt(order); setShowReceipt(true); }}
                                className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-500 font-bold text-[10px] hover:bg-orange-500 hover:text-white transition-all active:scale-95 cursor-pointer"
                              >
                                Cetak Struk
                              </button>
                              
                              <button
                                onClick={() => setResetModalConfig({ isOpen: true, type: 'single', payload: order })}
                                className="p-1.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-95 cursor-pointer"
                                title="Hapus Nota Ini"
                              >
                                <Trash2 size={13} />
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
        )}

        {/* TAB: PENGATURAN */}
        {activeTab === 'pengaturan' && (
          <div className="animate-in fade-in max-w-5xl mx-auto space-y-8">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 rounded-2xl"><Settings className="text-orange-500" size={28}/></div>
              Pengaturan Sistem
            </h2>
            
            {/* Profil Warung */}
            <div className={`p-6 md:p-8 rounded-3xl border flex flex-col md:flex-row gap-8 items-center transition-colors duration-300 ${t.glassCard}`}>
              <div className="relative group cursor-pointer" onClick={() => profilePicRef.current.click()}>
                <img src={settings.profilePic} className="w-28 h-28 rounded-[2rem] object-cover border-4 border-orange-500 shadow-xl shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300" alt="Profile"/>
                <div className="absolute inset-0 bg-black/60 rounded-[2rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white backdrop-blur-sm">
                  <ImageIcon size={24} className="mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Ubah Foto</span>
                </div>
                <input type="file" ref={profilePicRef} onChange={e => handleImageUpload(e, url => setSettings({...settings, profilePic: url}))} accept="image/*" className="hidden" />
              </div>
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 block mb-1">Nama Usaha / Warung</label>
                  <input type="text" value={settings.storeName} onChange={e => setSettings({...settings, storeName: e.target.value})} className={`w-full p-3.5 rounded-2xl border outline-none text-lg font-black transition-all ${t.input}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 block mb-1">No. Telepon / WA Admin (Ditampilkan di Struk)</label>
                  <input type="text" value={settings.phone || ''} onChange={e => setSettings({...settings, phone: e.target.value})} placeholder="Cth: 0812-3456-7890" className={`w-full p-3.5 rounded-2xl border outline-none text-sm font-bold transition-all ${t.input}`} />
                </div>
              </div>
            </div>

            {/* QRIS & Bank */}
            <div className={`p-6 md:p-8 rounded-3xl border transition-colors duration-300 ${t.glassCard}`}>
              <h3 className="font-black mb-6 text-sm uppercase tracking-wider opacity-80 border-b border-zinc-500/20 pb-4">Info Pembayaran (QRIS & Transfer)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-70">Upload Gambar QRIS (Galeri Lokal)</label>
                  <div className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:border-orange-500 flex flex-col items-center justify-center h-56 ${isDark ? 'border-zinc-700 bg-zinc-950/50' : 'border-slate-300 bg-slate-50'}`} onClick={() => qrisPicRef.current.click()}>
                    <img src={settings.qrisPic} className="max-h-32 object-contain mb-4 rounded-xl bg-white p-2 shadow-sm" alt="QRIS" />
                    <span className={`text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full ${t.badgeOrange}`}>Klik Ganti QRIS</span>
                    <input type="file" ref={qrisPicRef} onChange={e => handleImageUpload(e, url => setSettings({...settings, qrisPic: url}))} accept="image/*" className="hidden" />
                  </div>
                </div>
                <div className="space-y-5 flex flex-col justify-center">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-70">Nama Bank (Cth: BCA)</label>
                    <input type="text" value={settings.bankName} onChange={e => setSettings({...settings, bankName: e.target.value})} className={`w-full p-4 rounded-2xl border outline-none transition-all ${t.input}`} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-70">No. Rekening & Atas Nama</label>
                    <input type="text" value={settings.bankAccount} onChange={e => setSettings({...settings, bankAccount: e.target.value})} className={`w-full p-4 rounded-2xl border outline-none transition-all ${t.input}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Manajemen Menu */}
            <div className={`p-6 md:p-8 rounded-3xl border transition-colors duration-300 ${t.glassCard}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-zinc-500/20 pb-5">
                <h3 className="font-black text-sm uppercase tracking-wider opacity-80">Manajemen Daftar Menu</h3>
                <button 
                  onClick={() => handleOpenMenuModal()}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${t.btnPrimary}`}
                >
                  <Plus size={16}/> Tambah Menu
                </button>
              </div>
              
              <div className="space-y-4">
                {menus.map(menu => (
                  <div key={menu.id} className={`flex justify-between items-center p-4 rounded-2xl border transition-colors ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 flex justify-center items-center bg-zinc-500/10 rounded-2xl text-3xl shadow-sm border border-zinc-500/20 overflow-hidden">
                        {typeof menu.image === 'string' && (menu.image.startsWith('http') || menu.image.startsWith('blob:') || menu.image.startsWith('data:')) 
                          ? <img src={menu.image} className="w-full h-full object-cover" alt={menu.name} /> 
                          : (menu.image || '🍽️')}
                      </div>
                      <div>
                        <p className="font-black text-sm mb-1">{menu.name}</p>
                        <p className="text-sm text-orange-500 font-black">{formatIDR(menu.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <button 
                        onClick={() => toggleMenuAvailability(menu.id)}
                        className={`w-14 h-7 rounded-full p-1 transition-colors relative flex-shrink-0 shadow-inner ${menu.isAvailable ? 'bg-emerald-500' : isDark ? 'bg-zinc-700' : 'bg-slate-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-1 ${menu.isAvailable ? 'left-8' : 'left-1'}`}/>
                      </button>
                      
                      <div className={`flex border rounded-xl overflow-hidden shadow-sm ${t.glassCard}`}>
                        <button onClick={() => handleOpenMenuModal(menu)} className="p-3 hover:text-orange-500 hover:bg-orange-500/10 transition-colors active:bg-orange-500/20"><Edit3 size={16}/></button>
                        <div className="w-px bg-zinc-500/20"></div>
                        <button onClick={() => handleDeleteMenu(menu.id)} className="p-3 hover:text-red-500 hover:bg-red-500/10 transition-colors active:bg-red-500/20"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ZONA DANGER / RESET DATA OPERASIONAL */}
            <div className={`p-6 md:p-8 rounded-3xl border border-red-500/30 transition-colors duration-300 ${t.glassCard}`}>
              <h3 className="font-black mb-2 text-sm uppercase tracking-wider text-red-500 flex items-center gap-2">
                ⚠️ Pembersihan & Reset Data Operasional
              </h3>
              <p className={`text-xs mb-6 ${t.textMuted}`}>
                Gunakan fitur ini jika ingin memulai operasional warung dari 0 atau jika ingin menjual/menyerahkan aplikasi ke pemilik warung baru.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setResetModalConfig({ isOpen: true, type: 'transactions', payload: null })}
                  className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500 hover:text-white text-orange-500 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-left flex flex-col justify-between cursor-pointer"
                >
                  <span className="font-black text-sm mb-1 flex items-center gap-2"><RefreshCw size={16}/> Clear Riwayat Transaksi & Omset</span>
                  <span className="text-[10px] opacity-80 mt-2">Menghapus nota kasir & laporan keuangan (Omset jadi Rp 0). Katalog menu & profil warung tetap aman.</span>
                </button>

                <button
                  onClick={() => setResetModalConfig({ isOpen: true, type: 'factory', payload: null })}
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-500 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-left flex flex-col justify-between cursor-pointer"
                >
                  <span className="font-black text-sm mb-1 flex items-center gap-2"><Trash2 size={16}/> Reset Total </span>
                  <span className="text-[10px] opacity-80 mt-2">Menghapus SELURUH data (Nama Warung, WA, Menu, Omset, QRIS dikosongkan total 100%).</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around p-2 pb-safe z-30 transition-colors duration-300 ${t.glassPanel}`}>
        {[
          { id: 'pos', icon: ShoppingCart, label: 'Kasir' },
          { id: 'dapur', icon: ChefHat, label: 'Dapur' },
          { id: 'laporan', icon: BarChart2, label: 'Laporan' },
          { id: 'pengaturan', icon: Settings, label: 'Setelan' },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1.5 p-2 w-[72px] rounded-2xl transition-all duration-300 active:scale-90 ${activeTab === item.id ? 'text-orange-500 bg-orange-500/10 shadow-sm' : t.textMuted}`}
          >
            <item.icon size={22} className={activeTab === item.id ? 'fill-orange-500/20' : ''} />
            <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL CUSTOM KONFIRMASI RESET & HAPUS */}
      {resetModalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[80] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className={`w-full max-w-sm rounded-[2rem] shadow-2xl relative flex flex-col p-6 text-center border transition-transform slide-in-from-bottom-6 ${t.glassPanel}`}>
            <div className="mx-auto w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 shadow-lg shadow-red-500/20">
              {resetModalConfig.type === 'factory' ? <ShieldAlert size={36} /> : <AlertTriangle size={36} />}
            </div>

            <h3 className="text-lg font-black uppercase tracking-wide text-red-500 mb-2">
              {resetModalConfig.type === 'factory' 
                ? 'Konfirmasi Reset Total' 
                : resetModalConfig.type === 'transactions'
                ? 'Clear Semua Transaksi?'
                : `Hapus Order ${resetModalConfig.payload?.id}?`}
            </h3>

            <p className={`text-xs mb-6 leading-relaxed ${t.textMuted}`}>
              {resetModalConfig.type === 'factory' 
                ? 'Tindakan ini akan MENGHAPUS SEMUA DATA: Nama Warung, Kontak WA, QRIS, Katalog Menu, serta Laporan Omset dikosongkan total dari 0.'
                : resetModalConfig.type === 'transactions'
                ? 'Semua riwayat pesanan & laporan keuangan akan dihapus menjadi Rp 0. Katalog Menu & Setelan Warung tetap aman.'
                : `Nota pesanan ${resetModalConfig.payload?.id} atas nama "${resetModalConfig.payload?.customerName}" (${formatIDR(resetModalConfig.payload?.total || 0)}) akan dihapus permanen dari laporan.`}
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setResetModalConfig({ isOpen: false, type: '', payload: null })}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider border transition-all active:scale-95 ${isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-300 text-slate-700'}`}
              >
                Batal
              </button>
              <button 
                onClick={
                  resetModalConfig.type === 'factory' 
                    ? executeFactoryReset 
                    : resetModalConfig.type === 'transactions'
                    ? executeClearTransactions
                    : () => executeDeleteSingleOrder(resetModalConfig.payload?.id)
                }
                className="flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT MENU */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className={`w-full max-w-sm rounded-[2rem] shadow-2xl relative flex flex-col p-7 transition-transform slide-in-from-bottom-8 ${t.glassPanel}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black flex items-center gap-2"><Edit3 className="text-orange-500"/> {editingMenu ? 'Edit Menu' : 'Tambah Menu'}</h2>
              <button onClick={() => setShowMenuModal(false)} className={`p-2 rounded-full border transition-colors hover:bg-zinc-500/20 active:scale-90 ${isDark ? 'border-zinc-700' : 'border-slate-300'}`}><X size={18}/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-70">Nama Menu</label>
                <input type="text" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} className={`w-full p-3.5 rounded-2xl border outline-none font-bold ${t.input}`} placeholder="Cth: Ayam Geprek" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-70">Harga (Rp)</label>
                  <input type="number" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} className={`w-full p-3.5 rounded-2xl border outline-none font-bold ${t.input}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-70">Kategori</label>
                  <select value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} className={`w-full p-3.5 rounded-2xl border outline-none font-bold ${t.input}`}>
                    <option>Makanan</option><option>Minuman</option><option>Tambahan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-70">Gambar (Upload / Emoji)</label>
                <div className="flex gap-3 items-center">
                  <div 
                    className={`w-16 h-16 flex items-center justify-center text-3xl rounded-2xl border-2 border-dashed cursor-pointer transition-colors hover:border-orange-500 overflow-hidden ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-slate-300 bg-slate-100'}`}
                    onClick={() => menuImageRef.current.click()}
                  >
                    {typeof menuForm.image === 'string' && (menuForm.image.startsWith('http') || menuForm.image.startsWith('blob:') || menuForm.image.startsWith('data:')) 
                      ? <img src={menuForm.image} className="w-full h-full object-cover" alt="preview"/> 
                      : (menuForm.image || <ImageIcon size={20} className="opacity-50"/>)}
                  </div>
                  <input type="file" ref={menuImageRef} onChange={e => handleImageUpload(e, url => setMenuForm({...menuForm, image: url}))} accept="image/*" className="hidden" />
                  <div className="flex-1">
                    <input type="text" value={typeof menuForm.image === 'string' ? menuForm.image : ''} onChange={e => setMenuForm({...menuForm, image: e.target.value})} className={`w-full p-3 rounded-2xl border outline-none text-xs ${t.input}`} placeholder="Ketik emoji 🍗 atau klik gambar kiri" />
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSaveMenu} className={`w-full py-4 rounded-2xl mt-8 text-sm uppercase tracking-wider ${t.btnPrimary}`}>
              {editingMenu ? 'Simpan Perubahan' : 'Tambahkan Menu'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CHECKOUT */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className={`w-full max-w-md rounded-[2rem] shadow-2xl relative flex flex-col max-h-[90vh] transition-transform slide-in-from-bottom-8 ${t.glassPanel}`}>
            
            <div className="flex justify-between items-center p-6 border-b border-zinc-500/20">
              <h2 className="text-xl font-black flex items-center gap-2"><CreditCard className="text-orange-500"/> Checkout</h2>
              <button onClick={() => setShowCheckout(false)} className={`p-2.5 rounded-full border transition-colors hover:bg-zinc-500/20 active:scale-90 ${isDark ? 'border-zinc-700' : 'border-slate-300'}`}><X size={18} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className={`p-5 rounded-3xl mb-6 text-center border shadow-inner flex flex-col gap-1 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted}`}>Tagihan: <span className={t.text}>{customerName}</span></p>
                <h3 className="text-4xl font-black text-orange-500 mt-2 drop-shadow-sm">{formatIDR(totalTagihan)}</h3>
                {extraCharge > 0 && <p className="text-[10px] text-red-500 font-black mt-2 bg-red-500/10 self-center px-3 py-1 rounded-full">+ Biaya Tambahan {formatIDR(extraCharge)}</p>}
              </div>

              <label className="text-[10px] font-black uppercase tracking-widest mb-3 block opacity-70">Metode Pembayaran</label>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {['Tunai', 'QRIS', 'Transfer'].map(method => (
                  <button 
                    key={method}
                    onClick={() => { setPaymentMethod(method); setCashGiven(method==='Tunai'?0:totalTagihan); }}
                    className={`p-4 rounded-2xl border-2 font-black text-xs transition-all duration-300 flex flex-col items-center justify-center gap-2 active:scale-95
                      ${paymentMethod === method ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-md shadow-orange-500/20' : `border-transparent ${isDark?'bg-zinc-900':'bg-slate-100'}`}`}
                  >
                    <span className="text-2xl drop-shadow-sm">{method==='Tunai'?'💵':method==='QRIS'?'📱':'💳'}</span> {method}
                  </button>
                ))}
              </div>

              {paymentMethod === 'Tunai' ? (
                <div className="animate-in slide-in-from-bottom-4 space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-3 block opacity-70">Saran Nominal Cepat</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[totalTagihan, 20000, 50000, 100000].map(nom => (
                        <button key={nom} onClick={() => setCashGiven(nom)} className={`p-3 rounded-2xl border font-bold text-xs transition-all duration-300 hover:border-orange-500 hover:text-orange-500 active:scale-95 ${nom===100000?'col-span-3':''} ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                          {nom === totalTagihan ? 'Uang Pas' : formatIDR(nom)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-3 block opacity-70">Atau Ketik Manual (Rp)</label>
                    <input 
                      type="number" 
                      value={cashGiven || ''}
                      onChange={(e) => setCashGiven(Number(e.target.value))}
                      placeholder="Cth: 35000"
                      className={`w-full p-4 rounded-2xl border text-xl font-black outline-none transition-all ${t.input}`}
                    />
                  </div>
                  
                  {!isCashSufficient && cashGiven > 0 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center animate-pulse">
                      <p className="text-red-500 text-xs font-bold">Uang kurang {formatIDR(totalTagihan - cashGiven)}</p>
                    </div>
                  )}
                  {isCashSufficient && cashGiven > totalTagihan && (
                    <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shadow-inner">
                      <span className="text-emerald-500 font-black text-xs uppercase tracking-widest">Kembalian:</span>
                      <span className="text-emerald-500 font-black text-2xl drop-shadow-sm">{formatIDR(kembalian)}</span>
                    </div>
                  )}
                </div>
              ) : paymentMethod === 'QRIS' ? (
                 <div className="animate-in slide-in-from-bottom-4 flex flex-col items-center justify-center p-4">
                    <div className="bg-white p-3 rounded-3xl shadow-xl shadow-orange-500/20 border-4 border-orange-500 mb-4">
                      <img src={settings.qrisPic} className="w-48 h-48 object-contain rounded-xl" alt="QRIS" />
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted} animate-pulse`}>Silakan pelanggan scan QRIS</p>
                 </div>
              ) : (
                 <div className="animate-in slide-in-from-bottom-4 bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl text-center shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-3 opacity-80">Transfer ke Rekening:</p>
                    <p className="text-3xl font-black text-blue-500 mb-2 drop-shadow-sm">{settings.bankName}</p>
                    <p className="text-xl font-black text-white bg-blue-500 px-5 py-2.5 rounded-2xl inline-block shadow-md select-all">{settings.bankAccount}</p>
                 </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-500/20">
              <button 
                onClick={handleCheckout}
                disabled={!isCashSufficient}
                className={`w-full py-4 rounded-2xl text-lg flex items-center justify-center gap-2 uppercase tracking-wider ${t.btnSuccess} disabled:opacity-50 disabled:grayscale`}
              >
                <Printer size={20} /> Konfirmasi Bayar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STRUK */}
      {showReceipt && currentOrderReceipt && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-xl overflow-y-auto animate-in fade-in print:bg-white print:p-0 print:block">
          <div className="w-full max-w-sm bg-white text-black p-8 relative font-mono text-xs shadow-2xl print:shadow-none mx-auto my-8 print:my-0 rounded-none md:rounded-lg">
            
            <div className="absolute top-4 right-4 print:hidden flex gap-2">
              <button onClick={() => printViaBluetooth(currentOrderReceipt)} className="p-2.5 bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-90 rounded-full transition-all" title="Cetak Bluetooth Thermal Printer"><Bluetooth size={18}/></button>
              <button onClick={() => window.print()} className="p-2.5 bg-gray-200 hover:bg-gray-300 active:scale-90 rounded-full transition-all" title="Cetak Driver / PDF"><Printer size={18}/></button>
              <button onClick={resetTransaction} className="p-2.5 bg-red-100 hover:bg-red-200 active:scale-90 rounded-full text-red-600 transition-all"><X size={18}/></button>
            </div>

            <div className="text-center border-b-2 border-dashed border-gray-400 pb-5 mb-5 mt-8 print:mt-0">
              <h2 className="text-xl font-black uppercase tracking-widest">{settings.storeName}</h2>
              {settings.phone && <p className="text-xs font-bold mt-1">Telp: {settings.phone}</p>}
              <p className="text-[10px] mt-1 opacity-80">ID: {currentOrderReceipt.id}</p>
              <p className="text-[10px] opacity-80">{new Date(currentOrderReceipt.date).toLocaleString('id-ID')}</p>
            </div>
            
            <div className="mb-5 text-[11px] leading-relaxed">
              <p><b>Pelanggan:</b> {currentOrderReceipt.customerName}</p>
              <p><b>Meja/Alamat:</b> {currentOrderReceipt.address}</p>
            </div>

            <div className="space-y-3 mb-5 border-b-2 border-dashed border-gray-400 pb-5">
              <div className="font-bold flex justify-between border-b border-gray-200 pb-2 mb-3 uppercase tracking-wider text-[10px]">
                <span>Item</span><span>Total</span>
              </div>
              {currentOrderReceipt.items.map((item, idx) => (
                <div key={idx} className="mb-2">
                  <div className="font-bold">{item.name}</div>
                  <div className="flex justify-between pl-3 mt-1">
                    <span>{item.qty} x {formatIDR(item.price)}</span>
                    <span className="font-bold">{formatIDR(item.price * item.qty)}</span>
                  </div>
                  {item.note && <div className="text-[10px] italic pl-5 mt-1 text-gray-600">- {item.note}</div>}
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-8 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal</span><span>{formatIDR(currentOrderReceipt.subTotal)}</span>
              </div>
              {currentOrderReceipt.extraCharge > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Tambahan</span><span>{formatIDR(currentOrderReceipt.extraCharge)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm mt-3 pt-3 border-t border-gray-300">
                <span>TOTAL</span><span>{formatIDR(currentOrderReceipt.total)}</span>
              </div>
              
              <div className="flex justify-between mt-4 pt-4 border-t-2 border-dashed border-gray-400">
                <span>Metode Bayar</span><span className="uppercase font-bold">{currentOrderReceipt.method}</span>
              </div>
              {currentOrderReceipt.method === 'Tunai' && (
                <>
                  <div className="flex justify-between mt-1">
                    <span>Tunai</span><span>{formatIDR(currentOrderReceipt.cashGiven)}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-1">
                    <span>Kembali</span><span>{formatIDR(currentOrderReceipt.kembalian)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-center font-bold">
              <p className="text-sm">*** TERIMA KASIH ***</p>
              <p className="text-[9px] font-normal mt-2 opacity-70">Harap simpan struk ini sebagai bukti pembayaran.</p>
            </div>

            <div className="mt-8 space-y-2 print:hidden">
              <button 
                onClick={() => printViaBluetooth(currentOrderReceipt)} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                <Bluetooth size={16} /> Cetak Bluetooth Thermal
              </button>

              <button onClick={resetTransaction} className="w-full bg-black text-white font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs active:scale-95 transition-transform">
                Tutup & Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EXPORT FILTER */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className={`w-full max-w-sm rounded-[2rem] shadow-2xl relative flex flex-col p-6 transition-transform slide-in-from-bottom-8 ${t.glassPanel}`}>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-zinc-500/20">
              <h2 className="text-lg font-black flex items-center gap-2"><Download className="text-orange-500"/> Export Laporan</h2>
              <button onClick={() => setShowExportModal(false)} className={`p-2 rounded-full border transition-colors hover:bg-zinc-500/20 active:scale-90 ${isDark ? 'border-zinc-700' : 'border-slate-300'}`}><X size={18}/></button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-70">Metode Pembayaran</label>
                <div className="grid grid-cols-4 gap-2">
                  {['ALL', 'Tunai', 'QRIS', 'Transfer'].map(m => (
                    <button
                      key={m}
                      onClick={() => setExportPaymentFilter(m)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        exportPaymentFilter === m 
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                          : `${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'} hover:border-orange-500/50`
                      }`}
                    >
                      {m === 'ALL' ? 'Semua' : m}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between"><span className={t.textMuted}>Periode Terpilih:</span><span className="font-bold">{selectedMonthFilter === 'ALL' ? 'Semua Bulan' : selectedMonthFilter} {selectedYearFilter === 'ALL' ? 'Semua Tahun' : selectedYearFilter}</span></div>
                <div className="flex justify-between"><span className={t.textMuted}>Total Omset Diproses:</span><span className="font-black text-emerald-500">{formatIDR(filteredOrdersForExport.reduce((s,o)=>s+o.total,0))}</span></div>
                <div className="flex justify-between"><span className={t.textMuted}>Jumlah Transaksi:</span><span className="font-bold">{filteredOrdersForExport.length} Nota</span></div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleExportExcel}
                className="w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                📊 Export ke Excel (.XLSX)
              </button>
              
              <button 
                onClick={() => { setShowExportModal(false); setShowPdfReportModal(true); }}
                className="w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-wider bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                📄 Cetak / Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRINT / PDF REPORT PREVIEW */}
      {showPdfReportModal && (
        <div className="fixed inset-0 bg-black/90 z-[65] flex items-center justify-center p-4 backdrop-blur-xl overflow-y-auto animate-in fade-in print:bg-white print:p-0 print:block">
          <div className="w-full max-w-4xl bg-white text-slate-800 p-8 relative font-sans shadow-2xl print:shadow-none mx-auto my-8 print:my-0 rounded-2xl print:rounded-none">
            
            <div className="absolute top-6 right-6 print:hidden flex gap-3">
              <button onClick={() => window.print()} className="px-5 py-2.5 bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all"><Printer size={16}/> Cetak / Simpan PDF</button>
              <button onClick={() => setShowPdfReportModal(false)} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 active:scale-90 transition-all"><X size={18}/></button>
            </div>

            <div className="flex justify-between items-center border-b-2 border-slate-800 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <img src={settings.profilePic} className="w-12 h-12 max-w-[48px] max-h-[48px] rounded-2xl object-cover border-2 border-orange-500 flex-shrink-0" alt="Logo" />
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">{settings.storeName}</h1>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Laporan Penjualan Resmi {settings.phone ? `• Telp: ${settings.phone}` : ''}</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-slate-700">Periode: {selectedMonthFilter === 'ALL' ? 'Semua Bulan' : selectedMonthFilter} {selectedYearFilter === 'ALL' ? 'Semua Tahun' : selectedYearFilter}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Filter Bayar: {exportPaymentFilter}</p>
                <p className="text-slate-400 text-[10px]">Dicetak: {new Date().toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-[10px] font-bold text-emerald-700 uppercase">Total Omset</p>
                <p className="text-xl font-black text-emerald-600">{formatIDR(filteredOrdersForExport.reduce((s,o)=>s+o.total,0))}</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-bold text-slate-600 uppercase">Total Transaksi</p>
                <p className="text-xl font-black text-slate-800">{filteredOrdersForExport.length} Nota</p>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-[10px] font-bold text-orange-700 uppercase">Rata-rata / Nota</p>
                <p className="text-xl font-black text-orange-600">{formatIDR(filteredOrdersForExport.length > 0 ? filteredOrdersForExport.reduce((s,o)=>s+o.total,0)/filteredOrdersForExport.length : 0)}</p>
              </div>
            </div>

            {(exportPaymentFilter === 'ALL' ? ['Tunai', 'QRIS', 'Transfer'] : [exportPaymentFilter]).map(method => {
              const mOrders = filteredOrdersForExport.filter(o => o.method === method);
              if (mOrders.length === 0) return null;
              const mTotal = mOrders.reduce((sum, o) => sum + o.total, 0);

              return (
                <div key={method} className="mb-8">
                  <div className="flex justify-between items-center bg-slate-800 text-white px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider">
                    <span>Metode Pembayaran: {method} ({mOrders.length} Transaksi)</span>
                    <span className="text-emerald-400">Total: {formatIDR(mTotal)}</span>
                  </div>
                  <table className="w-full text-left text-xs border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[9px] border-b border-slate-200">
                        <th className="p-2.5">ID Order</th>
                        <th className="p-2.5">Tanggal & Waktu</th>
                        <th className="p-2.5">Pelanggan</th>
                        <th className="p-2.5">Rincian Item</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {mOrders.map(o => (
                        <tr key={o.id}>
                          <td className="p-2.5 font-bold text-orange-600">{o.id}</td>
                          <td className="p-2.5 text-[10px] text-slate-500">{new Date(o.date).toLocaleDateString('id-ID')} {new Date(o.date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</td>
                          <td className="p-2.5 font-bold">{o.customerName} <span className="font-normal text-slate-500">({o.address})</span></td>
                          <td className="p-2.5 text-[11px]">{o.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-600">{formatIDR(o.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}

            <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
              <div className="text-slate-400 text-[10px]">
                Dokumen ini dihasilkan secara otomatis oleh Sistem POS Warung Cobek Geprek.
              </div>
              <div className="text-center w-48">
                <p className="text-slate-500 mb-12">Penanggung Jawab,</p>
                <p className="font-bold text-slate-800 underline uppercase">{settings.storeName}</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; opacity: 0.3; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { opacity: 0.8; }
      `}} />
    </div>
  );
}