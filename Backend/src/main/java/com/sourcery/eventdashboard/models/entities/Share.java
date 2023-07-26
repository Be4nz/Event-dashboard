package com.sourcery.eventdashboard.models.entities;

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
@Table(name = "shares")
public class Share extends AbstractEntity {

    @Column(nullable = false)
    private Integer eventId;

    @Column(nullable = false)
    private String userId;

}
