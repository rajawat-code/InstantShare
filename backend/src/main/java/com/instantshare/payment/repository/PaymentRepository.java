package com.instantshare.payment.repository;

import com.instantshare.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByRentalId(Long rentalId);

    Optional<Payment> findByProviderOrderId(String providerOrderId);

    Optional<Payment> findTopByRentalIdOrderByCreatedAtDesc(Long rentalId);
}
