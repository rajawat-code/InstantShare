package com.instantshare.review.controller;

import com.instantshare.common.dto.ApiResponse;
import com.instantshare.review.dto.ReviewRequest;
import com.instantshare.review.dto.ReviewResponse;
import com.instantshare.review.service.ReviewService;
import com.instantshare.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ReviewRequest request) {

        ReviewResponse response = reviewService.createReview(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully", response));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getUserReviews(@PathVariable Long userId) {
        List<ReviewResponse> responses = reviewService.getUserReviews(userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
