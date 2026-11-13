# InstantShare API Documentation & Testing Guide

> **Hyperlocal Equipment-Rental Marketplace**  
> Complete interactive specification, endpoint catalog, curl commands, and end-to-end test workflows.

---

## 📌 Testing Environment & Base URLs

- **Base URL:** `http://localhost:8080/api`
- **Content-Type:** `application/json`
- **Default Authentication Scheme:** `Bearer <JWT_TOKEN>`

### Pre-Configured Test Accounts (from `seed_data.sql`):
All passwords are set to: `password123`

| Role | Name | Email | Password | Primary Purpose |
|---|---|---|---|---|
| **Renter** | Abhimanyu Agnivanshi | `renter@instantshare.test` | `password123` | Search, request rentals, test demo checkout |
| **Owner 1** | Anshuman Rajawat | `owner1@instantshare.test` | `password123` | Owns Drill (63m) & Camera (234m), accepts requests |
| **Owner 2** | Atul Kumar | `owner2@instantshare.test` | `password123` | Owns Ladder (158m), accepts requests |
| **Business** | Sharma Hardware Store | `business@instantshare.test` | `password123` | Owns Pressure Washer (453m), commercial inventory |

---

## Standard Response Format

### Success Envelope (`HTTP 200` / `HTTP 201`)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-11-13T17:30:00Z"
}
```

### Error Envelope (`HTTP 400` / `HTTP 401` / `HTTP 403` / `HTTP 404`)
```json
{
  "success": false,
  "message": "Specific error explanation",
  "data": null,
  "errorCode": "BAD_REQUEST",
  "timestamp": "2026-11-13T17:30:00Z"
}
```

---

## 1. Authentication Module

### 1.1 Register New User
- **Method & Route:** `POST /api/auth/register`
- **Auth:** Public
- **Description:** Registers a new user account (Renter, Owner, or Business).

#### Request Body:
```json
{
  "name": "Vikram Malhotra",
  "email": "vikram@instantshare.test",
  "password": "password123",
  "phone": "+919811223344",
  "role": "RENTER"
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vikram Malhotra",
    "email": "vikram@instantshare.test",
    "password": "password123",
    "phone": "+919811223344",
    "role": "RENTER"
  }'
```

#### Response (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "userId": 5,
    "name": "Vikram Malhotra",
    "email": "vikram@instantshare.test",
    "role": "RENTER"
  },
  "timestamp": "2026-11-13T17:30:00Z"
}
```

---

### 1.2 User Login
- **Method & Route:** `POST /api/auth/login`
- **Auth:** Public
- **Description:** Authenticates with email and password to receive a stateless JWT token.

#### Request Body:
```json
{
  "email": "renter@instantshare.test",
  "password": "password123"
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "renter@instantshare.test",
    "password": "password123"
  }'
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzIiwiZW1haWwiOiJyZW50ZXJAaW5zdGFudHNoYXJlLnRlc3QiLCJpYXQiOjE3OTQ1Njc4MDAsImV4cCI6MTc5NDY1NDIwMH0.X8u2K9L...",
    "tokenType": "Bearer",
    "userId": 3,
    "name": "Abhimanyu Agnivanshi",
    "email": "renter@instantshare.test",
    "role": "RENTER"
  },
  "timestamp": "2026-11-13T17:30:00Z"
}
```

---

## 2. User Profile Module

### 2.1 Get Current User Profile
- **Method & Route:** `GET /api/users/me`
- **Auth:** Bearer Token required

#### Example cURL:
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <TOKEN>"
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": 3,
    "name": "Abhimanyu Agnivanshi",
    "email": "renter@instantshare.test",
    "phone": "+919876543212",
    "role": "RENTER",
    "status": "ACTIVE",
    "businessName": null,
    "businessDescription": null,
    "createdAt": "2026-11-13T16:00:00Z"
  }
}
```

---

### 2.2 Update User Profile
- **Method & Route:** `PUT /api/users/me`
- **Auth:** Bearer Token required

#### Request Body:
```json
{
  "name": "Abhimanyu A.",
  "phone": "+919876599999"
}
```

#### Example cURL:
```bash
curl -X PUT http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Abhimanyu A.",
    "phone": "+919876599999"
  }'
```

---

## 3. Categories & Equipment Module

### 3.1 List Categories
- **Method & Route:** `GET /api/categories`
- **Auth:** Public

#### Example cURL:
```bash
curl -X GET http://localhost:8080/api/categories
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {"id": 1, "name": "Power Tools", "active": true},
    {"id": 2, "name": "Hand Tools", "active": true},
    {"id": 3, "name": "Ladders & Scaffolding", "active": true},
    {"id": 4, "name": "Lawn & Gardening", "active": true},
    {"id": 5, "name": "Cameras & Audio/Video", "active": true},
    {"id": 6, "name": "Camping & Outdoor Gear", "active": true},
    {"id": 7, "name": "Cleaning & Pressure Washers", "active": true}
  ]
}
```

---

### 3.2 Hyperlocal GPS Nearby Search (Zero External Map API)
- **Method & Route:** `GET /api/equipment/nearby`
- **Auth:** Public
- **Query Parameters:**
  - `lat` (required, double): User's latitude (e.g. `12.914142`)
  - `lon` (required, double): User's longitude (e.g. `77.636928`)
  - `radius` (optional, integer): Supported micro-radii: `100`, `200`, `300` (defaults to `200`)
  - `category` (optional, integer): Filter by Category ID

#### Test Case A: Micro-Radius 100 meters (returns only 63m drill)
```bash
curl -X GET "http://localhost:8080/api/equipment/nearby?lat=12.914142&lon=77.636928&radius=100"
```
*Expected: Returns 1 listing (Bosch Drill at 63m). Ladder at 158m and Camera at 234m are excluded.*

#### Test Case B: Micro-Radius 200 meters (returns drill & ladder)
```bash
curl -X GET "http://localhost:8080/api/equipment/nearby?lat=12.914142&lon=77.636928&radius=200"
```
*Expected: Returns 2 listings (Bosch Drill at 63m, Ladder at 158m). Camera at 234m and Pressure Washer at 453m are excluded.*

#### Test Case C: Micro-Radius 300 meters (returns drill, ladder, camera)
```bash
curl -X GET "http://localhost:8080/api/equipment/nearby?lat=12.914142&lon=77.636928&radius=300"
```
*Expected: Returns 3 listings (Drill 63m, Ladder 158m, Camera 234m). Pressure Washer at 453m is strictly excluded.*

#### Response Sample (`200 OK`):
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
        "description": "Heavy-duty 18V drill suitable for concrete, masonry, wood, and steel. Includes 2 batteries and full bit set.",
        "price": 150.00,
        "priceUnit": "DAY",
        "securityDeposit": 500.00,
        "categoryName": "Power Tools",
        "distanceMeters": 63.0,
        "latitude": 12.914592,
        "longitude": 77.637278,
        "displayArea": "Sector 1, HSR Layout (Near Park)",
        "ownerId": 1
      },
      {
        "id": 2,
        "title": "Heavy Duty 20ft Aluminum Telescoping Ladder",
        "description": "Compact multi-position ladder. Extends up to 20 feet. Easy to transport in a car boot.",
        "price": 200.00,
        "priceUnit": "DAY",
        "securityDeposit": 800.00,
        "categoryName": "Ladders & Scaffolding",
        "distanceMeters": 158.0,
        "latitude": 12.912992,
        "longitude": 77.637778,
        "displayArea": "Sector 1, 14th Main",
        "ownerId": 2
      }
    ]
  }
}
```

---

### 3.3 Create Equipment Listing (Owner)
- **Method & Route:** `POST /api/equipment`
- **Auth:** Bearer Token required (Owner or Business user)

#### Request Body:
```json
{
  "title": "DeWalt 12-Inch Compound Miter Saw",
  "description": "Precise crosscutting and miter cuts. Includes carbide blade and dust bag.",
  "categoryId": 1,
  "price": 250.00,
  "priceUnit": "DAY",
  "securityDeposit": 1000.00,
  "latitude": 12.914250,
  "longitude": 77.637050,
  "displayArea": "Sector 1, 7th Cross",
  "imageUrls": [
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407"
  ]
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:8080/api/equipment \
  -H "Authorization: Bearer <OWNER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "DeWalt 12-Inch Compound Miter Saw",
    "description": "Precise crosscutting and miter cuts. Includes carbide blade and dust bag.",
    "categoryId": 1,
    "price": 250.00,
    "priceUnit": "DAY",
    "securityDeposit": 1000.00,
    "latitude": 12.914250,
    "longitude": 77.637050,
    "displayArea": "Sector 1, 7th Cross",
    "imageUrls": [
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407"
    ]
  }'
```

---

### 3.4 Get Equipment Details
- **Method & Route:** `GET /api/equipment/{id}`
- **Auth:** Public

#### Example cURL:
```bash
curl -X GET http://localhost:8080/api/equipment/1
```

---

### 3.5 Update Equipment Listing
- **Method & Route:** `PUT /api/equipment/{id}`
- **Auth:** Bearer Token required (Must be owner of listing)

#### Request Body:
```json
{
  "title": "Bosch 18V Cordless Impact Drill (Updated with Extra Batteries)",
  "description": "Includes 3 batteries, masonry bits, and quick charger.",
  "categoryId": 1,
  "price": 160.00,
  "priceUnit": "DAY",
  "securityDeposit": 500.00,
  "latitude": 12.914592,
  "longitude": 77.637278,
  "displayArea": "Sector 1, HSR Layout"
}
```

#### Example cURL:
```bash
curl -X PUT http://localhost:8080/api/equipment/1 \
  -H "Authorization: Bearer <OWNER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bosch 18V Cordless Impact Drill (Updated with Extra Batteries)",
    "description": "Includes 3 batteries, masonry bits, and quick charger.",
    "categoryId": 1,
    "price": 160.00,
    "priceUnit": "DAY",
    "securityDeposit": 500.00,
    "latitude": 12.914592,
    "longitude": 77.637278,
    "displayArea": "Sector 1, HSR Layout"
  }'
```

---

### 3.6 Delete Equipment Listing (Soft Delete)
- **Method & Route:** `DELETE /api/equipment/{id}`
- **Auth:** Bearer Token required (Must be owner of listing)

```bash
curl -X DELETE http://localhost:8080/api/equipment/1 \
  -H "Authorization: Bearer <OWNER_TOKEN>"
```

---

### 3.7 Get My Equipment Listings
- **Method & Route:** `GET /api/equipment/my`
- **Auth:** Bearer Token required

```bash
curl -X GET http://localhost:8080/api/equipment/my \
  -H "Authorization: Bearer <OWNER_TOKEN>"
```

---

## 4. Rental Lifecycle Module

### 4.1 Submit Rental Request (Renter)
- **Method & Route:** `POST /api/rentals`
- **Auth:** Bearer Token required (Renter)

#### Request Body:
```json
{
  "equipmentId": 1,
  "startAt": "2026-11-20T09:00:00Z",
  "endAt": "2026-11-22T09:00:00Z"
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:8080/api/rentals \
  -H "Authorization: Bearer <RENTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": 1,
    "startAt": "2026-11-20T09:00:00Z",
    "endAt": "2026-11-22T09:00:00Z"
  }'
```

#### Response (`201 Created`):
```json
{
  "success": true,
  "message": "Rental request submitted successfully",
  "data": {
    "id": 1,
    "equipmentId": 1,
    "equipmentTitle": "Bosch 18V Cordless Impact Drill with Battery & Bits",
    "renterId": 3,
    "renterName": "Abhimanyu Agnivanshi",
    "renterEmail": "renter@instantshare.test",
    "renterPhone": "+919876543212",
    "ownerId": 1,
    "ownerName": "Anshuman Rajawat",
    "startAt": "2026-11-20T09:00:00Z",
    "endAt": "2026-11-22T09:00:00Z",
    "status": "PENDING",
    "quotedAmount": 300.00,
    "platformFee": 30.00,
    "securityDeposit": 500.00,
    "totalPayable": 830.00,
    "paymentStatus": null,
    "createdAt": "2026-11-13T17:35:00Z"
  }
}
```

---

### 4.2 Owner Accepts or Rejects Rental Request
- **Method & Route:** `PATCH /api/rentals/{id}/decision`
- **Auth:** Bearer Token required (Owner only)

#### Request Body (Accept):
```json
{
  "decision": "ACCEPT",
  "note": "Ready for collection at the agreed time."
}
```

#### Example cURL:
```bash
curl -X PATCH http://localhost:8080/api/rentals/1/decision \
  -H "Authorization: Bearer <OWNER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "ACCEPT",
    "note": "Ready for collection at the agreed time."
  }'
```

---

### 4.3 Get Rental Details
- **Method & Route:** `GET /api/rentals/{id}`
- **Auth:** Bearer Token required (Participant only: Renter or Owner)

```bash
curl -X GET http://localhost:8080/api/rentals/1 \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 4.4 List User Rentals
- **Method & Route:** `GET /api/rentals/my?role=RENTER` or `GET /api/rentals/my?role=OWNER`
- **Auth:** Bearer Token required

```bash
# As Renter
curl -X GET "http://localhost:8080/api/rentals/my?role=RENTER" \
  -H "Authorization: Bearer <RENTER_TOKEN>"

# As Owner
curl -X GET "http://localhost:8080/api/rentals/my?role=OWNER" \
  -H "Authorization: Bearer <OWNER_TOKEN>"
```

---

### 4.5 Owner Handover Equipment
- **Method & Route:** `PATCH /api/rentals/{id}/handover`
- **Auth:** Bearer Token required (Owner only)
- **Constraint:** Rental status must be `CONFIRMED` (i.e. paid in demo mode)

```bash
curl -X PATCH http://localhost:8080/api/rentals/1/handover \
  -H "Authorization: Bearer <OWNER_TOKEN>"
```
*Status changes from `CONFIRMED` to `ACTIVE`.*

---

### 4.6 Owner Receives Return & Completes Rental
- **Method & Route:** `PATCH /api/rentals/{id}/return`
- **Auth:** Bearer Token required (Owner only)
- **Constraint:** Rental status must be `ACTIVE`

```bash
curl -X PATCH http://localhost:8080/api/rentals/1/return \
  -H "Authorization: Bearer <OWNER_TOKEN>"
```
*Status changes from `ACTIVE` to `COMPLETED`.*

---

## 5. Demo Mode Payment Gateway Module

### 5.1 Initiate Demo Checkout
- **Method & Route:** `POST /api/payments/checkout`
- **Auth:** Bearer Token required (Renter)
- **Description:** Generates a demo checkout order and returns payment breakdown with preset test card options.

#### Request Body:
```json
{
  "rentalId": 1
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:8080/api/payments/checkout \
  -H "Authorization: Bearer <RENTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rentalId": 1
  }'
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Checkout session initialized in DEMO mode",
  "data": {
    "orderId": "demo_ord_1794568912345_a1b2c3d4",
    "rentalId": 1,
    "equipmentTitle": "Bosch 18V Cordless Impact Drill with Battery & Bits",
    "rentalAmount": 300.00,
    "platformFee": 30.00,
    "securityDeposit": 500.00,
    "totalAmount": 830.00,
    "currency": "INR",
    "mode": "DEMO",
    "message": "Demo mode payment gateway initialized. Use preset test cards or 1-click simulation to confirm.",
    "demoTestCards": [
      {
        "cardNumber": "4242 4242 4242 4242",
        "expiry": "12/28",
        "cvv": "123",
        "expectedResult": "Instant Success / Approved"
      },
      {
        "cardNumber": "4000 0000 0000 0002",
        "expiry": "12/28",
        "cvv": "123",
        "expectedResult": "Simulated Card Declined"
      },
      {
        "cardNumber": "5000 0000 0000 0003",
        "expiry": "12/28",
        "cvv": "123",
        "expectedResult": "Simulated Insufficient Funds"
      }
    ]
  }
}
```

---

### 5.2 Confirm Demo Payment (Simulated Instant Approval)
- **Method & Route:** `POST /api/payments/demo-confirm`
- **Auth:** Bearer Token required (Renter)
- **Description:** Simulates payment card authorization in Demo Mode. Transitions payment to `SUCCESS` and automatically advances rental status from `PENDING` to `CONFIRMED`.

#### Request Body (Success Test):
```json
{
  "rentalId": 1,
  "orderId": "demo_ord_1794568912345_a1b2c3d4",
  "cardNumber": "4242 4242 4242 4242",
  "expiry": "12/28",
  "cvv": "123",
  "simulateFailure": false
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:8080/api/payments/demo-confirm \
  -H "Authorization: Bearer <RENTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rentalId": 1,
    "orderId": "demo_ord_1794568912345_a1b2c3d4",
    "cardNumber": "4242 4242 4242 4242",
    "expiry": "12/28",
    "cvv": "123",
    "simulateFailure": false
  }'
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Demo payment approved! Rental is now CONFIRMED.",
  "data": {
    "paymentId": 1,
    "rentalId": 1,
    "orderId": "demo_ord_1794568912345_a1b2c3d4",
    "paymentIdRef": "demo_pay_1794568945678",
    "amount": 830.00,
    "currency": "INR",
    "paymentStatus": "SUCCESS",
    "paymentMode": "DEMO",
    "rentalStatus": "CONFIRMED",
    "message": "Demo payment approved! Rental is now CONFIRMED.",
    "paidAt": "2026-11-13T17:36:12Z"
  }
}
```

#### Request Body (Decline Simulation Test):
```bash
curl -X POST http://localhost:8080/api/payments/demo-confirm \
  -H "Authorization: Bearer <RENTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rentalId": 1,
    "orderId": "demo_ord_1794568912345_a1b2c3d4",
    "cardNumber": "4000 0000 0000 0002",
    "simulateFailure": false
  }'
```
*Expected: Returns paymentStatus: `FAILED`, reason: `Card was declined (Demo simulation)`.*

---

### 5.3 Simulated Webhook Receiver (Idempotent)
- **Method & Route:** `POST /api/payments/webhook`
- **Auth:** Public
- **Description:** Simulates an external webhook callback from a gateway in demo mode.

#### Request Body:
```json
{
  "event": "payment.captured",
  "orderId": "demo_ord_1794568912345_a1b2c3d4",
  "paymentId": "demo_wh_pay_998877",
  "amount": 830.00,
  "currency": "INR",
  "status": "SUCCESS"
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:8080/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.captured",
    "orderId": "demo_ord_1794568912345_a1b2c3d4",
    "status": "SUCCESS"
  }'
```

---

### 5.4 Query Payment Status
- **Method & Route:** `GET /api/payments/status/{rentalId}`
- **Auth:** Bearer Token required (Participant only)

```bash
curl -X GET http://localhost:8080/api/payments/status/1 \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 6. Review & Rating Module

### 6.1 Submit Review
- **Method & Route:** `POST /api/reviews`
- **Auth:** Bearer Token required (Renter or Owner)
- **Constraint:** Rental must be in `COMPLETED` status. One review per participant per rental.

#### Request Body:
```json
{
  "rentalId": 1,
  "rating": 5,
  "comment": "The drill worked flawlessly for putting up wall shelves. Owner was punctual and helpful!"
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:8080/api/reviews \
  -H "Authorization: Bearer <RENTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rentalId": 1,
    "rating": 5,
    "comment": "The drill worked flawlessly for putting up wall shelves. Owner was punctual and helpful!"
  }'
```

#### Response (`201 Created`):
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": 1,
    "rentalId": 1,
    "reviewerId": 3,
    "reviewerName": "Abhimanyu Agnivanshi",
    "revieweeId": 1,
    "revieweeName": "Anshuman Rajawat",
    "rating": 5,
    "comment": "The drill worked flawlessly for putting up wall shelves. Owner was punctual and helpful!",
    "createdAt": "2026-11-13T17:40:00Z"
  }
}
```

---

### 6.2 Get User Reviews
- **Method & Route:** `GET /api/reviews/user/{userId}`
- **Auth:** Public

```bash
curl -X GET http://localhost:8080/api/reviews/user/1
```
