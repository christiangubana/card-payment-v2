import { PAYMENT } from './constants';

export interface PaymentResult {
  success: boolean;
  redirectUrl: string;
}

export function submitPayment(
  token: string,
  isStoredCard: boolean,
): Promise<PaymentResult> {
  const label = isStoredCard
    ? '[Payment] POST /payments/process (stored card)'
    : '[Payment] POST /payments/process';

  console.log(label, {
    amount: PAYMENT.AMOUNT,
    currency: PAYMENT.CURRENCY,
    cardToken: token,
    timestamp: new Date().toISOString(),
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.1;
      resolve({
        success,
        redirectUrl: success ? PAYMENT.SUCCESS_URL : PAYMENT.FAILURE_URL,
      });
    }, 1200);
  });
}
