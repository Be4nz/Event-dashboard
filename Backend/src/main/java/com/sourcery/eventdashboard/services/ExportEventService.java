package com.sourcery.eventdashboard.services;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.microsoft.graph.models.extensions.User;
import com.sourcery.eventdashboard.models.dto.EventResponse;
import com.sourcery.eventdashboard.models.entities.Participation;
import com.sourcery.eventdashboard.models.enums.EventSubtype;
import com.sourcery.eventdashboard.models.errors.NotAllowedException;
import com.sourcery.eventdashboard.utils.AuthUtils;

import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportEventService {

    private final ParticipationService participationService;
    private final EventService eventService;
    private final UserService userService;

    public ExportEventService(ParticipationService participationService, EventService eventService, UserService userService) {
        this.participationService = participationService;
        this.eventService = eventService;
        this.userService = userService;
    }


    public byte[] exportEventToExcel (List<Integer> eventIds) throws Exception {
        int MAX_LENGTH = 27;

        if(eventIds.size() == 0) {
            eventIds = eventService.getAllEventsIds();
        }

        String PATTERN_FORMAT = "yyyy.MM.dd HH.mm";

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Workbook workbook = new XSSFWorkbook();

        for(Integer eventId : eventIds) {

            EventResponse event = eventService.getEventById(eventId);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(PATTERN_FORMAT).withZone(ZoneId.of(event.getTimeZone()));

            if (eventIds.size() == 1 && !validEventUser(event.getCreatedBy())) {
                throw new NotAllowedException("You do not have permission to export this event");
            }
            else if (eventIds.size() > 1 &&  !AuthUtils.getCurrentUserRoles().contains("admin")) {
                throw new NotAllowedException("You do not have permission to export this event");
            }
            String title = event.getTitle();
            if (title.length() > MAX_LENGTH) {
                title = title.substring(0, MAX_LENGTH) + "...";
            }
            Sheet sheet = workbook.createSheet(title);
            
            sheet.setColumnWidth(0, 6000);
            sheet.setColumnWidth(1, 10000);
            sheet.setColumnWidth(2, 10000);
            sheet.setColumnWidth(3, 8000);
            sheet.setColumnWidth(4, 8000);

            Row header = sheet.createRow(0);

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setWrapText(true);

            XSSFFont font = ((XSSFWorkbook) workbook).createFont();
            font.setFontName("Arial");
            font.setFontHeightInPoints((short) 11);
            font.setBold(true);
            headerStyle.setFont(font);

            Cell headerCell = header.createCell(0);
            headerCell.setCellValue("Event title");
            headerCell.setCellStyle(headerStyle);

            headerCell = header.createCell(1);
            headerCell.setCellValue("Event description");
            headerCell.setCellStyle(headerStyle);

            headerCell = header.createCell(2);
            headerCell.setCellValue("Event date");
            headerCell.setCellStyle(headerStyle);

            if(event.getRegistrationDeadline() != null) {
                headerCell = header.createCell(3);
                headerCell.setCellValue("Registration deadline");
                headerCell.setCellStyle(headerStyle);
            }

            headerCell = header.createCell(4);
            headerCell.setCellValue("Time zone: ");
            headerCell.setCellStyle(headerStyle);
            
            CellStyle style = workbook.createCellStyle();
            style.setWrapText(true);

            Row row = sheet.createRow(1);
            Cell cell = row.createCell(0);
            cell.setCellValue(event.getTitle());
            cell.setCellStyle(style);

            cell = row.createCell(1);
            cell.setCellValue(event.getDescription());
            cell.setCellStyle(style);

            cell = row.createCell(2);
            cell.setCellValue(formatter.format(event.getEventDate()));
            cell.setCellStyle(style);

            if(event.getRegistrationDeadline() != null) {
                cell = row.createCell(3);
                cell.setCellValue(formatter.format(event.getRegistrationDeadline()));
                cell.setCellStyle(style);
            }
            cell = row.createCell(4);
            cell.setCellValue(event.getTimeZone());
            cell.setCellStyle(style);

            appendParticipants(workbook, event, headerStyle, style, title);
        }
        workbook.write(outputStream);
        byte[] bytes = outputStream.toByteArray();
        outputStream.close();
        workbook.close();
        return bytes;
    }

    private void appendParticipants(Workbook workbook, EventResponse event, CellStyle headerStyle, CellStyle style, String sheetTitle) throws Exception {
        String TIME_FORMAT = "HH.mm";
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern(TIME_FORMAT).withZone(ZoneId.systemDefault());
        List<Participation> participants = participationService.getParticipationsByEventId(event.getId());
        Sheet sheet = workbook.getSheet(sheetTitle);

        int lastRowNum = sheet.getLastRowNum()+1;

        Row participantsHeader = sheet.createRow(lastRowNum + 1);
        Cell participantsCell = participantsHeader.createCell(0);
        participantsCell.setCellValue("Participant list: ");
        participantsCell.setCellStyle(headerStyle);

        if(participants.size() > 0) {
            Row participantsColumns = sheet.createRow(lastRowNum + 2);

            CellStyle participantheaderStyle = workbook.createCellStyle();
            participantheaderStyle.setWrapText(true);

            XSSFFont font = ((XSSFWorkbook) workbook).createFont();
            font.setFontName("Arial");
            font.setFontHeightInPoints((short) 11);
            font.setBold(true);
            participantheaderStyle.setFont(font);

            participantsCell = participantsColumns.createCell(0);
            participantsCell.setCellValue("Name");
            participantsCell.setCellStyle(participantheaderStyle);

            participantsCell = participantsColumns.createCell(1);
            participantsCell.setCellValue("Email");
            participantsCell.setCellStyle(participantheaderStyle);

            participantsCell = participantsColumns.createCell(2);
            participantsCell.setCellValue("Notes");
            participantsCell.setCellStyle(participantheaderStyle);

            if(event.getSubtype() == EventSubtype.APPOINTMENT) {
                participantsCell = participantsColumns.createCell(3);
                participantsCell.setCellValue("Appointment time");
                participantsCell.setCellStyle(participantheaderStyle);
            }

            for (int i = 0; i < participants.size(); i++) {
                Participation participant = participants.get(i);
                User userInfo = userService.getUserInformation(participant.getUserId());

                Row participantRow = sheet.createRow(lastRowNum + 3 + i);
                participantsCell = participantRow.createCell(0);
                participantsCell.setCellValue(userInfo.displayName);
                participantsCell.setCellStyle(style);

                participantsCell = participantRow.createCell(1);
                participantsCell.setCellValue(userInfo.mail);
                participantsCell.setCellStyle(style);

                participantsCell = participantRow.createCell(2);
                participantsCell.setCellValue(participant.getNotes());
                participantsCell.setCellStyle(style);

                if(participant.getAppointmentTime() != null) {
                    participantsCell = participantRow.createCell(3);
                    participantsCell.setCellValue(timeFormatter.format(participant.getAppointmentTime()));
                    participantsCell.setCellStyle(style);
                }
            }
        }
        
        
    }

    private boolean validEventUser(String eventCreatorId) {
        return AuthUtils.getCurrentUserId().equals(eventCreatorId) || AuthUtils.getCurrentUserRoles().contains("admin");
    }
}
