package com.instantshare.rental.repository;

import com.instantshare.rental.model.Rental;
import com.instantshare.rental.model.RentalStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {

    List<Rental> findByRenterIdOrderByCreatedAtDesc(Long renterId);

    List<Rental> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Rental r WHERE r.id = :id")
    Optional<Rental> findByIdWithLock(@Param("id") Long id);

    /**
     * Checks if there is any overlapping booking for this equipment that is already CONFIRMED or ACTIVE.
     */
    @Query("""
        SELECT COUNT(r) > 0 FROM Rental r
        WHERE r.equipment.id = :equipmentId
          AND r.status IN (:activeStatuses)
          AND r.startAt < :endAt
          AND r.endAt > :startAt
          AND (:excludeRentalId IS NULL OR r.id != :excludeRentalId)
        """)
    boolean hasOverlappingBooking(
            @Param("equipmentId") Long equipmentId,
            @Param("startAt") Instant startAt,
            @Param("endAt") Instant endAt,
            @Param("activeStatuses") List<RentalStatus> activeStatuses,
            @Param("excludeRentalId") Long excludeRentalId
    );
}
