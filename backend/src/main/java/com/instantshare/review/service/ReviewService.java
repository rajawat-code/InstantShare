package com.instantshare.review.service;

import com.instantshare.common.exception.BadRequestException;
import com.instantshare.common.exception.ResourceNotFoundException;
import com.instantshare.common.exception.UnauthorizedException;
import com.instantshare.rental.model.Rental;
import com.instantshare.rental.model.RentalStatus;
import com.instantshare.rental.repository.RentalRepository;
import com.instantshare.review.dto.ReviewRequest;
import com.instantshare.review.dto.ReviewResponse;
import com.instantshare.review.model.Review;
import com.instantshare.review.repository.ReviewRepository;
import com.instantshare.user.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RentalRepository rentalRepository;

    public ReviewService(ReviewRepository reviewRepository, RentalRepository rentalRepository) {
        this.reviewRepository = reviewRepository;
        this.rentalRepository = rentalRepository;
    }

    @Transactional
    public ReviewResponse createReview(Long currentUserId, ReviewRequest request) {
        Rental rental = rentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", request.getRentalId()));

        if (rental.getStatus() != RentalStatus.COMPLETED) {
            throw new BadRequestException("Reviews can only be submitted for COMPLETED rentals. Current status: " + rental.getStatus());
        }

        boolean isRenter = rental.getRenter().getId().equals(currentUserId);
        boolean isOwner = rental.getOwner().getId().equals(currentUserId);

        if (!isRenter && !isOwner) {
            throw new UnauthorizedException("You are not a participant in this rental");
        }

        if (reviewRepository.existsByRentalIdAndReviewerId(rental.getId(), currentUserId)) {
            throw new BadRequestException("You have already reviewed this rental");
        }

        User reviewer = isRenter ? rental.getRenter() : rental.getOwner();
        User reviewee = isRenter ? rental.getOwner() : rental.getRenter();

        Review review = new Review(rental, reviewer, reviewee, request.getRating(), request.getComment());
        Review saved = reviewRepository.save(review);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviews(Long userId) {
        List<Review> reviews = reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId);
        return reviews.stream().map(this::toResponse).toList();
    }

    private ReviewResponse toResponse(Review review) {
        ReviewResponse resp = new ReviewResponse();
        resp.setId(review.getId());
        resp.setRentalId(review.getRental().getId());
        resp.setReviewerId(review.getReviewer().getId());
        resp.setReviewerName(review.getReviewer().getName());
        resp.setRevieweeId(review.getReviewee().getId());
        resp.setRevieweeName(review.getReviewee().getName());
        resp.setRating(review.getRating());
        resp.setComment(review.getComment());
        resp.setCreatedAt(review.getCreatedAt());
        return resp;
    }
}
