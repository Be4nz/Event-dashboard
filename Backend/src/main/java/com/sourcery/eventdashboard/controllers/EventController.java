package com.sourcery.eventdashboard.controllers;

import com.sourcery.eventdashboard.models.dto.AvailableTimesResponse;
import com.sourcery.eventdashboard.models.dto.EventRequest;
import com.sourcery.eventdashboard.models.dto.EventResponse;
import com.sourcery.eventdashboard.models.dto.EventSearchRequest;
import com.sourcery.eventdashboard.models.dto.EventSearchResponse;
import com.sourcery.eventdashboard.models.dto.EventsExportRequest;
import com.sourcery.eventdashboard.services.EventService;
import com.sourcery.eventdashboard.services.ReminderService;
import com.sourcery.eventdashboard.services.ExportEventService;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;
    private final ReminderService reminderService;
    private final ExportEventService exportEventService;

    public EventController(EventService eventService, ReminderService reminderService, ExportEventService exportEventService) {
        this.eventService = eventService;
        this.reminderService = reminderService;
        this.exportEventService = exportEventService;
    }

    @PostMapping
    public EventResponse createEvent(@Valid EventRequest eventRequest) {
        return eventService.createEvent(eventRequest);
    }

    @PutMapping("/{id}")
    public EventResponse updateEvent(@Valid EventRequest eventRequest, @PathVariable Integer id) {
        EventResponse oldEvent = eventService.getEventById(id);
        EventResponse response = eventService.updateEvent(id, eventRequest);
        eventService.sendNotifications(eventRequest, oldEvent);
        return response;
    }

    @PostMapping ("/search")
    public EventSearchResponse searchEvents(@RequestBody EventSearchRequest eventSearchDto) {
        return eventService.getSearchResult(eventSearchDto);
    }

    @PostMapping("/search-my")
    public EventSearchResponse searchParticipantsEvents(@RequestBody EventSearchRequest eventSearchDto) {
        return eventService.getParticipantsSearchResult(eventSearchDto);
    }

    @GetMapping ("/{id}")
    public EventResponse getEvent(@PathVariable Integer id) {
        return eventService.getEventById(id);
    }

    @DeleteMapping ("/{id}")
    @ResponseStatus(value = HttpStatus.NO_CONTENT)
    public void deleteEvent(@PathVariable Integer id) {
        eventService.deleteEvent(id);
    }

    @PutMapping("/restore/{id}")
    @ResponseStatus(value = HttpStatus.NO_CONTENT)
    public void restoreEvent(@PathVariable Integer id) {
        eventService.restoreEvent(id);
    }

    @GetMapping ("/{id}/times")
    public AvailableTimesResponse getAvailableTimes(@PathVariable Integer id) {
        return eventService.getAvailableTimes(id);
    }

    @Scheduled(fixedRate = 3600000)
    public void sendEventNotifications() {
        reminderService.sendReminders();
    }
    
    @PostMapping("/export")
    public ResponseEntity<byte[]> exportEventToExcel(@RequestBody EventsExportRequest request) throws Exception{
        byte[] fileContent = exportEventService.exportEventToExcel(request.getEventIds());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(ContentDisposition.builder("attachment").filename("Event.xlsx").build());
        return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
    }

}
