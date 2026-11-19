import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { supabase } from './supabase';
import Login from './Login';
import Header from './components/Header';
import KasirTab from './components/KasirTab';
import RiwayatTab from './components/RiwayatTab';
import MenuTab from './components/MenuTab';
import LaporanTab from './components/LaporanTab';
import {
  CheckoutModal,
  UnifiedReceiptModal,
  MenuFormModal,
  SettingsModal,
  ConfirmResetModal,
  PdfReportModal,
} from './components/Modals';
import { getTodayFormattedDate } from './utils/formatters';
import {
  connectBluetoothDevice,
  buildCustomerReceiptEscPos,
  buildKitchenTicketEscPos,
  sendEscPosToCharOrFallback,
} from './utils/bluetoothPrinter';
import { exportOrdersToExcel } from './utils/exportExcel';
import {
  DEFAULT_THEME,
  loadThemePrefs,
  saveThemePrefs,
  applyThemeToDocument,
} from './utils/theme';

const VALID_TABS = ['pos', 'riwayat', 'menu', 'laporan'];

const mapOrderRow = (o) => ({
  id: o.id,
  date: o.date,
  customerName: o.customer_name,
  address: o.address,
  items: o.items || [],
  subTotal: Number(o.sub_total) || 0,
  discountAmount: Number(o.discount_amount) || 0,
  extraCharge: Number(o.extra_charge) || 0,
  total: Number(o.total) || 0,
  method: o.method,
  cashGiven: Number(o.cash_given) || 0,
  kembalian: Number(o.kembalian) || 0,
  status: o.status,
});

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('pos_active_tab');
    return VALID_TABS.includes(saved) ? saved : 'pos';
  });

  useEffect(() => {
    localStorage.setItem('pos_active_tab', activeTab);
  }, [activeTab]);

  const [theme, setTheme] = useState(loadThemePrefs);

  useEffect(() => {
    applyThemeToDocument(theme);
    saveThemePrefs(theme);
  }, [theme]);

  const handleUpdateTheme = useCallback((patch) => {
    setTheme((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleToggleThemeMode = useCallback(() => {
    setTheme((prev) => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categoriesList, setCategoriesList] = useState([
    'Makanan',
    'Minuman',
    'Tambahan',
  ]);
  const [settings, setSettings] = useState({
    storeName: 'Warung Cobek Geprek',
    phone: '0812-3456-7890',
    profilePic: '/pwa-192x192.png',
    qrisPic: '',
    bankName: 'BCA',
    bankAccount: '1234567890 a/n Bapak Geprek',
  });

  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const handleResetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
    showToast('Tema dikembalikan ke pengaturan awal.', 'success');
  }, [showToast]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) {
        setSettings({
          storeName: data.store_name || 'Warung Cobek Geprek',
          phone: data.phone || '',
          profilePic: data.profile_pic || '/pwa-192x192.png',
          qrisPic: data.qris_pic || '',
          bankName: data.bank_name || '',
          bankAccount: data.bank_account || '',
        });
      }
    } catch {
      // Keep default settings if record is missing
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('name');
    if (data && data.length > 0) {
      setCategoriesList(data.map((c) => c.name));
    }
  }, []);

  const fetchMenus = useCallback(async () => {
    const { data } = await supabase
      .from('menus')
      .select('*')
      .order('id', { ascending: true });
    if (data) {
      setMenus(
        data.map((m) => ({
          id: m.id,
          name: m.name,
          price: Number(m.price) || 0,
          category: m.category,
          image: m.image,
          isAvailable: m.is_available,
        }))
      );
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setOrders(data.map(mapOrderRow));
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setCheckingAuth(false);
    });

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    void Promise.resolve().then(() => {
      fetchSettings();
      fetchCategories();
      fetchMenus();
      fetchOrders();
    });

    const ordersSubscription = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrd = mapOrderRow(payload.new);
            setOrders((prev) => [
              newOrd,
              ...prev.filter((o) => o.id !== newOrd.id),
            ]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapOrderRow(payload.new);
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const menusSubscription = supabase
      .channel('public:menus')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menus' },
        () => {
          fetchMenus();
        }
      )
      .subscribe();

    return () => {
      authSub.unsubscribe();
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(menusSubscription);
    };
  }, [fetchSettings, fetchCategories, fetchMenus, fetchOrders]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowSettingsModal(false);
    setCurrentUser(null);
  };

  const saveSettingsToCloud = async (newSettings, silent = false) => {
    setSettings(newSettings);
    const { error } = await supabase.from('settings').upsert({
      id: 1,
      store_name: newSettings.storeName,
      phone: newSettings.phone,
      profile_pic: newSettings.profilePic,
      qris_pic: newSettings.qrisPic,
      bank_name: newSettings.bankName,
      bank_account: newSettings.bankAccount,
    });
    if (error) {
      showToast('Gagal menyimpan pengaturan: ' + error.message, 'error');
      return;
    }
    if (!silent) {
      showToast('Pengaturan warung berhasil disimpan.', 'success');
    }
  };

  // --- PWA INSTALL ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () =>
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // --- BLUETOOTH PRINTER ---
  const [btDevice, setBtDevice] = useState(null);
  const [btPrintChar, setBtPrintChar] = useState(null);
  const [btStatus, setBtStatus] = useState('Terputus');

  const handleConnectBluetooth = async () => {
    if (btDevice?.gatt?.connected && btPrintChar) {
      setBtStatus('Terhubung');
      return btPrintChar;
    }

    setBtStatus('Menghubungkan...');
    const res = await connectBluetoothDevice(btDevice, btPrintChar);
    if (!res.supported) {
      setBtStatus('Terputus');
      showToast('Browser ini belum mendukung Web Bluetooth API.', 'error');
      return null;
    }

    setBtDevice(res.device);
    setBtPrintChar(res.characteristic);
    setBtStatus(res.status);
    if (res.status === 'Terhubung') {
      showToast('Printer thermal Bluetooth terhubung.', 'success');
    }
    return res.characteristic;
  };

  const handlePrintCashierBT = async (orderReceipt) => {
    let char = btPrintChar;
    if (!char || !btDevice?.gatt?.connected) {
      char = await handleConnectBluetooth();
    }
    const text = buildCustomerReceiptEscPos(orderReceipt, settings);
    await sendEscPosToCharOrFallback(char, text);
  };

  const handlePrintKitchenBT = async (orderTicket) => {
    let char = btPrintChar;
    if (!char || !btDevice?.gatt?.connected) {
      char = await handleConnectBluetooth();
    }
    const text = buildKitchenTicketEscPos(orderTicket);
    await sendEscPosToCharOrFallback(char, text);
  };

  // --- STATE MODUL KASIR ---
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('Semua');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState('Di Tempat');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [discountType, setDiscountType] = useState('rp');
  const [discountValue, setDiscountValue] = useState(0);

  // --- STATE CHECKOUT & DUAL-TAB RECEIPT MODAL ---
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [cashGiven, setCashGiven] = useState(0);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const [receiptModalOrder, setReceiptModalOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceiptTab, setActiveReceiptTab] = useState('kasir');

  // --- STATE MODUL MENU & SETTINGS MODAL ---
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    price: '',
    category: 'Makanan',
    image: '🍽️',
    isAvailable: true,
  });
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [resetModalConfig, setResetModalConfig] = useState({
    isOpen: false,
    type: '',
    payload: null,
  });

  // --- STATE MODUL RIWAYAT ---
  const [historyStartDate, setHistoryStartDate] = useState(getTodayFormattedDate);
  const [historyEndDate, setHistoryEndDate] = useState(getTodayFormattedDate);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('ALL');

  // --- STATE MODUL LAPORAN & PDF PREVIEW ---
  const [reportFilter, setReportFilter] = useState('Hari Ini');
  const [reportStartDate, setReportStartDate] = useState(getTodayFormattedDate);
  const [reportEndDate, setReportEndDate] = useState(getTodayFormattedDate);
  const [reportPaymentFilter, setReportPaymentFilter] = useState('ALL');

  const [showPdfReportModal, setShowPdfReportModal] = useState(false);
  const [pdfModalData, setPdfModalData] = useState({
    orders: [],
    periodLabel: '',
    printedAtLabel: '',
  });

  // --- CART OPERATIONS ---
  const addToCart = (menu) => {
    if (!menu.isAvailable) return;
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === menu.id && item.note === ''
      );
      if (existingIndex >= 0) {
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, qty: Number(item.qty) + 1 } : item
        );
      }
      return [
        ...prev,
        { ...menu, qty: 1, note: '', cartId: Date.now() + Math.random() },
      ];
    });
  };

  const updateQty = (cartId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const currentQty = Number(item.qty) || 1;
            const newQty = currentQty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const updateQtyDirect = (cartId, value) => {
    setCart((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, qty: value } : item))
    );
  };

  const updateItemNote = (cartId, note) => {
    setCart((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, note } : item))
    );
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setDeliveryAddress('');
    setDiscountValue(0);
  };

  const subTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * (Number(item.qty) || 0),
        0
      ),
    [cart]
  );

  const calculatedDiscount = useMemo(() => {
    const val = Number(discountValue) || 0;
    if (val <= 0) return 0;
    if (discountType === 'percent') {
      return Math.round((subTotal * Math.min(val, 100)) / 100);
    }
    return Math.min(val, subTotal);
  }, [subTotal, discountType, discountValue]);

  const totalTagihan = Math.max(0, subTotal - calculatedDiscount);
  const kembalian = cashGiven - totalTagihan;
  const isCashSufficient = paymentMethod !== 'Tunai' || cashGiven >= totalTagihan;

  const filteredMenus = useMemo(() => {
    const q = menuSearchQuery.toLowerCase().trim();
    return menus.filter((m) => {
      const matchesCategory =
        selectedCategoryTab === 'Semua' || m.category === selectedCategoryTab;
      const matchesSearch = !q || m.name.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [menus, selectedCategoryTab, menuSearchQuery]);

  // --- CHECKOUT HANDLER ---
  const handleOpenCheckout = () => {
    if (orderType === 'Delivery') {
      if (!customerName.trim() && !deliveryAddress.trim()) {
        showToast(
          'Mohon isi nama pemesan dan alamat tujuan untuk pesanan Delivery.',
          'error'
        );
        return;
      }
      if (!customerName.trim()) {
        showToast('Mohon isi nama pemesan untuk pesanan Delivery.', 'error');
        return;
      }
      if (!deliveryAddress.trim()) {
        showToast('Mohon isi alamat tujuan untuk pesanan Delivery.', 'error');
        return;
      }
    }
    setPaymentMethod('Tunai');
    setCashGiven(totalTagihan);
    setShowCheckout(true);
  };

  const handleConfirmPay = async () => {
    if (!isCashSufficient || cart.length === 0 || submittingOrder) return;
    if (
      orderType === 'Delivery' &&
      (!customerName.trim() || !deliveryAddress.trim())
    ) {
      showToast(
        'Nama pemesan dan alamat tujuan wajib diisi untuk pesanan Delivery.',
        'error'
      );
      return;
    }
    setSubmittingOrder(true);

    const nextNum =
      orders.reduce((max, o) => {
        const num = parseInt(String(o.id).replace(/[^0-9]/g, ''), 10);
        return !Number.isNaN(num) && num > max ? num : max;
      }, 1000) + 1;

    const finalCustomerName = customerName.trim() || 'Pelanggan';
    const finalAddress =
      orderType === 'Delivery'
        ? `Delivery - ${deliveryAddress.trim()}`
        : orderType;

    const newOrder = {
      id: `ORD-${nextNum}`,
      date: new Date().toISOString(),
      customerName: finalCustomerName,
      address: finalAddress,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        category: i.category,
        qty: Number(i.qty) || 1,
        note: i.note || '',
      })),
      subTotal,
      discountAmount: calculatedDiscount,
      extraCharge: 0,
      total: totalTagihan,
      method: paymentMethod,
      cashGiven: paymentMethod === 'Tunai' ? cashGiven : totalTagihan,
      kembalian: paymentMethod === 'Tunai' ? Math.max(0, kembalian) : 0,
      status: 'Masuk',
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
      status: newOrder.status,
    });

    setSubmittingOrder(false);

    if (error) {
      showToast('Gagal menyimpan transaksi: ' + error.message, 'error');
      return;
    }

    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    setShowCheckout(false);
    setCart([]);
    setCustomerName('');
    setDeliveryAddress('');
    setDiscountValue(0);
    setCashGiven(0);

    setReceiptModalOrder(newOrder);
    setActiveReceiptTab('kasir');
    setShowReceiptModal(true);
    showToast(`Transaksi ${newOrder.id} berhasil disimpan`, 'success');
  };

  const handleOpenReceiptFromHistory = (order, initialTab = 'kasir') => {
    setReceiptModalOrder(order);
    setActiveReceiptTab(initialTab);
    setShowReceiptModal(true);
  };

  // --- MENU CRUD ---
  const handleOpenMenuModal = (menu = null) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuForm({ ...menu });
      setIsCustomCategoryMode(false);
      setCustomCategoryInput('');
    } else {
      setEditingMenu(null);
      setMenuForm({
        name: '',
        price: '',
        category: categoriesList[0] || 'Makanan',
        image: '🍽️',
        isAvailable: true,
      });
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
      const { error } = await supabase
        .from('menus')
        .update({
          name: menuForm.name,
          price: Number(menuForm.price),
          category: finalCategory,
          image: menuForm.image,
          is_available: menuForm.isAvailable,
        })
        .eq('id', editingMenu.id);

      if (error) {
        showToast('Gagal mengedit menu: ' + error.message, 'error');
        return;
      }
      showToast('Menu berhasil diperbarui.', 'success');
    } else {
      const { error } = await supabase.from('menus').insert([
        {
          name: menuForm.name,
          price: Number(menuForm.price),
          category: finalCategory,
          image: menuForm.image,
          is_available: menuForm.isAvailable,
        },
      ]);

      if (error) {
        showToast('Gagal menambah menu: ' + error.message, 'error');
        return;
      }
      showToast('Menu baru berhasil ditambahkan.', 'success');
    }

    await fetchMenus();
    setShowMenuModal(false);
  };

  const handleDeleteMenu = async (id) => {
    const { error } = await supabase.from('menus').delete().eq('id', id);
    if (error) {
      showToast('Gagal menghapus menu: ' + error.message, 'error');
      return;
    }
    await fetchMenus();
    showToast('Menu dihapus.', 'success');
  };

  const toggleMenuAvailability = async (id, currentStatus) => {
    const { error } = await supabase
      .from('menus')
      .update({ is_available: !currentStatus })
      .eq('id', id);
    if (error) {
      showToast('Gagal mengubah status menu.', 'error');
      return;
    }
    await fetchMenus();
  };

  const handleImageUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      callback(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  // --- DELETE / RESET EXECUTION ---
  const executeClearTransactions = async () => {
    await supabase.from('orders').delete().neq('id', '');
    setOrders([]);
    setCart([]);
    setResetModalConfig({ isOpen: false, type: '', payload: null });
    showToast('Semua riwayat transaksi telah dibersihkan.', 'success');
  };

  const executeFactoryReset = async () => {
    const emptySettings = {
      storeName: '',
      phone: '',
      profilePic: '/pwa-192x192.png',
      qrisPic: '',
      bankName: '',
      bankAccount: '',
    };
    await supabase.from('orders').delete().neq('id', '');
    await supabase.from('menus').delete().neq('id', 0);
    await saveSettingsToCloud(emptySettings, true);

    setOrders([]);
    setMenus([]);
    setCart([]);
    setResetModalConfig({ isOpen: false, type: '', payload: null });
    showToast('Aplikasi berhasil di-reset total.', 'success');
  };

  const executeDeleteSingleOrder = async (orderId) => {
    await supabase.from('orders').delete().eq('id', orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setResetModalConfig({ isOpen: false, type: '', payload: null });
    showToast(`Order ${orderId} dihapus.`, 'success');
  };

  // --- EXPORT & PDF PREVIEW HANDLERS ---
  const handleExportExcelReport = (activeOrders, periodLabel) => {
    exportOrdersToExcel({
      ordersToExport: activeOrders,
      settings,
      periodLabel,
      paymentFilter: reportPaymentFilter,
    });
    showToast('File laporan Excel (.XLSX) diunduh.', 'success');
  };

  const handleOpenPdfPreview = (activeOrders, periodLabel) => {
    setPdfModalData({
      orders: activeOrders,
      periodLabel,
      printedAtLabel: new Date().toLocaleString('id-ID'),
    });
    setShowPdfReportModal(true);
  };

  if (checkingAuth) return null;

  if (!currentUser) {
    return (
      <Login
        onLoginSuccess={(usr) => setCurrentUser(usr)}
        storeName={settings.storeName}
        logoPic={settings.profilePic}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col overflow-hidden transition-colors">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        theme={theme}
        onToggleThemeMode={handleToggleThemeMode}
        btStatus={btStatus}
        onConnectBluetooth={handleConnectBluetooth}
        onOpenSettings={() => setShowSettingsModal(true)}
        deferredPrompt={deferredPrompt}
        onInstallPWA={handleInstallPWA}
      />

      <main className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 py-3 sm:py-4 flex-1 overflow-hidden">
        {activeTab === 'pos' && (
          <KasirTab
            menus={menus}
            filteredMenus={filteredMenus}
            categoriesList={categoriesList}
            selectedCategoryTab={selectedCategoryTab}
            setSelectedCategoryTab={setSelectedCategoryTab}
            menuSearchQuery={menuSearchQuery}
            setMenuSearchQuery={setMenuSearchQuery}
            cart={cart}
            onAddToCart={addToCart}
            onUpdateQty={updateQty}
            onUpdateQtyDirect={updateQtyDirect}
            onUpdateItemNote={updateItemNote}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
            customerName={customerName}
            setCustomerName={setCustomerName}
            orderType={orderType}
            setOrderType={setOrderType}
            deliveryAddress={deliveryAddress}
            setDeliveryAddress={setDeliveryAddress}
            discountType={discountType}
            setDiscountType={setDiscountType}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
            subTotal={subTotal}
            calculatedDiscount={calculatedDiscount}
            totalTagihan={totalTagihan}
            onOpenCheckout={handleOpenCheckout}
            theme={theme}
          />
        )}

        {activeTab === 'riwayat' && (
          <RiwayatTab
            orders={orders}
            historyStartDate={historyStartDate}
            setHistoryStartDate={setHistoryStartDate}
            historyEndDate={historyEndDate}
            setHistoryEndDate={setHistoryEndDate}
            historySearchQuery={historySearchQuery}
            setHistorySearchQuery={setHistorySearchQuery}
            selectedPaymentFilter={selectedPaymentFilter}
            setSelectedPaymentFilter={setSelectedPaymentFilter}
            onOpenReceiptModal={handleOpenReceiptFromHistory}
            onDeleteOrder={(order) =>
              setResetModalConfig({
                isOpen: true,
                type: 'single',
                payload: order,
              })
            }
          />
        )}

        {activeTab === 'menu' && (
          <MenuTab
            menus={menus}
            categoriesList={categoriesList}
            onOpenMenuModal={handleOpenMenuModal}
            onToggleMenuAvailability={toggleMenuAvailability}
            onDeleteMenu={handleDeleteMenu}
          />
        )}

        {activeTab === 'laporan' && (
          <LaporanTab
            orders={orders}
            reportFilter={reportFilter}
            setReportFilter={setReportFilter}
            reportStartDate={reportStartDate}
            setReportStartDate={setReportStartDate}
            reportEndDate={reportEndDate}
            setReportEndDate={setReportEndDate}
            reportPaymentFilter={reportPaymentFilter}
            setReportPaymentFilter={setReportPaymentFilter}
            onExportExcel={handleExportExcelReport}
            onOpenPdfPreview={handleOpenPdfPreview}
          />
        )}
      </main>

      {/* MODALS */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        customerName={customerName}
        orderType={orderType}
        deliveryAddress={deliveryAddress}
        totalTagihan={totalTagihan}
        calculatedDiscount={calculatedDiscount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cashGiven={cashGiven}
        setCashGiven={setCashGiven}
        kembalian={kembalian}
        isCashSufficient={isCashSufficient}
        settings={settings}
        submittingOrder={submittingOrder}
        onConfirmPay={handleConfirmPay}
      />

      <UnifiedReceiptModal
        isOpen={showReceiptModal}
        order={receiptModalOrder}
        activeTab={activeReceiptTab}
        setActiveTab={setActiveReceiptTab}
        settings={settings}
        onClose={() => {
          setShowReceiptModal(false);
          setReceiptModalOrder(null);
        }}
        onPrintCashierBT={handlePrintCashierBT}
        onPrintKitchenBT={handlePrintKitchenBT}
      />

      <MenuFormModal
        isOpen={showMenuModal}
        editingMenu={editingMenu}
        menuForm={menuForm}
        setMenuForm={setMenuForm}
        categoriesList={categoriesList}
        isCustomCategoryMode={isCustomCategoryMode}
        setIsCustomCategoryMode={setIsCustomCategoryMode}
        customCategoryInput={customCategoryInput}
        setCustomCategoryInput={setCustomCategoryInput}
        onImageUpload={handleImageUpload}
        onSave={handleSaveMenu}
        onClose={() => setShowMenuModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSaveSettings={saveSettingsToCloud}
        onImageUpload={handleImageUpload}
        onRequestReset={(type) => {
          setShowSettingsModal(false);
          setResetModalConfig({ isOpen: true, type, payload: null });
        }}
        onLogout={handleLogout}
        theme={theme}
        onUpdateTheme={handleUpdateTheme}
        onResetTheme={handleResetTheme}
        btStatus={btStatus}
        onConnectBluetooth={handleConnectBluetooth}
        userEmail={currentUser?.email}
      />

      <ConfirmResetModal
        config={resetModalConfig}
        onCancel={() =>
          setResetModalConfig({ isOpen: false, type: '', payload: null })
        }
        onConfirm={
          resetModalConfig.type === 'factory'
            ? executeFactoryReset
            : resetModalConfig.type === 'transactions'
            ? executeClearTransactions
            : () => executeDeleteSingleOrder(resetModalConfig.payload?.id)
        }
      />

      <PdfReportModal
        isOpen={showPdfReportModal}
        onClose={() => setShowPdfReportModal(false)}
        orders={pdfModalData.orders}
        periodLabel={pdfModalData.periodLabel}
        paymentFilter={reportPaymentFilter}
        setPaymentFilter={setReportPaymentFilter}
        settings={settings}
        printedAtLabel={pdfModalData.printedAtLabel}
      />

      {/* TOAST NOTIFICATION (POJOK KANAN BAWAH) */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-5 right-5 z-[90] max-w-sm no-print">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-red-600 border-red-700 text-white'
                : 'bg-emerald-600 border-emerald-700 text-white'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={16} className="flex-shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="flex-shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-1 opacity-80 hover:opacity-100 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}