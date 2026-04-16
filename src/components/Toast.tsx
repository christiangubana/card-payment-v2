'use client';

import { useEffect, useState } from 'react';
import type { ToastData } from '@/types/payment';
import styles from './Toast.module.css';

interface Props {
  toast: ToastData | null;
}

export default function Toast({ toast }: Props) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<ToastData | null>(null);

  useEffect(() => {
    if (!toast) return;
    setCurrent(toast);
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!current) return null;

  return (
    <div className={`${styles.toast} ${styles[current.type]} ${visible ? styles.visible : ''}`}>
      {current.message}
    </div>
  );
}
