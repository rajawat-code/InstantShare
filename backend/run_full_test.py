import urllib.request
import json
import sys
import time

BASE_URL = "http://localhost:8080/api"

def make_request(method, endpoint, body=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode('utf-8')
            return status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8')
        try:
            parsed = json.loads(content)
        except Exception:
            parsed = {"raw": content}
        return e.code, parsed
    except Exception as e:
        return 0, {"error": str(e)}

passed = 0
failed = 0

def test(name, condition, details=""):
    global passed, failed
    if condition:
        print(f"  [PASS] {name}")
        passed += 1
    else:
        print(f"  [FAIL] {name}: {details}")
        failed += 1

print("====================================================================")
print("     InstantShare Backend - Comprehensive End-to-End API Suite      ")
print("====================================================================")

# ---------------------------------------------------------
# 1. Categories
# ---------------------------------------------------------
print("\n[MODULE 1] Categories Endpoint")
status, res = make_request("GET", "/categories")
test("GET /categories returns 200", status == 200, f"Status: {status}, Body: {res}")

# ---------------------------------------------------------
# 2. Authentication
# ---------------------------------------------------------
print("\n[MODULE 2] Authentication Endpoints")
timestamp = int(time.time())
renter_email = f"test_renter_{timestamp}@instantshare.test"
owner_email = f"test_owner_{timestamp}@instantshare.test"

# Register Renter
status, res = make_request("POST", "/auth/register", {
    "name": "E2E Test Renter",
    "email": renter_email,
    "password": "password123",
    "phone": "+919876543201",
    "role": "RENTER"
})
test("POST /auth/register (Renter) returns 201", status == 201, f"Status: {status}, Body: {res}")
renter_token = res.get("data", {}).get("token")
renter_id = res.get("data", {}).get("userId")

# Register Owner
status, res = make_request("POST", "/auth/register", {
    "name": "E2E Test Owner",
    "email": owner_email,
    "password": "password123",
    "phone": "+919876543202",
    "role": "OWNER"
})
test("POST /auth/register (Owner) returns 201", status == 201, f"Status: {status}, Body: {res}")
owner_token = res.get("data", {}).get("token")
owner_id = res.get("data", {}).get("userId")

# Login Renter
status, res = make_request("POST", "/auth/login", {
    "email": renter_email,
    "password": "password123"
})
test("POST /auth/login returns 200 & JWT", status == 200 and "token" in res.get("data", {}), f"Status: {status}, Body: {res}")
if not renter_token and "token" in res.get("data", {}):
    renter_token = res["data"]["token"]

# ---------------------------------------------------------
# 3. User Profile
# ---------------------------------------------------------
print("\n[MODULE 3] User Profile Endpoints")
status, res = make_request("GET", "/users/me", token=renter_token)
test("GET /users/me returns 200", status == 200 and res.get("data", {}).get("email") == renter_email, f"Status: {status}, Body: {res}")

status, res = make_request("PUT", "/users/me", {
    "name": "E2E Renter Updated",
    "phone": "+919876599999"
}, token=renter_token)
test("PUT /users/me returns 200 & updated name", status == 200 and res.get("data", {}).get("name") == "E2E Renter Updated", f"Status: {status}, Body: {res}")

# ---------------------------------------------------------
# 4. Equipment Management & GPS Nearby Search
# ---------------------------------------------------------
print("\n[MODULE 4] Equipment & GPS Nearby Search (Haversine on MySQL)")
# Owner creates equipment at HSR Layout (12.914592, 77.637278 ~63m from search center 12.914142, 77.636928)
status, res = make_request("POST", "/equipment", {
    "title": "Bosch 18V Cordless Impact Drill",
    "description": "Heavy-duty 18V cordless impact drill with 2 batteries.",
    "price": 150.00,
    "priceUnit": "DAY",
    "securityDeposit": 500.00,
    "latitude": 12.914592,
    "longitude": 77.637278,
    "displayArea": "Sector 1, HSR Layout",
    "imageUrls": ["https://images.unsplash.com/photo-1504148455328-c376907d081c"]
}, token=owner_token)
test("POST /equipment (Owner creates listing) returns 201", status == 201, f"Status: {status}, Body: {res}")
equipment_id = res.get("data", {}).get("id")

# Get equipment by ID
status, res = make_request("GET", f"/equipment/{equipment_id}")
test(f"GET /equipment/{equipment_id} returns 200", status == 200 and res.get("data", {}).get("id") == equipment_id, f"Status: {status}")

# Owner updates equipment
status, res = make_request("PUT", f"/equipment/{equipment_id}", {
    "title": "Bosch 18V Cordless Impact Drill Pro Set",
    "description": "Includes 3 batteries and full drill bit set.",
    "price": 175.00,
    "priceUnit": "DAY",
    "securityDeposit": 500.00,
    "latitude": 12.914592,
    "longitude": 77.637278,
    "displayArea": "Sector 1, HSR Layout"
}, token=owner_token)
test(f"PUT /equipment/{equipment_id} returns 200", status == 200 and res.get("data", {}).get("price") == 175.0, f"Status: {status}")

# Get Owner's listings
status, res = make_request("GET", "/equipment/my", token=owner_token)
test("GET /equipment/my returns 200 & list", status == 200 and len(res.get("data", [])) >= 1, f"Status: {status}, count: {len(res.get('data', []))}")

# GPS Nearby Search at 100m (Base 12.914142, 77.636928 -> drill is at 12.914592, 77.637278 ~63m)
status, res = make_request("GET", "/equipment/nearby?lat=12.914142&lon=77.636928&radius=100")
items = res.get("data", {}).get("items", [])
has_item = any(item.get("id") == equipment_id for item in items)
test("GET /equipment/nearby (100m Haversine) discovers equipment ~63m", status == 200 and has_item, f"Status: {status}, items: {len(items)}")

# GPS Nearby Search outside radius (e.g. 5km away: 12.950000, 77.700000)
status, res = make_request("GET", "/equipment/nearby?lat=12.950000&lon=77.700000&radius=100")
far_items = res.get("data", {}).get("items", [])
test("GET /equipment/nearby excludes equipment outside radius", status == 200 and len(far_items) == 0, f"Status: {status}, items: {len(far_items)}")

# ---------------------------------------------------------
# 5. Rental Lifecycle
# ---------------------------------------------------------
print("\n[MODULE 5] Rental Booking Lifecycle")
# Renter creates rental request
status, res = make_request("POST", "/rentals", {
    "equipmentId": equipment_id,
    "startAt": "2026-11-20T10:00:00Z",
    "endAt": "2026-11-22T10:00:00Z"
}, token=renter_token)
test("POST /rentals (Renter requests booking) returns 201", status == 201 and res.get("data", {}).get("status") == "PENDING", f"Status: {status}, Body: {res}")
rental_id = res.get("data", {}).get("id")

# Get rental by ID
status, res = make_request("GET", f"/rentals/{rental_id}", token=renter_token)
test(f"GET /rentals/{rental_id} returns 200", status == 200 and res.get("data", {}).get("id") == rental_id, f"Status: {status}")

# List rentals for renter
status, res = make_request("GET", "/rentals/my?role=RENTER", token=renter_token)
test("GET /rentals/my?role=RENTER returns 200 & list", status == 200 and len(res.get("data", [])) >= 1, f"Status: {status}")

# List rentals for owner
status, res = make_request("GET", "/rentals/my?role=OWNER", token=owner_token)
test("GET /rentals/my?role=OWNER returns 200 & list", status == 200 and len(res.get("data", [])) >= 1, f"Status: {status}")

# Owner accepts rental request
status, res = make_request("PATCH", f"/rentals/{rental_id}/decision", {
    "decision": "ACCEPT",
    "note": "Ready for handover at scheduled time."
}, token=owner_token)
test("PATCH /rentals/{id}/decision (Owner ACCEPT) returns 200", status == 200, f"Status: {status}, Body: {res}")

# ---------------------------------------------------------
# 6. Demo Payment Gateway
# ---------------------------------------------------------
print("\n[MODULE 6] Demo Mode Payment Gateway")
# Initiate demo checkout
status, res = make_request("POST", "/payments/checkout", {
    "rentalId": rental_id
}, token=renter_token)
test("POST /payments/checkout returns 200 & orderId", status == 200 and "orderId" in res.get("data", {}), f"Status: {status}, Body: {res}")
order_id = res.get("data", {}).get("orderId")

# Check payment status
status, res = make_request("GET", f"/payments/status/{rental_id}", token=renter_token)
test(f"GET /payments/status/{rental_id} returns 200", status == 200, f"Status: {status}")

# Confirm demo payment
status, res = make_request("POST", "/payments/demo-confirm", {
    "rentalId": rental_id,
    "orderId": order_id,
    "cardNumber": "4242 4242 4242 4242",
    "expiry": "12/28",
    "cvv": "123",
    "simulateFailure": False
}, token=renter_token)
test("POST /payments/demo-confirm returns 200 & SUCCESS", status == 200 and res.get("data", {}).get("paymentStatus") == "SUCCESS", f"Status: {status}, Body: {res}")
test("Payment advances rental to CONFIRMED", res.get("data", {}).get("rentalStatus") == "CONFIRMED", f"Rental Status: {res.get('data', {}).get('rentalStatus')}")

# Simulated Webhook callback
status, res = make_request("POST", "/payments/webhook", {
    "event": "payment.captured",
    "orderId": order_id,
    "status": "SUCCESS"
})
test("POST /payments/webhook returns 200", status == 200, f"Status: {status}, Body: {res}")

# ---------------------------------------------------------
# 7. Handover & Return Lifecycle
# ---------------------------------------------------------
print("\n[MODULE 7] Handover & Return Completion")
# Owner hands over equipment (CONFIRMED -> ACTIVE)
status, res = make_request("PATCH", f"/rentals/{rental_id}/handover", token=owner_token)
test("PATCH /rentals/{id}/handover transitions to ACTIVE", status == 200 and res.get("data", {}).get("status") == "ACTIVE", f"Status: {status}, Body: {res}")

# Owner marks return (ACTIVE -> COMPLETED)
status, res = make_request("PATCH", f"/rentals/{rental_id}/return", token=owner_token)
test("PATCH /rentals/{id}/return transitions to COMPLETED", status == 200 and res.get("data", {}).get("status") == "COMPLETED", f"Status: {status}, Body: {res}")

# ---------------------------------------------------------
# 8. Reviews & Ratings
# ---------------------------------------------------------
print("\n[MODULE 8] Reviews & Ratings")
# Renter submits review
status, res = make_request("POST", "/reviews", {
    "rentalId": rental_id,
    "rating": 5,
    "comment": "Super smooth rental! Tool in top condition, owner was punctual."
}, token=renter_token)
test("POST /reviews (Renter reviews completed rental) returns 201", status == 201, f"Status: {status}, Body: {res}")

# Public / Authenticated gets reviews for owner
status, res = make_request("GET", f"/reviews/user/{owner_id}", token=renter_token)
test(f"GET /reviews/user/{owner_id} returns 200 & reviews", status == 200 and len(res.get("data", [])) >= 1, f"Status: {status}, Body: {res}")

# ---------------------------------------------------------
# 9. Cleanup / Equipment Deletion
# ---------------------------------------------------------
print("\n[MODULE 9] Equipment Deletion (Soft Delete)")
status, res = make_request("DELETE", f"/equipment/{equipment_id}", token=owner_token)
test(f"DELETE /equipment/{equipment_id} returns 200", status == 200, f"Status: {status}, Body: {res}")

print("\n====================================================================")
print(f"RESULTS: {passed} PASSED, {failed} FAILED (TOTAL: {passed + failed} TESTS)")
print("====================================================================")

if failed > 0:
    sys.exit(1)
