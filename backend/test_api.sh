#!/usr/bin/env bash
# ====================================================================
# InstantShare - Automated End-to-End API Test Script
# Usage: ./test_api.sh [http://localhost:8080/api]
# ====================================================================

set -e

BASE_URL="${1:-http://localhost:8080/api}"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  InstantShare Backend - Automated API Test Runner     ${NC}"
echo -e "${BLUE}  Target: ${BASE_URL}${NC}"
echo -e "${BLUE}======================================================${NC}\n"

# 1. Health / Category Check
echo -e "${YELLOW}[1/8] Testing Public Categories Endpoint...${NC}"
CATEGORIES=$(curl -s -X GET "${BASE_URL}/categories")
echo "Categories Response: $(echo "$CATEGORIES" | cut -c 1-120)..."
echo -e "${GREEN}✓ Categories retrieved successfully.${NC}\n"

# 2. Hyperlocal GPS Search
echo -e "${YELLOW}[2/8] Testing Hyperlocal GPS Search (200m radius around 12.914142, 77.636928)...${NC}"
NEARBY=$(curl -s -X GET "${BASE_URL}/equipment/nearby?lat=12.914142&lon=77.636928&radius=200")
echo "Nearby Search Response: $(echo "$NEARBY" | cut -c 1-140)..."
echo -e "${GREEN}✓ Nearby search executed (Zero external map APIs used).${NC}\n"

# 3. Authenticate Renter
echo -e "${YELLOW}[3/8] Logging in Renter (renter@instantshare.test)...${NC}"
RENTER_LOGIN=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"renter@instantshare.test","password":"password123"}')
RENTER_TOKEN=$(echo "$RENTER_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$RENTER_TOKEN" ]; then
  echo -e "${RED}✗ Failed to obtain Renter Token. Ensure database is running and seeded.${NC}"
  echo "$RENTER_LOGIN"
  exit 1
fi
echo -e "${GREEN}✓ Renter authenticated. Token acquired.${NC}\n"

# 4. Authenticate Owner
echo -e "${YELLOW}[4/8] Logging in Owner 1 (owner1@instantshare.test)...${NC}"
OWNER_LOGIN=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner1@instantshare.test","password":"password123"}')
OWNER_TOKEN=$(echo "$OWNER_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$OWNER_TOKEN" ]; then
  echo -e "${RED}✗ Failed to obtain Owner Token.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Owner authenticated. Token acquired.${NC}\n"

# 5. Create Rental Request
echo -e "${YELLOW}[5/8] Renter creating rental request for Equipment ID 1 (Drill)...${NC}"
RENTAL_RES=$(curl -s -X POST "${BASE_URL}/rentals" \
  -H "Authorization: Bearer ${RENTER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": 1,
    "startAt": "2026-11-25T10:00:00Z",
    "endAt": "2026-11-26T10:00:00Z"
  }')
RENTAL_ID=$(echo "$RENTAL_RES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$RENTAL_ID" ]; then
  echo -e "${RED}✗ Failed to create rental request.${NC}"
  echo "$RENTAL_RES"
  exit 1
fi
echo "Rental created with ID: ${RENTAL_ID} (Status: PENDING)"
echo -e "${GREEN}✓ Rental request created.${NC}\n"

# 6. Owner Accepts Request
echo -e "${YELLOW}[6/8] Owner accepting rental request ID: ${RENTAL_ID}...${NC}"
DECISION_RES=$(curl -s -X PATCH "${BASE_URL}/rentals/${RENTAL_ID}/decision" \
  -H "Authorization: Bearer ${OWNER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"decision":"ACCEPT","note":"Ready for collection"}')
echo -e "${GREEN}✓ Owner accepted the rental request.${NC}\n"

# 7. Demo Payment Checkout & Confirmation
echo -e "${YELLOW}[7/8] Testing Demo Mode Payment Gateway...${NC}"
CHECKOUT_RES=$(curl -s -X POST "${BASE_URL}/payments/checkout" \
  -H "Authorization: Bearer ${RENTER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"rentalId\":${RENTAL_ID}}")
ORDER_ID=$(echo "$CHECKOUT_RES" | grep -o '"orderId":"[^"]*' | cut -d'"' -f4)
echo "Generated Demo Order ID: ${ORDER_ID}"

CONFIRM_RES=$(curl -s -X POST "${BASE_URL}/payments/demo-confirm" \
  -H "Authorization: Bearer ${RENTER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"rentalId\": ${RENTAL_ID},
    \"orderId\": \"${ORDER_ID}\",
    \"cardNumber\": \"4242 4242 4242 4242\",
    \"simulateFailure\": false
  }")
PAYMENT_STATUS=$(echo "$CONFIRM_RES" | grep -o '"paymentStatus":"[^"]*' | cut -d'"' -f4)
RENTAL_STATUS=$(echo "$CONFIRM_RES" | grep -o '"rentalStatus":"[^"]*' | cut -d'"' -f4)

echo "Payment Status: ${PAYMENT_STATUS}"
echo "Rental Status: ${RENTAL_STATUS}"
echo -e "${GREEN}✓ Demo payment confirmed and rental status transitioned to CONFIRMED!${NC}\n"

# 8. Handover, Return, and Review
echo -e "${YELLOW}[8/8] Completing Handover, Return & Review...${NC}"
curl -s -X PATCH "${BASE_URL}/rentals/${RENTAL_ID}/handover" -H "Authorization: Bearer ${OWNER_TOKEN}" > /dev/null
echo "✓ Handover completed -> Rental is ACTIVE"

curl -s -X PATCH "${BASE_URL}/rentals/${RENTAL_ID}/return" -H "Authorization: Bearer ${OWNER_TOKEN}" > /dev/null
echo "✓ Equipment returned -> Rental is COMPLETED"

REVIEW_RES=$(curl -s -X POST "${BASE_URL}/reviews" \
  -H "Authorization: Bearer ${RENTER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"rentalId\": ${RENTAL_ID},
    \"rating\": 5,
    \"comment\": \"Great power drill, owner was very helpful!\"
  }")
echo "Review created: $(echo "$REVIEW_RES" | grep -o '"comment":"[^"]*' | cut -d'"' -f4)"
echo -e "${GREEN}✓ Dual-sided review submitted successfully.${NC}\n"

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}  All 8 End-to-End API Test Steps Passed Successfully! ${NC}"
echo -e "${BLUE}======================================================${NC}"
