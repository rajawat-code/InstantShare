package com.instantshare.payment;

import com.instantshare.equipment.model.Equipment;
import com.instantshare.payment.adapter.DemoPaymentGatewayAdapter;
import com.instantshare.payment.adapter.PaymentGatewayAdapter;
import com.instantshare.payment.model.PaymentStatus;
import com.instantshare.rental.model.Rental;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class DemoPaymentGatewayTest {

    private final DemoPaymentGatewayAdapter adapter = new DemoPaymentGatewayAdapter();

    @Test
    @DisplayName("Should create demo order with unique prefix")
    void testCreateOrder() {
        Rental rental = new Rental();
        rental.setId(42L);

        PaymentGatewayAdapter.PaymentOrderResult order = adapter.createOrder(
                rental, BigDecimal.valueOf(350.00), "INR"
        );

        assertNotNull(order.getOrderId());
        assertTrue(order.getOrderId().startsWith("demo_ord_"));
        assertEquals("DEMO", order.getMode());
        assertEquals("INR", order.getCurrency());
        assertEquals(BigDecimal.valueOf(350.00), order.getAmount());
    }

    @Test
    @DisplayName("Should approve valid demo test card")
    void testVerifySuccessCard() {
        PaymentGatewayAdapter.PaymentVerificationResult result = adapter.verifyDemoPayment(
                "demo_ord_123456", DemoPaymentGatewayAdapter.DEMO_CARD_SUCCESS, false
        );

        assertTrue(result.isSuccess());
        assertEquals(PaymentStatus.SUCCESS, result.getStatus());
        assertNotNull(result.getPaymentId());
        assertTrue(result.getPaymentId().startsWith("demo_pay_"));
    }

    @Test
    @DisplayName("Should simulate decline when card ending in 0002 is used")
    void testVerifyDeclinedCard() {
        PaymentGatewayAdapter.PaymentVerificationResult result = adapter.verifyDemoPayment(
                "demo_ord_123456", DemoPaymentGatewayAdapter.DEMO_CARD_DECLINE, false
        );

        assertFalse(result.isSuccess());
        assertEquals(PaymentStatus.FAILED, result.getStatus());
    }

    @Test
    @DisplayName("Should simulate explicit failure flag")
    void testExplicitFailureSimulation() {
        PaymentGatewayAdapter.PaymentVerificationResult result = adapter.verifyDemoPayment(
                "demo_ord_123456", DemoPaymentGatewayAdapter.DEMO_CARD_SUCCESS, true
        );

        assertFalse(result.isSuccess());
        assertEquals(PaymentStatus.FAILED, result.getStatus());
    }
}
