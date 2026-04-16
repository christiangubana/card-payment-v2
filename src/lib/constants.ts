import type { StoredCard } from '@/types/payment';

export const PAYMENT = {
  AMOUNT: '100.00',
  CURRENCY: 'EUR',
  SUCCESS_URL: '/payment/success',
  FAILURE_URL: '/payment/failure',
} as const;

export const STORAGE_KEY = 'storedCards';

export const DEMO_CARDS: StoredCard[] = [
  {
    token: 'tok_demo_visa',
    maskedPan: '4111****1111',
    last4: '1111',
    expiryDate: '12/28',
    cardholderName: 'John Smith',
    cardBrand: 'visa',
  },
  {
    token: 'tok_demo_mc',
    maskedPan: '5500****0004',
    last4: '0004',
    expiryDate: '06/27',
    cardholderName: 'Jane Doe',
    cardBrand: 'mastercard',
  },
];
