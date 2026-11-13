package com.instantshare.equipment.repository;

import com.instantshare.equipment.model.Equipment;
import com.instantshare.equipment.model.EquipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByOwnerIdAndStatusNot(Long ownerId, EquipmentStatus status);

    Optional<Equipment> findByIdAndStatus(Long id, EquipmentStatus status);

    List<Equipment> findByStatus(EquipmentStatus status);

    List<Equipment> findByStatusAndCategoryId(EquipmentStatus status, Long categoryId);

    /**
     * Hyperlocal GPS nearby search on MySQL using native Haversine trigonometric calculation.
     * Uses bounding box index prefiltering (minLat..maxLat, minLon..maxLon) followed by exact geodesic distance check.
     * Zero external API calls.
     */
    @Query(value = """
        SELECT e.id AS id,
               e.title AS title,
               e.description AS description,
               e.price AS price,
               e.price_unit AS priceUnit,
               e.security_deposit AS securityDeposit,
               e.status AS status,
               l.latitude AS latitude,
               l.longitude AS longitude,
               l.display_area AS displayArea,
               c.name AS categoryName,
               e.owner_user_id AS ownerUserId,
               (6371000.0 * acos(
                  least(1.0, greatest(-1.0,
                    sin(radians(:userLat)) * sin(radians(l.latitude)) +
                    cos(radians(:userLat)) * cos(radians(l.latitude)) *
                    cos(radians(l.longitude) - radians(:userLon))
                  ))
               )) AS distanceMeters
        FROM equipment e
        JOIN locations l ON e.id = l.equipment_id
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.status = 'ACTIVE'
          AND l.latitude BETWEEN :minLat AND :maxLat
          AND l.longitude BETWEEN :minLon AND :maxLon
          AND (:categoryId IS NULL OR e.category_id = :categoryId)
          AND (6371000.0 * acos(
                  least(1.0, greatest(-1.0,
                    sin(radians(:userLat)) * sin(radians(l.latitude)) +
                    cos(radians(:userLat)) * cos(radians(l.latitude)) *
                    cos(radians(l.longitude) - radians(:userLon))
                  ))
               )) <= :radiusMeters
        ORDER BY distanceMeters ASC
        """, nativeQuery = true)
    List<NearbyEquipmentProjection> findNearbyActiveEquipment(
            @Param("userLat") double userLat,
            @Param("userLon") double userLon,
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLon") double minLon,
            @Param("maxLon") double maxLon,
            @Param("radiusMeters") double radiusMeters,
            @Param("categoryId") Long categoryId
    );
}
