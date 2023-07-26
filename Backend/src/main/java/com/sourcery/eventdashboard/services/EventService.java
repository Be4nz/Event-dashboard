package com.sourcery.eventdashboard.services;

import com.microsoft.graph.models.extensions.User;
import com.sourcery.eventdashboard.mappers.EventsMapper;
import com.sourcery.eventdashboard.models.dto.EventRequest;
import com.sourcery.eventdashboard.models.dto.EventResponse;
import com.sourcery.eventdashboard.models.dto.EventSearchRequest;
import com.sourcery.eventdashboard.models.dto.EventSearchResponse;
import com.sourcery.eventdashboard.models.dto.PaginationDto;
import com.sourcery.eventdashboard.models.dto.AvailableTimesResponse;
import com.sourcery.eventdashboard.models.entities.Event;
import com.sourcery.eventdashboard.models.entities.Participation;
import com.sourcery.eventdashboard.models.entities.Share;
import com.sourcery.eventdashboard.models.enums.EventSubtype;
import com.sourcery.eventdashboard.models.enums.EventType;
import com.sourcery.eventdashboard.models.errors.NotAllowedException;
import com.sourcery.eventdashboard.models.errors.NotFoundException;
import com.sourcery.eventdashboard.utils.AuthUtils;

import jakarta.mail.internet.MimeMessage;

import com.sourcery.eventdashboard.models.errors.IncorrectSubtypeException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EventService {
    private final EventsMapper eventsMapper;

    private final ShareService shareService;
    private final ParticipationService participationService;
    private final StorageService storageService;
    private final UserService userService;

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String sender;

    public EventService(EventsMapper eventsMapper, StorageService storageService, ParticipationService participationService, UserService userService, ShareService shareService) {
        this.eventsMapper = eventsMapper;
        this.shareService = shareService;
        this.storageService = storageService;
        this.participationService = participationService;
        this.userService = userService;
    }

    private void validateEvent(Event event) {
        Map<EventType, List<EventSubtype>> allowedSubtypes = new HashMap<>();
        allowedSubtypes.put(EventType.PERSONAL, List.of(EventSubtype.SLD, EventSubtype.OTHER));
        allowedSubtypes.put(EventType.COMPANY_MANAGED, List.of(EventSubtype.SPORTS, EventSubtype.APPOINTMENT, EventSubtype.OTHER));
        allowedSubtypes.put(EventType.EXTERNAL, Collections.singletonList(null));
        if (event.getSubtype() == null && event.getType() != EventType.EXTERNAL) {
            throw new IncorrectSubtypeException();
        } else if (!allowedSubtypes.get(event.getType()).contains(event.getSubtype())) {
            throw new IncorrectSubtypeException();
        } else if ((event.getStartTime() != null || event.getEndTime() != null || event.getDuration() != null) && event.getSubtype() != EventSubtype.APPOINTMENT) {
            throw new IncorrectSubtypeException();
        }
        if (event.getSubtype() == EventSubtype.APPOINTMENT)
            validateAppointment(event);
    }

    private void validateAppointment(Event event) {
        if ((event.getStartTime() == null || event.getEndTime() == null || event.getDuration() == null) && event.getSubtype() == EventSubtype.APPOINTMENT) {
            throw new IncorrectSubtypeException();
        }
        LocalTime eventTime = event.getEventDate().atZone(ZoneId.of(event.getTimeZone())).toLocalTime();
        LocalTime startTime = event.getStartTime().atZone(ZoneId.of(event.getTimeZone())).toLocalTime();
        LocalTime endTime = event.getEndTime().atZone(ZoneId.of(event.getTimeZone())).toLocalTime();

        if (startTime.compareTo(eventTime) < 0 || startTime.compareTo(endTime) > 0 || endTime.compareTo(eventTime) <= 0) {
            throw new IncorrectSubtypeException();
        } else if (startTime.plus(Duration.of(event.getDuration(), ChronoUnit.MINUTES)).compareTo(endTime) > 0) {
            throw new IncorrectSubtypeException();
        }
    }

    public EventResponse createEvent(EventRequest eventRequest) {

        MultipartFile file = eventRequest.getImage();
        Event event = eventRequest.toEntity();
        validateEvent(event);
        EventResponse eventResponse = EventResponse.fromEntity(eventsMapper.create(event),eventRequest.getShareWith());

        for (String userId: eventRequest.getShareWith()) {
            shareService.create(new Share(eventResponse.getId(), userId));
        }

        if (file != null) {
            eventResponse.setImageUrl(getImageUrl(eventResponse.getId(), eventRequest));
            event.setId(eventResponse.getId());
            event.setImageUrl(eventResponse.getImageUrl());
            eventsMapper.update(event);
            storageService.uploadFile(file, eventResponse.getImageUrl());
        }

        return eventResponse;
    }

    public String getImageUrl(Integer id, EventRequest eventRequest) {
        String fileName = eventRequest.getImage().getOriginalFilename();
        int dotIndex = fileName.lastIndexOf('.');

        String fileEnd = fileName.substring(dotIndex);

        return "image" + id.toString() + fileEnd;
    }

    public EventResponse updateEvent(Integer id, EventRequest eventRequest) {

        MultipartFile file = eventRequest.getImage();
        Event event = eventRequest.toEntity();

        if (!validEventUser(event.getCreatedBy())) {
            throw new NotAllowedException("You do not have permission to update this event");
        }

        event.setId(id);

        String imageUrl = eventsMapper.findAllById(id).getImageUrl();

        if (file != null) {
            imageUrl = getImageUrl(id, eventRequest);
            event.setImageUrl(imageUrl);
            if(storageService.doesFileExist(imageUrl)) {
                storageService.deleteFile(getEventById(id).getImageUrl());
            }
            storageService.uploadFile(file, imageUrl);
        } else if (!imageUrl.equals("")) {
            event.setImageUrl(imageUrl);
        }

        String userId = AuthUtils.getCurrentUserId();
        Boolean isAdmin = AuthUtils.getCurrentUserRoles().contains("admin");
        Event oldEvent = eventsMapper.findById(id, userId, isAdmin);

        EventResponse eventResponse = EventResponse.fromEntity(eventsMapper.update(event), eventRequest.getShareWith());

        List<String> existingShares = shareService.getSharedIds(id);

        for(String shareUserId: existingShares){
            if(!eventRequest.getShareWith().contains(shareUserId)){
                shareService.delete(new Share(id,shareUserId));
            }
        }

        existingShares = shareService.getSharedIds(id);

        if(eventRequest.getShareWith() != null) {
            for(String shareUserId: eventRequest.getShareWith()){
                if(!existingShares.contains(shareUserId)){
                    shareService.create(new Share(id,shareUserId));
                }
            }
        }

        if (!oldEvent.getSubtype().equals(EventSubtype.APPOINTMENT) && event.getSubtype().equals(EventSubtype.APPOINTMENT) ||
            oldEvent.getSubtype().equals(EventSubtype.APPOINTMENT) && !event.getSubtype().equals(EventSubtype.APPOINTMENT)) {
            participationService.deleteAllEventParticipations(event.getId());
        }

        return eventResponse;
    }

    public boolean checkIfChanged(EventResponse oldEvent, Event newEvent) {
        return !oldEvent.getTitle().equals(newEvent.getTitle())
            || !oldEvent.getType().equals(newEvent.getType())
            || !oldEvent.getSubtype().equals(newEvent.getSubtype())
            || !oldEvent.getEventDate().equals(newEvent.getEventDate())
            || !oldEvent.getDescription().equals(newEvent.getDescription());
    }

    @Async
    public void sendNotifications(EventRequest eventRequest, EventResponse oldEvent) {
        Event newEvent = eventRequest.toEntity();
        if(checkIfChanged(oldEvent, newEvent)) {
            List<Participation> participants = participationService.getParticipationsByEventId(oldEvent.getId());
            for(Participation participant : participants) 
            {
                try {
    
                    MimeMessage message = javaMailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true);
                    User user = userService.getUserInformation(participant.getUserId());

                    helper.setFrom(sender);
                    helper.setTo(user.mail);
                    helper.setSubject("Event details have changed");

                    String htmlMsg = 
                    "<div style=\"background-color: #f0f0f0; font-family: Arial; font-size: 16px; padding: 20px;\"> " +
                    "<p style=\"margin-bottom: 40px;\">Hi " + user.displayName + ",</p> " +
                    "<p style=\"margin-bottom: 40px;\">We wanted to inform you that the details of <strong>\"" + oldEvent.getTitle() + "\"</strong> have changed.</p> " +
                    "<p>Best wishes,</p> " +
                    "<p>Event Dashboard Team</p> " +
                    "</div>";
                    helper.setText(htmlMsg, true);

                    javaMailSender.send(message);
                }
                catch (Exception e) {
                    System.out.print(e);
                }
            }
        }
    }

    private EventSearchRequest  validateEventSearch(EventSearchRequest eventSearchDto)
    {
        // If start date is null, set it to the current date
        if (eventSearchDto.getStartDate() == null) {
            eventSearchDto.setStartDate(Instant.parse("0000-01-01T00:00:01Z"));
        }
        // If end date is null, set it to the end of time
        if (eventSearchDto.getEndDate() == null) {
            eventSearchDto.setEndDate(Instant.parse("9999-12-31T23:59:59Z"));
        }
        // If there are no types selected all types get inserted.
        if (eventSearchDto.getTypes() == null || eventSearchDto.getTypes().isEmpty()) {
            eventSearchDto.setTypes(Arrays.asList(EventType.values()));
        }

        if (eventSearchDto.getLimit() == null || eventSearchDto.getLimit() == 0) {
            eventSearchDto.setLimit(10);
        }

        return eventSearchDto;
    }

    public List<EventResponse> searchEvents(EventSearchRequest eventSearchDto) {

        eventSearchDto = validateEventSearch(eventSearchDto);

        String userId = AuthUtils.getCurrentUserId();
        Boolean isAdmin = AuthUtils.getCurrentUserRoles().contains("admin");

        List<Event> eventList = eventsMapper.searchEvents(
                eventSearchDto.getTitle(),
                eventSearchDto.getTypes().stream().map(element -> "'" + element + "'").collect(Collectors.joining(",")),
                eventSearchDto.getStartDate(),
                eventSearchDto.getEndDate(),
                eventSearchDto.getOffset(),
                eventSearchDto.getLimit(),
                eventSearchDto.getSortDirection().toString(),
                camelCaseToUnderscores(eventSearchDto.getSortField()),
                userId,
                isAdmin
        );

        return fromEventEntityList(eventList);
    }

    private List<EventResponse> fromEventEntityList(List<Event> eventList){
        return eventList.stream().map(event -> EventResponse.fromEntity(event, shareService.getSharedIds(event.getId()))).toList();
    }

    public List<EventResponse> searchParticipantsEvents(EventSearchRequest eventSearchDto){

        eventSearchDto = validateEventSearch(eventSearchDto);

        String userId = AuthUtils.getCurrentUserId();
        Boolean isAdmin = AuthUtils.getCurrentUserRoles().contains("admin");

        List<Event> eventList = eventsMapper.searchParticipantsEvents(
                eventSearchDto.getTitle(),
                eventSearchDto.getTypes().stream().map(element -> "'" + element + "'").collect(Collectors.joining(",")),
                eventSearchDto.getStartDate(),
                eventSearchDto.getEndDate(),
                eventSearchDto.getOffset(),
                eventSearchDto.getLimit(),
                eventSearchDto.getSortDirection().toString(),
                camelCaseToUnderscores(eventSearchDto.getSortField()),
                userId,
                isAdmin
        );

        return fromEventEntityList(eventList);
    }

    public EventSearchResponse getParticipantsSearchResult(EventSearchRequest eventSearchDto) {

        EventSearchResponse searchResult = new EventSearchResponse(searchParticipantsEvents(eventSearchDto), getParticipantsPagination(eventSearchDto));

        return searchResult;
    }

    private String camelCaseToUnderscores(String camel) {
        String underscore;
        underscore = String.valueOf(Character.toLowerCase(camel.charAt(0)));
        for (int i = 1; i < camel.length(); i++) {
            underscore += Character.isLowerCase(camel.charAt(i)) ? String
                    .valueOf(camel.charAt(i))
                    : "_"
                    + String.valueOf(Character.toLowerCase(camel
                    .charAt(i)));
        }
        return underscore;
    }

    public PaginationDto getPagination(EventSearchRequest eventSearchDto) {
        Integer eventCount = eventsMapper.findCount(
                eventSearchDto.getTitle(),
                eventSearchDto.getTypes().stream().map(element -> "'" + element + "'").collect(Collectors.joining(",")),
                eventSearchDto.getStartDate(),
                eventSearchDto.getEndDate(),
                AuthUtils.getCurrentUserId(),
                AuthUtils.getCurrentUserRoles().contains("admin")
        );

        PaginationDto paginationDto = new PaginationDto(
                eventSearchDto.getLimit(),
                eventSearchDto.getOffset(),
                eventCount
        );

        return paginationDto;
    }

    public PaginationDto getParticipantsPagination(EventSearchRequest eventSearchDto){

        Integer eventCount = eventsMapper.findParticipantsCount(
                eventSearchDto.getTitle(),
                eventSearchDto.getTypes().stream().map(element -> "'" + element + "'").collect(Collectors.joining(",")),
                eventSearchDto.getStartDate(),
                eventSearchDto.getEndDate(),
                AuthUtils.getCurrentUserId()
        );

        PaginationDto paginationDto = new PaginationDto(
                eventSearchDto.getLimit(),
                eventSearchDto.getOffset(),
                eventCount
        );

        return paginationDto;
    }

    public EventSearchResponse getSearchResult(EventSearchRequest eventSearchDto) {
        EventSearchResponse searchResult = new EventSearchResponse(searchEvents(eventSearchDto), getPagination(eventSearchDto));

        return searchResult;
    }

    public EventResponse getEventById(Integer id) {
        String userId = AuthUtils.getCurrentUserId();
        Boolean isAdmin = AuthUtils.getCurrentUserRoles().contains("admin");
        Event event = eventsMapper.findById(id, userId, isAdmin);

        if (event == null) {
            throw new NotFoundException();
        }

        return EventResponse.fromEntity(event, shareService.getSharedIds(event.getId()));
    }

    private boolean validEventUser(String eventCreatorId) {
        return AuthUtils.getCurrentUserId().equals(eventCreatorId) || AuthUtils.getCurrentUserRoles().contains("admin");
    }

    public void deleteEvent(Integer id) {
        Event event = eventsMapper.findAllById(id);
        if (!validEventUser(event.getCreatedBy())) {
            throw new NotAllowedException("You do not have permission to delete this event");
        }
        eventsMapper.delete(id);
    }

    public void restoreEvent(Integer id) {
        eventsMapper.restore(id);
    }

    public AvailableTimesResponse getAvailableTimes(Integer eventId) {
        Event event = eventsMapper.checkIfExists(eventId);
        if(event == null || event.getSubtype() != EventSubtype.APPOINTMENT) {
            throw new NotFoundException();
        }
        List<Participation> participations = participationService.getParticipationsByEventId(eventId);
        List<Instant> availableTimes = new ArrayList<Instant>();
        Instant startTime = event.getStartTime();
        Instant endTime = event.getEndTime();
        Duration duration = Duration.ofMinutes(event.getDuration());

        while (startTime.plus(duration).isBefore(endTime) || startTime.plus(duration).equals(endTime)) {
            final Instant time = startTime;
            boolean isTaken = participations.stream()
                    .anyMatch(participation -> checkTimeMatch(participation.getAppointmentTime(), time));

            if (!isTaken) {
                availableTimes.add(startTime);
            }

            startTime = startTime.plus(duration);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        List<String> availableTimesStrings = availableTimes.stream()
                .map(time -> {
                    ZonedDateTime zonedDateTime = ZonedDateTime.ofInstant(time, ZoneId.systemDefault());
                    return formatter.format(zonedDateTime);
                })
                .collect(Collectors.toList());

        return new AvailableTimesResponse(availableTimesStrings);
    }

    private Boolean checkTimeMatch(Instant first, Instant second) {
        return first.atZone(ZoneOffset.UTC).toLocalTime().truncatedTo(ChronoUnit.MINUTES)
            .equals(second.atZone(ZoneOffset.UTC).toLocalTime().truncatedTo(ChronoUnit.MINUTES));
    }

    public List<Event> getUpcoming() {
        List<Event> upcomingEvents = eventsMapper.getUpcoming();
        Instant now = Instant.now();
        Instant cutoff = now.plus(Duration.ofHours(1));
        upcomingEvents.removeIf(event -> event.getEventDate().isBefore(cutoff));
        return upcomingEvents;
    }

    public void setEventSent(Integer eventId) {
        eventsMapper.setReminderSent(eventId);
    }

    public List<Integer> getAllEventsIds() {
        return eventsMapper.getAllEventsIds();
    }
}

