import { renderHook, act } from '@testing-library/react';
import { useStoredCards } from '@/hooks/useStoredCards';
import { STORAGE_KEY } from '@/lib/constants';
import type { StoredCard } from '@/types/payment';

const mockCard: StoredCard = {
  token: 'tok_test_1',
  maskedPan: '4111****1111',
  last4: '1111',
  expiryDate: '12/28',
  cardholderName: 'Test User',
  cardBrand: 'visa',
};

beforeEach(() => {
  localStorage.clear();
});

describe('useStoredCards', () => {
  it('initialises with empty cards when localStorage is empty', () => {
    const { result } = renderHook(() => useStoredCards());
    expect(result.current.cards).toEqual([]);
  });

  it('loads existing cards from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([mockCard]));
    const { result } = renderHook(() => useStoredCards());
    expect(result.current.cards).toEqual([mockCard]);
  });

  it('adds a card and persists to localStorage', () => {
    const { result } = renderHook(() => useStoredCards());

    act(() => {
      result.current.addCard(mockCard);
    });

    expect(result.current.cards).toEqual([mockCard]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([mockCard]);
  });

  it('prevents duplicate cards with the same maskedPan', () => {
    const { result } = renderHook(() => useStoredCards());

    act(() => { result.current.addCard(mockCard); });
    act(() => { result.current.addCard({ ...mockCard, token: 'tok_duplicate' }); });

    expect(result.current.cards).toHaveLength(1);
    expect(result.current.cards[0].token).toBe('tok_test_1');
  });

  it('removes a card by index and updates localStorage', () => {
    const card2: StoredCard = {
      ...mockCard,
      token: 'tok_test_2',
      maskedPan: '5500****0004',
      last4: '0004',
      cardBrand: 'mastercard',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([mockCard, card2]));

    const { result } = renderHook(() => useStoredCards());

    act(() => {
      result.current.removeCard(0);
    });

    expect(result.current.cards).toEqual([card2]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([card2]);
  });

  it('handles removing the last card (results in empty array)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([mockCard]));
    const { result } = renderHook(() => useStoredCards());

    act(() => {
      result.current.removeCard(0);
    });

    expect(result.current.cards).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([]);
  });

  it('survives corrupted localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid json');
    const { result } = renderHook(() => useStoredCards());
    expect(result.current.cards).toEqual([]);
  });
});
