package com.instantshare.rental.model;

public enum RentalStatus {
    PENDING,    // Renter submitted request; awaiting owner decision
    CONFIRMED,  // Owner accepted and demo payment completed; booking confirmed
    ACTIVE,     // Item handed over to renter; in active use
    RETURNED,   // Item returned to owner; condition check pending
    COMPLETED,  // Rental closed; deposit released
    CANCELLED,  // Cancelled by renter or system
    REJECTED    // Rejected by equipment owner
}
