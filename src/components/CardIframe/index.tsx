'use client';

import { forwardRef } from 'react';
import styles from './CardIframe.module.css';

const CardIframe = forwardRef<HTMLIFrameElement>(function CardIframe(_, ref) {
  return (
    <div className={styles.wrapper}>
      <iframe
        ref={ref}
        src="/iframe/card-form.html"
        title="Card details form"
        sandbox="allow-scripts allow-same-origin"
        scrolling="no"
        className={styles.iframe}
      />
    </div>
  );
});

export default CardIframe;
