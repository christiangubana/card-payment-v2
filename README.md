# Card Payment App (v2 — Next.js)

A mocked card payment page demonstrating PCI-compliant separation between a main payment page and an embedded iframe (Hosted Payment Page). All communication happens via browser `postMessage` window events.

This is the Next.js + TypeScript rewrite of the [vanilla JS v1](https://github.com/christiangubana/card-payment).

## Architecture

```
┌──────────────────────────────────────────────┐
│  Next.js App (src/)                          │
│  - React components + TypeScript             │
│  - Custom hooks for state & messaging        │
│  - CSS Modules for scoped styling            │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Static Iframe (public/iframe/)        │  │
│  │  - Vanilla JS (no framework)           │  │
│  │  - Card form fields (PCI scope)        │  │
│  │  - Validation + mock tokenisation      │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

The iframe content is intentionally **not** a React component. In production, this page would be hosted on the payment processor's domain — it must be a minimal, framework-free bundle.

## Communication Flow (postMessage)

1. Iframe loads → sends `CARD_IFRAME_READY` to parent
2. Parent receives ready signal → sends `INJECT_STYLES` with CSS payload
3. Iframe applies styles → sends `STYLES_APPLIED`
4. User clicks **Pay** → parent sends `TOKENIZE_CARD` to iframe
5. Iframe validates fields:
   - If errors → sends `VALIDATION_ERROR` with error details back to parent
   - If valid → mocks `POST /cards/tokenize`, then sends `CARD_TOKENIZED` with token + masked PAN
6. Parent performs mocked `POST /payments/process` using amount + card token
7. Parent logs redirect to success/failure URL

## Project Structure

```
card-payment-v2/
├── public/iframe/                  # Static iframe files (PCI scope, vanilla JS)
│   ├── card-form.html
│   └── card-form.js
├── src/
│   ├── app/
│   │   ├── globals.css             # CSS variables + reset
│   │   ├── layout.tsx              # Root layout with metadata
│   │   └── page.tsx                # Entry point → PaymentPage
│   ├── components/                 # Co-located component folders
│   │   ├── PaymentPage/
│   │   │   ├── index.tsx           # Main orchestrator (state, payment flow)
│   │   │   └── PaymentPage.module.css
│   │   ├── StoredCards/
│   │   │   ├── index.tsx           # Stored card tiles (select, delete)
│   │   │   └── StoredCards.module.css
│   │   ├── CardIframe/
│   │   │   ├── index.tsx           # Iframe wrapper (forwardRef)
│   │   │   └── CardIframe.module.css
│   │   └── Toast/
│   │       ├── index.tsx           # Auto-dismiss toast notifications
│   │       └── Toast.module.css
│   ├── hooks/
│   │   ├── useStoredCards.ts       # localStorage persistence + demo seeding
│   │   └── useIframeMessaging.ts   # postMessage protocol (send, receive, resize)
│   ├── lib/                        # Pure logic, no React dependency
│   │   ├── constants.ts            # Payment config, storage key, demo cards
│   │   ├── message-protocol.ts     # Message types, allowlists, type guards
│   │   ├── iframe-styles.ts        # CSS payload injected into card iframe
│   │   ├── validation.ts           # Luhn check, PAN/expiry/CVV validation
│   │   └── payment-service.ts      # Mock POST /payments/process
│   ├── types/
│   │   └── payment.ts              # Shared TypeScript interfaces
│   └── __tests__/                  # Unit tests (Jest)
│       ├── validation.test.ts      # Luhn, PAN, expiry, CVV, brand detection
│       ├── message-protocol.test.ts# Protocol contract + direction guards
│       └── useStoredCards.test.ts   # Hook: add, remove, dedup, persistence
├── jest.config.mjs
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## Running Locally

**Prerequisites:** [Git](https://git-scm.com/) and [Node.js](https://nodejs.org/) (v18 or later).

```bash
# 1. Clone the repository
git clone https://github.com/christiangubana/card-payment-v2.git

# 2. Navigate into the v2 project
cd card-payment-v2

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

> **Demo mode:** Append `?demo` to pre-seed stored cards: `http://localhost:3000/?demo`

## Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch
```

The test suite covers three areas:

| Suite | What it verifies |
|-------|-----------------|
| `validation.test.ts` | Luhn algorithm, PAN/expiry/CVV/name validation, card brand detection |
| `message-protocol.test.ts` | Message type allowlists, direction guards, contract parity with `card-form.js` |
| `useStoredCards.test.ts` | Hook behaviour: localStorage persistence, add/remove, deduplication, corrupted data recovery |

## Design Decisions

### Why Next.js for v2?

v1 proved the architecture works with zero dependencies. v2 adds:
- **TypeScript** — compile-time safety for the postMessage protocol, card types, and component props.
- **React component model** — composable, testable UI pieces vs. a single 330-line app.js.
- **Custom hooks** — `useIframeMessaging` and `useStoredCards` encapsulate side effects and can be unit-tested independently.
- **CSS Modules** — scoped styles that prevent class name collisions, built into Next.js.

### Why keep the iframe as vanilla JS?

The iframe represents a **payment processor's hosted page**. In production, this would be served from a separate origin (e.g., `pay.processor.com`). It must be:
- Lightweight (no framework overhead)
- Self-contained (no build step dependencies)
- Minimal attack surface

Keeping it as static HTML/JS in `public/iframe/` mirrors this reality.

### What would change in production?

| This mock | Production |
|-----------|------------|
| Iframe on same origin (`localhost`) | Iframe on payment processor's domain |
| Styles injected via postMessage | Same — this is how real hosted pages work |
| `window.location.origin` for postMessage target | Hardcoded production origin |
| Mock tokenisation (`setTimeout`) | Real API call to `POST /cards/tokenize` |
| Mock payment (`Math.random`) | Next.js API route or backend `POST /payments/process` |
| `localStorage` for saved cards | Backend API (`GET /payment-methods`) |
| CSP via Next.js config | CSP via HTTP response headers with nonces |

## Security Considerations

### Origin validation on postMessage

Both sides validate `event.origin` before processing messages. Each maintains an explicit allowlist of accepted message types, preventing injection of unexpected commands.

### XSS prevention

All dynamic content uses React's built-in escaping (`{variable}` in JSX) or safe DOM construction in the iframe (`textContent`, `createElement`). No `dangerouslySetInnerHTML` is used.

### PCI scope separation

Card details (PAN, CVV) exist **only inside the iframe**. The React app never sees raw card data — it only receives a tokenised reference.

### Autocomplete disabled

All card input fields use `autocomplete="off"` to prevent browsers from caching sensitive data.

### Iframe sandbox

The iframe uses `sandbox="allow-scripts allow-same-origin"`. In production with cross-origin hosting, this sandbox effectively restricts the iframe's capabilities.

## Test Cases

Open DevTools **Console** to observe the full postMessage flow and payment logs.

### Test 1 — Style injection from main page to iframe

1. Open `http://localhost:3000`.
2. **Expected:** Card form fields inside the iframe have dark theme styling (dark inputs, rounded borders, light text) matching the main page.
3. Open `http://localhost:3000/iframe/card-form.html` directly in a new tab.
4. **Expected:** The form appears unstyled (browser defaults, white background) — confirming styling is injected via postMessage.

### Test 2 — Validation errors on empty / invalid form

1. Open `http://localhost:3000` (no stored cards).
2. Click **Pay 100.00 EUR (Fee included)** without filling any fields.
3. **Expected:**
   - Button briefly shows "Processing..." then resets.
   - All four fields show red borders and error messages.
   - Errors appear in the main page below the iframe.
   - Red toast: "Please fix the errors above".
4. Fill only cardholder name, click **Pay** again.
5. **Expected:** Only that field clears its error; the other three remain.
6. Enter a card number that fails Luhn (e.g. `1234 5678 9012 3456`), click **Pay**.
7. **Expected:** "Card number is invalid".

### Test 3 — Successful new card payment + card saving

1. Open `http://localhost:3000`. Ensure "Save card" toggle is **ON**.
2. Enter valid details: Name `John Smith`, Card `4111 1111 1111 1111`, Expiry `12/28`, CVV `456`.
3. Click **Pay**.
4. **Expected:**
   - Spinner + "Processing..." on button.
   - Blue toast: "Card tokenized, processing payment...".
   - Green toast: "Payment of 100.00 EUR successful!" (~90% chance; retry if declined).
   - Form clears after success.
   - A Visa stored card tile appears showing `4111****1111` and `12/28`.
5. Console shows:
   ```
   [postMessage → iframe] TOKENIZE_CARD
   [Card Iframe] POST /cards/tokenize (mocked)
   [Card Iframe] Token received: tok_... | Masked PAN: 4111****1111
   [postMessage → parent] CARD_TOKENIZED
   [postMessage ← iframe] CARD_TOKENIZED
   [Payment] POST /payments/process { amount: "100.00", currency: "EUR", cardToken: "tok_..." }
   [Redirect] → /payment/success
   ```

### Test 4 — Paying with a stored card

1. Open `http://localhost:3000/?demo` to load demo stored cards.
2. Click the **Visa** tile — it gets a green/lime border.
3. Click **Pay**.
4. **Expected:**
   - Payment uses the stored token directly (no iframe validation).
   - Blue toast: "Processing payment with saved card...".
   - Green toast: "Payment of 100.00 EUR successful!".
5. Console: `[Payment] POST /payments/process (stored card)` and `[Redirect] → /payment/success`.

### Test 5 — Deselecting a stored card

1. With stored cards visible, click a card to select it.
2. Click the **same card** again.
3. **Expected:** Border removed (deselected). Card form still visible below.
4. Fill new card details, click **Pay**.
5. **Expected:** New card is validated and tokenised (not the stored card).

### Test 6 — Deleting a stored card

1. Open `http://localhost:3000/?demo`.
2. Click the trash icon on the Mastercard tile.
3. **Expected:** Mastercard removed; only Visa remains.
4. Click trash on Visa.
5. **Expected:** Stored cards section disappears entirely.
6. Reload without `?demo` — no stored cards appear (deleted from localStorage).

### Test 7 — Save card toggle OFF

1. Open `http://localhost:3000`. Turn "Save card" toggle **OFF**.
2. Enter valid details, click **Pay**.
3. **Expected:** Payment succeeds but no stored card tile appears.

### Test 8 — Input formatting

1. Type `4111111111111111` in card number field.
2. **Expected:** Auto-formats to `4111 1111 1111 1111`.
3. Type `1228` in expiry field.
4. **Expected:** Auto-formats to `12/28`.
5. Type `abc456def` in CVV field.
6. **Expected:** Only `456` appears (non-numeric stripped, max 4 digits).
