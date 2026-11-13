package com.instantshare.equipment.dto;

import java.util.List;

public class NearbySearchResponse {

    private double userLatitude;
    private double userLongitude;
    private int radiusMeters;
    private int totalResults;
    private List<NearbyEquipmentDto> items;

    public NearbySearchResponse() {}

    public NearbySearchResponse(double userLatitude, double userLongitude, int radiusMeters, List<NearbyEquipmentDto> items) {
        this.userLatitude = userLatitude;
        this.userLongitude = userLongitude;
        this.radiusMeters = radiusMeters;
        this.items = items;
        this.totalResults = items != null ? items.size() : 0;
    }

    public double getUserLatitude() {
        return userLatitude;
    }

    public void setUserLatitude(double userLatitude) {
        this.userLatitude = userLatitude;
    }

    public double getUserLongitude() {
        return userLongitude;
    }

    public void setUserLongitude(double userLongitude) {
        this.userLongitude = userLongitude;
    }

    public int getRadiusMeters() {
        return radiusMeters;
    }

    public void setRadiusMeters(int radiusMeters) {
        this.radiusMeters = radiusMeters;
    }

    public int getTotalResults() {
        return totalResults;
    }

    public void setTotalResults(int totalResults) {
        this.totalResults = totalResults;
    }

    public List<NearbyEquipmentDto> getItems() {
        return items;
    }

    public void setItems(List<NearbyEquipmentDto> items) {
        this.items = items;
        this.totalResults = items != null ? items.size() : 0;
    }
}
