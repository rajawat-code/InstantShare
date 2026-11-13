package com.instantshare.rental.controller;

import com.instantshare.common.dto.ApiResponse;
import com.instantshare.rental.dto.RentalDecisionRequest;
import com.instantshare.rental.dto.RentalRequest;
import com.instantshare.rental.dto.RentalResponse;
import com.instantshare.rental.service.RentalService;
import com.instantshare.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RentalResponse>> createRentalRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody RentalRequest request) {

        RentalResponse response = rentalService.createRentalRequest(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rental request submitted successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RentalResponse>> getRentalById(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        RentalResponse response = rentalService.getRentalById(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> getMyRentals(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(value = "role", defaultValue = "RENTER") String role) {

        List<RentalResponse> responses = rentalService.getMyRentals(currentUser.getId(), role);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PatchMapping("/{id}/decision")
    public ResponseEntity<ApiResponse<RentalResponse>> decideRental(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody RentalDecisionRequest request) {

        RentalResponse response = rentalService.decideRental(currentUser.getId(), id, request.getDecision());
        return ResponseEntity.ok(ApiResponse.success("Rental request " + request.getDecision().toLowerCase() + "ed", response));
    }

    @PatchMapping("/{id}/handover")
    public ResponseEntity<ApiResponse<RentalResponse>> handoverEquipment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        RentalResponse response = rentalService.handoverEquipment(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Equipment marked as handed over (ACTIVE)", response));
    }

    @PatchMapping("/{id}/return")
    public ResponseEntity<ApiResponse<RentalResponse>> returnEquipment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        RentalResponse response = rentalService.returnEquipment(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Equipment returned and rental COMPLETED", response));
    }
}
