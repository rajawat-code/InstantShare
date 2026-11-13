package com.instantshare.location.util;

import com.instantshare.common.exception.BadRequestException;
import com.instantshare.common.util.AppConstants;

public final class GeoUtils {

    private GeoUtils() {}

    /**
     * Calculates the great-circle distance between two GPS points using the Haversine formula.
     * Pure mathematical calculation - zero external API dependencies.
     *
     * @param lat1 Latitude of point 1 in degrees
     * @param lon1 Longitude of point 1 in degrees
     * @param lat2 Latitude of point 2 in degrees
     * @param lon2 Longitude of point 2 in degrees
     * @return Distance in meters
     */
    public static double haversineDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double rLat1 = Math.toRadians(lat1);
        double rLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
                   Math.cos(rLat1) * Math.cos(rLat2) *
                   Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));

        return AppConstants.EARTH_RADIUS_METERS * c;
    }

    /**
     * Calculates a bounding box around a center point for fast index-based SQL prefiltering.
     */
    public static BoundingBox calculateBoundingBox(double centerLat, double centerLon, double radiusMeters) {
        // Approximate 1 degree latitude ~= 111,139 meters
        double deltaLat = radiusMeters / 111139.0;
        // 1 degree longitude depends on latitude
        double deltaLon = radiusMeters / (111139.0 * Math.cos(Math.toRadians(centerLat)));

        return new BoundingBox(
                centerLat - deltaLat,
                centerLat + deltaLat,
                centerLon - deltaLon,
                centerLon + deltaLon
        );
    }

    /**
     * Validates that requested radius strictly adheres to supported micro-radius values (100m, 200m, 300m).
     */
    public static int validateRadius(Integer radius) {
        if (radius == null) {
            return (int) AppConstants.DEFAULT_RADIUS_METERS;
        }
        if (!AppConstants.SUPPORTED_RADII_METERS.contains(radius)) {
            throw new BadRequestException("Unsupported search radius: " + radius +
                    "m. InstantShare micro-radius strictly supports 100m, 200m, or 300m.");
        }
        return radius;
    }

    public static void validateCoordinates(double lat, double lon) {
        if (lat < -90.0 || lat > 90.0) {
            throw new BadRequestException("Invalid latitude: " + lat + ". Must be between -90 and 90.");
        }
        if (lon < -180.0 || lon > 180.0) {
            throw new BadRequestException("Invalid longitude: " + lon + ". Must be between -180 and 180.");
        }
    }

    public static class BoundingBox {
        private final double minLat;
        private final double maxLat;
        private final double minLon;
        private final double maxLon;

        public BoundingBox(double minLat, double maxLat, double minLon, double maxLon) {
            this.minLat = minLat;
            this.maxLat = maxLat;
            this.minLon = minLon;
            this.maxLon = maxLon;
        }

        public double getMinLat() {
            return minLat;
        }

        public double getMaxLat() {
            return maxLat;
        }

        public double getMinLon() {
            return minLon;
        }

        public double getMaxLon() {
            return maxLon;
        }
    }
}
