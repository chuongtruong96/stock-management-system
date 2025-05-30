package com.example.stationerymgntbe;

import java.security.SecureRandom;
import java.util.Base64;

public class GenerateSecretKey {
    public static void main(String[] args) {
        SecureRandom random = new SecureRandom();
        byte[] key = new byte[64]; // 512 bits = 64 bytes
        random.nextBytes(key);
        String base64Key = Base64.getEncoder().encodeToString(key);
        // System.out.println("Base64-encoded secret key: " + base64Key);
    }
}