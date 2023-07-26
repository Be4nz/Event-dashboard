package com.sourcery.eventdashboard.models.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sourcery.eventdashboard.models.entities.Participation;

import java.time.Instant;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ParticipationResponse {

    private Integer id;

    private String notes;

    @NotNull(message = "Event id is mandatory")
    private Integer eventId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant createdAt;

    private String userId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant appointmentTime;

    public static List<ParticipationResponse> fromEntityList(List<Participation> participationList) {
        return participationList.stream().map(ParticipationResponse::fromEntity).toList();
    }

    public static ParticipationResponse fromEntity(Participation participation) {
        return new ParticipationResponse(participation.getId(), participation.getNotes(), participation.getEventId(), participation.getCreatedAt(), participation.getUserId(), participation.getAppointmentTime());
    }

}

