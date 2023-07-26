package com.sourcery.eventdashboard.models.dto;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sourcery.eventdashboard.models.entities.Event;
import com.sourcery.eventdashboard.models.enums.EventSubtype;
import com.sourcery.eventdashboard.models.enums.EventType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EventResponse {

    private Integer id;

    @NotBlank(message = "Title is mandatory")
    private String title;

    @NotNull(message = "Type is mandatory")
    private EventType type;

    @NotNull(message = "Subtype is mandatory")
    private EventSubtype subtype;

    private String description;

    @NotNull(message = "Event date is mandatory")
    @Future(message = "Event date must be in the future")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant eventDate;

    @Future(message = "Registration deadline must be in the future")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant registrationDeadline;

    private String imageUrl;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant startTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant endTime;

    private Integer duration;
    
    private boolean deleted;

    private String createdBy;

    private String timeZone;

    private List<String> shareWith;

    public static EventResponse fromEntity(Event event, List<String> shareWith) {
        return new EventResponse(event.getId(), event.getTitle(), event.getType(), event.getSubtype(), event.getDescription(),
                event.getEventDate(), event.getRegistrationDeadline(), event.getImageUrl(), event.getStartTime(), event.getEndTime(),
                event.getDuration(), event.isDeleted(), event.getCreatedBy(), event.getTimeZone(), shareWith);
    }
}

