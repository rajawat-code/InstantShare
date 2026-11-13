package com.instantshare.payment.dto;

import com.instantshare.payment.model.PaymentMode;
import com.instantshare.payment.model.PaymentStatus;
import com.instantshare.rental.model.RentalStatus;

import java.math.BigDecimal;
import java.time.Instant;

public class PaymentStatusResponse {

    private Long paymentId;
    private Long rentalId;
    private String orderId;
    private String paymentIdRef;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus paymentStatus;
    private PaymentMode paymentMode;
    private RentalStatus rentalStatus;
    private String message;
    private Instant paidAt;

    public PaymentStatusResponse() {}

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

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

    public String getPaymentIdRef() {
        return paymentIdRef;
    }

    public void setPaymentIdRef(String paymentIdRef) {
        this.paymentIdRef = paymentIdRef;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public PaymentMode getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(PaymentMode paymentMode) {
        this.paymentMode = paymentMode;
    }

    public RentalStatus getRentalStatus() {
        return rentalStatus;
    }

    public void setRentalStatus(RentalStatus rentalStatus) {
        this.rentalStatus = rentalStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }
}
