package com.instantshare.rental.service;

import com.instantshare.common.exception.BadRequestException;
import com.instantshare.common.exception.ResourceNotFoundException;
import com.instantshare.common.exception.UnauthorizedException;
import com.instantshare.common.util.AppConstants;
import com.instantshare.equipment.model.Equipment;
import com.instantshare.equipment.model.EquipmentStatus;
import com.instantshare.equipment.repository.EquipmentRepository;
import com.instantshare.payment.model.Payment;
import com.instantshare.payment.repository.PaymentRepository;
import com.instantshare.rental.dto.RentalRequest;
import com.instantshare.rental.dto.RentalResponse;
import com.instantshare.rental.model.Rental;
import com.instantshare.rental.model.RentalStatus;
import com.instantshare.rental.repository.RentalRepository;
import com.instantshare.user.model.User;
import com.instantshare.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @Value("${instantshare.payment.platform-fee-percent:10.0}")
    private double platformFeePercent;

    public RentalService(
            RentalRepository rentalRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            PaymentRepository paymentRepository) {
        this.rentalRepository = rentalRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public RentalResponse createRentalRequest(Long renterId, RentalRequest request) {
        if (!request.getEndAt().isAfter(request.getStartAt())) {
            throw new BadRequestException("Rental end time must be after start time");
        }

        Equipment equipment = equipmentRepository.findByIdAndStatus(request.getEquipmentId(), EquipmentStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", request.getEquipmentId()));

        if (equipment.getOwner().getId().equals(renterId)) {
            throw new BadRequestException("You cannot rent your own equipment");
        }

        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", renterId));

        // Check for double-booking conflict on MySQL database
        boolean hasOverlap = rentalRepository.hasOverlappingBooking(
                equipment.getId(),
                request.getStartAt(),
                request.getEndAt(),
                List.of(RentalStatus.CONFIRMED, RentalStatus.ACTIVE),
                null
        );

        if (hasOverlap) {
            throw new BadRequestException("Equipment is already booked for the selected time window");
        }

        // Calculate rental price based on duration
        BigDecimal quotedAmount = calculateRentalPrice(equipment, request.getStartAt(), request.getEndAt());
        BigDecimal platformFee = quotedAmount
                .multiply(BigDecimal.valueOf(platformFeePercent / 100.0))
                .setScale(2, RoundingMode.HALF_UP);

        Rental rental = new Rental();
        rental.setEquipment(equipment);
        rental.setRenter(renter);
        rental.setOwner(equipment.getOwner());
        rental.setStartAt(request.getStartAt());
        rental.setEndAt(request.getEndAt());
        rental.setStatus(RentalStatus.PENDING);
        rental.setQuotedAmount(quotedAmount);
        rental.setSecurityDeposit(equipment.getSecurityDeposit() != null ? equipment.getSecurityDeposit() : BigDecimal.ZERO);
        rental.setPlatformFee(platformFee);

        Rental saved = rentalRepository.save(rental);
        return toResponse(saved);
    }

    @Transactional
    public RentalResponse decideRental(Long ownerId, Long rentalId, String decision) {
        Rental rental = rentalRepository.findByIdWithLock(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", rentalId));

        if (!rental.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("Only the equipment owner can accept or reject this rental request");
        }

        if (rental.getStatus() != RentalStatus.PENDING) {
            throw new BadRequestException("Rental is not in PENDING status. Current status: " + rental.getStatus());
        }

        if ("REJECT".equalsIgnoreCase(decision)) {
            rental.setStatus(RentalStatus.REJECTED);
        } else if ("ACCEPT".equalsIgnoreCase(decision)) {
            // Check again for overlaps before accepting
            boolean hasOverlap = rentalRepository.hasOverlappingBooking(
                    rental.getEquipment().getId(),
                    rental.getStartAt(),
                    rental.getEndAt(),
                    List.of(RentalStatus.CONFIRMED, RentalStatus.ACTIVE),
                    rental.getId()
            );
            if (hasOverlap) {
                throw new BadRequestException("Cannot accept: another booking was confirmed for this overlapping time");
            }
            // Rental remains ready for renter to complete demo checkout
            // Status remains PENDING until payment is confirmed
        } else {
            throw new BadRequestException("Invalid decision: " + decision + ". Allowed values: ACCEPT, REJECT");
        }

        Rental saved = rentalRepository.save(rental);
        return toResponse(saved);
    }

    @Transactional
    public RentalResponse handoverEquipment(Long ownerId, Long rentalId) {
        Rental rental = rentalRepository.findByIdWithLock(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", rentalId));

        if (!rental.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("Only the equipment owner can mark equipment as handed over");
        }

        if (rental.getStatus() != RentalStatus.CONFIRMED) {
            throw new BadRequestException("Equipment can only be handed over if booking is CONFIRMED. Current: " + rental.getStatus());
        }

        rental.setStatus(RentalStatus.ACTIVE);
        return toResponse(rentalRepository.save(rental));
    }

    @Transactional
    public RentalResponse returnEquipment(Long ownerId, Long rentalId) {
        Rental rental = rentalRepository.findByIdWithLock(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", rentalId));

        if (!rental.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("Only the equipment owner can mark equipment as returned and completed");
        }

        if (rental.getStatus() != RentalStatus.ACTIVE) {
            throw new BadRequestException("Equipment can only be returned if currently ACTIVE. Current: " + rental.getStatus());
        }

        rental.setStatus(RentalStatus.COMPLETED);
        return toResponse(rentalRepository.save(rental));
    }

    @Transactional(readOnly = true)
    public RentalResponse getRentalById(Long userId, Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", rentalId));

        if (!rental.getRenter().getId().equals(userId) && !rental.getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to view this rental");
        }

        return toResponse(rental);
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> getMyRentals(Long userId, String asRole) {
        List<Rental> list;
        if ("OWNER".equalsIgnoreCase(asRole)) {
            list = rentalRepository.findByOwnerIdOrderByCreatedAtDesc(userId);
        } else {
            list = rentalRepository.findByRenterIdOrderByCreatedAtDesc(userId);
        }
        return list.stream().map(this::toResponse).toList();
    }

    private BigDecimal calculateRentalPrice(Equipment equipment, Instant startAt, Instant endAt) {
        Duration duration = Duration.between(startAt, endAt);
        long hours = Math.max(1, duration.toHours());
        BigDecimal rate = equipment.getPrice();
        String unit = equipment.getPriceUnit() != null ? equipment.getPriceUnit().toUpperCase() : "DAY";

        switch (unit) {
            case "HOUR":
                return rate.multiply(BigDecimal.valueOf(hours));
            case "WEEK":
                long daysForWeek = Math.max(1, (hours + 23) / 24);
                long weeks = Math.max(1, (daysForWeek + 6) / 7);
                return rate.multiply(BigDecimal.valueOf(weeks));
            case "DAY":
            default:
                long days = Math.max(1, (hours + 23) / 24);
                return rate.multiply(BigDecimal.valueOf(days));
        }
    }

    public RentalResponse toResponse(Rental rental) {
        RentalResponse resp = new RentalResponse();
        resp.setId(rental.getId());
        resp.setEquipmentId(rental.getEquipment().getId());
        resp.setEquipmentTitle(rental.getEquipment().getTitle());
        resp.setRenterId(rental.getRenter().getId());
        resp.setRenterName(rental.getRenter().getName());
        resp.setRenterEmail(rental.getRenter().getEmail());
        resp.setRenterPhone(rental.getRenter().getPhone());
        resp.setOwnerId(rental.getOwner().getId());
        resp.setOwnerName(rental.getOwner().getName());
        resp.setStartAt(rental.getStartAt());
        resp.setEndAt(rental.getEndAt());
        resp.setStatus(rental.getStatus());
        resp.setQuotedAmount(rental.getQuotedAmount());
        resp.setSecurityDeposit(rental.getSecurityDeposit());
        resp.setPlatformFee(rental.getPlatformFee());

        BigDecimal total = rental.getQuotedAmount()
                .add(rental.getPlatformFee() != null ? rental.getPlatformFee() : BigDecimal.ZERO)
                .add(rental.getSecurityDeposit() != null ? rental.getSecurityDeposit() : BigDecimal.ZERO);
        resp.setTotalPayable(total);

        paymentRepository.findTopByRentalIdOrderByCreatedAtDesc(rental.getId())
                .ifPresent(p -> resp.setPaymentStatus(p.getStatus().name()));

        resp.setCreatedAt(rental.getCreatedAt());
        return resp;
    }
}
