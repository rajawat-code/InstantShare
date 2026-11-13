package com.instantshare.payment.adapter;

import com.instantshare.payment.model.PaymentStatus;
import com.instantshare.rental.model.Rental;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Component
public class DemoPaymentGatewayAdapter implements PaymentGatewayAdapter {

    private static final Logger log = LoggerFactory.getLogger(DemoPaymentGatewayAdapter.class);

    public static final String DEMO_CARD_SUCCESS = "4242 4242 4242 4242";
    public static final String DEMO_CARD_DECLINE = "4000 0000 0000 0002";
    public static final String DEMO_CARD_INSUFFICIENT = "5000 0000 0000 0003";

    @Override
    public String getProviderName() {
        return "DEMO_GATEWAY";
    }

    @Override
    public PaymentOrderResult createOrder(Rental rental, BigDecimal amount, String currency) {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String orderId = String.format("demo_ord_%d_%s", System.currentTimeMillis(), uniqueSuffix);

        log.info("[DEMO PAYMENT] Created demo checkout order: {} for rental ID: {}, amount: {} {}",
                orderId, rental.getId(), amount, currency);

        return new PaymentOrderResult(orderId, amount, currency, "DEMO");
    }

    @Override
    public PaymentVerificationResult verifyDemoPayment(String orderId, String mockCardNumber, boolean simulateFailure) {
        String paymentId = "demo_pay_" + System.currentTimeMillis();

        if (simulateFailure) {
            log.warn("[DEMO PAYMENT] Simulated explicit failure for order: {}", orderId);
            return new PaymentVerificationResult(false, orderId, paymentId, PaymentStatus.FAILED, "Simulated payment failure");
        }

        if (mockCardNumber != null) {
            String sanitizedCard = mockCardNumber.replaceAll("\\s+", "");
            if (sanitizedCard.endsWith("0002")) {
                log.warn("[DEMO PAYMENT] Simulated card declined for card: {}", mockCardNumber);
                return new PaymentVerificationResult(false, orderId, paymentId, PaymentStatus.FAILED, "Card was declined (Demo simulation)");
            }
            if (sanitizedCard.endsWith("0003")) {
                log.warn("[DEMO PAYMENT] Simulated insufficient funds for card: {}", mockCardNumber);
                return new PaymentVerificationResult(false, orderId, paymentId, PaymentStatus.FAILED, "Insufficient funds (Demo simulation)");
            }
        }

        log.info("[DEMO PAYMENT] Verified successfully. Order: {}, Payment: {}", orderId, paymentId);
        return new PaymentVerificationResult(true, orderId, paymentId, PaymentStatus.SUCCESS, "Demo payment approved successfully");
    }

    @Override
    public PaymentVerificationResult processWebhook(String rawPayload, String signature) {
        // In demo mode, webhook processing parses orderId from simulated JSON or fallback
        log.info("[DEMO PAYMENT WEBHOOK] Processing demo webhook event. Payload: {}", rawPayload);
        String paymentId = "demo_wh_pay_" + System.currentTimeMillis();
        return new PaymentVerificationResult(true, "unknown", paymentId, PaymentStatus.SUCCESS, "Webhook verified");
    }

    public List<DemoCardInfo> getDemoCards() {
        return List.of(
                new DemoCardInfo(DEMO_CARD_SUCCESS, "12/28", "123", "Instant Success / Approved"),
                new DemoCardInfo(DEMO_CARD_DECLINE, "12/28", "123", "Simulated Card Declined"),
                new DemoCardInfo(DEMO_CARD_INSUFFICIENT, "12/28", "123", "Simulated Insufficient Funds")
        );
    }

    public static class DemoCardInfo {
        private final String cardNumber;
        private final String expiry;
        private final String cvv;
        private final String expectedResult;

        public DemoCardInfo(String cardNumber, String expiry, String cvv, String expectedResult) {
            this.cardNumber = cardNumber;
            this.expiry = expiry;
            this.cvv = cvv;
            this.expectedResult = expectedResult;
        }

        public String getCardNumber() {
            return cardNumber;
        }

        public String getExpiry() {
            return expiry;
        }

        public String getCvv() {
            return cvv;
        }

        public String getExpectedResult() {
            return expectedResult;
        }
    }
}
