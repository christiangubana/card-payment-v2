import type { CardBrand } from '@/types/payment';

export function luhnCheck(num: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function validatePan(raw: string): string | null {
  if (!raw || raw.length < 13 || raw.length > 19) return 'Enter a valid card number';
  if (!luhnCheck(raw)) return 'Card number is invalid';
  return null;
}

export function validateExpiry(expiry: string): string | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry);
  if (!match) return 'Enter a valid expiry (MM/YY)';
  const year = parseInt('20' + match[2], 10);
  const month = parseInt(match[1], 10);
  if (new Date(year, month) <= new Date()) return 'Card has expired';
  return null;
}

export function validateCvv(cvv: string): string | null {
  const trimmed = cvv.trim();
  if (!trimmed || trimmed.length < 3 || trimmed.length > 4) return 'Enter a valid CVV';
  return null;
}

export function validateCardholderName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2) return 'Enter the cardholder name';
  return null;
}

export function detectBrand(pan: string): CardBrand {
  if (/^4/.test(pan)) return 'visa';
  if (/^5[1-5]/.test(pan) || /^2[2-7]/.test(pan)) return 'mastercard';
  if (/^3[47]/.test(pan)) return 'amex';
  return 'unknown';
}
