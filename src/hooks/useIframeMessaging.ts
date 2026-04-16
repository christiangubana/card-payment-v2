'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { StoredCard, ValidationError } from '@/types/payment';

const ALLOWED_INBOUND = new Set([
  'CARD_IFRAME_READY',
  'STYLES_APPLIED',
  'VALIDATION_ERROR',
  'CARD_TOKENIZED',
]);

function getIframeStyles(): string {
  return [
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: transparent; color: #fff; }',
    '.form-group { margin-bottom: 16px; }',
    '.form-row { display: flex; gap: 12px; }',
    '.form-group.half { flex: 1; }',
    'label { display: block; font-size: 12px; color: #8a8a8a; margin-bottom: 6px; letter-spacing: 0.3px; }',
    'input { width: 100%; padding: 16px 14px; background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 12px; color: #fff; font-size: 16px; outline: none; transition: border-color 0.2s ease; }',
    'input::placeholder { color: #555; }',
    'input:focus { border-color: #d1f526; }',
    'input.input-error { border-color: #ff4d4d; }',
    '.error-message { display: block; font-size: 12px; color: #ff4d4d; margin-top: 4px; min-height: 16px; }',
  ].join('');
}

function resizeIframe(iframe: HTMLIFrameElement | null) {
  if (!iframe) return;
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) iframe.style.height = doc.body.scrollHeight + 20 + 'px';
  } catch {
    iframe.style.height = '320px';
  }
}

interface IframeEvents {
  onTokenized: (data: StoredCard) => void;
  onValidationError: (errors: ValidationError[]) => void;
}

export function useIframeMessaging(events: IframeEvents) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const eventsRef = useRef(events);
  eventsRef.current = events;

  const send = useCallback((type: string, payload: object = {}) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    console.log('[postMessage → iframe]', type);
    win.postMessage({ type, payload }, window.location.origin);
  }, []);

  useEffect(() => {
    const origin = window.location.origin;

    function onMessage(e: MessageEvent) {
      if (e.origin !== origin) return;
      const { type, payload } = e.data ?? {};
      if (!type || !ALLOWED_INBOUND.has(type)) return;

      console.log('[postMessage ← iframe]', type);

      switch (type) {
        case 'CARD_IFRAME_READY':
          send('INJECT_STYLES', { css: getIframeStyles() });
          break;
        case 'STYLES_APPLIED':
          resizeIframe(iframeRef.current);
          break;
        case 'VALIDATION_ERROR':
          eventsRef.current.onValidationError(payload.errors);
          break;
        case 'CARD_TOKENIZED':
          eventsRef.current.onTokenized(payload);
          break;
      }
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [send]);

  // The iframe may load before React hydrates, causing CARD_IFRAME_READY to be
  // missed. This effect uses the iframe's load event as a fallback to ensure
  // styles are always injected regardless of timing.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function injectStyles() {
      send('INJECT_STYLES', { css: getIframeStyles() });
      setTimeout(() => resizeIframe(iframe), 100);
    }

    iframe.addEventListener('load', injectStyles);

    try {
      if (iframe.contentDocument?.readyState === 'complete') {
        injectStyles();
      }
    } catch { /* cross-origin in production */ }

    return () => iframe.removeEventListener('load', injectStyles);
  }, [send]);

  return {
    iframeRef,
    tokenizeCard: useCallback(() => send('TOKENIZE_CARD'), [send]),
    clearForm: useCallback(() => send('CLEAR_FORM'), [send]),
  };
}
