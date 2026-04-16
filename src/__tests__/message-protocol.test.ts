import {
  MessageType,
  ALLOWED_INBOUND,
  ALLOWED_OUTBOUND,
  isAllowedInbound,
  isAllowedOutbound,
} from '@/lib/message-protocol';

describe('MessageType constants', () => {
  it('defines all 7 message types', () => {
    expect(Object.keys(MessageType)).toHaveLength(7);
  });
});

describe('ALLOWED_INBOUND (iframe → parent)', () => {
  it('contains exactly the four iframe-to-parent message types', () => {
    expect(ALLOWED_INBOUND.size).toBe(4);
    expect(ALLOWED_INBOUND.has(MessageType.CARD_IFRAME_READY)).toBe(true);
    expect(ALLOWED_INBOUND.has(MessageType.STYLES_APPLIED)).toBe(true);
    expect(ALLOWED_INBOUND.has(MessageType.VALIDATION_ERROR)).toBe(true);
    expect(ALLOWED_INBOUND.has(MessageType.CARD_TOKENIZED)).toBe(true);
  });

  it('does not include any outbound types', () => {
    expect(ALLOWED_INBOUND.has(MessageType.INJECT_STYLES)).toBe(false);
    expect(ALLOWED_INBOUND.has(MessageType.TOKENIZE_CARD)).toBe(false);
    expect(ALLOWED_INBOUND.has(MessageType.CLEAR_FORM)).toBe(false);
  });
});

describe('ALLOWED_OUTBOUND (parent → iframe)', () => {
  it('contains exactly the three parent-to-iframe message types', () => {
    expect(ALLOWED_OUTBOUND.size).toBe(3);
    expect(ALLOWED_OUTBOUND.has(MessageType.INJECT_STYLES)).toBe(true);
    expect(ALLOWED_OUTBOUND.has(MessageType.TOKENIZE_CARD)).toBe(true);
    expect(ALLOWED_OUTBOUND.has(MessageType.CLEAR_FORM)).toBe(true);
  });
});

describe('inbound / outbound sets are disjoint', () => {
  it('shares no message types between the two directions', () => {
    for (const type of ALLOWED_INBOUND) {
      expect(ALLOWED_OUTBOUND.has(type)).toBe(false);
    }
    for (const type of ALLOWED_OUTBOUND) {
      expect(ALLOWED_INBOUND.has(type)).toBe(false);
    }
  });
});

describe('type-guard helpers', () => {
  it('isAllowedInbound accepts valid inbound types', () => {
    expect(isAllowedInbound('CARD_TOKENIZED')).toBe(true);
    expect(isAllowedInbound('CARD_IFRAME_READY')).toBe(true);
  });

  it('isAllowedInbound rejects outbound and unknown types', () => {
    expect(isAllowedInbound('INJECT_STYLES')).toBe(false);
    expect(isAllowedInbound('RANDOM_JUNK')).toBe(false);
    expect(isAllowedInbound('')).toBe(false);
  });

  it('isAllowedOutbound accepts valid outbound types', () => {
    expect(isAllowedOutbound('INJECT_STYLES')).toBe(true);
    expect(isAllowedOutbound('TOKENIZE_CARD')).toBe(true);
  });

  it('isAllowedOutbound rejects inbound and unknown types', () => {
    expect(isAllowedOutbound('CARD_TOKENIZED')).toBe(false);
    expect(isAllowedOutbound('HACKER_MSG')).toBe(false);
  });
});

describe('contract parity with card-form.js', () => {
  // The iframe (public/iframe/card-form.js) maintains its own allowlist.
  // These string-literal assertions act as a contract test — if either side
  // renames a message type, this test breaks.
  const IFRAME_SENDS = ['CARD_IFRAME_READY', 'STYLES_APPLIED', 'VALIDATION_ERROR', 'CARD_TOKENIZED'];
  const IFRAME_ACCEPTS = ['INJECT_STYLES', 'TOKENIZE_CARD', 'CLEAR_FORM'];

  it('parent inbound set matches what the iframe sends', () => {
    IFRAME_SENDS.forEach(type => {
      expect(ALLOWED_INBOUND.has(type)).toBe(true);
    });
    expect(ALLOWED_INBOUND.size).toBe(IFRAME_SENDS.length);
  });

  it('parent outbound set matches what the iframe accepts', () => {
    IFRAME_ACCEPTS.forEach(type => {
      expect(ALLOWED_OUTBOUND.has(type)).toBe(true);
    });
    expect(ALLOWED_OUTBOUND.size).toBe(IFRAME_ACCEPTS.length);
  });
});
