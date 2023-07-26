package com.sourcery.eventdashboard.models.entities;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "participations")
public class Participation extends AbstractEntity {

    @Column
    private String notes;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Integer eventId;

    @Column(nullable = false)
    private String userId;

    @Column
    private Instant appointmentTime;
    
}
