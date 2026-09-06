package dev.mariam123.movies;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String email;
    private String password;
}
