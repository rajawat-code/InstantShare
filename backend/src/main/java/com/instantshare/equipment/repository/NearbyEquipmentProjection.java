package com.instantshare.equipment.repository;

import java.math.BigDecimal;

public interface NearbyEquipmentProjection {
    Long getId();
    String getTitle();
    String getDescription();
    BigDecimal getPrice();
    String getPriceUnit();
    BigDecimal getSecurityDeposit();
    String getStatus();
    Double getLatitude();
    Double getLongitude();
    String getDisplayArea();
    Double getDistanceMeters();
    Long getOwnerUserId();
    String getCategoryName();
}
