package com.instantshare.payment.service;

import com.instantshare.common.exception.BadRequestException;
import com.instantshare.common.exception.ResourceNotFoundException;
import com.instantshare.common.exception.UnauthorizedException;
import com.instantshare.common.util.AppConstants;
import com.instantshare.payment.adapter.DemoPaymentGatewayAdapter;
import com.instantshare.payment.adapter.PaymentGatewayAdapter;
import com.instantshare.payment.dto.*;
import com.instantshare.payment.model.Payment;
import com.instantshare.payment.model.PaymentMode;
import com.instantshare.payment.model.PaymentStatus;
import com.instantshare.payment.repository.PaymentRepository;
import com.instantshare.rental.model.Rental;
import com.instantshare.rental.model.RentalStatus;
import com.instantshare.rental.repository.RentalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final RentalRepository rentalRepository;
    private final DemoPaymentGatewayAdapter demoGatewayAdapter;

    @Value("${instantshare.payment.mode:DEMO}")
    private String paymentModeConfig;

    @Value("${instantshare.payment.demo.auto-confirm:false}")
    private boolean autoConfirm;

    public PaymentService(
            PaymentRepository paymentRepository,
            RentalRepository rentalRepository,
            DemoPaymentGatewayAdapter demoGatewayAdapter) {
        this.paymentRepository = paymentRepository;
        this.rentalRepository = rentalRepository;
        this.demoGatewayAdapter = demoGatewayAdapter;
    }

    /**
     * Initiates checkout for a rental in DEMO mode.
     */
    @Transactional
    public CheckoutResponse createCheckoutSession(Long userId, CheckoutRequest request) {
        Rental rental = rentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", request.getRentalId()));

        if (!rental.getRenter().getId().equals(userId)) {
            throw new UnauthorizedException("Only the renter can initiate payment for this rental");
        }

        if (rental.getStatus() != RentalStatus.PENDING) {
            throw new BadRequestException("Rental is not in PENDING state. Current status: " + rental.getStatus());
        }

        // Calculate total amount
        BigDecimal rentalAmount = rental.getQuotedAmount();
        BigDecimal platformFee = rental.getPlatformFee() != null ? rental.getPlatformFee() : BigDecimal.ZERO;
        BigDecimal securityDeposit = rental.getSecurityDeposit() != null ? rental.getSecurityDeposit() : BigDecimal.ZERO;
        BigDecimal totalAmount = rentalAmount.add(platformFee).add(securityDeposit);

        // Check if an existing initiated payment exists
        Optional<Payment> existingPayment = paymentRepository.findTopByRentalIdOrderByCreatedAtDesc(rental.getId());
        String orderId;
        Payment payment;

        if (existingPayment.isPresent() && existingPayment.get().getStatus() == PaymentStatus.INITIATED) {
            payment = existingPayment.get();
            orderId = payment.getProviderOrderId();
        } else {
            PaymentGatewayAdapter.PaymentOrderResult orderResult = demoGatewayAdapter.createOrder(
                    rental, totalAmount, AppConstants.CURRENCY_INR
            );
            orderId = orderResult.getOrderId();

            payment = new Payment();
            payment.setRental(rental);
            payment.setProvider(demoGatewayAdapter.getProviderName());
            payment.setMode(PaymentMode.DEMO);
            payment.setProviderOrderId(orderId);
            payment.setAmount(totalAmount);
            payment.setCurrency(AppConstants.CURRENCY_INR);
            payment.setStatus(PaymentStatus.INITIATED);
            payment = paymentRepository.save(payment);
        }

        CheckoutResponse response = new CheckoutResponse();
        response.setOrderId(orderId);
        response.setRentalId(rental.getId());
        response.setEquipmentTitle(rental.getEquipment().getTitle());
        response.setRentalAmount(rentalAmount);
        response.setPlatformFee(platformFee);
        response.setSecurityDeposit(securityDeposit);
        response.setTotalAmount(totalAmount);
        response.setCurrency(AppConstants.CURRENCY_INR);
        response.setMode(PaymentMode.DEMO.name());
        response.setMessage("Demo mode payment gateway initialized. Use preset test cards or 1-click simulation to confirm.");
        response.setDemoTestCards(demoGatewayAdapter.getDemoCards());

        return response;
    }

    /**
     * Confirms payment in DEMO mode with simulated test card verification and updates rental to CONFIRMED.
     */
    @Transactional
    public PaymentStatusResponse confirmDemoPayment(Long userId, DemoConfirmRequest request) {
        Rental rental = rentalRepository.findByIdWithLock(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", request.getRentalId()));

        if (!rental.getRenter().getId().equals(userId)) {
            throw new UnauthorizedException("Only the renter can submit payment confirmation for this rental");
        }

        Payment payment = paymentRepository.findByProviderOrderId(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment Order", "orderId", request.getOrderId()));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment order {} is already confirmed (idempotent call)", request.getOrderId());
            return buildStatusResponse(payment, rental, "Payment is already successfully confirmed");
        }

        // Verify with Demo Payment Adapter
        PaymentGatewayAdapter.PaymentVerificationResult result = demoGatewayAdapter.verifyDemoPayment(
                request.getOrderId(),
                request.getCardNumber(),
                request.isSimulateFailure()
        );

        if (result.isSuccess()) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(Instant.now());
            payment.setProviderPaymentId(result.getPaymentId());
            payment.setRawPayload(String.format("{\"cardNumberMasked\":\"**** **** **** %s\", \"status\":\"APPROVED\"}",
                    request.getCardNumber().replaceAll("\\s+", "").substring(12)));
            paymentRepository.save(payment);

            // Transition rental status to CONFIRMED
            rental.setStatus(RentalStatus.CONFIRMED);
            rentalRepository.save(rental);

            log.info("[DEMO PAYMENT SUCCESS] Rental ID: {} successfully confirmed via Demo Gateway Order: {}",
                    rental.getId(), payment.getProviderOrderId());

            return buildStatusResponse(payment, rental, "Demo payment approved! Rental is now CONFIRMED.");
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setRawPayload(String.format("{\"error\":\"%s\", \"status\":\"DECLINED\"}", result.getMessage()));
            paymentRepository.save(payment);

            log.warn("[DEMO PAYMENT FAILED] Rental ID: {} demo payment failed. Reason: {}",
                    rental.getId(), result.getMessage());

            return buildStatusResponse(payment, rental, "Payment failed: " + result.getMessage());
        }
    }

    /**
     * Webhook simulation endpoint for payment gateways in DEMO mode. Idempotent.
     */
    @Transactional
    public PaymentStatusResponse processWebhook(MockWebhookPayload payload, String signature) {
        log.info("[DEMO WEBHOOK] Received event: {} for order: {}", payload.getEvent(), payload.getOrderId());

        if (payload.getOrderId() == null) {
            throw new BadRequestException("Missing orderId in webhook payload");
        }

        Payment payment = paymentRepository.findByProviderOrderId(payload.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment Order", "orderId", payload.getOrderId()));

        Rental rental = rentalRepository.findByIdWithLock(payment.getRental().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", payment.getRental().getId()));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return buildStatusResponse(payment, rental, "Webhook already processed previously");
        }

        if ("payment.captured".equalsIgnoreCase(payload.getEvent()) || "SUCCESS".equalsIgnoreCase(payload.getStatus())) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(Instant.now());
            payment.setProviderPaymentId(payload.getPaymentId() != null ? payload.getPaymentId() : "demo_pay_" + System.currentTimeMillis());
            paymentRepository.save(payment);

            rental.setStatus(RentalStatus.CONFIRMED);
            rentalRepository.save(rental);

            return buildStatusResponse(payment, rental, "Webhook processed: payment SUCCESS, rental CONFIRMED");
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return buildStatusResponse(payment, rental, "Webhook processed: payment marked FAILED");
        }
    }

    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatus(Long userId, Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental", "id", rentalId));

        if (!rental.getRenter().getId().equals(userId) && !rental.getOwner().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to view payment details for this rental");
        }

        Payment payment = paymentRepository.findTopByRentalIdOrderByCreatedAtDesc(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "rentalId", rentalId));

        return buildStatusResponse(payment, rental, "Current payment status");
    }

    private PaymentStatusResponse buildStatusResponse(Payment payment, Rental rental, String message) {
        PaymentStatusResponse response = new PaymentStatusResponse();
        response.setPaymentId(payment.getId());
        response.setRentalId(rental.getId());
        response.setOrderId(payment.getProviderOrderId());
        response.setPaymentIdRef(payment.getProviderPaymentId());
        response.setAmount(payment.getAmount());
        response.setCurrency(payment.getCurrency());
        response.setPaymentStatus(payment.getStatus());
        response.setPaymentMode(payment.getMode());
        response.setRentalStatus(rental.getStatus());
        response.setMessage(message);
        response.setPaidAt(payment.getPaidAt());
        return response;
    }
}
