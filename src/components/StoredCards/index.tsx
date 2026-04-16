'use client';

import type { StoredCard } from '@/types/payment';
import styles from './StoredCards.module.css';

interface Props {
  cards: StoredCard[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
}

export default function StoredCards({ cards, selectedIndex, onSelect, onDelete }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {cards.map((card, index) => (
          <div
            key={card.token}
            className={`${styles.card} ${selectedIndex === index ? styles.selected : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`${card.cardBrand} ending in ${card.last4}`}
            onClick={() => onSelect(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelect(index);
            }}
          >
            <div className={styles.header}>
              <BrandIcon brand={card.cardBrand} />
              <button
                className={styles.deleteBtn}
                title="Delete card"
                aria-label={`Delete ${card.cardBrand} card`}
                onClick={(e) => { e.stopPropagation(); onDelete(index); }}
              >
                🗑
              </button>
            </div>
            <div className={styles.info}>
              {card.maskedPan}
              <br />
              {card.expiryDate}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BrandIcon({ brand }: { brand: string }) {
  if (brand === 'visa') {
    return <div className={`${styles.brandIcon} ${styles.visa}`}>VISA</div>;
  }
  if (brand === 'mastercard') {
    return (
      <div className={`${styles.brandIcon} ${styles.mastercard}`}>
        <span className={styles.mcCircle1} />
        <span className={styles.mcCircle2} />
      </div>
    );
  }
  return (
    <div className={styles.brandIcon} style={{ background: '#555', fontSize: 9 }}>
      {brand.toUpperCase()}
    </div>
  );
}
