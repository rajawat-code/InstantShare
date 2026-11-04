# InstantShare – Frontend-First MVP

**InstantShare** is a modern, responsive, hyperlocal peer-to-peer rental web platform where neighbors can discover, request, and rent useful equipment temporarily without purchasing it. Users can also list their idle items for rent, approve or reject rental requests, and manage handovers.

This frontend is fully functional using mock data and browser `localStorage`, with an isolated API service layer ready for future Spring Boot REST API integration.

---

## 🌟 Key Features

### 1. User Roles (Dual Persona)
A single user can act as both a **Renter** and an **Owner**:
- **Renter Workflow**:
  - Discover items nearby with real-time keyword search and category filtering.
  - View detailed item specs, owner reputation, condition, and pricing.
  - Submit rental requests with automatic hourly/daily duration and cost calculations.
  - Track requests across lifecycle states (Pending, Accepted, Active, Completed, Cancelled).
  - Cancel pending requests at any time.
- **Owner Workflow**:
  - List new equipment with validation, photo selection, pricing, and location.
  - Edit existing listings and adjust pricing or availability.
  - Delete listings with a safe confirmation dialog.
  - Manage incoming rental requests via the **Owner Dashboard**.
  - Execute full state transitions: **Accept** / **Reject** → **Mark Handed Over** (Active) → **Mark Returned** (Completed).

### 2. Multi-User Demo Switcher
- Switch instantly between 5 pre-configured demo users across Indian cities (Agra, New Delhi, Bengaluru, Mumbai, Jaipur).
- Test dual perspectives in seconds (e.g. rent a camera as Priya from Aarav, then switch to Aarav to accept the booking and mark it as handed over).
- One-click **Reset Demo Data** button anytime to restore fresh initial data in `localStorage`.

### 3. Booking Workflow & Lifecycle
```
[Renter Submits Request] ──> PENDING
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       [Owner Accepts]                 [Owner Rejects] ──> REJECTED
               │                               ▲
               │ (Renter can also Cancel)      │
               │                               └── CANCELLED
               ▼
     [Owner Marks Handed Over] ──> ACTIVE
               │
               ▼
     [Owner Marks Returned] ──> COMPLETED
```

---

## 🛠️ Technology Stack

- **React 19** – Functional components and hooks (`useState`, `useEffect`, `useContext`, `useMemo`)
- **Vite** – Ultra-fast modern bundler & dev server
- **Tailwind CSS v4** (`@tailwindcss/vite`) – Clean, human-designed UI with authentic visual hierarchy
- **React Router v7** (`react-router-dom`) – Client-side routing with deep links & search query sync
- **Axios** – Configured HTTP client with abstracted service methods for future REST integration
- **Lucide React** – Minimalist, crisp iconography

---

## 📁 Project Structure

```text
instantshare-frontend/
│
├── public/
├── src/
│   ├── assets/              # Static assets & icons
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx              # Responsive navigation & demo switcher dropdown
│   │   ├── Footer.jsx              # Footer with About, Contact, Terms, Privacy modals
│   │   ├── ItemCard.jsx            # Product card with price, duration & availability
│   │   ├── SearchBar.jsx           # Debounced search input with clear trigger
│   │   ├── CategoryFilter.jsx      # Interactive chips & category card grid
│   │   ├── BookingCard.jsx         # Booking record card with cancellation action
│   │   ├── BookingStatusBadge.jsx  # Color-coded badge for all 6 booking statuses
│   │   ├── LoadingSpinner.jsx      # Accessible animated loading spinner
│   │   ├── ConfirmDialog.jsx       # Modal confirmation dialog for critical actions
│   │   └── ToastNotification.jsx   # Non-intrusive feedback toast alerts
│   │
│   ├── pages/               # Application views
│   │   ├── Home.jsx                # Landing page with hero search, categories & featured items
│   │   ├── Explore.jsx             # Search, category filter, price range & sort
│   │   ├── ItemDetails.jsx         # Full item specs & live rental cost calculator
│   │   ├── AddItem.jsx             # Form to publish new item with validation & presets
│   │   ├── EditItem.jsx            # Form to update existing item info
│   │   ├── MyListings.jsx          # Owner inventory with edit & delete actions
│   │   ├── MyBookings.jsx          # Renter booking history with status filters
│   │   ├── OwnerDashboard.jsx      # Metrics overview & request approval table
│   │   └── Profile.jsx             # User profile, demo user switcher & data reset
│   │
│   ├── data/
│   │   └── mockData.js             # Realistic seed data (5 users, 17 items, 10 bookings)
│   │
│   ├── services/
│   │   ├── storageService.js       # Browser localStorage persistence layer
│   │   └── apiService.js           # Abstracted API layer (localStorage + Axios ready)
│   │
│   ├── context/
│   │   └── UserContext.jsx         # Active user session, user switching, and toasts
│   │
│   ├── utils/
│   │   └── pricing.js              # Currency formatting (₹ INR) & duration math
│   │
│   ├── App.jsx                     # Route definitions & scroll-to-top logic
│   ├── main.jsx                    # React entrypoint
│   └── index.css                   # Tailwind v4 import & custom styling
│
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm or pnpm

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd instant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing User Journeys

### Journey A: Rent an Item as Priya
1. Click the top-right profile switcher and ensure **Priya Patel** is selected.
2. Go to **Explore** or search for "DSLR" on the Home page.
3. Select **Canon EOS 90D DSLR Camera Kit** (owned by Aarav Sharma).
4. Select your desired start and end times in the booking section.
5. Notice the estimated rental total automatically updates (e.g., 4 hours × ₹200 = ₹800).
6. Click **Send Rental Request**. You are redirected to **My Bookings** with status `PENDING`.

### Journey B: Accept and Hand Over Item as Aarav
1. Open the top-right profile switcher and switch to **Aarav Sharma**.
2. Navigate to **Owner Dashboard**.
3. Under **Rental Requests & Actions**, locate Priya's pending booking for the Canon 90D.
4. Click **Accept**. The status changes to `ACCEPTED`.
5. When ready to deliver, click **Mark Handed Over**. The status becomes `ACTIVE`.
6. When Priya returns the gear, click **Mark Returned**. The status becomes `COMPLETED`.

### Journey C: List a New Equipment
1. Click **List an Item** in the navigation bar.
2. Fill out the form or pick a preset image (Camera, Tool, Bicycle, Projector, etc.).
3. Choose **Hourly** or **Daily** rental rate.
4. Click **Publish Listing**. It immediately appears in **My Listings** and on the **Explore** marketplace.

---

## 🔮 Future Spring Boot Integration

The frontend was specifically decoupled from data storage:
- All data interactions flow through `src/services/apiService.js`.
- Future Spring Boot backend endpoints will map directly:
  - `GET /api/items` – List & search items
  - `GET /api/items/{id}` – Item details
  - `POST /api/items` – Create listing
  - `PUT /api/items/{id}` – Update listing
  - `DELETE /api/items/{id}` – Delete listing
  - `GET /api/bookings` – Fetch user bookings
  - `POST /api/bookings` – Create booking request
  - `PATCH /api/bookings/{id}/status` – Transition booking status
  - `GET /api/users` – Fetch users & profiles

---

## 📄 License
MIT License. Built for the InstantShare Hyperlocal Peer Rental Platform.
