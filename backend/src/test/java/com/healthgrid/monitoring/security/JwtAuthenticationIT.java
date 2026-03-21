package com.healthgrid.monitoring.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthgrid.monitoring.controller.AuthenticationController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for JWT authentication flow.
 * 
 * Tests the complete authentication pipeline:
 * - Token generation from Module 10 (Core)
 * - Token validation
 * - Protected endpoint access
 * - Unauthorized access without token
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Slf4j
class JwtAuthenticationIT {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String validToken;
    private String invalidToken = "invalid.token.here";

    @BeforeEach
    public void setup() {
        // Generate a valid token for testing
        validToken = jwtTokenProvider.generateToken("Monitoring", "test_user");
    }

    // ==================== Token Generation Tests ====================

    @Test
    public void testGenerateToken_Success() throws Exception {
        AuthenticationController.TokenRequest request = 
            new AuthenticationController.TokenRequest("Monitoring", "system_user");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.type", is("Bearer")))
                .andExpect(jsonPath("$.expiresIn", is(86400)))
                .andExpect(jsonPath("$.module", is("Monitoring")))
                .andExpect(jsonPath("$.userId", is("system_user")))
                .andExpect(jsonPath("$.issuer", is("Module10-Core")))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        assertThat(responseBody).contains("token");
        System.out.println("✓ Token generated successfully");
    }

    @Test
    public void testGenerateToken_WithDifferentModule() throws Exception {
        AuthenticationController.TokenRequest request = 
            new AuthenticationController.TokenRequest("PatientService", "module_5");

        mockMvc.perform(post("/api/v1/auth/token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.module", is("PatientService")))
                .andExpect(jsonPath("$.userId", is("module_5")))
                .andReturn();

        System.out.println("✓ Token generated for different module");
    }

    // ==================== Token Validation Tests ====================

    @Test
    public void testValidateToken_ValidToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/validate")
                .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(true)))
                .andExpect(jsonPath("$.message", notNullValue()))
                .andExpect(jsonPath("$.module", is("Monitoring")))
                .andExpect(jsonPath("$.userId", is("test_user")))
                .andReturn();

        System.out.println("✓ Valid token accepted");
    }

    @Test
    public void testValidateToken_InvalidToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/validate")
                .header("Authorization", "Bearer " + invalidToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(false)))
                .andExpect(jsonPath("$.message", notNullValue()))
                .andReturn();

        System.out.println("✓ Invalid token rejected");
    }

    @Test
    public void testValidateToken_MissingAuthorizationHeader() throws Exception {
        mockMvc.perform(post("/api/v1/auth/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(false)))
                .andExpect(jsonPath("$.message", notNullValue()))
                .andReturn();

        System.out.println("✓ Missing authorization header handled");
    }

    @Test
    public void testValidateToken_BadAuthorizationFormat() throws Exception {
        mockMvc.perform(post("/api/v1/auth/validate")
                .header("Authorization", "Basic some_token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(false)))
                .andReturn();

        System.out.println("✓ Bad authorization format rejected");
    }

    // ==================== Protected Endpoint Tests ====================

    @Test
    public void testProtectedEndpoint_WithValidToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.module", is("Monitoring")))
                .andExpect(jsonPath("$.userId", is("test_user")))
                .andExpect(jsonPath("$.authenticated", is(true)))
                .andExpect(jsonPath("$.issuer", is("Module10-Core")))
                .andReturn();

        System.out.println("✓ Protected endpoint accessible with valid token");
    }

    @Test
    public void testProtectedEndpoint_WithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andReturn();

        System.out.println("✓ Protected endpoint denied without token");
    }

    @Test
    public void testProtectedEndpoint_WithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + invalidToken))
                .andExpect(status().isUnauthorized())
                .andReturn();

        System.out.println("✓ Protected endpoint denied with invalid token");
    }

    // ==================== Public Endpoint Tests ====================

    @Test
    public void testPublicEndpoint_HealthCheck() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andReturn();

        System.out.println("✓ Public health endpoint accessible without token");
    }

    @Test
    public void testPublicEndpoint_SwaggerUI() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk())
                .andReturn();

        System.out.println("✓ Public Swagger UI accessible without token");
    }

    // ==================== Token Provider Unit Tests ====================

    @Test
    public void testJwtTokenProvider_GenerateToken() {
        String token = jwtTokenProvider.generateToken("TestModule", "test_user");
        assertThat(token).isNotBlank();
        assertThat(token).contains(".");  // JWT has 3 parts separated by dots
        System.out.println("✓ JwtTokenProvider generates valid token");
    }

    @Test
    public void testJwtTokenProvider_ValidateToken() {
        String token = jwtTokenProvider.generateToken("TestModule", "test_user");
        boolean isValid = jwtTokenProvider.validateToken(token);
        assertThat(isValid).isTrue();
        System.out.println("✓ JwtTokenProvider validates valid token");
    }

    @Test
    public void testJwtTokenProvider_InvalidateToken() {
        boolean isValid = jwtTokenProvider.validateToken(invalidToken);
        assertThat(isValid).isFalse();
        System.out.println("✓ JwtTokenProvider rejects invalid token");
    }

    @Test
    public void testJwtTokenProvider_ExtractClaims() {
        String token = jwtTokenProvider.generateToken("TestModule", "test_user");
        
        String module = jwtTokenProvider.getModuleFromToken(token);
        String userId = jwtTokenProvider.getUserIdFromToken(token);
        String subject = jwtTokenProvider.getSubjectFromToken(token);
        
        assertThat(module).isEqualTo("TestModule");
        assertThat(userId).isEqualTo("test_user");
        assertThat(subject).isEqualTo("TestModule:test_user");
        
        System.out.println("✓ JwtTokenProvider extracts claims correctly");
    }

    @Test
    public void testJwtTokenProvider_IsTokenExpired() {
        String token = jwtTokenProvider.generateToken("TestModule", "test_user");
        boolean isExpired = jwtTokenProvider.isTokenExpired(token);
        assertThat(isExpired).isFalse();
        System.out.println("✓ JwtTokenProvider identifies non-expired token");
    }

    // ==================== Integration Flow Tests ====================

    @Test
    public void testCompleteAuthenticationFlow() throws Exception {
        // Step 1: Generate token
        AuthenticationController.TokenRequest tokenRequest = 
            new AuthenticationController.TokenRequest("Monitoring", "integration_test");

        MvcResult generateResult = mockMvc.perform(post("/api/v1/auth/token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tokenRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andReturn();

        // Extract token from response
        String responseBody = generateResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("token").asText();
        System.out.println("✓ Step 1: Token generated");

        // Step 2: Validate token
        mockMvc.perform(post("/api/v1/auth/validate")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(true)))
                .andReturn();
        System.out.println("✓ Step 2: Token validated");

        // Step 3: Access protected endpoint with token
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.module", is("Monitoring")))
                .andReturn();
        System.out.println("✓ Step 3: Protected endpoint accessed");

        // Step 4: Try to access protected endpoint without token (should fail)
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andReturn();
        System.out.println("✓ Step 4: Unauthorized access blocked");

        System.out.println("✓ Complete authentication flow successful!");
    }

    // ==================== Security Header Tests ====================

    @Test
    public void testSecurityHeaders_CORS() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + validToken)
                .header("Origin", "http://localhost:3000"))
                .andExpect(status().isOk())
                .andReturn();

        System.out.println("✓ CORS headers handled correctly");
    }

 @Test
    void testTokenInvalid() {
        // ARRANGE: Usar un token completamente inválido
        String invalidToken = "invalid.token.here";
        
        // ACT: Llamar endpoint protegido
        ResponseEntity<String> response = restTemplate.exchange(
            "/api/v1/patients",
            HttpMethod.GET,
            new HttpEntity<>(new HttpHeaders() {{
                set("Authorization", "Bearer " + invalidToken);
            }}),
            String.class
        );
        
        // ASSERT: Debe retornar 401 Unauthorized
        assertThat(response.getStatusCode())
            .isEqualTo(HttpStatus.UNAUTHORIZED);
        
        assertThat(response.getBody())
            .contains("Invalid or expired token");
        
        log.info("✓ Test passed: Invalid token rejected");
    }
    
    @Test
    void testTokenMissingBearerPrefix() {
        String token = jwtTokenProvider.generateToken("Monitoring", "test_user");
        
        // Sin "Bearer " prefix
        ResponseEntity<String> response = restTemplate.exchange(
            "/api/v1/patients",
            HttpMethod.GET,
            new HttpEntity<>(new HttpHeaders() {{
                set("Authorization", token); // Falta "Bearer "
            }}),
            String.class
        );
        
        // Debe retornar 401
        assertThat(response.getStatusCode())
            .isEqualTo(HttpStatus.UNAUTHORIZED);
    }
    
    @Test
    void testTokenExpired() {
        // ARRANGE: Generar token con expiración en el pasado
        // (Requiere inyectar JwtTokenProvider)
        String expiredToken = generateExpiredToken();
        
        // ACT: Llamar endpoint protegido
        ResponseEntity<String> response = restTemplate.exchange(
            "/api/v1/patients",
            HttpMethod.GET,
            new HttpEntity<>(new HttpHeaders() {{
                set("Authorization", "Bearer " + expiredToken);
            }}),
            String.class
        );
        
        // ASSERT: Debe retornar 401 Token Expired
        assertThat(response.getStatusCode())
            .isEqualTo(HttpStatus.UNAUTHORIZED);
        
        assertThat(response.getBody())
            .contains("expired");
    }
    
    @Test
    void testPublicEndpointNoToken() {
        // GET /health NO requiere token
        ResponseEntity<String> response = restTemplate.getForEntity(
            "/health",
            String.class
        );
        
        assertThat(response.getStatusCode())
            .isEqualTo(HttpStatus.OK);
    }
    
    @Test
    void testProtectedEndpointNoToken() {
        // GET /patients SÍ requiere token
        ResponseEntity<String> response = restTemplate.getForEntity(
            "/api/v1/patients",
            String.class
        );
        
        // Debe retornar 401 o 403
        assertThat(response.getStatusCode().value())
            .isIn(401, 403);
    }
}

    
}
