package com.sourcery.eventdashboard.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collections;
import java.util.List;

public class AuthUtils {

    public static String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return (String) jwt.getClaims().get("oid");
        }
        return null;
    }

    public static List<String> getCurrentUserRoles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Jwt jwt = (Jwt) authentication.getPrincipal();

            List<String> roles = jwt.getClaimAsStringList("roles");
            if (roles != null) {
                return roles;
            }
        }
        return Collections.emptyList();
    }
}