package com.sourcery.eventdashboard.controllers;

import com.sourcery.eventdashboard.mappers.EventsMapper;
import com.sourcery.eventdashboard.models.dto.CheckParticipationRequest;
import com.sourcery.eventdashboard.models.dto.ParticipationRequest;
import com.sourcery.eventdashboard.models.dto.ParticipationResponse;
import com.sourcery.eventdashboard.models.dto.ParticipationSearchRequest;
import com.sourcery.eventdashboard.models.dto.ParticipationSearchResponse;
import com.sourcery.eventdashboard.models.entities.Event;
import com.sourcery.eventdashboard.models.entities.Participation;
import com.sourcery.eventdashboard.services.ParticipationService;
import com.sourcery.eventdashboard.utils.AuthUtils;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/participations")
public class ParticipationController {

    private final ParticipationService participationService;
    private final EventsMapper eventsMapper;

    public ParticipationController(ParticipationService participationService, EventsMapper eventsMapper) {
        this.participationService = participationService;
        this.eventsMapper = eventsMapper;
    }

    @PostMapping
    public ParticipationResponse createParticipation(@Valid @RequestBody ParticipationRequest participationDto) {
        return participationService.createParticipation(participationDto);
    }
    
    @PutMapping("/{id}")
    public ParticipationResponse updateParticipation(@Valid @RequestBody ParticipationRequest participationDto, @PathVariable Integer id) {
        return participationService.updateParticipation(id, participationDto);
    }

    @GetMapping ("/{id}")
    public ParticipationResponse getParticipation(@PathVariable Integer id) {
        return participationService.getParticipationById(id);
    }

    @PostMapping ("/search")
    public ParticipationSearchResponse searchParticipations(@RequestBody ParticipationSearchRequest request) {
        return participationService.searchByEventId(request);
    }

    @PostMapping("/check")
    public Boolean checkIfParticipates(@Valid @RequestBody CheckParticipationRequest request) {
        return participationService.checkIfParticipates(request);
    }

    @DeleteMapping("/{id}")
    public void deleteParticipation(@Valid @PathVariable int id) {
        participationService.deleteParticipation(id);
    }

    @DeleteMapping("/event/{id}")
    @ResponseStatus(value = HttpStatus.NO_CONTENT)
    public void deleteAllEventParticipations(@Valid @PathVariable int id) {
        String userId = AuthUtils.getCurrentUserId();
        boolean isAdmin = AuthUtils.getCurrentUserRoles().contains("admin");
        Event event = eventsMapper.findById(id, userId, isAdmin);
        List<Participation> participants = participationService.getParticipationsByEventId(id);
        participationService.deleteAllEventParticipations(id);
        participationService.notifyUsers(participants, event);
    }
}
