// Mirror of the allowlist in public/iframe/card-form.js.
export const MessageType = {
  INJECT_STYLES: 'INJECT_STYLES',
  TOKENIZE_CARD: 'TOKENIZE_CARD',
  CLEAR_FORM: 'CLEAR_FORM',

  CARD_IFRAME_READY: 'CARD_IFRAME_READY',
  STYLES_APPLIED: 'STYLES_APPLIED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CARD_TOKENIZED: 'CARD_TOKENIZED',
} as const;

export type MessageTypeValue = (typeof MessageType)[keyof typeof MessageType];

export const ALLOWED_INBOUND: ReadonlySet<string> = new Set([
  MessageType.CARD_IFRAME_READY,
  MessageType.STYLES_APPLIED,
  MessageType.VALIDATION_ERROR,
  MessageType.CARD_TOKENIZED,
]);

export const ALLOWED_OUTBOUND: ReadonlySet<string> = new Set([
  MessageType.INJECT_STYLES,
  MessageType.TOKENIZE_CARD,
  MessageType.CLEAR_FORM,
]);

export function isAllowedInbound(type: string): boolean {
  return ALLOWED_INBOUND.has(type);
}

export function isAllowedOutbound(type: string): boolean {
  return ALLOWED_OUTBOUND.has(type);
}
