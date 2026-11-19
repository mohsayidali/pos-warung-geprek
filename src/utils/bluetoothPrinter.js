import { formatBTPrice } from './formatters';

export const BLUETOOTH_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4158-6b44-508a0d9cd86e',
  '00001101-0000-1000-8000-00805f9b34fb',
  '0000180a-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
];

export const connectBluetoothDevice = async (existingDevice, existingChar) => {
  if (!navigator.bluetooth) {
    return {
      supported: false,
      device: null,
      characteristic: null,
      status: 'Terputus',
    };
  }

  if (existingDevice && existingDevice.gatt?.connected && existingChar) {
    return {
      supported: true,
      device: existingDevice,
      characteristic: existingChar,
      status: 'Terhubung',
    };
  }

  try {
    let device = existingDevice;
    if (!device || !device.gatt?.connected) {
      device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: BLUETOOTH_SERVICES,
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
      } catch {
        // Skip inaccessible service characteristics
      }
      if (foundChar) break;
    }

    if (foundChar) {
      return {
        supported: true,
        device,
        characteristic: foundChar,
        status: 'Terhubung',
      };
    }

    return {
      supported: true,
      device: null,
      characteristic: null,
      status: 'Terputus',
    };
  } catch {
    return {
      supported: true,
      device: null,
      characteristic: null,
      status: 'Terputus',
    };
  }
};

const writeEscPosChunks = async (char, text) => {
  const encoder = new TextEncoder();
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
};

export const buildCustomerReceiptEscPos = (orderReceipt, settings) => {
  const init = '\x1B\x40';
  const setCodePage = '\x1B\x74\x00';
  const center = '\x1B\x61\x01';
  const left = '\x1B\x61\x00';
  const boldOn = '\x1B\x45\x01';
  const boldOff = '\x1B\x45\x00';
  const feed = '\x0A\x0A\x0A';

  let text =
    init +
    setCodePage +
    center +
    boldOn +
    (settings.storeName || 'WARUNG COBEK GEPREK').toUpperCase() +
    '\n' +
    boldOff;
  if (settings.phone) text += 'Telp: ' + settings.phone + '\n';
  text += 'ID: ' + orderReceipt.id + '\n';
  text += new Date(orderReceipt.date).toLocaleString('id-ID') + '\n';
  text += '--------------------------------\n' + left;
  text += 'Pelanggan: ' + (orderReceipt.customerName || 'Pelanggan') + '\n';
  text += 'Tipe/Meja: ' + (orderReceipt.address || 'Di Tempat') + '\n';
  text += '--------------------------------\n';
  text += boldOn + 'QTY ITEM              TOTAL\n' + boldOff;

  (orderReceipt.items || []).forEach((item) => {
    const name = String(item.name || '').substring(0, 14).padEnd(14, ' ');
    const qtyStr = String(item.qty).padStart(3, ' ');
    const totalStr = formatBTPrice(item.price * item.qty)
      .replace('Rp ', '')
      .trim()
      .padStart(11, ' ');
    text += `${qtyStr}x ${name} ${totalStr}\n`;
    if (item.note) text += `    * ${item.note}\n`;
  });

  text += '--------------------------------\n';
  text += `Subtotal    : ${formatBTPrice(orderReceipt.subTotal)}\n`;
  if (orderReceipt.discountAmount > 0) {
    text += `Diskon      : -${formatBTPrice(orderReceipt.discountAmount)}\n`;
  }
  if (orderReceipt.extraCharge > 0) {
    text += `Biaya Extra : ${formatBTPrice(orderReceipt.extraCharge)}\n`;
  }
  text += boldOn + `TOTAL       : ${formatBTPrice(orderReceipt.total)}\n` + boldOff;
  text += `Bayar (${orderReceipt.method}): ${formatBTPrice(orderReceipt.cashGiven || orderReceipt.total)}\n`;
  if (orderReceipt.method === 'Tunai') {
    text += `Kembali     : ${formatBTPrice(orderReceipt.kembalian || 0)}\n`;
  }
  text += '--------------------------------\n' + center;
  text += '*** TERIMA KASIH ***\n\n' + feed;

  return text;
};

export const buildKitchenTicketEscPos = (orderTicket) => {
  const init = '\x1B\x40';
  const center = '\x1B\x61\x01';
  const left = '\x1B\x61\x00';
  const boldOn = '\x1B\x45\x01';
  const boldOff = '\x1B\x45\x00';
  const feed = '\x0A\x0A\x0A';

  let text = init + center + boldOn + '*** TIKET DAPUR / KOKI ***\n' + boldOff;
  text +=
    'ID: ' +
    orderTicket.id +
    ' | ' +
    new Date(orderTicket.date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }) +
    '\n';
  text += '--------------------------------\n' + left;
  text +=
    boldOn +
    'PEMESAN : ' +
    (orderTicket.customerName || 'Pelanggan').toUpperCase() +
    '\n' +
    boldOff;
  text += 'TIPE/MEJA: ' + (orderTicket.address || 'Di Tempat') + '\n';
  text += '--------------------------------\n';
  text += boldOn + 'QTY  NAMA MENU & CATATAN\n' + boldOff;

  (orderTicket.items || []).forEach((item) => {
    text += boldOn + `${item.qty}x  ${item.name}\n` + boldOff;
    if (item.note) text += `    >>> CATATAN: ${item.note}\n`;
  });

  text += '--------------------------------\n' + center;
  text += 'HARAP SEGERA DISIAPKAN!\n\n' + feed;

  return text;
};

export const sendEscPosToCharOrFallback = async (char, escPosText) => {
  if (!char) {
    window.print();
    return false;
  }
  try {
    await writeEscPosChunks(char, escPosText);
    return true;
  } catch {
    window.print();
    return false;
  }
};
