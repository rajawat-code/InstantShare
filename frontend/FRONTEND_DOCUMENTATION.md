# InstantShare – Frontend Technology & Libraries Documentation

> **Project Name:** InstantShare  
> **Platform Type:** Hyperlocal Peer-to-Peer Rental Web Application  
> **Architecture:** Frontend-First Single Page Application (SPA), REST-Ready  
> **Current Version:** 1.0.0 (Frontend MVP Phase)  
> **Document Date:** November 2026  

---

## 1. Executive Overview

**InstantShare** is a hyperlocal peer-to-peer equipment and item rental web application. It enables neighbors to discover, rent, and list tools, appliances, cameras, and outdoor gear within walking distance—specifically centered around a **200-meter proximity radius**.

The frontend has been built completely client-side first, utilizing mock data and browser `localStorage` for state persistence, with a fully decoupled services layer designed for direct connection to a future **Spring Boot** backend.

---

## 2. Core Technology Stack

The application is built on modern, standard web technologies prioritizing performance, modularity, and zero boilerplate:

### 2.1 Technology Specifications

1. **User Interface Framework: React 19 (`v19.3.1`)**
   - Built exclusively with functional React components and React Hooks (`useState`, `useEffect`, `useRef`, `useContext`, `useCallback`, `useMemo`).
   - Clean component hierarchy with no class components or legacy lifecycles.
   - Zero external global state overhead (no Redux, Zustand, or MobX needed).

2. **Build System & Tooling: Vite 8 (`v8.3.5`)**
   - High-performance ES Module bundling using Rollup/Rolldown under the hood.
   - Instant Hot Module Replacement (HMR) for sub-second development feedback.
   - Custom module aliasing configured in `vite.config.js` (`@` resolves directly to `./src`).

3. **Styling Engine: Tailwind CSS v4 (`v4.3.4`)**
   - Modern `@tailwindcss/vite` integration.
   - Custom branding color system:
     - **Primary:** Forest Green (`#166534`, `#236B45`)
     - **Secondary / Surfaces:** Light Green (`#DCFCE7`, `#EEF3EE`)
     - **Canvas Background:** Off-white (`#F8F8F5`, `#F8FAFC`)
     - **Typography:** Dark Charcoal (`#1F2937`, `#252B27`)
     - **Accents & Badges:** Warm Gold / Amber (`#FACC15`)
   - Utility-first responsive design supporting Mobile, Tablet, and Desktop breakpoints (`sm:`, `md:`, `lg:`, `xl:`).

4. **Client-Side Routing: React Router DOM v7 (`v7.18.5`)**
   - Declarative `BrowserRouter`, `Routes`, `Route`, `NavLink`, and `Link`.
   - Dynamic parameter routing (`/items/:id`, `/edit-item/:id`).
   - URL query parameter state synchronization (`?nearby=true&radius=200&category=Tools`).
   - Automatic `ScrollToTop` trigger upon page navigation.

---

## 3. Library Breakdown & Counts

The project strictly follows a lightweight philosophy: **avoiding unnecessary libraries, bloated component frameworks, or external authentication vendors**.

### 3.1 Production Dependencies (8 Libraries)

| # | Package Name | Version | Purpose & Usage in InstantShare |
| :-: | :--- | :---: | :--- |
| **1** | `react` | `^19.3.1` | Core React library powering component lifecycle, virtual DOM, and reactive hooks. |
| **2** | `react-dom` | `^19.3.1` | Renders React components to the browser DOM (`createRoot`). |
| **3** | `react-router-dom` | `^7.18.5` | Client-side routing, deep linking, location history, and navigation management. |
| **4** | `tailwindcss` | `^4.3.4` | Modern CSS styling engine for all cards, modals, grids, and responsive layouts. |
| **5** | `@tailwindcss/vite` | `^4.3.4` | Vite native compiler plugin for Tailwind v4. |
| **6** | `lucide-react` | `^1.67.0` | Comprehensive icon system (pins, navigation, ratings, tools, categories, badges). |
| **7** | `three` | `^0.187.0` | 3D graphics library for GPU-accelerated WebGL geometry, lighting, and spatial radar. |
| **8** | `axios` | `^1.21.0` | Promise-based HTTP client configured to connect to future Spring Boot endpoints. |

### 3.2 Development Dependencies (5 Libraries)

| # | Package Name | Version | Purpose & Usage in InstantShare |
| :-: | :--- | :---: | :--- |
| **1** | `vite` | `^8.3.5` | Next-generation dev server and production asset bundler. |
| **2** | `@vitejs/plugin-react` | `^6.1.2` | Fast Refresh and JSX transformation plugin for Vite. |
| **3** | `oxlint` | `^1.89.0` | Ultra-fast Rust-based static code analysis and linting engine. |
| **4** | `@types/react` | `^19.3.0` | TypeScript definitions and IDE autocompletion for React. |
| **5** | `@types/react-dom` | `^19.3.0` | TypeScript definitions and IDE autocompletion for React DOM. |

> **Total Libraries Count:** **13 packages** (8 production dependencies + 5 developer dependencies).

---

## 4. Frontend Architecture & Directory Structure

```
src/
├── assets/                     # Static media and brand icons
├── components/                 # Reusable UI components
│   ├── 3d/                     # 3D Visual & Physics components
│   │   ├── Tilt3DImageCard.jsx # 3D organic floating tilt image showcase
│   │   ├── Hyperlocal3DHub.jsx # Three.js 200m spatial radar hub
│   │   └── HeroBackground3D.jsx# Three.js particle wave
│   ├── ui/                     # UI visual modules
│   │   ├── AnimatedHomeBackground.jsx # Luminous canvas peer-to-peer network
│   │   ├── shader-animation.jsx       # Three.js WebGL ripple shader
│   │   └── responsive-hero-banner.jsx # Space exploration hero banner
│   ├── CategoryFilter.jsx      # Multi-category selection pills/cards
│   ├── Footer.jsx              # Application footer with info links
│   ├── ItemCard.jsx            # Standardized rental card with distance badge
│   ├── Navbar.jsx              # Responsive header, active route pill, user switcher
│   ├── NearbyDiscoverySection.jsx # Proximity radius selector & nearby list
│   ├── ToastNotification.jsx   # Global success/error toast alerts
│   └── UserSwitcher.jsx        # Demo persona selector (Renter vs Owner)
├── context/                    # React Context API Global State
│   ├── LocationContext.jsx     # GPS coordinates, distance calc, radius state
│   └── UserContext.jsx         # Current user, demo switching, data reset
├── data/                       # Mock data repositories
│   └── mockData.js             # Seed data for users, items, and initial bookings
├── pages/                      # Application route views
│   ├── Home.jsx                # Landing page with 3D tilt showcase & nearby hub
│   ├── Explore.jsx             # Search, category filters, price range, distance
│   ├── ItemDetails.jsx         # Rental calculator, owner details, request modal
│   ├── AddItem.jsx             # Listing creation form with image validation
│   ├── EditItem.jsx            # Edit existing listing details
│   ├── MyBookings.jsx          # Renter's booking tracker (Pending/Approved/Active)
│   ├── MyListings.jsx          # Owner's item inventory & availability toggle
│   ├── OwnerDashboard.jsx      # Rental request approval workflow & earnings
│   ├── Profile.jsx             # User stats and settings
│   ├── DemoOne.jsx             # Standalone Three.js shader demo
│   └── HeroDemo.jsx            # Standalone Mars flight banner demo
├── services/                   # Business logic and external communication
│   ├── apiService.js           # REST-like asynchronous mock API (CRUD)
│   ├── locationService.js      # Haversine distance, walking time, sorting
│   └── storageService.js       # Browser localStorage CRUD abstraction
├── utils/                      # Helper utility functions
│   ├── dateUtils.js            # Booking dates, hours, and duration formatting
│   ├── distance.js             # Geodesic mathematical formulas
│   └── pricing.js              # Currency formatter (₹ INR) & duration math
├── App.jsx                     # Root router, layouts, scroll-to-top
├── index.css                   # Tailwind v4 import & custom font bindings
└── main.jsx                    # Application entry point (createRoot)
```

---

## 5. Core Systems & Technical Implementations

### 5.1 Hyperlocal Geolocation Engine (`locationService.js` + `LocationContext.jsx`)
- **Geolocation API Integration:** Interacts directly with `navigator.geolocation.getCurrentPosition`.
- **Haversine Distance Formula:** Calculates spherical earth distances between user coordinates and item coordinates:
  $$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lng}}{2}\right)}\right)$$
- **Walking Time Estimation:** Calculates walking durations based on standard pedestrian velocity ($4.8\text{ km/h}$ or $80\text{ m/min}$).
- **Radius Filtering:** Supports $100\text{m}$, $200\text{m}$ (default), $300\text{m}$, and $500\text{m}$ thresholds.
- **Fail-Safe Demo Location:** If location permissions are denied or GPS is unavailable, seamlessly switches to an explicit Demo Hub with realistic local items.

### 5.2 Decoupled Data & Persistence Layer (`storageService.js` + `apiService.js`)
- All user modifications (adding items, editing prices, submitting rental requests, approving/rejecting bookings) are saved to browser `localStorage`.
- `apiService.js` wraps all storage access in asynchronous Promises with simulated network latency ($150\text{ms}$), mimicking real HTTP responses.
- **Spring Boot Migration Path:** When backend development begins, replacing `apiService.js` internal calls with `axios.get('/api/v1/items')` requires **zero modifications** to any React page or UI component.

### 5.3 3D Graphics & Visual Animation Systems

1. **Random 3D Tilt Image Showcase (`Tilt3DImageCard.jsx`)**:
   - Multi-frequency incommensurate harmonic physics running on `requestAnimationFrame` at 60 FPS:
     - **Pitch (`rotateX`):** Gentle organic sway ($\pm 4.2^\circ$).
     - **Yaw (`rotateY`):** Smooth horizontal tilt ($\pm 5.6^\circ$).
     - **Roll (`rotateZ`):** Subtle banking ($\pm 1.3^\circ$).
     - **Float (`translateY`):** Soft $\pm 4.4\text{px}$ vertical breathing float.
   - **Stereoscopic 3D Depth:** Child elements pop out on the Z-axis (`translateZ: 18px` to `26px`).
   - **Dynamic Lighting:** Real-time specular sheen and contact ground shadow that move inversely with tilt.
   - **Cursor Blending:** Mouse coordinates seamlessly blend into the tilt angle with spring damping (`lerp: 0.035`).

2. **Luminous Background Network (`AnimatedHomeBackground.jsx`)**:
   - High-performance HTML5 2D Canvas rendering 70 floating neighborhood peer nodes.
   - Dynamic proximity threshold line drawing (visualizing the peer-to-peer sharing mesh).
   - Radial glow halos with pulsing intensity (`ctx.shadowBlur`).
   - Interactive cursor beacon projecting a $190\text{px}$ proximity aura.
   - Expanding $200\text{m}$ radar ripples on click.
   - CSS Aurora ambient light pools in brand emerald and sunlight gold.

---

## 6. Route & Navigation Map

| Path | Component | Accessible To | Purpose |
| :--- | :--- | :---: | :--- |
| `/` | `Home.jsx` | Public | Hero search, 3D tilt showcase, nearby gear, categories, "How It Works". |
| `/explore` | `Explore.jsx` | Public | Catalog browsing, multi-filter search, sorting, GPS nearby toggles. |
| `/items/:id` | `ItemDetails.jsx` | Public | High-res item gallery, owner info, pricing calculator, rental request modal. |
| `/add-item` | `AddItem.jsx` | Owner | Listing creation form with validation and coordinate tagging. |
| `/edit-item/:id` | `EditItem.jsx` | Owner | Listing edit form to update price, duration, and availability. |
| `/my-bookings` | `MyBookings.jsx` | Renter | Rental tracking (Pending, Approved, Ongoing, Completed, Cancelled). |
| `/my-listings` | `MyListings.jsx` | Owner | Inventory management, quick availability toggle, item deletion. |
| `/dashboard` | `OwnerDashboard.jsx` | Owner | Rental request management (Accept/Reject, Handover, Return) + Earnings. |
| `/profile` | `Profile.jsx` | All | User account details, stats, role switching, demo data reset. |
| `/demo-one` | `DemoOne.jsx` | Developer | Full-screen Three.js WebGL ripple shader demonstration. |
| `/hero-demo` | `HeroDemo.jsx` | Developer | Full-screen responsive Mars exploration hero banner. |
