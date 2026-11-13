package com.instantshare.equipment.controller;

import com.instantshare.common.dto.ApiResponse;
import com.instantshare.equipment.dto.EquipmentRequest;
import com.instantshare.equipment.dto.EquipmentResponse;
import com.instantshare.equipment.dto.NearbySearchResponse;
import com.instantshare.equipment.model.Category;
import com.instantshare.equipment.repository.CategoryRepository;
import com.instantshare.equipment.service.EquipmentService;
import com.instantshare.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final CategoryRepository categoryRepository;

    public EquipmentController(EquipmentService equipmentService, CategoryRepository categoryRepository) {
        this.equipmentService = equipmentService;
        this.categoryRepository = categoryRepository;
    }

    /**
     * Hyperlocal GPS Nearby Search
     * Strict 100m, 200m, 300m micro-radius supported.
     * Calculated natively in MySQL.
     */
    @GetMapping("/equipment/nearby")
    public ResponseEntity<ApiResponse<NearbySearchResponse>> searchNearby(
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon,
            @RequestParam(value = "radius", required = false, defaultValue = "200") Integer radius,
            @RequestParam(value = "category", required = false) Long categoryId) {

        NearbySearchResponse results = equipmentService.searchNearby(lat, lon, radius, categoryId);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/equipment")
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> getAllEquipment(
            @RequestParam(value = "category", required = false) Long categoryId,
            @RequestParam(value = "search", required = false) String search) {

        List<EquipmentResponse> responses = equipmentService.getAllActiveEquipment(categoryId, search);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/equipment")
    public ResponseEntity<ApiResponse<EquipmentResponse>> createEquipment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody EquipmentRequest request) {

        EquipmentResponse response = equipmentService.createEquipment(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Equipment listing created successfully", response));
    }

    @GetMapping("/equipment/{id}")
    public ResponseEntity<ApiResponse<EquipmentResponse>> getEquipmentById(@PathVariable Long id) {
        EquipmentResponse response = equipmentService.getEquipmentById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/equipment/{id}")
    public ResponseEntity<ApiResponse<EquipmentResponse>> updateEquipment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequest request) {

        EquipmentResponse response = equipmentService.updateEquipment(currentUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Equipment listing updated successfully", response));
    }

    @DeleteMapping("/equipment/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEquipment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        equipmentService.deleteEquipment(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Equipment listing deleted successfully", null));
    }

    @GetMapping("/equipment/my")
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> getMyEquipment(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<EquipmentResponse> responses = equipmentService.getOwnerEquipments(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Category>>> getCategories() {
        List<Category> categories = categoryRepository.findByActiveTrue();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
}
