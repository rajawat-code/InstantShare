# InstantShare Backend

> **Hyperlocal Equipment-Rental Marketplace**  
> Powered by **Spring Boot 3**, **MySQL Database**, and an internal **Demo Mode Payment Gateway**.

---

## 🌟 Key Architecture Decisions & Updates

1. **Database: MySQL Database**
   - Direct connection to local or cloud MySQL (`jdbc:mysql://localhost:3306/instantshare?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true`).
   - Uses HikariCP connection pooling configured for robust MySQL performance.
   - Initial DDL script located at [`src/main/resources/db/migration/V1__init_schema.sql`](file:///src/main/resources/db/migration/V1__init_schema.sql).
   - Sample test inventory located at [`src/main/resources/db/seed_data.sql`](file:///src/main/resources/db/seed_data.sql).

2. **Zero / Minimal External API Strategy**
   - **Hyperlocal GPS Search:** Calculates exact geodesic distance using spherical **Haversine trigonometry natively in MySQL**. Does **NOT** call external Google Maps Distance Matrix or Directions APIs.
   - **Micro-Radius Support:** Strictly enforces `100m`, `200m`, and `300m` radius filters with fast B-Tree bounding box indexing.
   - **Payment Gateway in Demo Mode:** Internal mock gateway adapter handles checkout sessions, test card validation, instant simulated callbacks, and booking confirmation (`PENDING` -> `CONFIRMED`) without needing real merchant bank accounts or external credentials.
   - **Authentication:** Pure stateless JSON Web Tokens (JJWT) with BCrypt password hashing. Zero external Auth0 / Firebase dependency.
   - **Media Handling:** Direct image URLs / local storage references without mandatory S3 / Cloudinary requirements.

---

## 🚀 Quick Start

### 1. Configure MySQL Database
Ensure MySQL Server (8.0+) is installed and running (via MySQL service, XAMPP, or Docker):
```bash
# Example with Docker:
docker run -d --name instantshare-mysql -p 3306:3306 -e MYSQL_DATABASE=instantshare -e MYSQL_ALLOW_EMPTY_PASSWORD=yes mysql:8.0
```

Configure your credentials in `.env` (or via environment variables):
```bash
MYSQL_DB_HOST=localhost
MYSQL_DB_PORT=3306
MYSQL_DB_NAME=instantshare
MYSQL_DB_USERNAME=root
MYSQL_DB_PASSWORD=
```
Spring Boot Hibernate `ddl-auto: update` automatically generates the tables on first startup!
Alternatively, you can manually run [`src/main/resources/db/migration/V1__init_schema.sql`](file:///src/main/resources/db/migration/V1__init_schema.sql) in MySQL Workbench or CLI, followed by [`src/main/resources/db/seed_data.sql`](file:///src/main/resources/db/seed_data.sql) if you want sample listings.

### 2. Run the Application
In your terminal or IntelliJ IDEA:
```bash
mvn spring-boot:run
```
The server will start on port `8080`.

---

## 📡 API Reference & Testing Flows

### 1. Authentication
#### Register:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Anuj User",
    "email": "anuj@instantshare.test",
    "password": "password123",
    "phone": "+919876543210",
    "role": "RENTER"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "anuj@instantshare.test",
    "password": "password123"
  }'
```
*Save the `token` from the response to pass in `Authorization: Bearer <token>` for protected endpoints.*

---

### 2. Hyperlocal GPS Nearby Search (Public - Zero External Map API)
Search for active equipment within 100m, 200m, or 300m:
```bash
curl -X GET "http://localhost:8080/api/equipment/nearby?lat=12.914142&lon=77.636928&radius=200"
```
**Sample Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "userLatitude": 12.914142,
    "userLongitude": 77.636928,
    "radiusMeters": 200,
    "totalResults": 2,
    "items": [
      {
        "id": 1,
        "title": "Bosch 18V Cordless Impact Drill with Battery & Bits",
        "price": 150.00,
        "priceUnit": "DAY",
        "securityDeposit": 500.00,
        "categoryName": "Power Tools",
        "distanceMeters": 63.0,
        "displayArea": "Sector 1, HSR Layout (Near Park)"
      },
      {
        "id": 2,
        "title": "Heavy Duty 20ft Aluminum Telescoping Ladder",
        "price": 200.00,
        "priceUnit": "DAY",
        "securityDeposit": 800.00,
        "categoryName": "Ladders & Scaffolding",
        "distanceMeters": 158.0,
        "displayArea": "Sector 1, 14th Main"
      }
    ]
  }
}
```
*(Items outside 200m, like the Sony camera at 234m and pressure washer at 453m, are strictly excluded).*

---

### 3. Equipment Listings (Owner)
```bash
curl -X POST http://localhost:8080/api/equipment \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Makita Angle Grinder 840W",
    "description": "High performance angle grinder for metal and tile cutting",
    "categoryId": 1,
    "price": 180.00,
    "priceUnit": "DAY",
    "securityDeposit": 600.00,
    "latitude": 12.914300,
    "longitude": 77.637100,
    "displayArea": "Sector 1, 5th Cross",
    "imageUrls": ["https://images.unsplash.com/photo-1504148455328-c376907d081c"]
  }'
```

---

### 4. Rental Lifecycle & Demo Payment Checkout

#### Step A: Renter submits a rental request
```bash
curl -X POST http://localhost:8080/api/rentals \
  -H "Authorization: Bearer <RENTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": 1,
    "startAt": "2026-11-20T10:00:00Z",
    "endAt": "2026-11-21T10:00:00Z"
  }'
```
*Status: `PENDING`*

#### Step B: Owner accepts the request
```bash
curl -X PATCH http://localhost:8080/api/rentals/1/decision \
  -H "Authorization: Bearer <OWNER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "ACCEPT"
  }'
```

#### Step C: Renter starts Demo Checkout
```bash
curl -X POST http://localhost:8080/api/payments/checkout \
  -H "Authorization: Bearer <RENTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rentalId": 1
  }'
```
*Returns `orderId` (e.g. `demo_ord_179456...`), price breakdown (Rental + 10% platform fee + refundable deposit), and preset test card numbers.*

#### Step D: Renter confirms payment using Demo Card (Simulated Approval)
```bash
curl -X POST http://localhost:8080/api/payments/demo-confirm \
  -H "Authorization: Bearer <RENTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rentalId": 1,
    "orderId": "demo_ord_179456...",
    "cardNumber": "4242 4242 4242 4242",
    "expiry": "12/28",
    "cvv": "123"
  }'
```
*Result: Payment status becomes `SUCCESS`, and rental automatically transitions to `CONFIRMED`!*

#### Step E: Equipment Handover & Return
```bash
# Owner marks item handed over (ACTIVE)
curl -X PATCH http://localhost:8080/api/rentals/1/handover \
  -H "Authorization: Bearer <OWNER_TOKEN>"

# Owner confirms return (COMPLETED)
curl -X PATCH http://localhost:8080/api/rentals/1/return \
  -H "Authorization: Bearer <OWNER_TOKEN>"
```

#### Step F: Review
```bash
curl -X POST http://localhost:8080/api/reviews \
  -H "Authorization: Bearer <RENTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rentalId": 1,
    "rating": 5,
    "comment": "Excellent drill, worked smoothly and great communication with owner!"
  }'
```

---

## 💳 Demo Payment Test Cards

| Card Number | Expiry | CVV | Behavior |
|---|---|---|---|
| `4242 4242 4242 4242` | `12/28` | `123` | **Instant Approval** (`SUCCESS` -> Rental `CONFIRMED`) |
| `4000 0000 0000 0002` | `12/28` | `123` | **Simulated Decline** (`FAILED`) |
| `5000 0000 0000 0003` | `12/28` | `123` | **Insufficient Funds** (`FAILED`) |

You can also pass `"simulateFailure": true` in `DemoConfirmRequest` to force an error.

---

## 📁 Project Directory Structure
```
InstantShare/
├── InstantShare_PRD.md            # Updated Product Requirements Document
├── InstantShare_PRD.pdf           # Updated PRD PDF
├── InstantShare_TRD.md            # Updated Technical Requirements Document
├── InstantShare_TRD.pdf           # Updated TRD PDF
├── pom.xml                        # Maven dependencies & build configuration
├── .env.example                   # Environment configuration template
├── README.md                      # Comprehensive developer guide
└── src/
    ├── main/
    │   ├── java/com/instantshare/
    │   │   ├── InstantShareApplication.java
    │   │   ├── config/            # SecurityConfig, CorsConfig, WebMvcConfig
    │   │   ├── security/          # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal
    │   │   ├── auth/              # AuthController, AuthService, DTOs
    │   │   ├── user/              # User, BusinessProfile, UserService, UserController
    │   │   ├── location/          # Location, GeoUtils (Haversine math)
    │   │   ├── equipment/         # Equipment, Category, EquipmentRepository, Service, Controller
    │   │   ├── rental/            # Rental, RentalStatus, Service, Controller
    │   │   ├── payment/           # Payment, DemoPaymentGatewayAdapter, Service, Controller
    │   │   ├── review/            # Review, ReviewService, ReviewController
    │   │   └── common/            # ApiResponse, GlobalExceptionHandler, AppConstants
    │   └── resources/
    │       ├── application.yml    # MySQL Database & application settings
    │       └── db/
    │           ├── migration/
    │           │   └── V1__init_schema.sql  # MySQL schema DDL
    │           └── seed_data.sql            # Hyperlocal sample inventory
    └── test/
        └── java/com/instantshare/ # Unit tests for GeoUtils and Demo Gateway
```
