package com.sourcery.eventdashboard.models.entities;

import com.sourcery.eventdashboard.models.enums.EventType;
import com.sourcery.eventdashboard.models.enums.EventSubtype;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "events")
public class Event extends AbstractEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EventType type;

    @Column
    @Enumerated(EnumType.STRING)
    private EventSubtype subtype;

    @Column
    private String description;

    @Column(nullable = false)
    private Instant eventDate;

    @Column
    private Instant registrationDeadline;

    @Column
    private String imageUrl;

    @Column
    private Instant startTime;

    @Column
    private Instant endTime;

    @Column
    private Integer duration;

    @Column
    private boolean deleted;

    @Column(nullable = false)
    private String createdBy;

    @Column(nullable = false)
    private String timeZone;

    public Event(String title, EventType type, EventSubtype subtype, String description, Instant eventDate, Instant registrationDeadline,
        Instant startTime, Instant endTime, Integer duration, boolean deleted, String createdBy, String timeZone) {
            
        this.title = title;
        this.type = type;
        this.subtype = subtype;
        this.description = description;
        this.eventDate = eventDate;
        this.registrationDeadline = registrationDeadline;
        this.imageUrl = "";
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = duration;
        this.deleted = deleted;
        this.createdBy = createdBy;
        this.timeZone = timeZone;
    }
}
