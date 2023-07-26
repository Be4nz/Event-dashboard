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
public class EventSearchResponse {
    private List<EventResponse> eventList;

    private PaginationDto pagination;
}
