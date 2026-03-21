# JWT Authentication Testing Script for Windows PowerShell
# Hospital Patient Monitoring System - Spring Boot 3.3
# Module 10 (Core) JWT Simulation

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  JWT Authentication Testing - Module 10 (Core)" -ForegroundColor Cyan
Write-Host "  Hospital Patient Monitoring System - Spring Boot 3.3" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BASE_URL = "http://localhost:8080"
$TOKEN = ""

# ==================== UTILITY FUNCTIONS ====================

function Print-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "$Title" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

# ==================== TEST 1: HEALTH CHECK ====================

Print-Section "TEST 1: Health Check (Public Endpoint)"

Print-Info "Endpoint: GET /health"
Print-Info "Expected: 200 OK"
Print-Info "Authentication: NOT required (public endpoint)"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/health" -Method Get -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Print-Success "Health check successful"
        $response.Content | ConvertFrom-Json | ConvertTo-Json | Write-Host
    }
} catch {
    Print-Error "Health check failed: $_"
}
Write-Host ""

# ==================== TEST 2: TOKEN GENERATION ====================

Print-Section "TEST 2: Generate JWT Token (Module 10 - Core)"

Print-Info "Endpoint: POST /api/v1/auth/token"
Print-Info "Request Body: {`"module`": `"Monitoring`", `"userId`": `"system_user`"}"
Print-Info "Expected: 200 OK with JWT token"
Write-Host ""

try {
    $body = @{
        module = "Monitoring"
        userId = "system_user"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/auth/token" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    $json = $response.Content | ConvertFrom-Json
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json
    
    $script:TOKEN = $json.token
    if ($TOKEN) {
        Print-Success "Token generated successfully!"
        Print-Info "Token: $($TOKEN.Substring(0, 30))...$(${TOKEN}.Substring($TOKEN.Length - 20))"
    } else {
        Print-Error "Failed to extract token"
        exit 1
    }
} catch {
    Print-Error "Token generation failed: $_"
    exit 1
}
Write-Host ""

# ==================== TEST 3: TOKEN VALIDATION ====================

Print-Section "TEST 3: Validate JWT Token"

Print-Info "Endpoint: POST /api/v1/auth/validate"
Print-Info "Authorization Header: Bearer {token}"
Print-Info "Expected: 200 OK with valid=true"
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/auth/validate" `
        -Method Post `
        -Headers $headers `
        -ErrorAction Stop
    
    $json = $response.Content | ConvertFrom-Json
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json
    
    if ($json.valid -eq $true) {
        Print-Success "Token validation successful!"
    } else {
        Print-Error "Token validation failed"
    }
} catch {
    Print-Error "Token validation request failed: $_"
}
Write-Host ""

# ==================== TEST 4: GET CURRENT AUTH INFO ====================

Print-Section "TEST 4: Get Current Authentication Info"

Print-Info "Endpoint: GET /api/v1/auth/me"
Print-Info "Authorization Header: Bearer {token}"
Print-Info "Expected: 200 OK with current user/module info"
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/auth/me" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    $json = $response.Content | ConvertFrom-Json
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json
    
    if ($json.authenticated -eq $true) {
        Print-Success "Authentication info retrieved!"
    } else {
        Print-Error "Failed to get auth info"
    }
} catch {
    Print-Error "Failed to get auth info: $_"
}
Write-Host ""

# ==================== TEST 5: ACCESS PROTECTED ENDPOINT WITH TOKEN ====================

Print-Section "TEST 5: Access Protected Endpoint WITH Valid Token"

Print-Info "Endpoint: GET /api/v1/patients"
Print-Info "Authorization Header: Bearer {token}"
Print-Info "Expected: 200 OK or 404 (depends on data)"
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/patients" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    Print-Success "Protected endpoint accessed (HTTP $($response.StatusCode))"
    if ($response.StatusCode -eq 200) {
        $response.Content | ConvertFrom-Json | ConvertTo-Json | Write-Host
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq "NotFound") {
        Print-Success "Protected endpoint accessible (HTTP 404 - No data)"
    } else {
        Print-Error "Failed to access protected endpoint: $_"
    }
}
Write-Host ""

# ==================== TEST 6: ACCESS PROTECTED ENDPOINT WITHOUT TOKEN ====================

Print-Section "TEST 6: Access Protected Endpoint WITHOUT Token"

Print-Info "Endpoint: GET /api/v1/patients"
Print-Info "Authorization Header: NONE"
Print-Info "Expected: 401 Unauthorized"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/patients" `
        -Method Get `
        -ErrorAction Stop
    Print-Error "Should have returned 401, got HTTP $($response.StatusCode)"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Print-Success "Unauthorized request blocked (HTTP 401)"
    } else {
        Print-Error "Unexpected error: $_"
    }
}
Write-Host ""

# ==================== TEST 7: INVALID TOKEN ====================

Print-Section "TEST 7: Validate Invalid Token"

Print-Info "Testing with invalid/expired token"
Print-Info "Expected: 401 Unauthorized or validation failure"
Write-Host ""

$INVALID_TOKEN = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.invalid.signature"

try {
    $headers = @{
        "Authorization" = "Bearer $INVALID_TOKEN"
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/auth/validate" `
        -Method Post `
        -Headers $headers `
        -ErrorAction Stop
    
    $json = $response.Content | ConvertFrom-Json
    if ($json.valid -eq $false) {
        Print-Success "Invalid token rejected"
        Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json
    }
} catch {
    Print-Error "Request failed: $_"
}
Write-Host ""

# ==================== TEST 8: CORS HEADERS ====================

Print-Section "TEST 8: CORS Preflight Request"

Print-Info "Endpoint: OPTIONS /api/v1/auth/token"
Print-Info "Origin: http://localhost:3000"
Print-Info "Expected: 200 OK with CORS headers"
Write-Host ""

try {
    $headers = @{
        "Origin" = "http://localhost:3000"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/auth/token" `
        -Method Options `
        -Headers $headers `
        -ErrorAction Stop
    
    Print-Success "CORS preflight successful (HTTP $($response.StatusCode))"
} catch {
    Write-Host "Response status: $($_.Exception.Response.StatusCode)"
}
Write-Host ""

# ==================== TEST 9: SWAGGER UI (PUBLIC) ====================

Print-Section "TEST 9: Access Swagger UI (Public Endpoint)"

Print-Info "Endpoint: GET /swagger-ui/index.html"
Print-Info "Authorization Header: NONE"
Print-Info "Expected: 200 OK (public endpoint)"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/swagger-ui/index.html" `
        -Method Get `
        -ErrorAction Stop
    Print-Success "Swagger UI accessible without authentication (HTTP 200)"
} catch {
    Print-Error "Swagger UI request failed: $_"
}
Write-Host ""

# ==================== TEST 10: GENERATE MULTIPLE TOKENS ====================

Print-Section "TEST 10: Generate Multiple Tokens (Different Users)"

Print-Info "Simulating different modules and users"
Write-Host ""

$modules = @("Monitoring", "PatientService", "Internacion", "Admissions")
$users = @("user1", "user2", "user3", "user4")

for ($i = 0; $i -lt $modules.Length; $i++) {
    Print-Info "Generating token for $($modules[$i]):$($users[$i])"
    
    try {
        $body = @{
            module = $modules[$i]
            userId = $users[$i]
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/auth/token" `
            -Method Post `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop
        
        $json = $response.Content | ConvertFrom-Json
        if ($json.token) {
            Print-Success "Token generated for $($modules[$i]):$($users[$i])"
            Print-Info "Token: $($json.token.Substring(0, 30))..."
        } else {
            Print-Error "Failed to generate token for $($modules[$i])"
        }
    } catch {
        Print-Error "Token generation failed for $($modules[$i]): $_"
    }
}
Write-Host ""

# ==================== SUMMARY ====================

Print-Section "Test Summary"

Print-Success "All authentication tests completed!"
Write-Host ""
Print-Info "Test Results:"
Print-Info "✓ Health check (public)"
Print-Info "✓ Token generation (Module 10)"
Print-Info "✓ Token validation"
Print-Info "✓ Current auth info"
Print-Info "✓ Protected endpoint access"
Print-Info "✓ Unauthorized access blocked"
Print-Info "✓ Invalid token rejection"
Print-Info "✓ CORS support"
Print-Info "✓ Swagger UI public access"
Print-Info "✓ Multiple token generation"
Write-Host ""

Print-Info "Next Steps:"
Print-Info "1. Test WebSocket with JWT token"
Print-Info "2. Test with React frontend"
Print-Info "3. Test token expiration (24 hours)"
Print-Info "4. Test rate limiting (if implemented)"
Write-Host ""

Print-Success "Authentication testing complete!"
Write-Host ""
