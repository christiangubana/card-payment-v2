'use client';

import { useRef, useState, useCallback } from 'react';
import { useStoredCards } from '@/hooks/useStoredCards';
import { useIframeMessaging } from '@/hooks/useIframeMessaging';
import StoredCards from '@/components/StoredCards';
import CardIframe from '@/components/CardIframe';
import Toast from '@/components/Toast';
import type { StoredCard, ValidationError, ToastData } from '@/types/payment';
import styles from './PaymentPage.module.css';

const AMOUNT = '100.00';
const CURRENCY = 'EUR';
const SUCCESS_URL = '/payment/success';
const FAILURE_URL = '/payment/failure';

export default function PaymentPage() {
  const { cards, addCard, removeCard } = useStoredCards();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(true);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [toast, setToast] = useState<ToastData | null>(null);

  const toastKey = useRef(0);
  const saveCardRef = useRef(saveCard);
  saveCardRef.current = saveCard;
  const clearFormRef = useRef(() => {});

  const showToast = useCallback((message: string, type: ToastData['type']) => {
    setToast({ message, type, key: ++toastKey.current });
  }, []);

  function processPayment(token: string, isStoredCard: boolean) {
    const label = isStoredCard
      ? '[Payment] POST /payments/process (stored card)'
      : '[Payment] POST /payments/process';
    console.log(label, {
      amount: AMOUNT,
      currency: CURRENCY,
      cardToken: token,
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      const success = Math.random() > 0.1;
      if (success) {
        console.log('[Redirect] →', SUCCESS_URL);
        showToast(`Payment of ${AMOUNT} ${CURRENCY} successful!`, 'success');
        if (!isStoredCard) clearFormRef.current();
      } else {
        console.log('[Redirect] →', FAILURE_URL);
        showToast('Payment declined. Please try again.', 'error');
      }
      setProcessing(false);
    }, 1200);
  }

  const { iframeRef, tokenizeCard, clearForm, isIframeReady } = useIframeMessaging({
    onTokenized(data: StoredCard) {
      showToast('Card tokenized, processing payment...', 'info');
      if (saveCardRef.current) addCard(data);
      processPayment(data.token, false);
    },
    onValidationError(validationErrors: ValidationError[]) {
      setErrors(validationErrors);
      setProcessing(false);
      showToast('Please fix the errors above', 'error');
    },
  });

  clearFormRef.current = clearForm;

  function handlePay() {
    if (processing) return;
    setErrors([]);
    setProcessing(true);

    if (selectedIndex !== null && cards[selectedIndex]) {
      showToast('Processing payment with saved card...', 'info');
      processPayment(cards[selectedIndex].token, true);
    } else {
      const started = tokenizeCard();
      if (!started) {
        setProcessing(false);
        showToast('Card form is still loading. Please try again.', 'error');
      }
    }
  }

  function handleSelectCard(index: number) {
    setSelectedIndex(prev => (prev === index ? null : index));
    setErrors([]);
  }

  function handleDeleteCard(index: number) {
    removeCard(index);
    setSelectedIndex(prev => {
      if (prev === index) return null;
      if (prev !== null && prev > index) return prev - 1;
      return prev;
    });
  }

  return (
    <div className={styles.container}>
      {cards.length > 0 && (
        <StoredCards
          cards={cards}
          selectedIndex={selectedIndex}
          onSelect={handleSelectCard}
          onDelete={handleDeleteCard}
        />
      )}

      <section className={styles.newCardSection}>
        <h2 className={styles.sectionTitle}>Card details</h2>
        <CardIframe ref={iframeRef} />

        <div className={styles.saveCardRow}>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={saveCard}
              onChange={() => setSaveCard(s => !s)}
            />
            <span className={styles.toggleSlider} />
          </label>
          <span
            className={styles.saveCardLabel}
            onClick={() => setSaveCard(s => !s)}
          >
            Save card
          </span>
        </div>
      </section>

      {errors.length > 0 && (
        <div className={styles.validationErrors}>
          {errors.map((err, i) => (
            <p key={i}>{err.message}</p>
          ))}
        </div>
      )}

      <button
        className={styles.payButton}
        onClick={handlePay}
        disabled={processing || (selectedIndex === null && !isIframeReady)}
      >
        {processing ? (
          <>
            <span className={styles.spinner} />
            {' Processing...'}
          </>
        ) : (
          `Pay ${AMOUNT} ${CURRENCY} (Fee included)`
        )}
      </button>

      <Toast toast={toast} />
    </div>
  );
}
