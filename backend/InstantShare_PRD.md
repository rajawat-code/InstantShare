# INSTANTSHARE
## PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Product vision, users, features, workflows, business model, and acceptance criteria**

- **Project:** GPS-powered hyperlocal equipment-rental marketplace
- **Discovery model:** Selectable 100 m / 200 m / 300 m radius
- **Supply:** Nearby households and local businesses
- **Technology baseline:** React.js, Java, Spring Boot, Spring Data JPA / Hibernate, **MySQL Database**, Spring Security/JWT, GPS and Maps API, **Demo Mode Payment Gateway**
- **External API Footprint:** Minimalist / Self-Contained (Native Haversine MySQL geospatial filtering, internal Demo Payment Gateway, local/direct media handling)
- **Team:** Code Alpha — Anshuman Rajawat, Atul Kumar, and Abhimanyu Agnivanshi
- **Version:** 1.2 · Updated Architecture & Scope Specification (incorporating MySQL Database and Demo Mode Payment Gateway)

---

## 1. Product Overview
InstantShare is a GPS-powered hyperlocal marketplace for renting tools and equipment. It connects people who need an item temporarily with nearby households and local businesses that have underused equipment available. Instead of buying equipment for occasional use, renters can find and rent an item nearby within walking distance (100 m, 200 m, or 300 m).

---

## 2. Problem Statement
People often purchase expensive tools or equipment for one-off or short-term tasks, even though nearby households or local shops already own the exact same items. At the same time, power drills, ladders, cameras, lawnmowers, projectors, camping gear, and gardening tools sit idle in closets and garages. 

Potential renters lack a convenient, immediate way to discover nearby equipment ownership, real-time availability, fair rental pricing, and exact walking distance. The target user groups comprise students, urban households, DIY enthusiasts, hobbyists, small contractors, equipment owners, and local hardware shops.

---

## 3. Proposed Solution
InstantShare provides a shared two-sided marketplace where:
1. Owners (households & local shops) list equipment with hourly/daily pricing, photos, and approximate location.
2. Renters search using GPS coordinates within a strictly enforced micro-radius (100 m, 200 m, or 300 m).
3. Renters review equipment details and submit rental requests for specific time windows.
4. Owners accept or reject requests.
5. Accepted requests proceed through an integrated **Demo Mode Payment Gateway** allowing frictionless verification of checkout, deposit escrow simulation, and instant booking confirmation without real financial transactions.
6. Local handover, equipment use, return check, and reviews complete the lifecycle.

---

## 4. Product Goals and Non-Goals

### Product Goals:
- **Hyperlocal Discovery:** Make equipment discoverable inside a strict, user-selected micro-radius (100 m, 200 m, 300 m) using native backend/database geodesic calculations with zero reliance on paid external distance APIs.
- **Unified Inventory:** Combine peer-to-peer household inventory and local business inventory in one marketplace.
- **End-to-End Rental Journey:** Manage the full lifecycle from discovery and request to demo checkout, handover, return, and review.
- **Zero-Friction Demo Payments:** Fully simulate the payment, commission calculation, and webhook confirmation flow in demo mode to test the booking lifecycle without merchant onboarding delays or live credit card charges.
- **Asset Monetization:** Help equipment owners earn recurring income from otherwise idle assets.

### Initial Non-Goals:
- Nationwide or unrestricted city-wide search by default.
- Complex AI dynamic pricing, algorithmic demand forecasting, or automatic request approvals in MVP.
- Owned delivery logistics or physical courier fleet (focus on local pickup and return).
- Live credit-card settlement or production merchant banking integration during demo/MVP phase.

---

## 5. User Roles
1. **Renter:** Searches nearby equipment within 100–300 m, checks availability, requests rentals, completes demo checkout, picks up item, returns it, and writes reviews.
2. **Individual Owner:** Creates and manages equipment listings, sets rental rates, reviews incoming requests, coordinates handover, inspects returns, and tracks earnings.
3. **Local Business:** Lists commercial store inventory, manages high-volume availability, and serves nearby renters with commercial equipment.
4. **Administrator:** Moderates listings and users, oversees dispute resolution, and audits demo payment transactions.

---

## 6. Release Scope and Roadmap

| Phase | Duration | Scope & Deliverables |
|---|---|---|
| **Phase 1** | Months 1–3 | User registration/login (JWT), user profiles, equipment listing CRUD, MySQL database data layer, GPS 100–300 m search with backend Haversine filtering, listing details. |
| **Phase 2** | Months 4–6 | Availability slot management, rental requests, owner approval workflow, **Demo Mode Payment Gateway** (mock checkout modal, test cards, simulated webhooks, state transitions to CONFIRMED), rental history. |
| **Phase 3** | Months 7–9 | User identity verification, dual-sided ratings and reviews, security deposit escrow simulation, and damage reporting. |
| **Phase 4** | Month 10+ | Business dashboards, analytics, production payment gateway migration (Stripe / Razorpay live keys), and multi-city expansion. |

---

## 7. Functional Requirements

### 7.1 Authentication & Accounts
- Users can register and log in via email and password.
- Passwords hashed using BCrypt; sessions authenticated via stateless JSON Web Tokens (JWT).
- Role-based authorization for Renters, Owners, Businesses, and Admins.

### 7.2 Equipment Listings & Management
- Owners can create, update, pause, and delete their own equipment listings.
- Listing metadata includes: Title, Description, Category, Daily/Hourly Price, Photos (URLs or uploads), Availability Status, and Geolocation (Latitude/Longitude).
- Listings are persisted in **MySQL Database** with referential integrity.

### 7.3 Hyperlocal GPS Discovery (Zero External API Dependency)
- The client provides user coordinates (`latitude`, `longitude`) and a selected micro-radius (`100`, `200`, or `300` meters).
- The backend performs authoritative geodesic radius filtering directly on **MySQL Database** using mathematical Haversine calculations.
- Results strictly exclude items outside the radius; response includes exact distance in meters sorted nearest-first.
- Explicit non-expansion rule: If no items are found within 100 m, the system does not silently widen the radius.

### 7.4 Rental Booking Lifecycle
- Renter selects rental start and end timestamps and submits a booking request.
- Status initializes to `PENDING`.
- Listing owner receives the request and can `ACCEPT` or `REJECT`.
- Upon owner acceptance, the rental enters checkout state awaiting payment.

### 7.5 Payment Integration (Demo Mode)
- **Demo Mode Checkout:** After owner accepts, the renter initiates checkout.
- The backend generates a demo payment order with exact calculations:
  - Base rental fee
  - Platform commission (e.g., 10%)
  - Refundable security deposit (simulated)
- The frontend presents an interactive Demo Checkout dialog displaying order summary and preset test payment options (e.g., "Simulate Success", "Simulate Failure", test card numbers).
- **Simulated Webhook / Callback:** A demo payment confirmation triggers an idempotent callback to the backend.
- The backend updates the payment record to `SUCCESS` (mode `DEMO`), logs the transaction, and automatically updates the rental status from `PENDING` to `CONFIRMED`.
- Double-booking prevention: Confirmed bookings lock the availability window via transactional database checks.

### 7.6 Handover and Completion
- `CONFIRMED` -> `ACTIVE` when equipment is picked up.
- `ACTIVE` -> `RETURNED` when equipment is brought back and inspected.
- `RETURNED` -> `COMPLETED` closing the rental and releasing the simulated deposit.
- Both parties can submit ratings (1–5 stars) and reviews post-completion.

---

## 8. User Journeys

```
[Renter Flow]
Register/Login -> Allow GPS -> Choose Radius (100m/200m/300m) -> Browse Nearby
      -> View Listing -> Request Rental -> Owner Accepts -> Demo Payment Checkout
      -> Instant Simulated Confirmation -> Handover & Pickup -> Return Item -> Review

[Owner Flow]
Register/Login -> Create Listing with Location -> Set Price & Availability
      -> Receive Rental Request -> Accept Request -> Renter Pays (Demo Mode)
      -> Handover Equipment -> Inspect & Receive Return -> Rental Marked Completed
```

---

## 9. Business Model & Demo Simulation
- **Rental Commission:** Standard platform commission (e.g. 10%) calculated on gross rental value.
- **Business Subscriptions:** Tiered plans for commercial hardware stores for unlimited listings and analytics.
- **Featured Listings:** Promoted search placement within micro-radius results.
- **Demo Mode Transparency:** All commission and fee equations execute with production accuracy in Demo Mode, enabling full auditability and stakeholder demonstration without actual credit card debits.

---

## 10. Core Differentiators
1. **Strict 100–300 m Walking-Distance Radius:** Not a broad city search sorted by distance, but a true neighborhood walking-radius marketplace.
2. **Two-Sided Neighborhood Supply:** Unites household tools with neighborhood hardware store inventory.
3. **Self-Contained & Low-Cost Infrastructure:** Runs on MySQL Database with zero costly third-party map distance matrix or payment subscription dependencies during validation.

---

## 11. Privacy & Product UX Rules
- **Location Privacy:** Do not expose exact residential street addresses publicly on search results. Show approximate area and distance; reveal exact handover coordinates only after booking is `CONFIRMED`.
- **Demo Mode Banner:** Clearly badge the checkout modal with `Demo Mode - Simulated Payment` so testers and evaluators understand no real currency is moved.
- **No Results UX:** If no listings exist within 100 m, display an encouraging prompt suggesting the user switch to 200 m or 300 m.

---

## 12. Acceptance Criteria (PRD MVP)
1. **Authentication:** User can register, authenticate via JWT, and maintain session state.
2. **Listings:** Owners can create, update, and view equipment listings stored in MySQL Database.
3. **GPS Search:** Querying `GET /api/equipment/nearby?lat=...&lon=...&radius=100|200|300` returns only active items within the exact radius with computed distance in meters.
4. **Booking Lifecycle:** Renter creates request; Owner accepts; status updates accordingly.
5. **Demo Payment:** Renter clicks checkout, confirms demo payment, receives instant simulated confirmation, and rental status transitions to `CONFIRMED`.
6. **Data Storage:** All records (users, listings, rentals, payments, reviews) persist reliably in MySQL Database.
