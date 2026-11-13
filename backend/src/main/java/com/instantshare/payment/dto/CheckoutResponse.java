package com.instantshare.payment.dto;

import com.instantshare.payment.adapter.DemoPaymentGatewayAdapter;

import java.math.BigDecimal;
import java.util.List;

public class CheckoutResponse {

    private String orderId;
    private Long rentalId;
    private String equipmentTitle;
    private BigDecimal rentalAmount;
    private BigDecimal platformFee;
    private BigDecimal securityDeposit;
    private BigDecimal totalAmount;
    private String currency;
    private String mode;
    private String message;
    private List<DemoPaymentGatewayAdapter.DemoCardInfo> demoTestCards;

    public CheckoutResponse() {}

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public Long getRentalId() {
        return rentalId;
    }

    public void setRentalId(Long rentalId) {
        this.rentalId = rentalId;
    }

    public String getEquipmentTitle() {
        return equipmentTitle;
    }

    public void setEquipmentTitle(String equipmentTitle) {
        this.equipmentTitle = equipmentTitle;
    }

    public BigDecimal getRentalAmount() {
        return rentalAmount;
    }

    public void setRentalAmount(BigDecimal rentalAmount) {
        this.rentalAmount = rentalAmount;
    }

    public BigDecimal getPlatformFee() {
        return platformFee;
    }

    public void setPlatformFee(BigDecimal platformFee) {
        this.platformFee = platformFee;
    }

    public BigDecimal getSecurityDeposit() {
        return securityDeposit;
    }

    public void setSecurityDeposit(BigDecimal securityDeposit) {
        this.securityDeposit = securityDeposit;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<DemoPaymentGatewayAdapter.DemoCardInfo> getDemoTestCards() {
        return demoTestCards;
    }

    public void setDemoTestCards(List<DemoPaymentGatewayAdapter.DemoCardInfo> demoTestCards) {
        this.demoTestCards = demoTestCards;
    }
}
