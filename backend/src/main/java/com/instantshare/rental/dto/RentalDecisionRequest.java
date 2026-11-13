package com.instantshare.rental.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class RentalDecisionRequest {

    @NotBlank(message = "Decision is required")
    @Pattern(regexp = "ACCEPT|REJECT", message = "Decision must be ACCEPT or REJECT")
    private String decision;

    private String note;

    public RentalDecisionRequest() {}

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
