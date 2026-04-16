/**
 * CSS payload injected into the card iframe via postMessage.
 * Kept as a standalone module so the style definition is separate from
 * the messaging logic that delivers it.
 */
export function getIframeStyles(): string {
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
