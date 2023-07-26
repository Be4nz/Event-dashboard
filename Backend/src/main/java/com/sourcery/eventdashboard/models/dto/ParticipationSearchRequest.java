package com.sourcery.eventdashboard.models.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ParticipationSearchRequest {
    private Integer eventId;
        
    private Integer limit;

    private Integer offset;
}

