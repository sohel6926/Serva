# SERVA: Multiple Services Provider

**Tagline:** *All Your Needs, One Platform*

SERVA is a full-stack multi-service booking and partner operations marketplace built with React 19, TypeScript, Tailwind CSS v4, Express, and SQLite (`better-sqlite3`), covering **Home Services**, **Contractors**, **Events**, **Agriculture**, and **Moving and Shifting**.

---

## Quick Start

### 1. Prerequisites
- Node.js 20+ and npm

### 2. Environment Variables
Copy `.env.example` to `.env` if running outside AI Studio (default development values work out of the box):
- `GEMINI_API_KEY`: Optional (not required for core booking flows)
- `APP_URL`: Optional application base URL
- `SESSION_SECRET`: Optional HMAC signing secret for `serva_session` HTTP-only cookies (falls back to a local dev secret when unset)

### 3. Install, Seed & Run
```bash
npm install
npm run db:seed
npm run dev
```
The Express + Vite middleware dev server runs on **http://localhost:3000**.

### 4. Build, Production Start & Verification
```bash
npm run build
npm start
npm run lint
npm test
```

---

## Demo Login Credentials

| Role | Email / Phone | Password | Notes |
| --- | --- | --- | --- |
| **Customer** | `ananya@serva.demo` (`9876543210`) | `Serva@123` | Pre-seeded addresses (`HOME` & `FARM`), wallet credit, bookings |
| **Verified Partner 1** | `ramesh.partner@serva.demo` (`9876500001`) | `Serva@123` | Home Services, Contractors, Moving crew |
| **Verified Partner 2** | `lakshmi.partner@serva.demo` (`9876500003`) | `Serva@123` | Cooking, Events (Decor/Catering/DJ), Agriculture |
| **Pending Partner** | `pending.partner@serva.demo` (`9876500002`) | `Serva@123` | Awaiting Admin approval (blocked `403` from accepting jobs until verified) |
| **Admin** | `admin@serva.demo` (`9876599999`) | `Admin@123` | Partner verification, pricing settings, ledger & moderation |

**Demo OTP & Google Sign-In:** Mobile OTP login (`POST /api/auth/otp/request`) displays a demo 6-digit OTP banner in development (`demoOtp` returned from API in non-production mode). Google Sign-In works via `/api/auth/google-demo` for instant customer demo sign-in.

---

## Route Map

### Public & Discovery
- `/` — Home landing page with quick category tiles, banner carousel, search, popular services, offers
- `/services` — Complete service catalogue directory
- `/search` — Full-text keyword & category search (`?q=`)
- `/login` — Email/phone password login, registration, mobile OTP login, and demo account quick-fill
- `/offers` — Active discount & promotional offers
- `/support` — FAQs, missing/damaged item complaint form with photo upload, callback request
- `/about`, `/terms`, `/privacy`, `/refund-policy` — Platform information & legal policies

### Category Flows
- `/home-services` & `/home-services/repairing|cleaning|cooking|painting`
  - Repairing (electrician, plumbing, appliance, mobile/laptop), Cleaning (home, commercial, septic/drainage), Home Cooking (3 food categories, 100% online payment), Painting (2D/3D wall art, 100% online payment)
- `/contractors` & `/contractors/interior-design|construction-workers|construction-vehicles|home-construction`
  - Interior Design portfolios, Daily/Weekly/Monthly Workers, Vehicles & Material Supply, and Free Promotion Home Construction enquiries
- `/events` & `/events/plan` & `/events/:slug`
  - Multi-vendor Event Planner or single service (Decoration, Catering, Photography, Tent/Lighting, Event Staff, Makeup, Mehendi, Haldi, Transport, and standalone **DJ**) with mandatory 30% advance before confirmation
- `/agriculture` & `/agriculture/workers|services|machinery`
  - Farm labour teams, crop operations & drone spraying, Tractor / Harvester / JCB rentals
- `/moving` & `/moving/:slug`
  - Exact 7 Moving & Shifting services (with combined *Loading and Unloading* and zero SERVA transport vehicles)

### Customer Account & Booking
- `/book/:category/:service` — Custom service booking request form
- `/book/summary` & `/book/pay` — Price transparency review (`Estimated` / `Confirmed`), quotation approval, online UPI/Card/Wallet checkout & COD (where allowed)
- `/bookings` & `/bookings/:id` — Live timeline, partner arrival/departed confirmations, before/after photos, itemised extra-work quotes, in-booking chat, review & complaint submission
- `/wallet` — Wallet balance, demo top-up, transactions & digital receipts
- `/profile` — Saved `HOME`/`FARM` addresses CRUD, EN/TE language switch, city selector

### Partner & Admin
- `/partner/register` — 4-step individual or team onboarding wizard
- `/partner/dashboard` — Requests, Machinery & Fleet, Portfolio uploads, Availability, Rates & Box Sizes, Construction Enquiries, Payouts
- `/admin` — Partner Approvals, Home Services Settlement Ledger (worker payout & platform revenue), All Bookings, Commission Settings (`7%`, `₹100` addon), Gallery Moderation, Complaints
