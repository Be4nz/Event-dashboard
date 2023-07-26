package com.sourcery.eventdashboard.models.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ParticipationSearchResponse {
    private List<ParticipationResponse> participantList;

    private PaginationDto pagination;
}
