package com.instantshare.common.util;

import java.util.List;

public final class AppConstants {

    private AppConstants() {}

    public static final List<Integer> SUPPORTED_RADII_METERS = List.of(100, 200, 300, 500, 1000, 2000);
    public static final double DEFAULT_RADIUS_METERS = 200.0;
    public static final double MAX_RADIUS_METERS = 2000.0;
    public static final double EARTH_RADIUS_METERS = 6371000.0;

    public static final String ROLE_RENTER = "RENTER";
    public static final String ROLE_OWNER = "OWNER";
    public static final String ROLE_BUSINESS = "BUSINESS";
    public static final String ROLE_ADMIN = "ADMIN";

    public static final String PAYMENT_PROVIDER_DEMO = "DEMO_GATEWAY";
    public static final String CURRENCY_INR = "INR";
    public static final double DEFAULT_PLATFORM_FEE_PERCENT = 10.0;
}
