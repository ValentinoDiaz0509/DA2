package com.healthgrid.monitoring.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.util.Pair;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * JWT Authentication Filter.
 * 
 * Intercepts all HTTP requests and validates the JWT token.
 * Token must be provided in Authorization header: "Bearer <token>"
 * Token must be issued by Module 10 (Core).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String AUTHORIZATION_HEADER = "Authorization";

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        try {
            // Extract token from Authorization header
            Pair<String, String> tokenInfo = extractTokenInfo(request);
            
            if (tokenInfo != null && tokenInfo.getFirst() != null) {
                String token = tokenInfo.getFirst();
                String module = tokenInfo.getSecond();

                // Validate token
                if (jwtTokenProvider.validateToken(token)) {
                    // Create authentication token
                    String subject = jwtTokenProvider.getSubjectFromToken(token);
                    String userId = jwtTokenProvider.getUserIdFromToken(token);
                    
                    // Create granted authorities (can add roles from token if needed)
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_MODULE_" + module));
                    
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                    subject,
                                    null,
                                    authorities
                            );
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    log.debug("JwtAuthenticationFilter: ✓ Token validated for module: {}, userId: {}", 
                            module, userId);
                } else {
                    log.warn("JwtAuthenticationFilter: Invalid or expired token");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\": \"Invalid or expired token\"}");
                    return;
                }
            } else {
                log.warn("JwtAuthenticationFilter: No valid Authorization header found");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"Missing or invalid Authorization header\"}");
                return;
            }

        } catch (Exception e) {
            log.error("JwtAuthenticationFilter: Error processing JWT token", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Authentication failed\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract token from Authorization header.
     * Expected format: "Bearer <token>"
     *
     * @param request the HTTP request
     * @return Pair of (token, module) or null if no valid header
     */
    private Pair<String, String> extractTokenInfo(HttpServletRequest request) {
        String authHeader = request.getHeader(AUTHORIZATION_HEADER);
        
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith(BEARER_PREFIX)) {
            return null;
        }
        
        String token = authHeader.substring(BEARER_PREFIX.length());
        
        if (!StringUtils.hasText(token)) {
            return null;
        }
        
        try {
            String module = jwtTokenProvider.getModuleFromToken(token);
            return Pair.of(token, module);
        } catch (Exception e) {
            log.debug("JwtAuthenticationFilter: Error extracting module from token", e);
            return null;
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // Skip authentication for these endpoints
        return path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/health") ||
                path.startsWith("/api/v1/auth/token") ||  // Token generation endpoint
                path.startsWith("/api/v1/auth/validate"); // Token validation endpoint
    }

}
