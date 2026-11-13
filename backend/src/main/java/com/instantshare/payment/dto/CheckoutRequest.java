package com.instantshare.payment.dto;

import jakarta.validation.constraints.NotNull;

public class CheckoutRequest {

    @NotNull(message = "Rental ID is required for checkout")
    private Long rentalId;

    public CheckoutRequest() {}

    public CheckoutRequest(Long rentalId) {
        this.rentalId = rentalId;
    }

    public Long getRentalId() {
        return rentalId;
    }

    public void setRentalId(Long rentalId) {
        this.rentalId = rentalId;
    }
}
