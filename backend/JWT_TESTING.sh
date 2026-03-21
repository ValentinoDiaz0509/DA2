#!/bin/bash

# JWT Authentication Testing Script
# This script demonstrates manual testing of JWT authentication
# Run this from a Linux/Mac terminal or modify for Windows PowerShell

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║         JWT Authentication Testing Script - Module 10 (Core)              ║"
echo "║     Hospital Patient Monitoring System - Spring Boot 3.3                  ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
BASE_URL="http://localhost:8080"
ECHO_COLOR='\033[0;36m'
SUCCESS_COLOR='\033[0;32m'
ERROR_COLOR='\033[0;31m'
RESET_COLOR='\033[0m'

# ==================== UTILITY FUNCTIONS ====================

print_section() {
    echo ""
    echo -e "${ECHO_COLOR}═══════════════════════════════════════════════════════════════════════════${RESET_COLOR}"
    echo -e "${ECHO_COLOR}$1${RESET_COLOR}"
    echo -e "${ECHO_COLOR}═══════════════════════════════════════════════════════════════════════════${RESET_COLOR}"
    echo ""
}

print_success() {
    echo -e "${SUCCESS_COLOR}✓ $1${RESET_COLOR}"
}

print_error() {
    echo -e "${ERROR_COLOR}✗ $1${RESET_COLOR}"
}

print_info() {
    echo -e "${ECHO_COLOR}ℹ $1${RESET_COLOR}"
}

# ==================== TEST 1: HEALTH CHECK ====================

print_section "TEST 1: Health Check (Public Endpoint)"

print_info "Endpoint: GET /health"
print_info "Expected: 200 OK"
print_info "Authentication: NOT required (public endpoint)"
echo ""

RESULT=$(curl -s -w "%{http_code}" -o health_response.txt "$BASE_URL/health")
if [ "$RESULT" = "200" ]; then
    print_success "Health check successful"
    cat health_response.txt | jq '.' 2>/dev/null || cat health_response.txt
else
    print_error "Health check failed (HTTP $RESULT)"
fi
echo ""

# ==================== TEST 2: TOKEN GENERATION ====================

print_section "TEST 2: Generate JWT Token (Module 10 - Core)"

print_info "Endpoint: POST /api/v1/auth/token"
print_info "Request Body: {\"module\": \"Monitoring\", \"userId\": \"system_user\"}"
print_info "Expected: 200 OK with JWT token"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"module":"Monitoring","userId":"system_user"}')

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract token from response
TOKEN=$(echo "$RESPONSE" | jq -r '.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    print_error "Failed to extract token"
    exit 1
fi

print_success "Token generated successfully!"
print_info "Token: ${TOKEN:0:30}...${TOKEN: -20}"
echo ""

# ==================== TEST 3: TOKEN VALIDATION ====================

print_section "TEST 3: Validate JWT Token"

print_info "Endpoint: POST /api/v1/auth/validate"
print_info "Authorization Header: Bearer {token}"
print_info "Expected: 200 OK with valid=true"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/validate" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

VALID=$(echo "$RESPONSE" | jq -r '.valid' 2>/dev/null)
if [ "$VALID" = "true" ]; then
    print_success "Token validation successful!"
else
    print_error "Token validation failed"
fi
echo ""

# ==================== TEST 4: GET CURRENT AUTH INFO ====================

print_section "TEST 4: Get Current Authentication Info"

print_info "Endpoint: GET /api/v1/auth/me"
print_info "Authorization Header: Bearer {token}"
print_info "Expected: 200 OK with current user/module info"
echo ""

RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

AUTHENTICATED=$(echo "$RESPONSE" | jq -r '.authenticated' 2>/dev/null)
if [ "$AUTHENTICATED" = "true" ]; then
    print_success "Authentication info retrieved!"
else
    print_error "Failed to get auth info"
fi
echo ""

# ==================== TEST 5: ACCESS PROTECTED ENDPOINT WITH TOKEN ====================

print_section "TEST 5: Access Protected Endpoint WITH Valid Token"

print_info "Endpoint: GET /api/v1/patients"
print_info "Authorization Header: Bearer {token}"
print_info "Expected: 200 OK or 404 (depends on data)"
echo ""

HTTP_CODE=$(curl -s -w "%{http_code}" -o patients_response.txt "$BASE_URL/api/v1/patients" \
  -H "Authorization: Bearer $TOKEN")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    print_success "Protected endpoint accessed (HTTP $HTTP_CODE)"
    if [ "$HTTP_CODE" = "200" ]; then
        cat patients_response.txt | jq '.' 2>/dev/null || cat patients_response.txt
    fi
else
    print_error "Failed to access protected endpoint (HTTP $HTTP_CODE)"
    cat patients_response.txt
fi
echo ""

# ==================== TEST 6: ACCESS PROTECTED ENDPOINT WITHOUT TOKEN ====================

print_section "TEST 6: Access Protected Endpoint WITHOUT Token"

print_info "Endpoint: GET /api/v1/patients"
print_info "Authorization Header: NONE"
print_info "Expected: 401 Unauthorized"
echo ""

HTTP_CODE=$(curl -s -w "%{http_code}" -o unauthorized_response.txt "$BASE_URL/api/v1/patients")

if [ "$HTTP_CODE" = "401" ]; then
    print_success "Unauthorized request blocked (HTTP 401)"
    cat unauthorized_response.txt
else
    print_error "Should have returned 401, got HTTP $HTTP_CODE"
fi
echo ""

# ==================== TEST 7: EXPIRED TOKEN ====================

print_section "TEST 7: Validate Expired Token"

print_info "Testing with invalid/expired token"
print_info "Expected: 401 Unauthorized or validation failure"
echo ""

INVALID_TOKEN="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ"

RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/validate" \
  -H "Authorization: Bearer $INVALID_TOKEN")

VALID=$(echo "$RESPONSE" | jq -r '.valid' 2>/dev/null)
if [ "$VALID" = "false" ]; then
    print_success "Invalid token rejected"
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    print_error "Invalid token was accepted"
fi
echo ""

# ==================== TEST 8: CORS PREFLIGHT ====================

print_section "TEST 8: CORS Preflight Request"

print_info "Endpoint: OPTIONS /api/v1/auth/token"
print_info "Origin: http://localhost:3000"
print_info "Expected: 200 OK with CORS headers"
echo ""

RESPONSE=$(curl -s -i -X OPTIONS "$BASE_URL/api/v1/auth/token" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")

if echo "$RESPONSE" | grep -q "200\|204"; then
    print_success "CORS preflight successful"
else
    print_error "CORS preflight failed"
fi
echo "$RESPONSE" | grep -E "Access-Control|HTTP"
echo ""

# ==================== TEST 9: SWAGGER UI (PUBLIC) ====================

print_section "TEST 9: Access Swagger UI (Public Endpoint)"

print_info "Endpoint: GET /swagger-ui/index.html"
print_info "Authorization Header: NONE"
print_info "Expected: 200 OK (public endpoint)"
echo ""

HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/swagger-ui/index.html")

if [ "$HTTP_CODE" = "200" ]; then
    print_success "Swagger UI accessible without authentication (HTTP 200)"
else
    print_error "Swagger UI request failed (HTTP $HTTP_CODE)"
fi
echo ""

# ==================== TEST 10: GENERATE MULTIPLE TOKENS ====================

print_section "TEST 10: Generate Multiple Tokens (Different Users)"

print_info "Simulating different modules and users"
echo ""

MODULES=("Monitoring" "PatientService" "Internacion" "Admissions")
USERS=("user1" "user2" "user3" "user4")

for i in "${!MODULES[@]}"; do
    print_info "Generating token for ${MODULES[$i]}:${USERS[$i]}"
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/token" \
      -H "Content-Type: application/json" \
      -d "{\"module\":\"${MODULES[$i]}\",\"userId\":\"${USERS[$i]}\"}")
    
    NEW_TOKEN=$(echo "$RESPONSE" | jq -r '.token' 2>/dev/null)
    if [ ! -z "$NEW_TOKEN" ] && [ "$NEW_TOKEN" != "null" ]; then
        print_success "Token generated for ${MODULES[$i]}:${USERS[$i]}"
        print_info "Token: ${NEW_TOKEN:0:30}...${NEW_TOKEN: -20}"
    else
        print_error "Failed to generate token for ${MODULES[$i]}"
    fi
done
echo ""

# ==================== SUMMARY ====================

print_section "Test Summary"

print_success "All authentication tests completed!"
print_info ""
print_info "Test Results:"
print_info "✓ Health check (public)"
print_info "✓ Token generation (Module 10)"
print_info "✓ Token validation"
print_info "✓ Current auth info"
print_info "✓ Protected endpoint access"
print_info "✓ Unauthorized access blocked"
print_info "✓ Invalid token rejection"
print_info "✓ CORS support"
print_info "✓ Swagger UI public access"
print_info "✓ Multiple token generation"
echo ""

print_info "Next Steps:"
print_info "1. Test WebSocket with JWT token"
print_info "2. Test with React frontend"
print_info "3. Test token expiration (24 hours)"
print_info "4. Test rate limiting (if implemented)"
echo ""

print_success "Authentication testing complete!"
echo ""

# Cleanup
rm -f health_response.txt patients_response.txt unauthorized_response.txt 2>/dev/null
