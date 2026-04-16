import {
  luhnCheck,
  validatePan,
  validateExpiry,
  validateCvv,
  validateCardholderName,
  detectBrand,
} from '@/lib/validation';

describe('luhnCheck', () => {
  it('accepts known-valid test PANs', () => {
    expect(luhnCheck('4111111111111111')).toBe(true);
    expect(luhnCheck('5500000000000004')).toBe(true);
    expect(luhnCheck('340000000000009')).toBe(true);
  });

  it('rejects arbitrary invalid numbers', () => {
    expect(luhnCheck('1234567890123456')).toBe(false);
    expect(luhnCheck('1111111111111111')).toBe(false);
  });

  it('handles single-digit edge case', () => {
    expect(luhnCheck('0')).toBe(true);
  });
});

describe('validatePan', () => {
  it('returns null for a valid Visa PAN', () => {
    expect(validatePan('4111111111111111')).toBeNull();
  });

  it('rejects PAN shorter than 13 digits', () => {
    expect(validatePan('411111')).toBe('Enter a valid card number');
  });

  it('rejects PAN longer than 19 digits', () => {
    expect(validatePan('41111111111111111111')).toBe('Enter a valid card number');
  });

  it('rejects PAN that fails Luhn', () => {
    expect(validatePan('4111111111111112')).toBe('Card number is invalid');
  });

  it('rejects empty string', () => {
    expect(validatePan('')).toBe('Enter a valid card number');
  });
});

describe('validateExpiry', () => {
  it('returns null for a future date', () => {
    expect(validateExpiry('12/40')).toBeNull();
  });

  it('rejects malformed input', () => {
    expect(validateExpiry('1328')).toBe('Enter a valid expiry (MM/YY)');
    expect(validateExpiry('00/30')).toBe('Enter a valid expiry (MM/YY)');
    expect(validateExpiry('')).toBe('Enter a valid expiry (MM/YY)');
  });

  it('rejects expired card', () => {
    expect(validateExpiry('01/20')).toBe('Card has expired');
  });
});

describe('validateCvv', () => {
  it('accepts 3-digit CVV', () => {
    expect(validateCvv('123')).toBeNull();
  });

  it('accepts 4-digit CVV (Amex)', () => {
    expect(validateCvv('1234')).toBeNull();
  });

  it('rejects too short', () => {
    expect(validateCvv('12')).toBe('Enter a valid CVV');
  });

  it('rejects empty', () => {
    expect(validateCvv('')).toBe('Enter a valid CVV');
  });
});

describe('validateCardholderName', () => {
  it('accepts valid name', () => {
    expect(validateCardholderName('John Smith')).toBeNull();
  });

  it('rejects single character', () => {
    expect(validateCardholderName('J')).toBe('Enter the cardholder name');
  });

  it('rejects whitespace-only', () => {
    expect(validateCardholderName('   ')).toBe('Enter the cardholder name');
  });
});

describe('detectBrand', () => {
  it('detects Visa (starts with 4)', () => {
    expect(detectBrand('4111111111111111')).toBe('visa');
  });

  it('detects Mastercard (starts with 51-55)', () => {
    expect(detectBrand('5500000000000004')).toBe('mastercard');
  });

  it('detects Mastercard (starts with 22-27)', () => {
    expect(detectBrand('2221000000000000')).toBe('mastercard');
  });

  it('detects Amex (starts with 34 or 37)', () => {
    expect(detectBrand('340000000000009')).toBe('amex');
    expect(detectBrand('370000000000002')).toBe('amex');
  });

  it('returns unknown for unrecognised prefix', () => {
    expect(detectBrand('9999999999999999')).toBe('unknown');
  });
});
