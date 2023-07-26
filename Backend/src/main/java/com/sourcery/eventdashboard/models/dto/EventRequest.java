package com.sourcery.eventdashboard.models.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sourcery.eventdashboard.models.entities.Event;
import com.sourcery.eventdashboard.models.enums.EventSubtype;
import com.sourcery.eventdashboard.models.enums.EventType;
import com.sourcery.eventdashboard.utils.AuthUtils;

import java.time.Instant;
import java.util.List;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EventRequest {

    @NotBlank(message = "Title is mandatory")
    private String title;

    @NotNull(message = "Type is mandatory")
    private EventType type;

    private EventSubtype subtype;

    private String description;

    @NotNull(message = "Event date is mandatory")
    @Future(message = "Event date must be in the future")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant eventDate;

    @Future(message = "Registration deadline must be in the future")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant registrationDeadline;

    private MultipartFile image;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant startTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant endTime;

    private Integer duration;
    
    private boolean deleted;
 
    private String timeZone;

    private List<String> shareWith;

    public Event toEntity() {
        Event event = new Event(this.getTitle(), this.getType(), this.getSubtype(), this.getDescription(), this.getEventDate(), 
                                this.getRegistrationDeadline(), this.getStartTime(), this.getEndTime(), this.getDuration(), this.isDeleted(), AuthUtils.getCurrentUserId(), this.getTimeZone());
        return event;
    }
}

