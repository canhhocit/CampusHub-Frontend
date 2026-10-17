import jsQR from 'jsqr';

export interface CccdQrData {
  citizenId: string;
  oldCmnd?: string;
  fullName: string;
  dateOfBirthRaw: string;
  dateOfBirthFormatted: string; // DD/MM/YYYY
  gender?: string;
  address?: string;
  issueDate?: string;
  rawText: string;
}

/**
 * Phân tích chuỗi QR code trên thẻ Căn cước công dân gắn chip (Việt Nam)
 * Định dạng chuẩn của Bộ Công An:
 * <Số CCCD>|<Số CMND 9 số cũ nếu có>|<Họ và tên>|<Ngày sinh (DDMMYYYY)>|<Giới tính>|<Nơi thường trú>|<Ngày cấp (DDMMYYYY)>
 */
export function parseCccdQr(rawText: string): CccdQrData | null {
  if (!rawText || typeof rawText !== 'string') return null;

  const trimmed = rawText.trim();
  if (!trimmed.includes('|')) return null;

  const parts = trimmed.split('|');
  if (parts.length < 3) return null;

  const citizenId = parts[0]?.trim() || '';
  const oldCmnd = parts[1]?.trim() || undefined;
  const fullName = parts[2]?.trim() || '';
  const dobRaw = parts[3]?.trim() || '';

  let dateOfBirthFormatted = dobRaw;
  if (/^[0-9]{8}$/.test(dobRaw)) {
    const day = dobRaw.slice(0, 2);
    const month = dobRaw.slice(2, 4);
    const year = dobRaw.slice(4, 8);
    dateOfBirthFormatted = `${day}/${month}/${year}`;
  }

  const gender = parts[4]?.trim() || undefined;
  const address = parts[5]?.trim() || undefined;
  const issueDate = parts[6]?.trim() || undefined;

  return {
    citizenId,
    oldCmnd,
    fullName,
    dateOfBirthRaw: dobRaw,
    dateOfBirthFormatted,
    gender,
    address,
    issueDate,
    rawText: trimmed,
  };
}

/**
 * Quét mã QR từ nguồn ảnh (File từ máy tính hoặc URL ảnh online)
 * Sử dụng native BarcodeDetector API (trên Chrome/Edge) kết hợp jsQR đa luồng xử lý
 */
export async function scanQrFromImageSource(source: File | string): Promise<string | null> {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  let objectUrl = '';
  if (typeof source === 'string') {
    img.src = source;
  } else {
    objectUrl = URL.createObjectURL(source);
    img.src = objectUrl;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Không thể tải dữ liệu ảnh để quét mã QR.'));
    });
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }

  // 1. Thử native BarcodeDetector nếu trình duyệt hỗ trợ (Chrome, Edge, Android)
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      const barcodes = await barcodeDetector.detect(img);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return barcodes[0].rawValue;
      }
    } catch {
      // Tiếp tục fallback sang jsQR bên dưới
    }
  }

  // 2. Sử dụng jsQR với HTML Canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;
  if (!origW || !origH) return null;

  const scanImageData = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void): string | null => {
    canvas.width = w;
    canvas.height = h;
    draw(ctx);
    const imageData = ctx.getImageData(0, 0, w, h);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });
    return code?.data || null;
  };

  // Pass 1: Toàn bộ ảnh (giới hạn max 1600px để quét nhanh và chính xác)
  const maxDim = 1600;
  let targetW = origW;
  let targetH = origH;
  if (targetW > maxDim || targetH > maxDim) {
    const scale = Math.min(maxDim / targetW, maxDim / targetH);
    targetW = Math.round(targetW * scale);
    targetH = Math.round(targetH * scale);
  }

  let text = scanImageData(targetW, targetH, (c) => {
    c.drawImage(img, 0, 0, targetW, targetH);
  });
  if (text) return text;

  // Pass 2: Trọng tâm góc trên bên phải (vị trí QR code trên thẻ CCCD Việt Nam)
  // Lấy vùng 55% chiều rộng bên phải và 55% chiều cao phía trên
  const cropX = Math.round(origW * 0.45);
  const cropY = 0;
  const cropW = Math.round(origW * 0.55);
  const cropH = Math.round(origH * 0.55);

  text = scanImageData(cropW, cropH, (c) => {
    c.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  });
  if (text) return text;

  // Pass 3: Tăng cường độ tương phản (grayscale + high contrast) nếu ảnh chụp bị tối/lóa
  text = scanImageData(cropW, cropH, (c) => {
    c.filter = 'contrast(150%) grayscale(100%)';
    c.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    c.filter = 'none';
  });
  if (text) return text;

  // Pass 4: Quét toàn ảnh ở độ phân giải gốc nếu ảnh nhỏ hơn 2400px
  if (origW <= 2400 && origH <= 2400 && (origW !== targetW || origH !== targetH)) {
    text = scanImageData(origW, origH, (c) => {
      c.drawImage(img, 0, 0, origW, origH);
    });
    if (text) return text;
  }

  return null;
}
