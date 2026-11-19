export const formatIDR = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);

export const formatBTPrice = (val) => {
  const num = Number(val) || 0;
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const formatDateInput = (dateObj = new Date()) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const getTodayFormattedDate = () => formatDateInput(new Date());

export const formatDisplayDateShort = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const isImageSource = (img) =>
  typeof img === 'string' &&
  (img.startsWith('http') ||
    img.startsWith('blob:') ||
    img.startsWith('data:') ||
    img.startsWith('/'));
