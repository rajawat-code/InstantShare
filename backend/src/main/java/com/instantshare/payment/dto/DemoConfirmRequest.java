package com.instantshare.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DemoConfirmRequest {

    @NotNull(message = "Rental ID is required")
    private Long rentalId;

    @NotBlank(message = "Order ID is required")
    private String orderId;

    // Preset test card (e.g., "4242 4242 4242 4242")
    private String cardNumber = "4242 4242 4242 4242";

    private String expiry = "12/28";

    private String cvv = "123";

    // Set true to simulate a failed transaction
    private boolean simulateFailure = false;

    public DemoConfirmRequest() {}

    public Long getRentalId() {
        return rentalId;
    }

    public void setRentalId(Long rentalId) {
        this.rentalId = rentalId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getExpiry() {
        return expiry;
    }

    public void setExpiry(String expiry) {
        this.expiry = expiry;
    }

    public String getCvv() {
        return cvv;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }

    public boolean isSimulateFailure() {
        return simulateFailure;
    }

    public void setSimulateFailure(boolean simulateFailure) {
        this.simulateFailure = simulateFailure;
    }
}
