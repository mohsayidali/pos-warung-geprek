import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Moon, Sun, ShoppingCart, BarChart2, Settings, Plus, Minus, 
  Trash2, Printer, ChefHat, Image as ImageIcon, Download, 
  CreditCard, X, MapPin, ChevronUp, Edit3, CheckCircle2,
  Clock, TrendingUp, Calendar, Bluetooth, Smartphone, RefreshCw,
  AlertTriangle, ShieldAlert, Tag, Wifi, LogOut, Search, Filter,
  PieChart, Zap, Check, FileText
} from 'lucide-react';
import { supabase } from './supabase';
import Login from './Login';

// --- NATIVE SVG AREA CHART ---
const SimpleAreaChart = ({ data, isDark }) => {
  if (!data || data.length === 0) return null;

  const totals = data.map(d => d.total);
  const rawMax = Math.max(...totals, 10);
  const rawMin = Math.min(...totals);
  
  const minVal = rawMin === rawMax ? 0 : Math.max(0, rawMin - (rawMax - rawMin) * 0.2);
  const maxVal = rawMax + (rawMax - minVal) * 0.15;

  const width = 600;
  const height = 300;
  const paddingX = 45;
  const paddingTop = 40;
  const paddingBottom = 40;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * (width - paddingX * 2);
    const range = maxVal - minVal || 1;
    const y = height - paddingBottom - ((d.total - minVal) / range) * (height - paddingTop - paddingBottom);
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
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <line x1={paddingX} y1={paddingTop} x2={width - paddingX} y2={paddingTop} stroke={isDark ? '#3f3f46' : '#e2e8f0'} strokeDasharray="4 4" opacity="0.6" />
        <line x1={paddingX} y1={(height - paddingBottom + paddingTop) / 2} x2={width - paddingX} y2={(height - paddingBottom + paddingTop) / 2} stroke={isDark ? '#3f3f46' : '#e2e8f0'} strokeDasharray="4 4" opacity="0.6" />
        <line x1={paddingX} y1={height - paddingBottom} x2={width - paddingX} y2={height - paddingBottom} stroke={isDark ? '#3f3f46' : '#e2e8f0'} opacity="0.8" />

        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i} className="group">
            <circle cx={p.x} cy={p.y} r="6" fill="#f97316" stroke={isDark ? '#18181b' : '#ffffff'} strokeWidth="2.5" className="transition-all group-hover:r-8 cursor-pointer" />
            <text x={p.x} y={p.y - 12} textAnchor="middle" fill={isDark ? '#f4f4f5' : '#1e293b'} fontSize="12" fontWeight="bold">
              {p.total >= 1000000 ? `${(p.total / 1000000).toFixed(1)}M` : p.total >= 1000 ? `${(p.total / 1000).toFixed(0)}k` : p.total}
            </text>
            <text x={p.x} y={height - 12} textAnchor="middle" fill={isDark ? '#a1a1aa' : '#64748b'} fontSize="11" fontWeight="600">
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
  // PERSISTENCE STATE (TEMA & ACTIVE TAB SAVED IN LOCALSTORAGE)
  const [theme, setTheme] = useState(() => localStorage.getItem('pos_theme') || 'dark');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('pos_active_tab') || 'pos');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    localStorage.setItem('pos_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('pos_active_tab', activeTab);
  }, [activeTab]);

  // --- STATE SYSTEM AUTHENTICATION ---
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // --- STATE REALTIME CLOUD SUPABASE ---
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categoriesList, setCategoriesList] = useState(['Makanan', 'Minuman', 'Tambahan']);
  const [settings, setSettings] = useState({
    storeName: 'Warung Cobek Geprek',
    phone: '0812-3456-7890',
    profilePic: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150&q=80',
    qrisPic: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
    bankName: 'BCA',
    bankAccount: '1234567890 a/n Bapak Geprek'
  });

  // INITIAL AUTH & REALTIME LISTENERS
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setCheckingAuth(false);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    setIsReady(true);
    fetchSettings();
    fetchCategories();
    fetchMenus();
    fetchOrders();

    const ordersSubscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newOrd = {
            id: payload.new.id,
            date: payload.new.date,
            customerName: payload.new.customer_name,
            address: payload.new.address,
            items: payload.new.items,
            subTotal: Number(payload.new.sub_total),
            discountAmount: Number(payload.new.discount_amount),
            extraCharge: Number(payload.new.extra_charge),
            total: Number(payload.new.total),
            method: payload.new.method,
            cashGiven: Number(payload.new.cash_given),
            kembalian: Number(payload.new.kembalian),
            status: payload.new.status
          };
          setOrders(prev => [newOrd, ...prev.filter(o => o.id !== newOrd.id)]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? {
            ...o,
            customerName: payload.new.customer_name,
            address: payload.new.address,
            items: payload.new.items,
            subTotal: Number(payload.new.sub_total),
            discountAmount: Number(payload.new.discount_amount),
            extraCharge: Number(payload.new.extra_charge),
            total: Number(payload.new.total),
            method: payload.new.method,
            cashGiven: Number(payload.new.cash_given),
            kembalian: Number(payload.new.kembalian),
            status: payload.new.status
          } : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    const menusSubscription = supabase
      .channel('public:menus')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menus' }, () => {
        fetchMenus();
      })
      .subscribe();

    return () => {
      authSub.unsubscribe();
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(menusSubscription);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) {
        setSettings({
          storeName: data.store_name || 'Warung Cobek Geprek',
          phone: data.phone || '',
          profilePic: data.profile_pic || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150&q=80',
          qrisPic: data.qris_pic || '',
          bankName: data.bank_name || '',
          bankAccount: data.bank_account || ''
        });
      }
    } catch (e) {}
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('name');
    if (data && data.length > 0) {
      setCategoriesList(data.map(c => c.name));
    }
  };

  const fetchMenus = async () => {
    const { data } = await supabase.from('menus').select('*').order('id', { ascending: true });
    if (data) {
      setMenus(data.map(m => ({
        id: m.id,
        name: m.name,
        price: Number(m.price),
        category: m.category,
        image: m.image,
        isAvailable: m.is_available
      })));
    }
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) {
      setOrders(data.map(o => ({
        id: o.id,
        date: o.date,
        customerName: o.customer_name,
        address: o.address,
        items: o.items,
        subTotal: Number(o.sub_total),
        discountAmount: Number(o.discount_amount),
        extraCharge: Number(o.extra_charge),
        total: Number(o.total),
        method: o.method,
        cashGiven: Number(o.cash_given),
        kembalian: Number(o.kembalian),
        status: o.status
      })));
    }
  };

  const saveSettingsToCloud = async (newSettings) => {
    setSettings(newSettings);
    await supabase.from('settings').upsert({
      id: 1,
      store_name: newSettings.storeName,
      phone: newSettings.phone,
      profile_pic: newSettings.profilePic,
      qris_pic: newSettings.qrisPic,
      bank_name: newSettings.bankName,
      bank_account: newSettings.bankAccount
    });
  };

  // --- STATE: PWA INSTALL PROMPT ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
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

  const formatBTPrice = (val) => {
    const num = Number(val) || 0;
    return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // --- THERMAL BLUETOOTH PRINTER ---
  const [btDevice, setBtDevice] = useState(null);
  const [btPrintChar, setBtPrintChar] = useState(null);
  const [btStatus, setBtStatus] = useState('Terputus');

  const connectBluetoothPrinter = async () => {
    if (!navigator.bluetooth) {
      alert('Browser Anda belum mendukung Web Bluetooth API.');
      return null;
    }

    if (btDevice && btDevice.gatt.connected && btPrintChar) {
      setBtStatus('Terhubung');
      return btPrintChar;
    }

    try {
      setBtStatus('Menghubungkan...');
      let device = btDevice;
      if (!device || !device.gatt.connected) {
        device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            '000018f0-0000-1000-8000-00805f9b34fb',
            'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
            '49535343-fe7d-4158-6b44-508a0d9cd86e',
            '00001101-0000-1000-8000-00805f9b34fb',
            '0000180a-0000-1000-8000-00805f9b34fb',
            '0000ff00-0000-1000-8000-00805f9b34fb'
          ]
        });
      }

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
        return foundChar;
      } else {
        setBtStatus('Terputus');
        return null;
      }
    } catch (err) {
      setBtStatus('Terputus');
      return null;
    }
  };

  const printViaBluetooth = async (orderReceipt) => {
    let char = btPrintChar;
    if (!char || !btDevice?.gatt?.connected) {
      char = await connectBluetoothPrinter();
    }

    if (!char) {
      alert('Koneksi Bluetooth Printer belum siap. Mengalihkan ke Cetak Standar...');
      window.print();
      return;
    }

    try {
      const encoder = new TextEncoder();
      const init = '\x1B\x40';
      const setCodePage = '\x1B\x74\x00';
      const center = '\x1B\x61\x01';
      const left = '\x1B\x61\x00';
      const boldOn = '\x1B\x45\x01';
      const boldOff = '\x1B\x45\x00';
      const feed = '\x0A\x0A\x0A';

      let text = init + setCodePage + center + boldOn + (settings.storeName || 'WARUNG COBEK GEPREK').toUpperCase() + '\n' + boldOff;
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
        const totalStr = formatBTPrice(item.price * item.qty).replace('Rp ', '').trim().padStart(11, ' ');
        text += `${qtyStr}x ${name} ${totalStr}\n`;
        if (item.note) text += `    * ${item.note}\n`;
      });

      text += '--------------------------------\n';
      text += `Subtotal    : ${formatBTPrice(orderReceipt.subTotal)}\n`;
      if (orderReceipt.discountAmount > 0) {
        text += `Diskon      : -${formatBTPrice(orderReceipt.discountAmount)}\n`;
      }
      if (orderReceipt.extraCharge > 0) text += `Biaya Extra : ${formatBTPrice(orderReceipt.extraCharge)}\n`;
      text += boldOn + `TOTAL       : ${formatBTPrice(orderReceipt.total)}\n` + boldOff;
      text += `Bayar (${orderReceipt.method}): ${formatBTPrice(orderReceipt.cashGiven || orderReceipt.total)}\n`;
      if (orderReceipt.method === 'Tunai') text += `Kembali     : ${formatBTPrice(orderReceipt.kembalian || 0)}\n`;
      text += '--------------------------------\n' + center;
      text += '*** TERIMA KASIH ***\n\n' + feed;

      const data = encoder.encode(text);
      const chunkSize = 100;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        if (char.properties.writeWithoutResponse) {
          await char.writeValueWithoutResponse(chunk);
        } else {
          await char.writeValue(chunk);
        }
      }
    } catch (e) {
      window.print();
    }
  };

  // CETAK TIKET DAPUR UNTUK KOKI
  const printKitchenTicket = async (orderTicket) => {
    let char = btPrintChar;
    if (!char || !btDevice?.gatt?.connected) {
      char = await connectBluetoothPrinter();
    }

    if (!char) {
      alert(`TIKET DAPUR [${orderTicket.id}]\nPelanggan: ${orderTicket.customerName}\nMeja/Alamat: ${orderTicket.address}\n\nItem:\n` + 
        orderTicket.items.map(i => `- ${i.qty}x ${i.name} ${i.note ? '['+i.note+']' : ''}`).join('\n'));
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
      const feed = '\x0A\x0A\x0A';

      let text = init + center + boldOn + '*** TIKET DAPUR / KOKI ***\n' + boldOff;
      text += 'ID: ' + orderTicket.id + ' | ' + new Date(orderTicket.date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) + '\n';
      text += '--------------------------------\n' + left;
      text += boldOn + 'PEMESAN : ' + orderTicket.customerName.toUpperCase() + '\n' + boldOff;
      text += 'MEJA/ALAMAT: ' + orderTicket.address + '\n';
      text += '--------------------------------\n';
      text += boldOn + 'QTY  NAMA MENU & CATATAN\n' + boldOff;
      
      orderTicket.items.forEach(item => {
        text += boldOn + `${item.qty}x  ${item.name}\n` + boldOff;
        if (item.note) text += `    >>> CATATAN: ${item.note}\n`;
      });

      text += '--------------------------------\n' + center;
      text += 'HARAP SEGERA DISIAPKAN!\n\n' + feed;

      const data = encoder.encode(text);
      const chunkSize = 100;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        if (char.properties.writeWithoutResponse) {
          await char.writeValueWithoutResponse(chunk);
        } else {
          await char.writeValue(chunk);
        }
      }
    } catch (e) {
      window.print();
    }
  };

  // --- STATE MODUL KASIR ---
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('Semua');
  const [menuSearchQuery, setMenuSearchQuery] = useState(''); // REVISI: PENCARIAN MENU INSTAN
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuForm, setMenuForm] = useState({ name: '', price: '', category: 'Makanan', image: '🍽️', isAvailable: true });
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const menuImageRef = useRef(null);

  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [extraCharge, setExtraCharge] = useState(0);

  const [discountType, setDiscountType] = useState('rp');
  const [discountValue, setDiscountValue] = useState(0);

  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [cashGiven, setCashGiven] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [currentOrderReceipt, setCurrentOrderReceipt] = useState(null);

  const [resetModalConfig, setResetModalConfig] = useState({ isOpen: false, type: '', payload: null });

  const executeClearTransactions = async () => {
    await supabase.from('orders').delete().neq('id', '');
    setOrders([]);
    setCart([]);
    setResetModalConfig({ isOpen: false, type: '', payload: null });
  };

  const executeFactoryReset = async () => {
    const emptySettings = {
      storeName: '',
      phone: '',
      profilePic: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150&q=80',
      qrisPic: '',
      bankName: '',
      bankAccount: ''
    };
    await supabase.from('orders').delete().neq('id', '');
    await supabase.from('menus').delete().neq('id', 0);
    await saveSettingsToCloud(emptySettings);

    setOrders([]);
    setMenus([]);
    setCart([]);
    setResetModalConfig({ isOpen: false, type: '', payload: null });
  };

  const executeDeleteSingleOrder = async (orderId) => {
    await supabase.from('orders').delete().eq('id', orderId);
    setOrders(orders.filter(o => o.id !== orderId));
    setResetModalConfig({ isOpen: false, type: '', payload: null });
  };

  // --- FILTER LAPORAN & DASHBOARD ---
  const [reportFilter, setReportFilter] = useState('Harian'); // Harian, Mingguan, Bulanan
  
  // --- FILTER TABEL RIWAYAT TRANSAKSI (DEFAULT HARI INI) ---
  const getTodayFormattedDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [historyDateFilter, setHistoryDateFilter] = useState(getTodayFormattedDate()); // DEFAULT TODAY
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('ALL');

  const profilePicRef = useRef(null);
  const qrisPicRef = useRef(null);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

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
  
  const calculatedDiscount = useMemo(() => {
    const val = Number(discountValue) || 0;
    if (val <= 0) return 0;
    if (discountType === 'percent') {
      return Math.round((subTotal * Math.min(val, 100)) / 100);
    }
    return Math.min(val, subTotal);
  }, [subTotal, discountType, discountValue]);

  const totalTagihan = Math.max(0, subTotal - calculatedDiscount + Number(extraCharge || 0));
  const kembalian = cashGiven - totalTagihan;
  const isCashSufficient = paymentMethod !== 'Tunai' || cashGiven >= totalTagihan;

  const handleCheckout = async () => {
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
        discountAmount: calculatedDiscount,
        extraCharge: Number(extraCharge || 0),
        total: totalTagihan,
        method: paymentMethod,
        cashGiven: paymentMethod === 'Tunai' ? cashGiven : totalTagihan,
        kembalian: paymentMethod === 'Tunai' ? kembalian : 0,
        status: 'Masuk' 
      };
      
      const { error } = await supabase.from('orders').insert({
        id: newOrder.id,
        date: newOrder.date,
        customer_name: newOrder.customerName,
        address: newOrder.address,
        items: newOrder.items,
        sub_total: newOrder.subTotal,
        discount_amount: newOrder.discountAmount,
        extra_charge: newOrder.extraCharge,
        total: newOrder.total,
        method: newOrder.method,
        cash_given: newOrder.cashGiven,
        kembalian: newOrder.kembalian,
        status: newOrder.status
      });

      if (!error) {
        setCurrentOrderReceipt(newOrder);
        setShowCheckout(false);
        setShowReceipt(true);
      } else {
        alert('Gagal menyimpan ke Supabase: ' + error.message);
      }
    }
  };

  const resetTransaction = () => {
    setCart([]);
    setCustomerName('');
    setDeliveryNote('');
    setExtraCharge(0);
    setDiscountValue(0);
    setCashGiven(0);
    setShowReceipt(false);
    setIsMobileCartOpen(false);
    setCurrentOrderReceipt(null);
  };

  const handleOpenMenuModal = (menu = null) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuForm({ ...menu });
      setIsCustomCategoryMode(false);
      setCustomCategoryInput('');
    } else {
      setEditingMenu(null);
      setMenuForm({ name: '', price: '', category: categoriesList[0] || 'Makanan', image: '🍽️', isAvailable: true });
      setIsCustomCategoryMode(false);
      setCustomCategoryInput('');
    }
    setShowMenuModal(true);
  };

  const handleSaveMenu = async () => {
    if (!menuForm.name || !menuForm.price) return;
    
    let finalCategory = menuForm.category;
    if (isCustomCategoryMode && customCategoryInput.trim()) {
      finalCategory = customCategoryInput.trim();
      const { error: catErr } = await supabase
        .from('categories')
        .insert([{ name: finalCategory }]);

      if (!catErr) await fetchCategories();
    }

    if (editingMenu) {
      const { error } = await supabase.from('menus').update({
        name: menuForm.name,
        price: Number(menuForm.price),
        category: finalCategory,
        image: menuForm.image,
        is_available: menuForm.isAvailable
      }).eq('id', editingMenu.id);

      if (error) alert('Gagal mengedit menu: ' + error.message);
    } else {
      const { error } = await supabase.from('menus').insert([{
        name: menuForm.name,
        price: Number(menuForm.price),
        category: finalCategory,
        image: menuForm.image,
        is_available: menuForm.isAvailable
      }]);

      if (error) {
        alert('Gagal menambah menu: ' + error.message);
      }
    }

    await fetchMenus();
    setShowMenuModal(false);
  };

  const handleDeleteMenu = async (id) => {
    await supabase.from('menus').delete().eq('id', id);
    fetchMenus();
  };

  const toggleMenuAvailability = async (id, currentStatus) => {
    await supabase.from('menus').update({ is_available: !currentStatus }).eq('id', id);
    fetchMenus();
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

  // REVISI: FILTER MENU SESUAI TAB KATEGORI & INPUT SEARCH BAR
  const filteredMenus = useMemo(() => {
    return menus.filter(m => {
      const matchesCategory = selectedCategoryTab === 'Semua' || m.category === selectedCategoryTab;
      const matchesSearch = !menuSearchQuery.trim() || m.name.toLowerCase().includes(menuSearchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [menus, selectedCategoryTab, menuSearchQuery]);

  const updateOrderStatus = async (id, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
  };

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPaymentFilter, setExportPaymentFilter] = useState('ALL');
  const [showPdfReportModal, setShowPdfReportModal] = useState(false);

  // --- LOGIKA FILTER PERIODE HARIAN, MINGGUAN, BULANAN (SINKRON GRAPH + CARDS) ---
  const activeOrdersForReport = useMemo(() => {
    const now = new Date();
    const todayStr = getTodayFormattedDate();
    
    return orders.filter(o => {
      const d = new Date(o.date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const orderDateStr = `${yyyy}-${mm}-${dd}`;
      
      if (reportFilter === 'Harian') {
        return orderDateStr === todayStr;
      } else if (reportFilter === 'Mingguan') {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 6);
        sevenDaysAgo.setHours(0,0,0,0);
        return d >= sevenDaysAgo && d <= now;
      } else if (reportFilter === 'Bulanan') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      return true;
    });
  }, [orders, reportFilter]);

  // --- LOGIKA TABEL RIWAYAT TRANSAKSI (DEFAULT HARI INI) ---
  const filteredHistoryOrders = useMemo(() => {
    return orders.filter(o => {
      const d = new Date(o.date);
      
      // Filter Tanggal
      let matchDate = true;
      if (historyDateFilter && historyDateFilter !== 'ALL') {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const orderDateStr = `${yyyy}-${mm}-${dd}`;
        matchDate = orderDateStr === historyDateFilter;
      }

      // Filter Metode Pembayaran
      const matchPayment = selectedPaymentFilter === 'ALL' || o.method === selectedPaymentFilter;

      // Filter Search (ID / Nama Pemesan)
      const query = historySearchQuery.toLowerCase().trim();
      const matchQuery = !query || 
        o.id.toLowerCase().includes(query) || 
        o.customerName.toLowerCase().includes(query) ||
        (o.address && o.address.toLowerCase().includes(query));

      return matchDate && matchPayment && matchQuery;
    });
  }, [orders, historyDateFilter, selectedPaymentFilter, historySearchQuery]);

  // REVISI EXPORT 100% MENGIKUTI FILTER TABEL RIWAYAT / PERIODE ACTIVE
  const filteredOrdersForExport = useMemo(() => {
    return filteredHistoryOrders.filter(o => {
      return exportPaymentFilter === 'ALL' || o.method === exportPaymentFilter;
    });
  }, [filteredHistoryOrders, exportPaymentFilter]);

  const handleExportExcel = () => {
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
              <th style="padding:10px; text-align:right;">Diskon</th>
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
                <td style="padding:8px; text-align:right; color:#ef4444;">${o.discountAmount ? 'Rp ' + o.discountAmount.toLocaleString('id-ID') : '-'}</td>
                <td style="padding:8px; text-align:right; font-weight:bold; color:#10b981;">Rp ${o.total.toLocaleString('id-ID')}</td>
              </tr>
            `).join('')}
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
        <h2 style="color:#1e293b; margin-bottom:5px;">${settings.storeName || 'Aplikasi POS'} - LAPORAN PENJUALAN</h2>
        <p style="margin-top:0; color:#64748b; font-size:12px;">
          <b>Telp Admin:</b> ${settings.phone || '-'} | <b>Filter Tanggal:</b> ${historyDateFilter === 'ALL' ? 'Semua Tanggal' : historyDateFilter} | <b>Filter Metode Bayar:</b> ${exportPaymentFilter} | <b>Dicetak:</b> ${new Date().toLocaleString('id-ID')}
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
    link.download = `Laporan_${(settings.storeName || 'POS').replace(/\s+/g, '_')}_${historyDateFilter}.xlsx`;
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
      if (reportFilter === 'Harian') return [{ name: '08:00', total: 0 }, { name: '12:00', total: 0 }, { name: '16:00', total: 0 }, { name: '20:00', total: 0 }];
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

  const totalDiskonDiberikan = useMemo(() => {
    return activeOrdersForReport.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
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

  // REVISI FITUR LAPORAN TAMBAHAN: ANALISIS JAM SIBUK (PEAK HOURS)
  const peakHourInsight = useMemo(() => {
    const hourCounts = {};
    activeOrdersForReport.forEach(o => {
      const hour = new Date(o.date).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const sorted = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return 'Belum ada transaksi';
    const topHour = parseInt(sorted[0][0]);
    return `Jam ${topHour.toString().padStart(2, '0')}:00 - ${(topHour + 1).toString().padStart(2, '0')}:00 (${sorted[0][1]} Trx)`;
  }, [activeOrdersForReport]);

  // REVISI FITUR LAPORAN TAMBAHAN: BREAKDOWN OMSET PER KATEGORI (%)
  const categorySalesBreakdown = useMemo(() => {
    const catSales = {};
    let totalCatSales = 0;
    activeOrdersForReport.forEach(o => {
      o.items.forEach(item => {
        const cat = item.category || 'Makanan';
        const itemTotal = item.price * item.qty;
        catSales[cat] = (catSales[cat] || 0) + itemTotal;
        totalCatSales += itemTotal;
      });
    });
    if (totalCatSales === 0) return [];
    return Object.entries(catSales).map(([cat, total]) => ({
      category: cat,
      total,
      percentage: Math.round((total / totalCatSales) * 100)
    })).sort((a,b) => b.total - a.total);
  }, [activeOrdersForReport]);

  // REVISI DAPUR 2 KOLOM: AKUMULASI REKAP PORSI DAPUR HARI INI
  const kitchenPrepSummary = useMemo(() => {
    const prepMap = {};
    orders.filter(o => o.status === 'Masuk').forEach(o => {
      o.items.forEach(i => {
        prepMap[i.name] = (prepMap[i.name] || 0) + Number(i.qty);
      });
    });
    return Object.entries(prepMap).sort((a, b) => b[1] - a[1]);
  }, [orders]);

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

  // PINTU GERBANG LOGIN
  if (checkingAuth) return null;
  if (!currentUser) {
    return (
      <Login 
        onLoginSuccess={(usr) => setCurrentUser(usr)} 
        isDark={isDark} 
        storeName={settings.storeName} 
        logoPic={settings.profilePic} 
      />
    );
  }

  return (
    /* FIXED SCREEN CONTAINER FREEZE PANES */
    <div className={`h-screen w-full font-sans transition-colors duration-300 ease-in-out ${t.bg} ${t.text} flex flex-col overflow-hidden ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* HEADER (FROZEN TOP BAR) */}
      <header className={`flex justify-between items-center px-6 py-3 border-b sticky top-0 z-30 flex-shrink-0 transition-colors duration-300 ${t.glassCard} rounded-none border-t-0 border-x-0`}>
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => profilePicRef.current.click()}>
            <img src={settings.profilePic} alt="Logo" className="w-10 h-10 aspect-square max-w-[40px] max-h-[40px] rounded-2xl object-cover flex-shrink-0 border-2 border-orange-500 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Edit3 size={14} className="text-white"/>
            </div>
            <input type="file" ref={profilePicRef} onChange={e => handleImageUpload(e, url => saveSettingsToCloud({...settings, profilePic: url}))} accept="image/*" className="hidden" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black uppercase tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500 drop-shadow-sm whitespace-nowrap">
              {settings.storeName || 'NAMA WARUNG'}
            </h1>
            <p className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${t.textMuted}`}>
              <Wifi size={9} className="text-emerald-500"/> Realtime Active
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 sm:gap-3 items-center">
          {deferredPrompt && (
            <button 
              onClick={handleInstallPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-orange-500/30 active:scale-95 transition-all"
            >
              <Smartphone size={14}/> Install App PWA
            </button>
          )}

          <button 
            onClick={connectBluetoothPrinter} 
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              btStatus === 'Terhubung' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30 hover:bg-orange-500 hover:text-white'
            }`}
            title="Sambungkan Thermal Bluetooth Printer"
          >
            <Bluetooth size={14}/> {btStatus === 'Terhubung' ? 'Printer BT Ready' : btStatus === 'Menghubungkan...' ? 'Menghubungkan...' : 'Hubungkan BT Printer'}
          </button>
          
          <nav className={`hidden md:flex p-1 rounded-2xl border transition-colors duration-300 ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-slate-100/50 border-slate-200'}`}>
            {[
              { id: 'pos', icon: ShoppingCart, label: 'Kasir' },
              { id: 'dapur', icon: ChefHat, label: 'Dapur' },
              { id: 'laporan', icon: BarChart2, label: 'Laporan' },
              { id: 'pengaturan', icon: Settings, label: 'Setelan' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 ${
                  activeTab === tab.id ? 'bg-white dark:bg-zinc-800 text-orange-500 shadow-sm' : `text-zinc-500 hover:text-orange-500 hover:bg-zinc-500/5`
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </nav>

          <button 
            onClick={toggleTheme} 
            className={`p-2.5 rounded-2xl border transition-all duration-300 hover:border-orange-500 active:scale-90 ${t.glassCard}`}
          >
            {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-600" />}
          </button>

          <button 
            onClick={handleLogout} 
            className={`p-2.5 rounded-2xl border transition-all duration-300 hover:border-red-500 hover:text-red-500 active:scale-90 ${t.glassCard}`}
            title="Keluar Akun (Logout)"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA (FREEZE PANES BODY DENGAN BOTTOM PADDING pb-28 md:pb-6 AGAR ANTI-DESAKAN HP) */}
      <main className="max-w-[1500px] w-full mx-auto p-4 md:p-5 flex-1 overflow-hidden animate-in fade-in duration-300" key={activeTab}>
        
        {/* TAB: POS KASIR */}
        {activeTab === 'pos' && (
          <div className="flex flex-col md:flex-row gap-5 h-full w-full overflow-hidden items-start pb-28 md:pb-0">
            
            {/* AREA KIRI: SEARCH BAR + KATALOG MENU + TAB KATEGORI LEBIH BESAR (14px) */}
            <div className="flex-1 w-full min-w-0 flex flex-col h-full overflow-hidden space-y-3">
              
              {/* BARIS PENCARIAN MENU INSTAN (SEARCH BAR) & TAB KATEGORI */}
              <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
                {/* SEARCH BAR INPUT */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-3 opacity-50" />
                  <input 
                    type="text" 
                    placeholder="Cari menu (cth: Ayam, Cumi, Es)..." 
                    value={menuSearchQuery}
                    onChange={e => setMenuSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-9 py-2.5 text-xs font-bold rounded-2xl border outline-none transition-all ${t.input}`}
                  />
                  {menuSearchQuery && (
                    <button 
                      onClick={() => setMenuSearchQuery('')}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-orange-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* TAB FILTER KATEGORI (REVISI FONT DIPERBESAR KE 14px / text-sm font-bold) */}
              {menus.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar w-full flex-shrink-0">
                  <button
                    onClick={() => setSelectedCategoryTab('Semua')}
                    className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 active:scale-95 ${
                      selectedCategoryTab === 'Semua' 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20' 
                        : isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-orange-500/50' : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-500/50'
                    }`}
                  >
                    Semua ({menus.length})
                  </button>
                  {categoriesList.map(cat => {
                    const count = menus.filter(m => m.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryTab(cat)}
                        className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 active:scale-95 ${
                          selectedCategoryTab === cat 
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20' 
                            : isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-orange-500/50' : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-500/50'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              {/* AREA GRID MENU 3 KOLOM */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {filteredMenus.length === 0 ? (
                  <div className={`p-12 text-center rounded-3xl border flex flex-col items-center justify-center ${t.glassCard}`}>
                    <ShoppingCart size={48} className="text-orange-500 opacity-40 mb-3" />
                    <h3 className="font-black text-lg">Menu Tidak Ditemukan</h3>
                    <p className="text-xs opacity-70 mt-1 max-w-sm">Tidak ada menu yang sesuai dengan kata kunci pencarian atau kategori ini.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 pb-8">
                    {filteredMenus.map((menu) => (
                      <div 
                        key={menu.id} 
                        onClick={() => menu.isAvailable && addToCart(menu)}
                        className={`rounded-3xl border p-4 flex flex-col items-center text-center transition-all duration-300 ${t.glassCard} 
                          ${menu.isAvailable 
                            ? 'cursor-pointer hover:border-orange-500 hover:shadow-orange-500/20 hover:-translate-y-1 active:scale-95 active:translate-y-0' 
                            : 'opacity-50 grayscale cursor-not-allowed'}`}
                      >
                        <div className="text-4xl mb-2.5 h-14 flex items-center justify-center drop-shadow-md">
                          {typeof menu.image === 'string' && (menu.image.startsWith('http') || menu.image.startsWith('blob:') || menu.image.startsWith('data:')) 
                            ? <img src={menu.image} className="h-14 w-14 object-cover rounded-2xl shadow-sm" alt={menu.name} /> 
                            : menu.image}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider mb-1 px-2 py-0.5 rounded-full ${t.badgeOrange}`}>
                          {menu.category}
                        </span>
                        <h3 className="font-bold text-xs mb-1 leading-tight line-clamp-2">{menu.name}</h3>
                        <p className="text-orange-500 font-black text-sm">{formatIDR(menu.price)}</p>
                        {!menu.isAvailable && <span className={`text-[9px] px-2.5 py-0.5 rounded-full mt-2 font-bold uppercase ${t.badgeRed}`}>Habis</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AREA KANAN: SIDEBAR KERANJANG TABLET/DESKTOP (REVISI DI-LEBARKAN KE 380px - 420px + FORM SPLIT KIRI-KANAN) */}
            <div className="hidden md:flex w-[380px] lg:w-[420px] flex-shrink-0 flex-col h-full z-20">
              <div className={`flex-1 rounded-3xl border p-4 flex flex-col h-full overflow-hidden transition-colors duration-300 ${t.glassCard}`}>
                <h2 className="text-lg font-black border-b pb-3 mb-3 flex items-center justify-between border-zinc-500/20 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-500/10 rounded-xl"><ShoppingCart className="text-orange-500" size={20}/></div>
                    Keranjang Pesanan
                  </div>
                  <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-xl">
                    {cart.reduce((a,b)=>a + (Number(b.qty) || 0), 0)} Item
                  </span>
                </h2>

                {/* SCROLLABLE ITEM LIST INSIDE CART */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className={`text-center h-full flex flex-col items-center justify-center ${t.textMuted}`}>
                      <ShoppingCart size={56} className="mb-3 opacity-10" />
                      <p className="font-bold text-xs">Keranjang masih kosong</p>
                      <p className="text-[10px] mt-1 opacity-70">Pilih menu di sebelah kiri</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.cartId} className={`p-3 rounded-2xl border transition-colors ${isDark ? 'bg-zinc-950/50 border-zinc-800/50' : 'bg-slate-50/50 border-slate-200/50'} hover:border-orange-500/30`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 pr-2">
                            <h4 className="text-xs font-bold leading-tight mb-0.5">{item.name}</h4>
                            <p className="text-xs font-black text-orange-500">{formatIDR(item.price * (Number(item.qty) || 0))}</p>
                          </div>
                          
                          <div className={`flex items-center gap-1 rounded-xl p-1 border shadow-sm ${t.glassCard}`}>
                            <button onClick={() => updateQty(item.cartId, -1)} className="p-1 rounded-lg hover:bg-zinc-500/10 hover:text-orange-500 transition-colors active:scale-90"><Minus size={12}/></button>
                            
                            <input 
                              type="number" 
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateQtyDirect(item.cartId, e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1))}
                              onBlur={() => { if (!item.qty || Number(item.qty) < 1) updateQtyDirect(item.cartId, 1); }}
                              className="w-10 text-center text-xs font-black bg-transparent outline-none text-orange-500 focus:bg-orange-500/10 rounded py-0.5"
                            />

                            <button onClick={() => updateQty(item.cartId, 1)} className="p-1 rounded-lg hover:bg-zinc-500/10 hover:text-orange-500 transition-colors active:scale-90"><Plus size={12}/></button>
                            <button onClick={() => removeFromCart(item.cartId)} className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 ml-0.5 transition-colors active:scale-90"><Trash2 size={12}/></button>
                          </div>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Catatan (Pedas/Tanpa Es)" 
                          value={item.note}
                          onChange={(e) => updateItemNote(item.cartId, e.target.value)}
                          className={`w-full text-[10px] p-1.5 rounded-xl border outline-none transition-all ${t.input}`}
                        />
                      </div>
                    ))
                  )}
                </div>

                {/* REVISI: FORM BOTTOM KERANJANG DI-SPLIT MENJADI 2 KOLOM MENSAMPING (KIRI & KANAN) */}
                <div className="pt-3 mt-2 border-t border-zinc-500/20 space-y-2 flex-shrink-0">
                  <div className="grid grid-cols-2 gap-2">
                    {/* BARIS 1 KIRI: NAMA PEMESAN */}
                    <div>
                      <label className="text-[9px] font-black mb-1 block uppercase tracking-wider text-orange-500">Nama Pemesan *</label>
                      <input type="text" placeholder="Nama pelanggan" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full p-2 text-xs rounded-xl border outline-none transition-all ${t.input}`} />
                    </div>

                    {/* BARIS 1 KANAN: ALAMAT / MEJA + TOMBOL DINE-IN/TAKEAWAY */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] font-black uppercase tracking-wider opacity-70">Meja / Alamat</label>
                        <div className="flex gap-1">
                          {['Dine-in', 'Takeaway'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setDeliveryNote(opt)}
                              className={`text-[8px] font-black px-1.5 py-0.5 rounded border transition-all active:scale-95 ${
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
                      <input 
                        type="text" 
                        placeholder="Ket. Meja / Status" 
                        value={deliveryNote} 
                        onChange={e => setDeliveryNote(e.target.value)} 
                        className={`w-full p-2 text-xs rounded-xl border outline-none transition-all ${t.input}`} 
                      />
                    </div>
                  </div>

                  {/* BARIS 2: SPLIT KIRI (DISKON) & KANAN (TOTAL TAGIHAN & BAYAR) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* KIRI: DISKON */}
                    <div className="p-2 rounded-2xl border bg-orange-500/5 border-orange-500/20 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-wider text-orange-500 flex items-center gap-0.5">
                          <Tag size={10}/> Diskon
                        </span>
                        <div className="flex border rounded overflow-hidden text-[8px] font-bold">
                          <button type="button" onClick={() => setDiscountType('rp')} className={`px-1.5 py-0.5 ${discountType === 'rp' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Rp</button>
                          <button type="button" onClick={() => setDiscountType('percent')} className={`px-1.5 py-0.5 ${discountType === 'percent' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>%</button>
                        </div>
                      </div>
                      <input 
                        type="number" 
                        min="0"
                        placeholder="Potongan"
                        value={discountValue || ''}
                        onChange={e => setDiscountValue(Number(e.target.value))}
                        className={`w-full p-1.5 text-xs font-bold rounded-xl border outline-none ${t.input}`}
                      />
                      {calculatedDiscount > 0 && <p className="text-[9px] font-bold text-red-500 text-right">- {formatIDR(calculatedDiscount)}</p>}
                    </div>

                    {/* KANAN: TOTAL TAGIHAN & BUTTON BAYAR */}
                    <div className="flex flex-col justify-between">
                      <div className={`p-1.5 px-2.5 rounded-xl border text-right ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
                        <span className="text-[8px] font-bold block uppercase opacity-70">Total Net</span>
                        <span className="text-base font-black text-orange-500">{formatIDR(totalTagihan)}</span>
                      </div>
                      <button 
                        disabled={cart.length === 0 || !customerName.trim()}
                        onClick={() => setShowCheckout(true)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black flex justify-center items-center gap-1 ${t.btnPrimary} disabled:opacity-50 disabled:grayscale`}
                      >
                        Bayar Sekarang
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* FLOATING CART BUTTON (HANYA LAYAR SMARTPHONE KHUSUS < 768px) */}
            {!isMobileCartOpen && cart.length > 0 && (
              <div className="md:hidden fixed bottom-20 left-4 right-4 z-40 animate-in slide-in-from-bottom-10">
                <button 
                  onClick={() => setIsMobileCartOpen(true)}
                  className={`w-full p-3.5 rounded-3xl flex justify-between items-center ${t.btnPrimary}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-2xl relative backdrop-blur-sm">
                      <ShoppingCart size={20} />
                      <span className="absolute -top-2 -right-2 bg-zinc-900 text-orange-500 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-orange-500">
                        {cart.reduce((a,b)=>a + (Number(b.qty) || 0), 0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] block opacity-80 uppercase tracking-widest font-bold">Total Belanja</span>
                      <span className="text-base font-black">{formatIDR(totalTagihan)}</span>
                    </div>
                  </div>
                  <ChevronUp size={24} className="animate-bounce" />
                </button>
              </div>
            )}

            {/* MOBILE CART DRAWER (< 768px) */}
            {isMobileCartOpen && (
              <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-300">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileCartOpen(false)}></div>
                <div className={`rounded-t-[2rem] relative max-h-[90vh] flex flex-col shadow-2xl transition-transform slide-in-from-bottom-full duration-300 border-t ${t.glassPanel}`}>
                  <div className="flex justify-between items-center p-4 border-b border-zinc-500/20">
                    <h2 className="text-base font-black flex items-center gap-2">
                      <div className="p-1.5 bg-orange-500/10 rounded-xl"><ShoppingCart className="text-orange-500" size={18}/></div>
                      Keranjang Pesanan
                    </h2>
                    <button onClick={() => setIsMobileCartOpen(false)} className={`p-2 rounded-full border transition-colors ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-slate-100 border-slate-300'}`}><X size={18} /></button>
                  </div>
                  
                  <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {cart.map(item => (
                      <div key={item.cartId} className={`p-3 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 pr-2">
                            <h4 className="text-xs font-bold leading-tight mb-0.5">{item.name}</h4>
                            <p className="text-xs font-black text-orange-500">{formatIDR(item.price * (Number(item.qty) || 0))}</p>
                          </div>
                          <div className={`flex items-center gap-1 rounded-xl p-1 border shadow-sm ${t.glassCard}`}>
                            <button onClick={() => updateQty(item.cartId, -1)} className="p-1 active:scale-90"><Minus size={12}/></button>
                            <input 
                              type="number" 
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateQtyDirect(item.cartId, e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1))}
                              onBlur={() => { if (!item.qty || Number(item.qty) < 1) updateQtyDirect(item.cartId, 1); }}
                              className="w-10 text-center text-xs font-black bg-transparent outline-none text-orange-500"
                            />
                            <button onClick={() => updateQty(item.cartId, 1)} className="p-1 active:scale-90"><Plus size={12}/></button>
                          </div>
                        </div>
                        <input type="text" placeholder="Catatan opsional..." value={item.note} onChange={(e) => updateItemNote(item.cartId, e.target.value)} className={`w-full text-xs p-2 rounded-xl border outline-none ${t.input}`} />
                      </div>
                    ))}
                  </div>
                  
                  <div className={`p-4 border-t pb-24 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
                    <div className="space-y-2 mb-3">
                      <input type="text" placeholder="Nama Pemesan *" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full p-3 text-xs font-bold rounded-xl border outline-none ${t.input}`} />
                      <input type="text" placeholder="Dine-in / Takeaway / Meja" value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} className={`w-full p-2.5 text-xs rounded-xl border outline-none ${t.input}`} />
                    </div>
                    <button 
                      disabled={cart.length === 0 || !customerName.trim()}
                      onClick={() => { setIsMobileCartOpen(false); setShowCheckout(true); }}
                      className={`w-full py-3.5 rounded-2xl flex justify-between items-center px-5 text-sm disabled:opacity-50 disabled:grayscale ${t.btnPrimary}`}
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

        {/* TAB: DAPUR (REVISI REDESAIN 2 KOLOM: ANTREAN AKTIF + REKAPITULASI PORSI HARIAN) */}
        {activeTab === 'dapur' && (
          <div className="animate-in fade-in h-full flex flex-col overflow-hidden pb-28 md:pb-0">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-xl md:text-2xl font-black flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-2xl"><ChefHat className="text-orange-500" size={24}/></div>
                Dapur & Koki Warung
              </h2>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${t.badgeOrange}`}>
                {orders.filter(o => o.status === 'Masuk').length} Pesanan Antrean
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 overflow-hidden">
              
              {/* KOLOM KIRI (60% LEBAR LAYAR): ANTREAN PESANAN MASUK ACTIVE + TOMBOL TIKET KOKI */}
              <div className={`lg:col-span-2 p-4 rounded-3xl border flex flex-col h-full overflow-hidden transition-colors duration-300 ${t.glassCard}`}>
                <h3 className="font-black uppercase tracking-wider text-xs text-orange-500 mb-3 pb-2 border-b border-zinc-500/20 flex justify-between items-center">
                  <span>📋 Antrean Pesanan Perlu Dimasak</span>
                  <span className="text-[10px] font-bold opacity-70">Klik Tiket Koki untuk cetak resep</span>
                </h3>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {orders.filter(o => o.status === 'Masuk').length === 0 ? (
                    <div className="text-center py-16 opacity-50 flex flex-col items-center">
                      <ChefHat size={48} className="mb-2 text-orange-500 opacity-40"/>
                      <p className="font-bold text-sm">Tidak ada antrean pesanan dapur saat ini</p>
                    </div>
                  ) : (
                    orders.filter(o => o.status === 'Masuk').map((order) => (
                      <div key={order.id} className={`p-4 rounded-2xl border-l-4 border-l-orange-500 border transition-all ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-3 pb-2 border-b border-zinc-500/10">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{order.id}</span>
                            <p className="text-base font-black mt-0.5">{order.customerName}</p>
                            <p className="text-[10px] font-bold opacity-70 flex items-center gap-1"><MapPin size={10}/> {order.address}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded-lg ${t.badgeOrange}`}>
                              <Clock size={12}/> {new Date(order.date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>

                        <ul className="space-y-2 mb-4">
                          {order.items.map((item, idx) => (
                            <li key={idx} className={`p-2 rounded-xl border text-xs font-bold ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                              <div className="flex justify-between items-center">
                                <span><span className="text-orange-500 font-black bg-orange-500/10 px-2 py-0.5 rounded-md mr-1.5">{item.qty}x</span> {item.name}</span>
                              </div>
                              {item.note && <div className={`text-[10px] font-bold italic mt-1.5 px-2 py-1 rounded-md ${t.badgeRed}`}>Catatan: {item.note}</div>}
                            </li>
                          ))}
                        </ul>

                        <div className="flex gap-2.5">
                          <button 
                            onClick={() => printKitchenTicket(order)} 
                            className="flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Printer size={14}/> Cetak Tiket Koki
                          </button>
                          
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'Selesai')} 
                            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 ${t.btnSuccess} flex items-center justify-center gap-1.5`}
                          >
                            <CheckCircle2 size={14}/> Tandai Selesai
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* KOLOM KANAN (40% LEBAR LAYAR): REKAPITULASI TOTAL PORSI DAPUR HARI INI */}
              <div className={`p-4 rounded-3xl border flex flex-col h-full overflow-hidden transition-colors duration-300 ${t.glassCard}`}>
                <h3 className="font-black uppercase tracking-wider text-xs text-emerald-500 mb-3 pb-2 border-b border-zinc-500/20 flex items-center justify-between">
                  <span>🍳 Rekapitulasi Porsi Dapur</span>
                  <span className="text-[10px] font-bold opacity-70">Antrean Aktif</span>
                </h3>

                <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
                  {kitchenPrepSummary.length === 0 ? (
                    <p className="text-xs opacity-50 text-center py-10">Belum ada porsi pesanan aktif</p>
                  ) : (
                    kitchenPrepSummary.map(([itemName, totalQty], idx) => (
                      <div key={idx} className={`p-3 rounded-2xl border flex justify-between items-center ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                        <span className="font-bold text-xs flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500"/>
                          {itemName}
                        </span>
                        <span className="font-black text-xs text-orange-500 bg-orange-500/10 px-3 py-1 rounded-xl">
                          {totalQty} Porsi
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: LAPORAN */}
        {activeTab === 'laporan' && (
          <div className="space-y-5 animate-in fade-in h-full overflow-y-auto pr-2 custom-scrollbar pb-28 md:pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-500/20 pb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-3">
                  <div className="p-2.5 bg-orange-500/10 rounded-2xl"><TrendingUp className="text-orange-500" size={24}/></div>
                  Dashboard Laporan Penjualan
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button onClick={() => setShowExportModal(true)} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider ${t.btnSuccess}`}>
                  <Download size={16}/> EXPORT / CETAK LAPORAN
                </button>
              </div>
            </div>

            {/* RINGKASAN CARD OMSET (SINKRON DENGAN PERIODE DROPDOWN) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-3xl border flex flex-col justify-center transition-colors duration-300 ${t.glassCard}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${t.textMuted}`}>Total Omset ({reportFilter})</p>
                <h3 className="text-xl md:text-2xl font-black text-emerald-500 drop-shadow-sm">{formatIDR(totalOmset)}</h3>
              </div>
              <div className={`p-4 rounded-3xl border flex flex-col justify-center transition-colors duration-300 ${t.glassCard}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${t.textMuted}`}>Total Transaksi</p>
                <h3 className="text-xl md:text-2xl font-black drop-shadow-sm">{activeOrdersForReport.length} Nota</h3>
              </div>
              <div className={`p-4 rounded-3xl border flex flex-col justify-center transition-colors duration-300 ${t.glassCard}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${t.textMuted}`}>Diskon Diberikan</p>
                <h3 className="text-xl md:text-2xl font-black text-red-500 drop-shadow-sm">{formatIDR(totalDiskonDiberikan)}</h3>
              </div>
              <div className={`p-4 rounded-3xl border flex flex-col justify-center transition-colors duration-300 ${t.glassCard}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${t.textMuted}`}>Rata-rata / Nota</p>
                <h3 className="text-xl md:text-2xl font-black text-orange-500 drop-shadow-sm">{formatIDR(activeOrdersForReport.length > 0 ? totalOmset / activeOrdersForReport.length : 0)}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className={`lg:col-span-2 p-5 rounded-3xl border transition-colors duration-300 flex flex-col justify-between ${t.glassCard}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-xs uppercase tracking-wider opacity-80 flex items-center gap-2">
                    📈 Grafik Tren Omset <span className="text-[10px] font-bold text-orange-500">({reportFilter})</span>
                  </h3>
                  <select value={reportFilter} onChange={e => setReportFilter(e.target.value)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer ${t.input}`}>
                    <option value="Harian">Harian (Hari Ini)</option>
                    <option value="Mingguan">Mingguan (7 Hari)</option>
                    <option value="Bulanan">Bulanan (Bulan Ini)</option>
                  </select>
                </div>
                <div className="h-64 md:h-80 w-full flex-1">
                  <SimpleAreaChart data={chartData} isDark={isDark} />
                </div>
              </div>

              <div className="space-y-5">
                {/* REVISI FITUR LAPORAN TAMBAHAN: WIDGET JAM SIBUK & BREAKDOWN KATEGORI */}
                <div className={`p-5 rounded-3xl border transition-colors duration-300 ${t.glassCard}`}>
                  <h3 className="font-black mb-3 text-xs uppercase tracking-wider opacity-80 flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500"/> Analisis Jam Sibuk Warung
                  </h3>
                  <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-orange-50 border-orange-200'}`}>
                    <p className="text-[10px] font-bold opacity-70 uppercase">Waktu Paling Ramai Pembeli</p>
                    <p className="text-base font-black text-orange-500 mt-1">{peakHourInsight}</p>
                  </div>
                </div>

                <div className={`p-5 rounded-3xl border transition-colors duration-300 ${t.glassCard}`}>
                  <h3 className="font-black mb-3 text-xs uppercase tracking-wider opacity-80">💳 Metode Bayar ({reportFilter})</h3>
                  <div className="py-2">
                    {pieData.length > 0 ? (
                      <SimpleDonutChart data={pieData} colors={COLORS} isDark={isDark} />
                    ) : (
                      <p className="text-xs opacity-50 text-center py-6">Belum ada data</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* REVISI BREAKDOWN KATEGORI OMSET */}
            {categorySalesBreakdown.length > 0 && (
              <div className={`p-5 rounded-3xl border transition-colors duration-300 ${t.glassCard}`}>
                <h3 className="font-black mb-4 text-xs uppercase tracking-wider opacity-80">📊 Breakdown Omset Berdasarkan Kategori</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {categorySalesBreakdown.map(cat => (
                    <div key={cat.category} className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-xs">{cat.category}</span>
                        <span className="font-bold text-[10px] text-orange-500">{cat.percentage}%</span>
                      </div>
                      <p className="text-lg font-black text-emerald-500">{formatIDR(cat.total)}</p>
                      <div className="w-full bg-zinc-500/20 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full" style={{width: `${cat.percentage}%`}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TABEL RINCIAN TRANSAKSI (DEFAULT HARI INI + FILTER PRESET KANBAN) */}
            <div className={`p-5 rounded-3xl border transition-colors duration-300 ${t.glassCard}`}>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 pb-3 border-b border-zinc-500/20">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                    📋 Riwayat Transaksi
                  </h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  {/* SEARCH BAR */}
                  <div className="relative flex-1 sm:flex-initial min-w-[160px]">
                    <Search size={14} className="absolute left-3 top-2.5 opacity-50" />
                    <input 
                      type="text" 
                      placeholder="Cari ID / Nama..." 
                      value={historySearchQuery}
                      onChange={e => setHistorySearchQuery(e.target.value)}
                      className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border outline-none ${t.input}`}
                    />
                  </div>

                  {/* DATE PICKER (FILTER TANGGAL SPESIFIK) */}
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="date"
                      value={historyDateFilter === 'ALL' ? '' : historyDateFilter}
                      onChange={e => setHistoryDateFilter(e.target.value || 'ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer ${isDark ? 'bg-zinc-900 border-zinc-700 text-orange-400' : 'bg-white border-slate-300 text-orange-600'}`}
                    />
                    
                    <button 
                      onClick={() => setHistoryDateFilter(getTodayFormattedDate())}
                      className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all active:scale-95 ${historyDateFilter === getTodayFormattedDate() ? 'bg-orange-500 text-white border-orange-500' : t.glassCard}`}
                    >
                      Hari Ini
                    </button>

                    <button 
                      onClick={() => setHistoryDateFilter('ALL')}
                      className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all active:scale-95 ${historyDateFilter === 'ALL' ? 'bg-orange-500 text-white border-orange-500' : t.glassCard}`}
                    >
                      Semua
                    </button>
                  </div>

                  {/* FILTER METHOD */}
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
                      <th className="py-3 px-4">No. Order / Waktu</th>
                      <th className="py-3 px-4">Pelanggan</th>
                      <th className="py-3 px-4">Pesanan</th>
                      <th className="py-3 px-4">Diskon</th>
                      <th className="py-3 px-4">Metode Bayar</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-500/10">
                    {filteredHistoryOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 opacity-40 font-bold">
                          Tidak ada transaksi untuk filter ini
                        </td>
                      </tr>
                    ) : (
                      filteredHistoryOrders.map((order) => (
                        <tr key={order.id} className={`hover:bg-zinc-500/5 transition-colors ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>
                          <td className="py-3 px-4">
                            <span className="font-black text-orange-500 block">{order.id}</span>
                            <span className="text-[10px] opacity-70">
                              {new Date(order.date).toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'})} • {new Date(order.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold">
                            <div>{order.customerName}</div>
                            <div className="text-[10px] opacity-60 font-normal">{order.address}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="max-w-[220px] truncate">
                              {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-red-500">
                            {order.discountAmount ? `- ${formatIDR(order.discountAmount)}` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider leading-none ${
                              order.method === 'Tunai' ? t.badgeGreen : order.method === 'QRIS' ? t.badgeOrange : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {order.method === 'Tunai' ? '💵 Tunai' : order.method === 'QRIS' ? '📱 QRIS' : '💳 Transfer'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-black text-sm text-emerald-500">
                            {formatIDR(order.total)}
                          </td>
                          <td className="py-3 px-4 text-center">
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

        {/* TAB: PENGATURAN (REVISI: ANTI DESAK-DESAKAN LAYAR HP 2 BARIS BERTINGKAT) */}
        {activeTab === 'pengaturan' && (
          <div className="animate-in fade-in max-w-5xl mx-auto space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar pb-28 md:pb-6">
            <h2 className="text-xl md:text-2xl font-black flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/10 rounded-2xl"><Settings className="text-orange-500" size={24}/></div>
              Pengaturan Sistem Warung
            </h2>
            
            <div className={`p-5 md:p-6 rounded-3xl border flex flex-col md:flex-row gap-6 items-center transition-colors duration-300 ${t.glassCard}`}>
              <div className="relative group cursor-pointer" onClick={() => profilePicRef.current.click()}>
                <img src={settings.profilePic} className="w-24 h-24 aspect-square max-w-[96px] max-h-[96px] rounded-[2rem] object-cover border-4 border-orange-500 shadow-xl shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300" alt="Profile"/>
                <div className="absolute inset-0 bg-black/60 rounded-[2rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white backdrop-blur-sm">
                  <ImageIcon size={20} className="mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Ubah Foto</span>
                </div>
                <input type="file" ref={profilePicRef} onChange={e => handleImageUpload(e, url => saveSettingsToCloud({...settings, profilePic: url}))} accept="image/*" className="hidden" />
              </div>
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 block mb-1">Nama Usaha / Warung</label>
                  <input type="text" value={settings.storeName} onChange={e => saveSettingsToCloud({...settings, storeName: e.target.value})} className={`w-full p-3.5 rounded-2xl border outline-none text-base font-black transition-all ${t.input}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 block mb-1">No. Telepon / WA Admin (Ditampilkan di Struk)</label>
                  <input type="text" value={settings.phone || ''} onChange={e => saveSettingsToCloud({...settings, phone: e.target.value})} placeholder="Cth: 0812-3456-7890" className={`w-full p-3.5 rounded-2xl border outline-none text-xs font-bold transition-all ${t.input}`} />
                </div>
              </div>
            </div>

            <div className={`p-5 md:p-6 rounded-3xl border transition-colors duration-300 ${t.glassCard}`}>
              <h3 className="font-black mb-5 text-xs uppercase tracking-wider opacity-80 border-b border-zinc-500/20 pb-3">Info Pembayaran (QRIS & Transfer)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-70">Upload Gambar QRIS (Galeri Lokal)</label>
                  <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all hover:border-orange-500 flex flex-col items-center justify-center h-48 ${isDark ? 'border-zinc-700 bg-zinc-950/50' : 'border-slate-300 bg-slate-50'}`} onClick={() => qrisPicRef.current.click()}>
                    {settings.qrisPic ? (
                      <img src={settings.qrisPic} className="max-h-28 object-contain mb-2 rounded-xl bg-white p-2 shadow-sm" alt="QRIS" />
                    ) : (
                      <div className="text-zinc-500 mb-2 text-xs">Upload Foto QRIS</div>
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${t.badgeOrange}`}>Klik Ganti QRIS</span>
                    <input type="file" ref={qrisPicRef} onChange={e => handleImageUpload(e, url => saveSettingsToCloud({...settings, qrisPic: url}))} accept="image/*" className="hidden" />
                  </div>
                </div>
                <div className="space-y-4 flex flex-col justify-center">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-70">Nama Bank (Cth: BCA)</label>
                    <input type="text" value={settings.bankName} onChange={e => saveSettingsToCloud({...settings, bankName: e.target.value})} className={`w-full p-3.5 rounded-2xl border outline-none text-xs transition-all ${t.input}`} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-70">No. Rekening & Atas Nama</label>
                    <input type="text" value={settings.bankAccount} onChange={e => saveSettingsToCloud({...settings, bankAccount: e.target.value})} className={`w-full p-3.5 rounded-2xl border outline-none text-xs transition-all ${t.input}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* REVISI DESAIN DAFTAR MENU DI HP: LAYOUT 2 BARIS AGAR TIDAK DESAK-DESAKAN */}
            <div className={`p-5 md:p-6 rounded-3xl border transition-colors duration-300 ${t.glassCard}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4 border-b border-zinc-500/20 pb-4">
                <h3 className="font-black text-xs uppercase tracking-wider opacity-80">Manajemen Daftar Menu</h3>
                <button 
                  onClick={() => handleOpenMenuModal()}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${t.btnPrimary}`}
                >
                  <Plus size={16}/> Tambah Menu
                </button>
              </div>
              
              <div className="space-y-3">
                {menus.map(menu => (
                  <div key={menu.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border gap-3 transition-colors ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    {/* BARIS ATAS / KIRI: FOTO & NAMA MENU */}
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      <div className="w-12 h-12 flex justify-center items-center bg-zinc-500/10 rounded-2xl text-2xl shadow-sm border border-zinc-500/20 overflow-hidden flex-shrink-0">
                        {typeof menu.image === 'string' && (menu.image.startsWith('http') || menu.image.startsWith('blob:') || menu.image.startsWith('data:')) 
                          ? <img src={menu.image} className="w-full h-full object-cover" alt={menu.name} /> 
                          : (menu.image || '🍽️')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-sm leading-tight">{menu.name}</p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${t.badgeOrange}`}>{menu.category}</span>
                        </div>
                        <p className="text-xs text-orange-500 font-black mt-0.5">{formatIDR(menu.price)}</p>
                      </div>
                    </div>

                    {/* BARIS BAWAH / KANAN: SAKLAR STOK & TOMBOL ACTION (LEGA DI HP) */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-500/10">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold opacity-70">{menu.isAvailable ? 'Tersedia' : 'Habis'}</span>
                        <button 
                          onClick={() => toggleMenuAvailability(menu.id, menu.isAvailable)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex-shrink-0 shadow-inner ${menu.isAvailable ? 'bg-emerald-500' : isDark ? 'bg-zinc-700' : 'bg-slate-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-0.5 ${menu.isAvailable ? 'left-5.5' : 'left-0.5'}`}/>
                        </button>
                      </div>
                      
                      <div className={`flex border rounded-xl overflow-hidden shadow-sm ${t.glassCard}`}>
                        <button onClick={() => handleOpenMenuModal(menu)} className="p-2 px-3 hover:text-orange-500 hover:bg-orange-500/10 transition-colors active:bg-orange-500/20"><Edit3 size={15}/></button>
                        <div className="w-px bg-zinc-500/20"></div>
                        <button onClick={() => handleDeleteMenu(menu.id)} className="p-2 px-3 hover:text-red-500 hover:bg-red-500/10 transition-colors active:bg-red-500/20"><Trash2 size={15}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-3xl border border-red-500/30 transition-colors duration-300 ${t.glassCard}`}>
              <h3 className="font-black mb-2 text-xs uppercase tracking-wider text-red-500 flex items-center gap-2">
                ⚠️ Pembersihan & Reset Data
              </h3>
              <p className={`text-xs mb-5 ${t.textMuted}`}>
                Gunakan fitur ini jika ingin memulai operasional warung dari 0 atau menyerahkan aplikasi ke pemilik baru.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setResetModalConfig({ isOpen: true, type: 'transactions', payload: null })}
                  className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500 hover:text-white text-orange-500 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-left flex flex-col justify-between cursor-pointer"
                >
                  <span className="font-black text-xs mb-1 flex items-center gap-2"><RefreshCw size={15}/> Clear Riwayat Transaksi</span>
                  <span className="text-[10px] opacity-80 mt-2">Menghapus nota kasir & laporan keuangan (Omset jadi Rp 0). Katalog menu & profil warung tetap aman.</span>
                </button>

                <button
                  onClick={() => setResetModalConfig({ isOpen: true, type: 'factory', payload: null })}
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-500 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-left flex flex-col justify-between cursor-pointer"
                >
                  <span className="font-black text-xs mb-1 flex items-center gap-2"><Trash2 size={15}/> Reset Total Aplikasi</span>
                  <span className="text-[10px] opacity-80 mt-2">Menghapus SELURUH data (Nama Warung, WA, Menu, Omset dikosongkan total 100%).</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MOBILE BOTTOM NAV (KHUSUS LAYAR HP KHUSUS < 768px) */}
      <nav className={`md:hidden fixed bottom-3 left-4 right-4 rounded-3xl border flex justify-around p-1.5 z-30 backdrop-blur-2xl transition-all duration-300 shadow-2xl ${
        isDark 
          ? 'bg-zinc-900/80 border-zinc-800/80 shadow-black/60' 
          : 'bg-white/80 border-slate-200/80 shadow-slate-300/50'
      }`}>
        {[
          { id: 'pos', icon: ShoppingCart, label: 'Kasir' },
          { id: 'dapur', icon: ChefHat, label: 'Dapur' },
          { id: 'laporan', icon: BarChart2, label: 'Laporan' },
          { id: 'pengaturan', icon: Settings, label: 'Setelan' },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 p-1.5 w-[68px] rounded-2xl transition-all duration-300 active:scale-90 ${
              activeTab === item.id 
                ? 'text-orange-500 bg-orange-500/15 shadow-sm font-black' 
                : t.textMuted
            }`}
          >
            <item.icon size={18} className={activeTab === item.id ? 'fill-orange-500/20' : ''} />
            <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL RESET KONFIRMASI */}
      {resetModalConfig.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[80] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className={`w-full max-w-sm rounded-[2rem] shadow-2xl relative flex flex-col p-6 text-center border transition-transform slide-in-from-bottom-6 ${t.glassPanel}`}>
            <div className="mx-auto w-14 h-14 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 shadow-lg shadow-red-500/20">
              {resetModalConfig.type === 'factory' ? <ShieldAlert size={32} /> : <AlertTriangle size={32} />}
            </div>

            <h3 className="text-base font-black uppercase tracking-wide text-red-500 mb-2">
              {resetModalConfig.type === 'factory' 
                ? 'Konfirmasi Reset Total' 
                : resetModalConfig.type === 'transactions'
                ? 'Clear Semua Transaksi?'
                : `Hapus Order ${resetModalConfig.payload?.id}?`}
            </h3>

            <p className={`text-xs mb-6 leading-relaxed ${t.textMuted}`}>
              {resetModalConfig.type === 'factory' 
                ? 'Tindakan ini akan MENGHAPUS SEMUA DATA: Profil Warung, Katalog Menu, dan Omset dikosongkan total.'
                : resetModalConfig.type === 'transactions'
                ? 'Semua riwayat pesanan & laporan keuangan akan dihapus. Katalog Menu tetap aman.'
                : `Nota pesanan ${resetModalConfig.payload?.id} atas nama "${resetModalConfig.payload?.customerName}" (${formatIDR(resetModalConfig.payload?.total || 0)}) akan dihapus permanen.`}
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setResetModalConfig({ isOpen: false, type: '', payload: null })}
                className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider border transition-all active:scale-95 ${isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-300 text-slate-700'}`}
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
                className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all active:scale-95"
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
          <div className={`w-full max-w-sm rounded-[2rem] shadow-2xl relative flex flex-col p-6 transition-transform slide-in-from-bottom-8 ${t.glassPanel}`}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-black flex items-center gap-2"><Edit3 className="text-orange-500" size={20}/> {editingMenu ? 'Edit Menu' : 'Tambah Menu'}</h2>
              <button onClick={() => setShowMenuModal(false)} className={`p-2 rounded-full border transition-colors hover:bg-zinc-500/20 active:scale-90 ${isDark ? 'border-zinc-700' : 'border-slate-300'}`}><X size={18}/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-70">Nama Menu</label>
                <input type="text" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} className={`w-full p-3 rounded-2xl border outline-none text-xs font-bold ${t.input}`} placeholder="Cth: Ayam Geprek" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-70">Harga (Rp)</label>
                  <input type="number" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} className={`w-full p-3 rounded-2xl border outline-none text-xs font-bold ${t.input}`} />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-70">Kategori</label>
                    <button 
                      type="button"
                      onClick={() => setIsCustomCategoryMode(!isCustomCategoryMode)}
                      className="text-[9px] font-bold text-orange-500 hover:underline"
                    >
                      {isCustomCategoryMode ? 'Dropdown' : '+ Baru'}
                    </button>
                  </div>

                  {isCustomCategoryMode ? (
                    <input 
                      type="text"
                      placeholder="Kategori baru..."
                      value={customCategoryInput}
                      onChange={e => setCustomCategoryInput(e.target.value)}
                      className={`w-full p-3 rounded-2xl border outline-none text-xs font-bold ${t.input}`}
                    />
                  ) : (
                    <select 
                      value={menuForm.category} 
                      onChange={e => {
                        if (e.target.value === 'NEW') {
                          setIsCustomCategoryMode(true);
                        } else {
                          setMenuForm({...menuForm, category: e.target.value});
                        }
                      }} 
                      className={`w-full p-3 rounded-2xl border outline-none text-xs font-bold ${t.input}`}
                    >
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="NEW">+ Kategori Baru...</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-70">Gambar (Upload / Emoji)</label>
                <div className="flex gap-3 items-center">
                  <div 
                    className={`w-14 h-14 flex items-center justify-center text-2xl rounded-2xl border-2 border-dashed cursor-pointer transition-colors hover:border-orange-500 overflow-hidden ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-slate-300 bg-slate-100'}`}
                    onClick={() => menuImageRef.current.click()}
                  >
                    {typeof menuForm.image === 'string' && (menuForm.image.startsWith('http') || menuForm.image.startsWith('blob:') || menuForm.image.startsWith('data:')) 
                      ? <img src={menuForm.image} className="w-full h-full object-cover" alt="preview"/> 
                      : (menuForm.image || <ImageIcon size={18} className="opacity-50"/>)}
                  </div>
                  <input type="file" ref={menuImageRef} onChange={e => handleImageUpload(e, url => setMenuForm({...menuForm, image: url}))} accept="image/*" className="hidden" />
                  <div className="flex-1">
                    <input type="text" value={typeof menuForm.image === 'string' ? menuForm.image : ''} onChange={e => setMenuForm({...menuForm, image: e.target.value})} className={`w-full p-3 rounded-2xl border outline-none text-xs ${t.input}`} placeholder="Ketik emoji 🍗 atau upload foto" />
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSaveMenu} className={`w-full py-3.5 rounded-2xl mt-6 text-xs font-bold uppercase tracking-wider ${t.btnPrimary}`}>
              {editingMenu ? 'Simpan Perubahan' : 'Tambahkan Menu'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CHECKOUT */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className={`w-full max-w-md rounded-[2rem] shadow-2xl relative flex flex-col max-h-[90vh] transition-transform slide-in-from-bottom-8 ${t.glassPanel}`}>
            
            <div className="flex justify-between items-center p-5 border-b border-zinc-500/20">
              <h2 className="text-lg font-black flex items-center gap-2"><CreditCard className="text-orange-500" size={20}/> Checkout</h2>
              <button onClick={() => setShowCheckout(false)} className={`p-2 rounded-full border transition-colors hover:bg-zinc-500/20 active:scale-90 ${isDark ? 'border-zinc-700' : 'border-slate-300'}`}><X size={18} /></button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              <div className={`p-4 rounded-3xl mb-5 text-center border shadow-inner flex flex-col gap-1 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted}`}>Tagihan: <span className={t.text}>{customerName}</span></p>
                <h3 className="text-3xl font-black text-orange-500 mt-1 drop-shadow-sm">{formatIDR(totalTagihan)}</h3>
                
                {calculatedDiscount > 0 && (
                  <p className="text-[10px] text-emerald-500 font-black mt-1 bg-emerald-500/10 self-center px-3 py-0.5 rounded-full">
                    Termasuk Diskon -{formatIDR(calculatedDiscount)}
                  </p>
                )}
                {extraCharge > 0 && (
                  <p className="text-[10px] text-red-500 font-black mt-1 bg-red-500/10 self-center px-3 py-0.5 rounded-full">
                    + Biaya Tambahan {formatIDR(extraCharge)}
                  </p>
                )}
              </div>

              <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-70">Metode Pembayaran</label>
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                {['Tunai', 'QRIS', 'Transfer'].map(method => (
                  <button 
                    key={method}
                    onClick={() => { setPaymentMethod(method); setCashGiven(method==='Tunai'?0:totalTagihan); }}
                    className={`p-3 rounded-2xl border-2 font-black text-xs transition-all duration-300 flex flex-col items-center justify-center gap-1.5 active:scale-95
                      ${paymentMethod === method ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-md shadow-orange-500/20' : `border-transparent ${isDark?'bg-zinc-900':'bg-slate-100'}`}`}
                  >
                    <span className="text-xl drop-shadow-sm">{method==='Tunai'?'💵':method==='QRIS'?'📱':'💳'}</span> {method}
                  </button>
                ))}
              </div>

              {paymentMethod === 'Tunai' ? (
                <div className="animate-in slide-in-from-bottom-4 space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-70">Saran Nominal Cepat</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[totalTagihan, 20000, 50000, 100000].map(nom => (
                        <button key={nom} onClick={() => setCashGiven(nom)} className={`p-2.5 rounded-2xl border font-bold text-xs transition-all duration-300 hover:border-orange-500 hover:text-orange-500 active:scale-95 ${nom===100000?'col-span-3':''} ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                          {nom === totalTagihan ? 'Uang Pas' : formatIDR(nom)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block opacity-70">Atau Ketik Manual (Rp)</label>
                    <input 
                      type="number" 
                      value={cashGiven || ''}
                      onChange={(e) => setCashGiven(Number(e.target.value))}
                      placeholder="Cth: 35000"
                      className={`w-full p-3.5 rounded-2xl border text-lg font-black outline-none transition-all ${t.input}`}
                    />
                  </div>
                  
                  {!isCashSufficient && cashGiven > 0 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center animate-pulse">
                      <p className="text-red-500 text-xs font-bold">Uang kurang {formatIDR(totalTagihan - cashGiven)}</p>
                    </div>
                  )}
                  {isCashSufficient && cashGiven > totalTagihan && (
                    <div className="flex justify-between items-center p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shadow-inner">
                      <span className="text-emerald-500 font-black text-xs uppercase tracking-widest">Kembalian:</span>
                      <span className="text-emerald-500 font-black text-xl drop-shadow-sm">{formatIDR(kembalian)}</span>
                    </div>
                  )}
                </div>
              ) : paymentMethod === 'QRIS' ? (
                 <div className="animate-in slide-in-from-bottom-4 flex flex-col items-center justify-center p-3">
                    <div className="bg-white p-3 rounded-3xl shadow-xl shadow-orange-500/20 border-4 border-orange-500 mb-3">
                      {settings.qrisPic ? (
                        <img src={settings.qrisPic} className="w-44 h-44 object-contain rounded-xl" alt="QRIS" />
                      ) : (
                        <div className="w-44 h-44 flex items-center justify-center text-xs font-bold text-gray-500">Upload Foto QRIS</div>
                      )}
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${t.textMuted} animate-pulse`}>Silakan pelanggan scan QRIS</p>
                 </div>
              ) : (
                 <div className="animate-in slide-in-from-bottom-4 bg-blue-500/10 border border-blue-500/20 p-5 rounded-3xl text-center shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2 opacity-80">Transfer ke Rekening:</p>
                    <p className="text-2xl font-black text-blue-500 mb-1 drop-shadow-sm">{settings.bankName || 'BCA'}</p>
                    <p className="text-lg font-black text-white bg-blue-500 px-4 py-2 rounded-2xl inline-block shadow-md select-all">{settings.bankAccount || '-'}</p>
                 </div>
              )}
            </div>

            <div className="p-5 border-t border-zinc-500/20">
              <button 
                onClick={handleCheckout}
                disabled={!isCashSufficient}
                className={`w-full py-3.5 rounded-2xl text-base font-black flex items-center justify-center gap-2 uppercase tracking-wider ${t.btnSuccess} disabled:opacity-50 disabled:grayscale`}
              >
                <Printer size={18} /> Konfirmasi Bayar & Cetak
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
              
              {currentOrderReceipt.discountAmount > 0 && (
                <div className="flex justify-between font-bold text-red-600">
                  <span>Diskon</span><span>-{formatIDR(currentOrderReceipt.discountAmount)}</span>
                </div>
              )}

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
                <div className="flex justify-between"><span className={t.textMuted}>Filter Tanggal Active:</span><span className="font-bold">{historyDateFilter === 'ALL' ? 'Semua Tanggal' : historyDateFilter}</span></div>
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
                📄 Cetak / Export PDF (A4)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRINT / PDF REPORT PREVIEW (FIXED STICKY TOP CONTROL BAR + MULTI PAGE A4 SINKRON FILTER) */}
      {showPdfReportModal && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex flex-col backdrop-blur-xl overflow-hidden animate-in fade-in print:bg-white print:p-0 print:block">
          
          {/* HEADER KONTROL TOMBOL CETAK & TUTUP (TERKUNCI KOKOH DI ATAS / STICKY TOP) */}
          <div className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center text-white print:hidden flex-shrink-0">
            <div className="flex items-center gap-2">
              <Printer className="text-orange-500" size={20} />
              <span className="font-black text-sm uppercase tracking-wider">Preview & Cetak PDF Laporan</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.print()} 
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/30 active:scale-95 transition-all"
              >
                <Printer size={16}/> Cetak / Simpan PDF
              </button>
              <button 
                onClick={() => setShowPdfReportModal(false)} 
                className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-300 active:scale-90 transition-all"
              >
                <X size={18}/>
              </button>
            </div>
          </div>

          {/* AREA DOKUMEN KERTAS BER-SCROLL MANDIRI */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar print:p-0 print:overflow-visible">
            <div className="w-full max-w-4xl bg-white text-slate-800 p-6 md:p-10 relative font-sans shadow-2xl print:shadow-none mx-auto rounded-2xl print:rounded-none print:w-full">
              
              {/* HEADER LAPORAN */}
              <div className="flex justify-between items-center border-b-2 border-slate-800 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <img src={settings.profilePic} className="w-12 h-12 aspect-square max-w-[48px] max-h-[48px] rounded-2xl object-cover border-2 border-orange-500 flex-shrink-0" alt="Logo" />
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">{settings.storeName}</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Laporan Penjualan Resmi {settings.phone ? `• Telp: ${settings.phone}` : ''}</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-slate-700">Tanggal: {historyDateFilter === 'ALL' ? 'Semua Tanggal' : historyDateFilter}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">Filter Bayar: {exportPaymentFilter}</p>
                  <p className="text-slate-400 text-[10px]">Dicetak: {new Date().toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* CARDS SUMMARY LAPORAN */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Total Omset Net</p>
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

              {/* TABLE LIST MULTI-PAGE PRINT */}
              {(exportPaymentFilter === 'ALL' ? ['Tunai', 'QRIS', 'Transfer'] : [exportPaymentFilter]).map(method => {
                const mOrders = filteredOrdersForExport.filter(o => o.method === method);
                if (mOrders.length === 0) return null;
                const mTotal = mOrders.reduce((sum, o) => sum + o.total, 0);

                return (
                  <div key={method} className="mb-8 print-page-break">
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
                          <th className="p-2.5 text-right">Diskon</th>
                          <th className="p-2.5 text-right">Total Net</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {mOrders.map(o => (
                          <tr key={o.id} className="print-page-break">
                            <td className="p-2.5 font-bold text-orange-600">{o.id}</td>
                            <td className="p-2.5 text-[10px] text-slate-500">{new Date(o.date).toLocaleDateString('id-ID')} {new Date(o.date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</td>
                            <td className="p-2.5 font-bold">{o.customerName} <span className="font-normal text-slate-500">({o.address})</span></td>
                            <td className="p-2.5 text-[11px]">{o.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</td>
                            <td className="p-2.5 text-right text-red-600">{o.discountAmount ? `- ${formatIDR(o.discountAmount)}` : '-'}</td>
                            <td className="p-2.5 text-right font-bold text-emerald-600">{formatIDR(o.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}

              {/* FOOTER PENANGGUNG JAWAB */}
              <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end text-xs print-page-break">
                <div className="text-slate-400 text-[10px]">
                  Dokumen ini dihasilkan secara otomatis oleh Sistem POS Warung.
                </div>
                <div className="text-center w-48">
                  <p className="text-slate-500 mb-12">Penanggung Jawab,</p>
                  <p className="font-bold text-slate-800 underline uppercase">{settings.storeName}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* OVERRIDE SCROLLBAR & FORMAT CETAK PRINTER A4 MULTI-PAGE SINKRON */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f97316; border-radius: 10px; opacity: 0.3; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { opacity: 0.8; }
        
        @media print {
          html, body, #root, div {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .print-page-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}} />
    </div>
  );
}