package com.instantshare.user.service;

import com.instantshare.common.exception.ResourceNotFoundException;
import com.instantshare.user.dto.UpdateProfileRequest;
import com.instantshare.user.dto.UserProfileDto;
import com.instantshare.user.model.BusinessProfile;
import com.instantshare.user.model.User;
import com.instantshare.user.repository.BusinessProfileRepository;
import com.instantshare.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BusinessProfileRepository businessProfileRepository;

    public UserService(UserRepository userRepository, BusinessProfileRepository businessProfileRepository) {
        this.userRepository = userRepository;
        this.businessProfileRepository = businessProfileRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return toDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getBusinessName() != null) {
            BusinessProfile profile = businessProfileRepository.findByUserId(userId)
                    .orElseGet(() -> new BusinessProfile(user, request.getBusinessName(), request.getBusinessDescription()));
            profile.setBusinessName(request.getBusinessName());
            if (request.getBusinessDescription() != null) {
                profile.setDescription(request.getBusinessDescription());
            }
            businessProfileRepository.save(profile);
        }

        userRepository.save(user);
        return toDto(user);
    }

    private UserProfileDto toDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());

        businessProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            dto.setBusinessName(profile.getBusinessName());
            dto.setBusinessDescription(profile.getDescription());
        });

        return dto;
    }
}
