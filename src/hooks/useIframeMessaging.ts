'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isAllowedInbound, MessageType } from '@/lib/message-protocol';
import { getIframeStyles } from '@/lib/iframe-styles';
import type { StoredCard, ValidationError } from '@/types/payment';

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
  const [isIframeReady, setIsIframeReady] = useState(false);
  eventsRef.current = events;

  const send = useCallback((type: string, payload: object = {}) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return false;
    console.log('[postMessage → iframe]', type);
    win.postMessage({ type, payload }, window.location.origin);
    return true;
  }, []);

  useEffect(() => {
    const origin = window.location.origin;

    function onMessage(e: MessageEvent) {
      if (e.origin !== origin) return;
      const { type, payload } = e.data ?? {};
      if (!type || !isAllowedInbound(type)) return;

      console.log('[postMessage ← iframe]', type);

      switch (type) {
        case MessageType.CARD_IFRAME_READY:
          send(MessageType.INJECT_STYLES, { css: getIframeStyles() });
          break;
        case MessageType.STYLES_APPLIED:
          setIsIframeReady(true);
          resizeIframe(iframeRef.current);
          break;
        case MessageType.VALIDATION_ERROR:
          eventsRef.current.onValidationError(payload.errors);
          break;
        case MessageType.CARD_TOKENIZED:
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
      setIsIframeReady(false);
      send(MessageType.INJECT_STYLES, { css: getIframeStyles() });
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
    isIframeReady,
    tokenizeCard: useCallback(() => send(MessageType.TOKENIZE_CARD), [send]),
    clearForm: useCallback(() => send(MessageType.CLEAR_FORM), [send]),
  };
}
