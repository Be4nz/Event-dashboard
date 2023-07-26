package com.sourcery.eventdashboard.services;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.microsoft.graph.models.extensions.User;
import com.sourcery.eventdashboard.models.entities.Event;
import com.sourcery.eventdashboard.models.entities.Participation;

import jakarta.mail.internet.MimeMessage;

@Service
public class ReminderService {

    @Autowired
    private JavaMailSender javaMailSender;
 
    @Value("${spring.mail.username}")
    private String sender;

    private final EventService eventService;
    private final ParticipationService participationService;
    private final UserService userService;

    public ReminderService (EventService eventService, ParticipationService participationService, UserService userService) {
        this.eventService = eventService;
        this.participationService = participationService;
        this.userService = userService;
    }

    public void sendReminders() {
        List<Event> upcoming = eventService.getUpcoming();
        for(Event event : upcoming) {
            List<Participation> participants = participationService.getParticipationsByEventId(event.getId());
            for(Participation participant : participants) {
                sendReminder(event, participant);
                eventService.setEventSent(event.getId());
            }
        }
    }
 
    public void sendReminder(Event event, Participation participant)
    {
        try {
 
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            User user = userService.getUserInformation(participant.getUserId());

            helper.setFrom(sender);
            helper.setTo(user.mail);
            helper.setSubject("Event reminder");

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            String formattedTime = formatter.format(event.getEventDate().atZone(ZoneId.of(event.getTimeZone())));
            String htmlMsg = 
            "<div style=\"background-color: #f0f0f0; font-family: Arial; font-size: 16px; padding: 20px;\"> " +
            "<p style=\"margin-bottom: 40px;\">Hi " + user.displayName + ",</p> " +
            "<p style=\"margin-bottom: 40px;\">We wanted to remind you that <strong>\"" + event.getTitle() + "\"</strong> is happening on <strong>" + formattedTime + "</strong>.</p> " +
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
