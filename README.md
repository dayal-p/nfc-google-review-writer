# TapReview 📱 — NFC Google Review Card Writer

A modern, full-stack, mobile-first Web application that generates direct Google Review review-trigger URLs and programs them onto physical NFC tags (such as NXP NTAG213, NTAG215, and NTAG216) using the W3C **Web NFC API**.

Inspired by the workflow and aesthetic of modern NFC review cards (like **Product Mate**), TapReview provides real-time card previews, high-contrast vector QR codes, multiple review link mechanics, acoustic and haptic feedback, and tag-locking protection.

- **GitHub Repository:** [https://github.com/dayal-p/nfc-google-review-writer](https://github.com/dayal-p/nfc-google-review-writer)
- **Live GitHub Web App:** [https://dayal-p.github.io/nfc-google-review-writer/](https://dayal-p.github.io/nfc-google-review-writer/)

---

## ✨ Features

### 1. Dual Review Link Generation Modes
- **Mode A: Verified Business Profile (Places API Lookup)**
  - Interactive Google Places Autocomplete search.
  - Generates the direct 1-tap review trigger URL:  
    `https://search.google.com/local/writereview?placeid={PLACE_ID}`
  - Alternate fallback formats:
    - Legacy Maps CID: `https://maps.google.com/?cid={CID}`
    - Search Intent: `https://www.google.com/maps/search/?api=1&query={NAME}&query_place_id={PLACE_ID}`
  - Pre-loaded with quick-test sample businesses (Joe's Coffee NYC, Apex Dental, Blue Bottle, L'Ami Jean Paris, etc.).
  - Built-in URL parser: paste any Google Maps link or Place ID directly to extract and convert it.
  - Optional Google Places API key settings modal for worldwide live autocomplete queries.

- **Mode B: Non-Business / Custom / Manual Profile**
  - Designed for freelancers, creators, individuals without a physical storefront, or multi-platform profiles.
  - Presets for:
    - **Google Maps Custom Short Links**
    - **Trustpilot** (`https://www.trustpilot.com/evaluate/...`)
    - **Tripadvisor**
    - **Yelp**
    - **Custom Linktree / Portfolio**
  - Strict HTTPS validation and real-time validity badge.
  - Custom redirect slug & UTM tracking parameter support (e.g. `utm_source=nfc_card`).

---

### 2. Physical NFC Tag Programming (Web NFC API)
- **Browser & Hardware Capability Detection:**
  - Detects `NDEFReader in window`.
  - Distinguishes between Android Chrome (full Web NFC supported), iOS Safari (sandboxed by Apple), and desktop browsers.
  - Provides dismissible guidance and iOS alternative instructions (using the free *NFC Tools* app).
- **Writing Lifecycle State Machine:**
  - States: `Idle` ➔ `Ready to Tap (Scanning)` ➔ `Writing` ➔ `Success` / `Error`.
  - Abort controller with timeout cancellation.
  - Audio & Haptic feedback:
    - Synthesized Web Audio API acoustic chime on success.
    - `navigator.vibrate([100, 50, 100])` haptic pulse on supported mobile devices.
    - Confetti celebration burst.
- **Tag Lock Protection (Read-Only):**
  - Optional permanent tag lock toggle with a two-step safety confirmation warning.
- **Interactive Simulator Mode:**
  - Allows full end-to-end testing on desktop or non-NFC hardware.

---

### 3. Real-Time PVC Card Mockup ("Product Mate" Style)
- Visual simulation of a standard **ISO/IEC 7810 ID-1** NFC card (85.60 mm × 53.98 mm).
- Finish selector:
  - **Matte Black PVC** (with gold/silver typography)
  - **Pure White PVC**
  - **Brushed Gold PVC**
  - **Midnight Cyber Blue**
- Contactless NFC payment ripple wave indicator.
- Google 5-star rating stamp (`5.0 ★★★★★`).
- Flip interaction to preview the reverse side with the printed backup QR code.

---

### 4. Vector QR Code Generator & Printing Specs
- Live SVG QR code updated in real-time.
- One-click downloads:
  - **Download SVG** (Vector for commercial card printers and print shops).
  - **Download PNG** (High-resolution 1024×1024 px for digital sharing or stickers).
- Standard card print template dimensions guide.

---

### 5. Tag Memory Counter (NXP NTAG Compatibility)
Real-time payload byte size estimator:
- **NTAG213**: 144 usable bytes (recommended, low-cost, fits direct review URLs).
- **NTAG215**: 504 usable bytes.
- **NTAG216**: 888 usable bytes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v22)
- npm 9+

### Installation & Local Run
```bash
# Clone or navigate into repository
cd "nfc writer"

# Install dependencies
npm install

# Start development server with local network access
npm run dev -- --host
```

The app will be available at:
- **Local:** `http://localhost:5173/`
- **Network (for mobile testing on same Wi-Fi):** `http://<YOUR_LOCAL_IP>:5173/`

### Testing Physical NFC on an Android Phone
1. Connect your Android phone to the same Wi-Fi network.
2. Open **Google Chrome** on your phone.
3. Navigate to `http://<YOUR_LOCAL_IP>:5173/` (or deploy over HTTPS via Vercel/Netlify).
4. Tap **"Program NFC Card"** and hold an NTAG213/215/216 card against the back of your phone.
5. Once written, tap the card against any iPhone or Android phone to trigger the instant 5-star Google review box!
