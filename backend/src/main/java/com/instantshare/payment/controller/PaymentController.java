package com.instantshare.payment.controller;

import com.instantshare.common.dto.ApiResponse;
import com.instantshare.payment.dto.*;
import com.instantshare.payment.service.PaymentService;
import com.instantshare.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Start demo checkout session for an accepted rental
     */
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<CheckoutResponse>> createCheckoutSession(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CheckoutRequest request) {

        CheckoutResponse response = paymentService.createCheckoutSession(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Checkout session initialized in DEMO mode", response));
    }

    /**
     * Confirm demo payment using simulated test card or 1-click test button.
     * Transitions rental status to CONFIRMED.
     */
    @PostMapping("/demo-confirm")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> confirmDemoPayment(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody DemoConfirmRequest request) {

        PaymentStatusResponse response = paymentService.confirmDemoPayment(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    /**
     * Simulated webhook endpoint for automated end-to-end tests and asynchronous demo gateway callbacks.
     */
    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> handleWebhook(
            @RequestBody MockWebhookPayload payload,
            @RequestHeader(value = "X-Demo-Signature", required = false) String signature) {

        PaymentStatusResponse response = paymentService.processWebhook(payload, signature);
        return ResponseEntity.ok(ApiResponse.success("Webhook processed successfully", response));
    }

    /**
     * Query payment status for a rental
     */
    @GetMapping("/status/{rentalId}")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> getPaymentStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long rentalId) {

        PaymentStatusResponse response = paymentService.getPaymentStatus(currentUser.getId(), rentalId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
