package dev.mariam123.movies;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String username;
    private String email;
    private String message;
}
