package com.sourcery.eventdashboard.models.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sourcery.eventdashboard.models.entities.Participation;
import com.sourcery.eventdashboard.utils.AuthUtils;

import java.time.Instant;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ParticipationRequest {

    private Integer id;

    private String notes;

    @NotNull(message = "Event id is mandatory")
    private Integer eventId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant appointmentTime;

    public Participation toEntity() {
        Participation participation = new Participation(this.getNotes(), Instant.now(), this.getEventId(), AuthUtils.getCurrentUserId(), this.getAppointmentTime());
        participation.setId(this.getId());
        return participation;
    }

}

