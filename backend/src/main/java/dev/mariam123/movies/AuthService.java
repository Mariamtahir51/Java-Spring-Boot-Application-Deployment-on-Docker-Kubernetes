package dev.mariam123.movies;

import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse register(AuthRequest request) {
        String email = validateAndNormalize(request);
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        String username = validateUsername(request.getUsername());
        userRepository.save(new User(null, email, username, passwordEncoder.encode(request.getPassword())));
        return new AuthResponse(username, email, "Registration successful. Please log in.");
    }

    public AuthResponse login(AuthRequest request) {
        String email = validateAndNormalize(request);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        return new AuthResponse(getDisplayUsername(user), email, "Login successful.");
    }

    private String validateAndNormalize(AuthRequest request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required.");
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (email.isBlank() || !email.contains("@")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid email address.");
        }
        if (request.getPassword().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters.");
        }
        return email;
    }

    private String validateUsername(String username) {
        if (username == null || username.trim().length() < 2 || username.trim().length() > 30) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username must be between 2 and 30 characters.");
        }
        return username.trim();
    }

    // Accounts created before usernames were introduced still have a readable display name.
    private String getDisplayUsername(User user) {
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername();
        }
        return user.getEmail().substring(0, user.getEmail().indexOf('@'));
    }
}
