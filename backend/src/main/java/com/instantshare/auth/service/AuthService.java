package com.instantshare.auth.service;

import com.instantshare.auth.dto.AuthResponse;
import com.instantshare.auth.dto.LoginRequest;
import com.instantshare.auth.dto.RegisterRequest;
import com.instantshare.common.exception.BadRequestException;
import com.instantshare.security.JwtTokenProvider;
import com.instantshare.user.model.BusinessProfile;
import com.instantshare.user.model.Role;
import com.instantshare.user.model.User;
import com.instantshare.user.repository.BusinessProfileRepository;
import com.instantshare.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            BusinessProfileRepository businessProfileRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.businessProfileRepository = businessProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole() != null ? request.getRole() : Role.RENTER
        );

        User savedUser = userRepository.save(user);

        // If registered as Business, create business profile
        if (savedUser.getRole() == Role.BUSINESS && request.getBusinessName() != null) {
            BusinessProfile profile = new BusinessProfile(
                    savedUser,
                    request.getBusinessName(),
                    request.getBusinessDescription()
            );
            businessProfileRepository.save(profile);
        }

        String jwt = tokenProvider.generateTokenFromUserId(savedUser.getId(), savedUser.getEmail());
        return new AuthResponse(jwt, savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        String jwt = tokenProvider.generateToken(authentication);
        return new AuthResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
