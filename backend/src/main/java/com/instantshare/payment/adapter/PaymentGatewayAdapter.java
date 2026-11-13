package com.instantshare.payment.adapter;

import com.instantshare.payment.model.Payment;
import com.instantshare.payment.model.PaymentStatus;
import com.instantshare.rental.model.Rental;

import java.math.BigDecimal;

public interface PaymentGatewayAdapter {

    String getProviderName();

    PaymentOrderResult createOrder(Rental rental, BigDecimal amount, String currency);

    PaymentVerificationResult verifyDemoPayment(String orderId, String mockCardNumber, boolean simulateFailure);

    PaymentVerificationResult processWebhook(String rawPayload, String signature);

    class PaymentOrderResult {
        private final String orderId;
        private final BigDecimal amount;
        private final String currency;
        private final String mode;

        public PaymentOrderResult(String orderId, BigDecimal amount, String currency, String mode) {
            this.orderId = orderId;
            this.amount = amount;
            this.currency = currency;
            this.mode = mode;
        }

        public String getOrderId() {
            return orderId;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public String getCurrency() {
            return currency;
        }

        public String getMode() {
            return mode;
        }
    }

    class PaymentVerificationResult {
        private final boolean success;
        private final String orderId;
        private final String paymentId;
        private final PaymentStatus status;
        private final String message;

        public PaymentVerificationResult(boolean success, String orderId, String paymentId, PaymentStatus status, String message) {
            this.success = success;
            this.orderId = orderId;
            this.paymentId = paymentId;
            this.status = status;
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getOrderId() {
            return orderId;
        }

        public String getPaymentId() {
            return paymentId;
        }

        public PaymentStatus getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }
    }
}
