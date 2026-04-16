export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export interface StoredCard {
  token: string;
  maskedPan: string;
  last4: string;
  expiryDate: string;
  cardholderName: string;
  cardBrand: CardBrand;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info';
  key: number;
}
