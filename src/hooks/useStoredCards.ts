'use client';

import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEY, DEMO_CARDS } from '@/lib/constants';
import type { StoredCard } from '@/types/payment';

function readFromStorage(): StoredCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeToStorage(cards: StoredCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function useStoredCards() {
  const [cards, setCards] = useState<StoredCard[]>([]);

  useEffect(() => {
    let loaded = readFromStorage();
    if (window.location.search.includes('demo') && loaded.length === 0) {
      loaded = DEMO_CARDS;
      writeToStorage(loaded);
    }
    setCards(loaded);
  }, []);

  const addCard = useCallback((card: StoredCard) => {
    setCards(prev => {
      if (prev.some(c => c.maskedPan === card.maskedPan)) return prev;
      const updated = [...prev, card];
      writeToStorage(updated);
      return updated;
    });
  }, []);

  const removeCard = useCallback((index: number) => {
    setCards(prev => {
      const updated = prev.filter((_, i) => i !== index);
      writeToStorage(updated);
      return updated;
    });
  }, []);

  return { cards, addCard, removeCard };
}
