package com.instantshare.equipment.service;

import com.instantshare.common.exception.ResourceNotFoundException;
import com.instantshare.common.exception.UnauthorizedException;
import com.instantshare.equipment.dto.EquipmentRequest;
import com.instantshare.equipment.dto.EquipmentResponse;
import com.instantshare.equipment.dto.NearbyEquipmentDto;
import com.instantshare.equipment.dto.NearbySearchResponse;
import com.instantshare.equipment.model.Category;
import com.instantshare.equipment.model.Equipment;
import com.instantshare.equipment.model.EquipmentImage;
import com.instantshare.equipment.model.EquipmentStatus;
import com.instantshare.equipment.repository.CategoryRepository;
import com.instantshare.equipment.repository.EquipmentRepository;
import com.instantshare.equipment.repository.NearbyEquipmentProjection;
import com.instantshare.location.model.Location;
import com.instantshare.location.util.GeoUtils;
import com.instantshare.user.model.BusinessProfile;
import com.instantshare.user.model.User;
import com.instantshare.user.repository.BusinessProfileRepository;
import com.instantshare.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BusinessProfileRepository businessProfileRepository;

    public EquipmentService(
            EquipmentRepository equipmentRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            BusinessProfileRepository businessProfileRepository) {
        this.equipmentRepository = equipmentRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.businessProfileRepository = businessProfileRepository;
    }

    @Transactional
    public EquipmentResponse createEquipment(Long ownerId, EquipmentRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId));

        Equipment equipment = new Equipment();
        equipment.setOwner(owner);
        equipment.setTitle(request.getTitle());
        equipment.setDescription(request.getDescription());
        equipment.setPrice(request.getPrice());
        equipment.setPriceUnit(request.getPriceUnit() != null ? request.getPriceUnit() : "DAY");
        equipment.setSecurityDeposit(request.getSecurityDeposit() != null ? request.getSecurityDeposit() : BigDecimal.ZERO);
        equipment.setStatus(EquipmentStatus.ACTIVE);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            equipment.setCategory(category);
        }

        // Attach business profile if owner has one
        businessProfileRepository.findByUserId(ownerId).ifPresent(equipment::setBusiness);

        // Location
        GeoUtils.validateCoordinates(request.getLatitude(), request.getLongitude());
        Location location = new Location(equipment, request.getLatitude(), request.getLongitude(), request.getDisplayArea());
        equipment.setLocation(location);

        // Images
        if (request.getImageUrls() != null) {
            List<EquipmentImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                images.add(new EquipmentImage(equipment, request.getImageUrls().get(i), i));
            }
            equipment.setImages(images);
        }

        Equipment saved = equipmentRepository.save(equipment);
        return toResponse(saved);
    }

    @Transactional
    public EquipmentResponse updateEquipment(Long ownerId, Long equipmentId, EquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", equipmentId));

        if (!equipment.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You are not authorized to update this equipment listing");
        }

        equipment.setTitle(request.getTitle());
        equipment.setDescription(request.getDescription());
        equipment.setPrice(request.getPrice());
        if (request.getPriceUnit() != null) {
            equipment.setPriceUnit(request.getPriceUnit());
        }
        if (request.getSecurityDeposit() != null) {
            equipment.setSecurityDeposit(request.getSecurityDeposit());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            equipment.setCategory(category);
        }

        if (request.getLatitude() != null && request.getLongitude() != null) {
            GeoUtils.validateCoordinates(request.getLatitude(), request.getLongitude());
            Location loc = equipment.getLocation();
            if (loc == null) {
                loc = new Location(equipment, request.getLatitude(), request.getLongitude(), request.getDisplayArea());
                equipment.setLocation(loc);
            } else {
                loc.setLatitude(request.getLatitude());
                loc.setLongitude(request.getLongitude());
                if (request.getDisplayArea() != null) {
                    loc.setDisplayArea(request.getDisplayArea());
                }
            }
        }

        Equipment saved = equipmentRepository.save(equipment);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public EquipmentResponse getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findByIdAndStatus(id, EquipmentStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));
        return toResponse(equipment);
    }

    @Transactional
    public void deleteEquipment(Long ownerId, Long equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", equipmentId));

        if (!equipment.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("You are not authorized to delete this equipment listing");
        }

        equipment.setStatus(EquipmentStatus.DELETED);
        equipmentRepository.save(equipment);
    }

    @Transactional(readOnly = true)
    public List<EquipmentResponse> getOwnerEquipments(Long ownerId) {
        List<Equipment> list = equipmentRepository.findByOwnerIdAndStatusNot(ownerId, EquipmentStatus.DELETED);
        return list.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EquipmentResponse> getAllActiveEquipment(Long categoryId, String search) {
        List<Equipment> list = categoryId != null
                ? equipmentRepository.findByStatusAndCategoryId(EquipmentStatus.ACTIVE, categoryId)
                : equipmentRepository.findByStatus(EquipmentStatus.ACTIVE);

        if (search != null && !search.trim().isEmpty()) {
            String query = search.toLowerCase().trim();
            list = list.stream()
                    .filter(e -> (e.getTitle() != null && e.getTitle().toLowerCase().contains(query)) ||
                                 (e.getDescription() != null && e.getDescription().toLowerCase().contains(query)))
                    .toList();
        }
        return list.stream().map(this::toResponse).toList();
    }

    /**
     * GPS Nearby Search - Strictly enforced 100m, 200m, 300m micro-radius.
     * Uses MySQL native Haversine query.
     */
    @Transactional(readOnly = true)
    public NearbySearchResponse searchNearby(double lat, double lon, Integer radius, Long categoryId) {
        GeoUtils.validateCoordinates(lat, lon);
        int validRadius = GeoUtils.validateRadius(radius);

        GeoUtils.BoundingBox box = GeoUtils.calculateBoundingBox(lat, lon, validRadius);

        List<NearbyEquipmentProjection> projections = equipmentRepository.findNearbyActiveEquipment(
                lat, lon,
                box.getMinLat(), box.getMaxLat(),
                box.getMinLon(), box.getMaxLon(),
                validRadius,
                categoryId
        );

        List<NearbyEquipmentDto> items = new ArrayList<>();
        for (NearbyEquipmentProjection p : projections) {
            NearbyEquipmentDto dto = new NearbyEquipmentDto();
            dto.setId(p.getId());
            dto.setTitle(p.getTitle());
            dto.setDescription(p.getDescription());
            dto.setPrice(p.getPrice());
            dto.setPriceUnit(p.getPriceUnit());
            dto.setSecurityDeposit(p.getSecurityDeposit());
            dto.setCategoryName(p.getCategoryName());
            dto.setLatitude(p.getLatitude());
            dto.setLongitude(p.getLongitude());
            dto.setDisplayArea(p.getDisplayArea());
            dto.setOwnerId(p.getOwnerUserId());

            // Round distance to nearest integer meter
            if (p.getDistanceMeters() != null) {
                double rounded = BigDecimal.valueOf(p.getDistanceMeters())
                        .setScale(0, RoundingMode.HALF_UP)
                        .doubleValue();
                dto.setDistanceMeters(rounded);
            }
            items.add(dto);
        }

        return new NearbySearchResponse(lat, lon, validRadius, items);
    }

    private EquipmentResponse toResponse(Equipment eq) {
        EquipmentResponse resp = new EquipmentResponse();
        resp.setId(eq.getId());
        resp.setOwnerId(eq.getOwner().getId());
        resp.setOwnerName(eq.getOwner().getName());
        if (eq.getBusiness() != null) {
            resp.setBusinessName(eq.getBusiness().getBusinessName());
        }
        if (eq.getCategory() != null) {
            resp.setCategoryId(eq.getCategory().getId());
            resp.setCategoryName(eq.getCategory().getName());
        }
        resp.setTitle(eq.getTitle());
        resp.setDescription(eq.getDescription());
        resp.setPrice(eq.getPrice());
        resp.setPriceUnit(eq.getPriceUnit());
        resp.setSecurityDeposit(eq.getSecurityDeposit());
        resp.setStatus(eq.getStatus());
        if (eq.getLocation() != null) {
            resp.setLatitude(eq.getLocation().getLatitude());
            resp.setLongitude(eq.getLocation().getLongitude());
            resp.setDisplayArea(eq.getLocation().getDisplayArea());
        }
        if (eq.getImages() != null) {
            resp.setImageUrls(eq.getImages().stream().map(EquipmentImage::getImageUrl).toList());
        }
        resp.setCreatedAt(eq.getCreatedAt());
        return resp;
    }
}
