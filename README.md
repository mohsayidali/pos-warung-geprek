# Dokumentasi Teknis — Aplikasi POS Warung Cobek Geprek

Dokumen ini merangkum arsitektur sistem, teknologi yang digunakan, struktur kode, fitur yang telah diimplementasikan, serta *roadmap* pengembangan antarmuka dan fungsionalitas selanjutnya untuk aplikasi **Point of Sale (POS) Warung Cobek Geprek**.

---

## 1. Tujuan & Fitur Utama Aplikasi

### Tujuan Aplikasi
Membangun sistem kasir (*Point of Sale*) berbasis web yang cepat, responsif (mendukung desktop, tablet, dan *smartphone*), terhubung secara *real-time* ke *cloud database*, serta mendukung pencetakan struk fisik secara nirkabel melalui printer thermal Bluetooth maupun ekspor laporan keuangan standar (Excel dan PDF A4).

### Fitur Utama
* **Transaksi Kasir Cepat:** Pemilihan menu berdasarkan kategori dan pencarian instan, manajemen keranjang belanja, perhitungan diskon otomatis (nominal Rupiah maupun persentase), serta pilihan tipe pesanan (*Dine-in* / *Takeaway*).
* **Multi-Metode Pembayaran:** Mendukung pembayaran **Tunai** (dilengkapi tombol nominal cepat dan kalkulator kembalian otomatis), **QRIS** (menampilkan kode QR toko), dan **Transfer Bank**.
* **Cetak Struk Thermal & Tiket Dapur:** Integrasi langsung dengan printer thermal Bluetooth menggunakan protokol ESC/POS serta dukungan cetak bawaan browser.
* **Sinkronisasi Real-Time & Multi-Perangkat:** Perubahan data pesanan, ketersediaan menu, dan pengaturan toko langsung tersinkronisasi ke seluruh perangkat yang aktif.
* **Analitik Penjualan & Ekspor Laporan:** Dasbor pemantauan omset harian/mingguan/bulanan, analisis jam sibuk, peringkat menu terlaris, serta ekspor laporan ke format `.xlsx` (Excel) dan `.pdf` (A4 multi-halaman).

---

## 2. Tech Stack & Library yang Digunakan

| Kategori | Teknologi / Library | Fungsi dalam Proyek |
| :--- | :--- | :--- |
| **Frontend Framework** | React (Hooks: `useState`, `useEffect`, `useMemo`, `useRef`) | Pengelolaan state antarmuka, kalkulasi keranjang/laporan secara reaktif, dan siklus hidup komponen. |
| **Styling & Layout** | Tailwind CSS + Custom CSS (`@media print`) | Desain responsif *mobile-first*, dukungan *Dark/Light Mode*, *glassmorphism*, dan isolasi tata letak cetak kertas A4. |
| **Ikon Antarmuka** | `lucide-react` | Penyediaan ikon vektor ringan dan konsisten untuk navigasi, tombol aksi, serta indikator status. |
| **Backend & Database** | Supabase (`@supabase/supabase-js`) | Autentikasi pengguna (`supabase.auth`), penyimpanan data relasional PostgreSQL (`orders`, `menus`, `categories`, `settings`), dan *Realtime Subscriptions*. |
| **Visualisasi Grafik** | Native Custom SVG (`SimpleAreaChart`, `SimpleDonutChart`) | Render grafik tren omset dan proporsi metode pembayaran secara ringan tanpa ketergantungan *library chart* eksternal yang berat. |
| **Integrasi Hardware** | Web Bluetooth API (ESC/POS Commands) | Koneksi langsung dari browser ke printer thermal Bluetooth 58mm/80mm untuk mencetak struk pelanggan dan tiket dapur. |
| **Ekspor Dokumen** | HTML-to-Excel Blob & Browser Print API | Pembuatan file laporan `.xlsx` terstruktur per metode pembayaran dan pratinjau cetak laporan PDF A4. |
| **Dukungan Aplikasi** | Progressive Web App (PWA) & `localStorage` | Instalasi aplikasi ke layar utama perangkat (`beforeinstallprompt`) dan penyimpanan preferensi tema/tab aktif secara lokal. |

---

## 3. Struktur Folder & Fungsi Tiap File

Aplikasi ini dirancang dengan pendekatan arsitektur yang ringkas agar mudah dipelihara dan di-*deploy*:

```text
pos-warung-cobek-geprek/
├── public/
│   ├── manifest.json          # Konfigurasi metadata PWA (nama aplikasi, ikon, orientasi layar)
│   └── sw.js                  # Service Worker untuk dukungan instalasi PWA
├── src/
│   ├── App.jsx                # Komponen inti aplikasi (Kasir, Dapur, Laporan, Pengaturan, Cetak BT & PDF)
│   ├── Login.jsx              # Halaman autentikasi masuk akun kasir/admin menggunakan Supabase Auth
│   ├── supabase.js            # Inisialisasi koneksi klien Supabase (URL & Anon Key)
│   ├── main.jsx               # Entry point utama React untuk me-render komponen App ke DOM
│   └── index.css              # Konfigurasi directive Tailwind CSS & gaya global
├── index.html                 # Kerangka HTML utama aplikasi
└── package.json               # Daftar dependensi dan skrip build proyek
```

### Rincian Fungsi Tiap File Utama
* **`src/App.jsx`:** Menampung seluruh logika bisnis aplikasi, meliputi sinkronisasi *real-time* Supabase, manajemen keranjang belanja, kalkulasi diskon & kembalian, generator byte ESC/POS untuk printer Bluetooth, komponen grafik SVG native, generator file Excel, serta modal pratinjau cetak struk dan laporan PDF A4.
* **`src/Login.jsx`:** Menangani form login pengguna, validasi sesi aktif bersama Supabase Auth, serta menampilkan identitas visual toko (logo dan nama warung) yang disesuaikan dengan tema gelap/terang.
* **`src/supabase.js`:** Menyimpan konfigurasi dan mengekspor objek klien `supabase` agar dapat diakses oleh `App.jsx` dan `Login.jsx`.

---

## 4. Fitur yang Sudah Selesai Dibuat

Seluruh fitur berikut telah terintegrasi dan berfungsi penuh pada rilis saat ini:

1. **Sistem Autentikasi & Sinkronisasi Cloud:**
   * Login dan logout aman menggunakan Supabase Auth dengan pengecekan sesi otomatis saat aplikasi dimuat.
   * *Real-time listener* pada tabel `orders` dan `menus` sehingga pesanan baru maupun perubahan status stok langsung diperbarui tanpa *refresh* halaman.
2. **Modul Kasir (POS):**
   * Filter katalog menu berdasarkan kategori dinamis dan kolom pencarian nama menu.
   * Pengaturan jumlah item (`+`, `-`, maupun input angka langsung), penghapusan item, dan kolom catatan khusus per menu.
   * Input nama pelanggan, status pesanan (*Dine-in* / *Takeaway* / nomor meja), serta fitur diskon fleksibel (`Rp` atau `%`).
   * *Floating cart drawer* khusus tampilan *mobile* agar area menu tetap luas di layar kecil.
3. **Proses Pembayaran & Pencetakan Struk:**
   * Modal *Checkout* dengan pilihan metode **Tunai** (saran nominal uang pas & pecahan umum + hitung kembalian), **QRIS** (menampilkan gambar QRIS warung), dan **Transfer Bank**.
   * Cetak struk pelanggan langsung melalui **Bluetooth Thermal Printer** (ESC/POS) maupun dialog cetak standar browser.
4. **Modul Dapur (Kitchen Display):**
   * Daftar antrean pesanan berstatus `Masuk` lengkap dengan catatan khusus koki dan waktu pemesanan.
   * Panel rekapitulasi total porsi per menu yang sedang aktif dimasak.
   * Fitur cetak **Tiket Dapur / Koki** khusus dan tombol konfirmasi pesanan selesai.
5. **Dasbor Laporan & Ekspor Multi-Halaman:**
   * Filter periode laporan (**Harian**, **Mingguan**, **Bulanan**) dengan 4 kartu indikator utama (Total Omset, Total Transaksi, Diskon Diberikan, Rata-rata per Nota).
   * Grafik tren omset (`SimpleAreaChart`), grafik metode bayar (`SimpleDonutChart`), analisis jam sibuk, peringkat **Top 5 Menu Terlaris**, dan rincian omset per kategori.
   * Tabel riwayat transaksi dengan pencarian ID/nama, filter tanggal (Hari Ini, Minggu Ini, Bulan Ini, Semua, atau pilih tanggal kalender), filter metode pembayaran, cetak ulang struk, dan hapus nota satuan.
   * **Ekspor Excel (`.xlsx`)** yang mengelompokkan tabel transaksi berdasarkan metode pembayaran.
   * **Cetak Laporan PDF (A4)** dengan aturan CSS `@media print` yang mengisolasi area cetak dari UI dashboard dan mendukung paginasi otomatis lintas puluhan halaman (header tabel berulang di tiap halaman baru tanpa memotong baris nota).
6. **Modul Pengaturan & Manajemen Sistem:**
   * Kustomisasi nama warung, nomor telepon/WA struk, foto profil/logo, gambar QRIS, dan informasi rekening bank.
   * Manajemen katalog menu (tambah, edit, hapus, *toggle* status Tersedia/Habis, serta pembuatan kategori baru).
   * Fitur pembersihan data (**Clear Riwayat Transaksi** dan **Reset Total Aplikasi**) dengan modal konfirmasi keamanan.
   * Pengalih tema **Dark Mode / Light Mode** dan tombol instalasi **PWA**.

---

## 5. Daftar Fitur Selanjutnya (Roadmap)

Berdasarkan evaluasi desain antarmuka terbaru (*layout* Emergent), berikut adalah rencana pengembangan dan penyempurnaan pada versi berikutnya:

### Fase 1: Pembaruan Layout & Penyederhanaan Alur Kerja (Prioritas Utama)
* [ ] **Adopsi Tata Letak High-Contrast (Dark Header + Light Workspace):** Memperbarui tampilan utama dengan *header* gelap yang memuat logo warung, indikator jam *live* (`WIB`), dan navigasi tab utama yang bersih.
* [ ] **Toggle Catatan Hemat Ruang di Keranjang:** Mengganti kolom input teks catatan yang selalu terbuka pada setiap item keranjang menjadi tombol pil kecil (`Catatan`) yang baru memunculkan kolom ketik saat diklik.
* [ ] **Penggabungan Modal Struk Kasir & Tiket Dapur:** Menyediakan *tab switcher* (`Struk Kasir` | `Struk Dapur`) serta dua tombol cetak langsung di dalam satu modal pasca-pembayaran sehingga kasir tidak perlu berpindah halaman untuk mencetak tiket dapur.
* [ ] **Restrukturisasi Tab Navigasi:**
  * Menghapus tab khusus **Dapur** yang jarang digunakan dan menggantinya dengan tab **Menu** khusus untuk pengelolaan katalog produk dalam format tabel yang lebih cepat diakses.
  * Memisahkan tabel transaksi menjadi tab mandiri **Riwayat** lengkap dengan ringkasan jumlah transaksi & omset di bagian atas serta tombol cetak ulang `Struk` dan `Dapur` di tiap baris.
  * Memindahkan akses **Bluetooth Printer** dan **Pengaturan Warung** ke tombol utilitas di pojok kanan *header*.
* [ ] **Peningkatan Visualisasi Laporan:**
  * Mengubah grafik pendapatan menjadi *Bar Chart* dinamis sesuai rentang tanggal (`Hari Ini`, `7 Hari Terakhir`, `Bulan Ini`, dan `Kustom` rentang tanggal).
  * Menampilkan *Bar Chart* **Jam Sibuk** dengan sorotan warna merah pekat pada jam puncak dan ringkasan teks jam tersibuk di bawah grafik.
  * Mengubah tampilan proporsi **Metode Pembayaran** menjadi *horizontal progress bar* yang menampilkan jumlah transaksi sekaligus total nominal rupiahnya, serta menambahkan kartu KPI **Item Terjual**.

### Fase 2: Pengembangan Operasional Lanjutan (Jangka Menengah)
* [ ] **Manajemen Hak Akses Pengguna (Role-Based Access):** Memisahkan akun **Kasir** (hanya akses transaksi & riwayat harian) dan **Owner/Admin** (akses penuh ke laporan omset, hapus transaksi, dan pengaturan sistem).
* [ ] **Manajemen Stok Bahan Baku / Porsi Harian:** Pengurangan kuota porsi menu secara otomatis setiap kali transaksi selesai untuk mencegah penjualan item yang sudah habis.
* [ ] **Rekap Shift & Tutup Kasir (Cash Drawer):** Fitur pencatatan modal awal laci kasir saat buka warung dan perhitungan selisih uang fisik saat tutup kasir.
