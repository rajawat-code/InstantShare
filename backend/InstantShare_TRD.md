# INSTANTSHARE
## TECHNICAL REQUIREMENTS DOCUMENT (TRD)
**Architecture, modules, data model, APIs, GPS search, security, testing, and deployment**

- **Project:** GPS-powered hyperlocal equipment-rental marketplace
- **Discovery model:** Selectable 100 m / 200 m / 300 m radius
- **Backend Stack:** Java 17/21, Spring Boot 3.x, Spring Data JPA / Hibernate, Spring Security + Stateless JWT
- **Database:** **MySQL Database (MySQL 8.0+)**
- **Payment Gateway:** **Integrated in Demo Mode** (Self-contained mock gateway adapter, order creation, simulated webhook callbacks)
- **External API Dependency Strategy:** Minimalist & Zero-Cost — Geodesic radius queries calculated natively via Haversine SQL math, self-contained Demo Payment Gateway, local/direct image references.
- **Team:** Code Alpha — Anshuman Rajawat, Atul Kumar, and Abhimanyu Agnivanshi
- **Version:** 1.1 · Updated Technical Design Specification

---

## 1. System Architecture & Baseline

### 1.1 High-Level Architecture
```
┌────────────────────────────────────────────────────────┐
│             React.js Client Application                │
│    (GPS Geolocation, Radius Selector, Demo Checkout)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│          Spring Boot REST API (Modular Monolith)       │
│                                                        │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────┐ │
│  │ Auth & Security│ │Nearby Discovery│ │Rental State │ │
│  │  (JWT/BCrypt)  │ │ (Haversine/GPS)│ │   Machine   │ │
│  └────────────────┘ └────────────────┘ └─────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │       Demo Payment Gateway Subsystem              │ │
│  │  (Mock Orders, Test Cards, Webhook Simulator)     │ │
│  └───────────────────────────────────────────────────┘ │
└───────────────────────────┬────────────────────────────┘
                            │ JDBC / HikariCP (SSL)
                            ▼
┌────────────────────────────────────────────────────────┐
│                 MySQL 8.0+ Database                    │
│  - Relational Schema (Users, Equipment, Rentals, ...) │
│  - Geospatial Bounding Box & Distance Calculations     │
│  - Pessimistic Row Locking (SELECT ... FOR UPDATE)     │
│  - InnoDB ACID Transactions & B-Tree Spatial Indexes   │
└────────────────────────────────────────────────────────┘
```

### 1.2 Minimizing External APIs
To keep infrastructure costs zero during development and avoid rate limits or vendor lock-in:
1. **Nearby Geolocation:** Calculated mathematically in the database / backend via Haversine spherical geometry. Eliminates expensive Google Maps Distance Matrix or Directions APIs.
2. **Payment Processing:** Handled via an internal `DemoPaymentGatewayAdapter` providing end-to-end checkout, token generation, and webhook verification without requiring live Stripe/Razorpay accounts.
3. **Authentication:** Pure stateless JWT with BCrypt password hashing. No external Auth0 or Firebase Auth dependency.
4. **Media Storage:** Equipment photos reference direct URLs or local media endpoints with fallback placeholders.

---

## 2. Package Structure (`com.instantshare`)

```
com.instantshare
├── InstantShareApplication.java
├── config/
│   ├── SecurityConfig.java               # Stateless Spring Security filter chain & CORS
│   └── WebMvcConfig.java                 # Jackson & web interceptors
├── security/
│   ├── JwtTokenProvider.java             # Token generation, claims & validation
│   ├── JwtAuthenticationFilter.java      # Bearer token extractor & SecurityContext setter
│   ├── CustomUserDetailsService.java     # UserDetailsService loading from MySQL Database
│   └── UserPrincipal.java                # Spring Security UserDetails adapter
├── auth/
│   ├── AuthController.java               # /api/auth/register, /api/auth/login
│   ├── AuthService.java                  # Registration & authentication logic
│   └── dto/                              # RegisterRequest, LoginRequest, AuthResponse
├── user/
│   ├── User.java                         # User JPA Entity
│   ├── BusinessProfile.java              # BusinessProfile JPA Entity
│   ├── UserRepository.java               # Spring Data JPA repository
│   ├── UserService.java                  # Profile CRUD
│   └── UserController.java               # /api/users/me
├── equipment/
│   ├── Equipment.java                    # Equipment entity
│   ├── EquipmentImage.java               # Image URLs
│   ├── Category.java                     # Categories
│   ├── EquipmentRepository.java          # Custom query methods with distance formulas
│   ├── EquipmentService.java             # CRUD and status management
│   ├── EquipmentController.java          # /api/equipment CRUD & /nearby
│   └── dto/                              # EquipmentRequest, EquipmentResponse, NearbyItemDto
├── location/
│   ├── Location.java                     # Geolocation coordinates entity
│   ├── LocationRepository.java
│   └── GeoUtils.java                     # Haversine distance & bounding box math
├── rental/
│   ├── Rental.java                       # Rental entity
│   ├── RentalStatus.java                 # PENDING, CONFIRMED, ACTIVE, RETURNED, COMPLETED, CANCELLED
│   ├── RentalRepository.java             # Overlap checking & queries
│   ├── RentalService.java                # State machine & concurrency locks
│   ├── RentalController.java             # /api/rentals, lifecycle endpoints
│   └── dto/                              # RentalRequest, RentalResponse, StatusTransitionRequest
├── payment/
│   ├── Payment.java                      # Payment record entity
│   ├── PaymentStatus.java                # INITIATED, SUCCESS, FAILED, REFUNDED
│   ├── PaymentMode.java                  # DEMO, LIVE
│   ├── PaymentRepository.java
│   ├── PaymentService.java               # Checkout order creation, confirmation, webhook processing
│   ├── PaymentController.java            # /api/payments/checkout, /api/payments/demo-confirm, /api/payments/webhook
│   ├── adapter/
│   │   ├── PaymentGatewayAdapter.java    # Common gateway contract
│   │   └── DemoPaymentGatewayAdapter.java# Self-contained Demo simulation engine
│   └── dto/                              # CheckoutRequest, CheckoutResponse, DemoPaymentConfirmRequest, WebhookEvent
├── review/
│   ├── Review.java                       # Review entity
│   ├── ReviewRepository.java
│   ├── ReviewService.java
│   └── ReviewController.java             # /api/reviews
└── common/
    ├── dto/ApiResponse.java              # Standard envelope {success, message, data, timestamp}
    ├── exception/
    │   ├── ResourceNotFoundException.java
    │   ├── BadRequestException.java
    │   ├── UnauthorizedException.java
    │   └── GlobalExceptionHandler.java   # Centralized HTTP status and error responses
    └── util/AppConstants.java
```

---

## 3. MySQL Data Model (DDL)

```sql
-- 1. Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'RENTER', -- RENTER, OWNER, BUSINESS, ADMIN
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Business Profiles
CREATE TABLE business_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(150) NOT NULL,
    description TEXT,
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id BIGINT REFERENCES categories(id),
    active BOOLEAN DEFAULT TRUE
);

-- 4. Equipment Listings
CREATE TABLE equipment (
    id BIGSERIAL PRIMARY KEY,
    owner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id BIGINT REFERENCES business_profiles(id) ON DELETE SET NULL,
    category_id BIGINT REFERENCES categories(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    price_unit VARCHAR(20) NOT NULL DEFAULT 'DAY', -- HOUR, DAY, WEEK
    security_deposit NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, DELETED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Locations (Geographic coordinates)
CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT UNIQUE NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    display_area VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for locations & spatial bounding queries
CREATE INDEX idx_locations_lat_lon ON locations(latitude, longitude);
CREATE INDEX idx_locations_equipment_id ON locations(equipment_id);

-- 6. Equipment Images
CREATE TABLE equipment_images (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

-- 7. Rentals (Bookings)
CREATE TABLE rentals (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id),
    renter_id BIGINT NOT NULL REFERENCES users(id),
    owner_id BIGINT NOT NULL REFERENCES users(id),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, ACTIVE, RETURNED, COMPLETED, CANCELLED, REJECTED
    quoted_amount NUMERIC(10, 2) NOT NULL,
    security_deposit NUMERIC(10, 2) DEFAULT 0.00,
    platform_fee NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rentals_eq_dates ON rentals(equipment_id, start_at, end_at, status);
CREATE INDEX idx_rentals_renter ON rentals(renter_id);
CREATE INDEX idx_rentals_owner ON rentals(owner_id);

-- 8. Payments (Demo Mode & Live Capable)
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'DEMO_GATEWAY',
    mode VARCHAR(20) NOT NULL DEFAULT 'DEMO', -- DEMO, LIVE
    provider_order_id VARCHAR(100) NOT NULL,
    provider_payment_id VARCHAR(100),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'INITIATED', -- INITIATED, SUCCESS, FAILED, REFUNDED
    paid_at TIMESTAMPTZ,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_rental ON payments(rental_id, status);
CREATE INDEX idx_payments_order ON payments(provider_order_id);

-- 9. Reviews
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT UNIQUE NOT NULL REFERENCES rentals(id),
    reviewer_id BIGINT NOT NULL REFERENCES users(id),
    reviewee_id BIGINT NOT NULL REFERENCES users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. GPS Micro-Radius Search Implementation

### 4.1 Native Haversine Distance Formula in Postgres
Rather than paying for an external mapping API, the backend calculates the geodesic distance directly using the spherical law of cosines / Haversine formula in PostgreSQL:

$$\text{distance} = 6371000 \times \arccos\Big(\sin(\text{lat}_1)\sin(\text{lat}_2) + \cos(\text{lat}_1)\cos(\text{lat}_2)\cos(\text{lon}_2 - \text{lon}_1)\Big)$$

### 4.2 Two-Stage Optimized Spatial Query
1. **Stage 1 (Bounding Box Filter):** Uses standard B-Tree index on `(latitude, longitude)` to filter candidates within a fast square bounding box:
   - $\Delta\text{lat} = \frac{\text{radius}}{111139}$
   - $\Delta\text{lon} = \frac{\text{radius}}{111139 \times \cos(\text{lat})}$
2. **Stage 2 (Exact Geodesic Distance Calculation):** Checks exact meters and discards items beyond the radius:

```sql
SELECT e.id, e.title, e.price, e.price_unit, e.security_deposit,
       l.latitude, l.longitude, l.display_area,
       (6371000.0 * acos(
          least(1.0, greatest(-1.0,
            sin(radians(:userLat)) * sin(radians(l.latitude)) +
            cos(radians(:userLat)) * cos(radians(l.latitude)) *
            cos(radians(l.longitude) - radians(:userLon))
          ))
       )) AS distance_meters
FROM equipment e
JOIN locations l ON e.id = l.equipment_id
WHERE e.status = 'ACTIVE'
  AND l.latitude BETWEEN :minLat AND :maxLat
  AND l.longitude BETWEEN :minLon AND :maxLon
  AND (6371000.0 * acos(
          least(1.0, greatest(-1.0,
            sin(radians(:userLat)) * sin(radians(l.latitude)) +
            cos(radians(:userLat)) * cos(radians(l.latitude)) *
            cos(radians(l.longitude) - radians(:userLon))
          ))
       )) <= :radiusMeters
ORDER BY distance_meters ASC;
```

---

## 5. Demo Mode Payment Gateway Engine

### 5.1 Design Pattern: Gateway Adapter
The payment architecture decouples business logic from gateway specifics through `PaymentGatewayAdapter`:

```java
public interface PaymentGatewayAdapter {
    CheckoutOrder createOrder(Rental rental, BigDecimal amount, String currency);
    PaymentVerificationResult verifyPayment(String orderId, String paymentId, String signature);
    PaymentVerificationResult processWebhook(String rawPayload, String signatureHeader);
}
```

### 5.2 Demo Implementation (`DemoPaymentGatewayAdapter`)
- **Order Generation:** Creates mock orders with unique identifiers: `demo_ord_<nano_timestamp>`.
- **Fee Calculation:** Calculates transparent breakdown:
  - Base Rental: $P \times D$
  - Platform Fee: 10%
  - Security Deposit: Refundable deposit
  - Total Payable: $\text{Base} + \text{Platform Fee} + \text{Security Deposit}$
- **Simulation Actions:**
  - `POST /api/payments/demo-confirm`: Instant verification endpoint allowing test suites or frontend demo UI to confirm payment without third-party redirects.
  - Preset mock cards:
    - `4242 4242 4242 4242` -> Auto-success
    - `4000 0000 0000 0002` -> Insufficient funds simulation
    - `5000 0000 0000 0003` -> Network error simulation
- **State Transition:** Upon successful demo verification, payment updates to `SUCCESS` and rental immediately transitions from `PENDING` to `CONFIRMED`.

---

## 6. REST API Contracts

### 6.1 Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login and receive JWT token

### 6.2 Equipment & Nearby Search
- `POST /api/equipment` — Create equipment listing (Auth required)
- `GET /api/equipment/{id}` — Get equipment details
- `PUT /api/equipment/{id}` — Update own listing
- `DELETE /api/equipment/{id}` — Soft delete / pause listing
- `GET /api/equipment/nearby?lat={lat}&lon={lon}&radius={100|200|300}&category={opt}` — Hyperlocal search

### 6.3 Rental Lifecycle
- `POST /api/rentals` — Request a rental
- `GET /api/rentals/{id}` — Get rental details
- `GET /api/rentals/my` — Get user's rental history (as renter or owner)
- `PATCH /api/rentals/{id}/decision` — Owner accepts (`CONFIRMED`) or rejects (`REJECTED`)
- `PATCH /api/rentals/{id}/handover` — Handover equipment (`ACTIVE`)
- `PATCH /api/rentals/{id}/return` — Return equipment (`RETURNED` -> `COMPLETED`)

### 6.4 Payments (Demo Mode)
- `POST /api/payments/checkout` — Initiate demo payment checkout for accepted rental
- `POST /api/payments/demo-confirm` — Confirm demo payment and transition rental to `CONFIRMED`
- `POST /api/payments/webhook` — Simulated webhook receiver with idempotency checking
- `GET /api/payments/status/{rentalId}` — Query payment status for rental

### 6.5 Reviews
- `POST /api/reviews` — Submit review after rental completion

---

## 7. MySQL Connection Configuration

In `src/main/resources/application.yml`:
```yaml
spring:
  application:
    name: instantshare-backend
  datasource:
    url: ${MYSQL_DB_URL:jdbc:mysql://${MYSQL_DB_HOST:localhost}:${MYSQL_DB_PORT:3306}/${MYSQL_DB_NAME:instantshare}?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true}
    username: ${MYSQL_DB_USERNAME:root}
    password: ${MYSQL_DB_PASSWORD:}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      idle-timeout: 30000
      max-lifetime: 1800000
      connection-timeout: 20000
  jpa:
    database: mysql
    database-platform: org.hibernate.dialect.MySQLDialect
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        format_sql: false

instantshare:
  jwt:
    secret: ${JWT_SECRET:InstantShareSuperSecretKeyForDevelopmentOnlyMustBeChangedInProduction32CharsMin}
    expiration-ms: 86400000 # 24 hours
  payment:
    mode: DEMO
    platform-fee-percent: 10.0
    demo:
      auto-confirm: false
```

---

## 8. Technical Acceptance Checklist
- [x] Spring Boot 3.x project structured cleanly under `com.instantshare`.
- [x] Configured for **MySQL Database** with MySQLDialect, pooling, and indexes.
- [x] Geodesic radius queries calculated purely via **native Haversine SQL** without third-party map APIs.
- [x] **Demo Mode Payment Gateway** fully implemented with mock checkout, test card validations, simulated webhooks, and automatic status transition.
- [x] Stateless JWT authentication and role-based route security.
- [x] Concurrency and double-booking checks enforced on MySQL Database.
