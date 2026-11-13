package com.instantshare.location;

import com.instantshare.common.exception.BadRequestException;
import com.instantshare.location.util.GeoUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GeoUtilsTest {

    // Base point: HSR Layout Sector 1 (12.914142, 77.636928)
    private final double baseLat = 12.914142;
    private final double baseLon = 77.636928;

    @Test
    @DisplayName("Should accurately calculate distance for point ~63 meters away")
    void testHaversineDistanceClosePoint() {
        // Point: ~63m northeast
        double targetLat = 12.914592;
        double targetLon = 77.637278;

        double distance = GeoUtils.haversineDistanceMeters(baseLat, baseLon, targetLat, targetLon);

        assertTrue(distance > 55.0 && distance < 75.0,
                "Expected distance to be around 63m but was: " + distance);
    }

    @Test
    @DisplayName("Should accurately calculate distance for point ~158 meters away")
    void testHaversineDistanceMediumPoint() {
        double targetLat = 12.912992;
        double targetLon = 77.637778;

        double distance = GeoUtils.haversineDistanceMeters(baseLat, baseLon, targetLat, targetLon);

        assertTrue(distance > 145.0 && distance < 170.0,
                "Expected distance to be around 158m but was: " + distance);
    }

    @Test
    @DisplayName("Should strictly validate micro-radii (100m, 200m, 300m)")
    void testValidateRadius() {
        assertEquals(100, GeoUtils.validateRadius(100));
        assertEquals(200, GeoUtils.validateRadius(200));
        assertEquals(300, GeoUtils.validateRadius(300));
        assertEquals(200, GeoUtils.validateRadius(null)); // default

        assertThrows(BadRequestException.class, () -> GeoUtils.validateRadius(500));
        assertThrows(BadRequestException.class, () -> GeoUtils.validateRadius(50));
        assertThrows(BadRequestException.class, () -> GeoUtils.validateRadius(1000));
    }

    @Test
    @DisplayName("Should validate latitude and longitude bounds")
    void testValidateCoordinates() {
        assertDoesNotThrow(() -> GeoUtils.validateCoordinates(12.9141, 77.6369));
        assertThrows(BadRequestException.class, () -> GeoUtils.validateCoordinates(95.0, 77.0));
        assertThrows(BadRequestException.class, () -> GeoUtils.validateCoordinates(-91.0, 77.0));
        assertThrows(BadRequestException.class, () -> GeoUtils.validateCoordinates(12.0, 185.0));
    }
}
