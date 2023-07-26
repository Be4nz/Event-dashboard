package com.sourcery.eventdashboard.models.dto;
import com.sourcery.eventdashboard.models.enums.EventType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Sort;


import java.util.List;
import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EventSearchRequest {
    private String title;

    private List<EventType> types;

    private Instant startDate;

    private Instant endDate;

    private Integer limit;

    private Integer offset;

    private Sort.Direction sortDirection;

    private String sortField;
}

