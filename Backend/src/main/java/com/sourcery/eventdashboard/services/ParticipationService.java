package com.sourcery.eventdashboard.services;

import com.microsoft.graph.models.extensions.User;
import com.sourcery.eventdashboard.mappers.EventsMapper;
import com.sourcery.eventdashboard.mappers.ParticipationMapper;
import com.sourcery.eventdashboard.models.dto.CheckParticipationRequest;
import com.sourcery.eventdashboard.models.dto.PaginationDto;
import com.sourcery.eventdashboard.models.dto.ParticipationRequest;
import com.sourcery.eventdashboard.models.dto.ParticipationResponse;
import com.sourcery.eventdashboard.models.dto.ParticipationSearchRequest;
import com.sourcery.eventdashboard.models.dto.ParticipationSearchResponse;
import com.sourcery.eventdashboard.models.entities.Event;
import com.sourcery.eventdashboard.models.entities.Participation;
import com.sourcery.eventdashboard.models.enums.EventSubtype;
import com.sourcery.eventdashboard.models.enums.EventType;
import com.sourcery.eventdashboard.models.errors.NotAllowedException;
import com.sourcery.eventdashboard.models.errors.NotFoundException;
import com.sourcery.eventdashboard.utils.AuthUtils;

import jakarta.mail.internet.MimeMessage;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class ParticipationService {
    private final ParticipationMapper participationMapper;
    private final EventsMapper eventsMapper;
    private final UserService userService;

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String sender;

    public ParticipationService(ParticipationMapper participationMapper, EventsMapper eventsMapper, UserService userService) {
        this.participationMapper = participationMapper;
        this.eventsMapper = eventsMapper;
        this.userService = userService;
    }

    public ParticipationResponse createParticipation(ParticipationRequest participationDto) {
        Participation participation = participationDto.toEntity();
        validateParticipation(participation);
        return ParticipationResponse.fromEntity(participationMapper.create(participation));
    }

    private void validateParticipation(Participation participation) {
        Event event = eventsMapper.checkIfExists(participation.getEventId());
        if (event == null) {
            throw new NotFoundException();
        }

        if(event.getRegistrationDeadline() != null && participation.getCreatedAt().isAfter(event.getRegistrationDeadline())) {
            throw new NotAllowedException("Registration deadline has passed!");
        }

        else if(participation.getCreatedAt().isAfter(event.getEventDate())){
            throw new NotAllowedException("Event date has passed!");
        }

        if(checkIfParticipates(new CheckParticipationRequest(participation.getEventId()))) {
            throw new NotAllowedException("This user already participates in this event!");
        }

        if(event.getType() == EventType.PERSONAL) {
            throw new NotAllowedException("You cannot participate in a personal event!");
        }
        if(event.getSubtype() == EventSubtype.APPOINTMENT) appointmentValidation(participation);
    }

    private void appointmentValidation (Participation participation) {
        //checks if the time is still free
        Participation check = participationMapper.findByAppointmentTimeAndEventId(participation.getEventId(), participation.getAppointmentTime());
        if(check != null) {
            throw new NotAllowedException("This time is already taken!");
        }
    }

    public Boolean checkIfParticipates(CheckParticipationRequest request) {
        String userId = AuthUtils.getCurrentUserId();
        Participation participation = participationMapper.checkParticipation(request.getEventId(), userId);
        return participation != null;
    }

    public ParticipationResponse updateParticipation(Integer id, ParticipationRequest participationDto) {
        Participation participation = participationDto.toEntity();
        participation.setId(id);
        return ParticipationResponse.fromEntity(participationMapper.update(participation));
    }

    public ParticipationResponse getParticipationById(Integer id){
        Participation participation = participationMapper.findById(id);

        if(participation == null) {
            throw new NotFoundException();
        }

        return ParticipationResponse.fromEntity(participation);
    }

    public ParticipationSearchResponse searchByEventId(ParticipationSearchRequest request){
        List<Participation> participations = participationMapper.searchByEventId(request.getEventId(), request.getOffset(), request.getLimit());

        if(participations == null) {
            throw new NotFoundException();
        }
        return new ParticipationSearchResponse(ParticipationResponse.fromEntityList(participations), getPagination(request));
    }

    public List<Participation> getParticipationsByEventId(Integer eventId) {
        return participationMapper.findByEventId(eventId);
    }

    public void deleteParticipation(int eventId) {
        String userId = AuthUtils.getCurrentUserId();
        participationMapper.deleteParticipation(eventId,userId);
    }

    public PaginationDto getPagination(ParticipationSearchRequest participationSearchDto) {
        Integer eventCount = participationMapper.findCount(participationSearchDto.getEventId());

        PaginationDto paginationDto = new PaginationDto(
                participationSearchDto.getLimit(),
                participationSearchDto.getOffset(),
                eventCount
        );

        return paginationDto;
    }
    public void deleteAllEventParticipations(int eventId) {
        participationMapper.deleteAllEventParticipations(eventId);
    }

    @Async
    public void notifyUsers(List<Participation> participants, Event event) {
            
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
                    "<p style=\"margin-bottom: 40px;\">We wanted to inform you that the details of <strong>\"" + event.getTitle() + "\"</strong> have changed and your participation has been removed.</p> " +
                    "<p style=\"margin-bottom: 40px;\">You can register for this event <a href=http://localhost:3000/events/" + event.getId() + ">here</a>.</p> " +
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

