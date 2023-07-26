package com.sourcery.eventdashboard.mappers;

import com.sourcery.eventdashboard.models.entities.Event;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.type.InstantTypeHandler;

import java.time.Instant;
import java.util.List;


@Mapper
public interface EventsMapper {

    @Results(id="eventResultMap", value={
            @Result(property="id", column="id", id=true),
            @Result(property="title", column="title"),
            @Result(property="type", column="type"),
            @Result(property="subtype", column="subtype"),
            @Result(property="description", column="description"),
            @Result(property="eventDate", column="event_date", javaType=Instant.class, typeHandler=InstantTypeHandler.class),
            @Result(property="registrationDeadline", column="registration_deadline", javaType=Instant.class, typeHandler=InstantTypeHandler.class),
            @Result(property="imageUrl", column="image_url"),
            @Result(property="startTime", column="start_time", javaType=Instant.class, typeHandler=InstantTypeHandler.class),
            @Result(property="endTime", column="end_time", javaType=Instant.class, typeHandler=InstantTypeHandler.class),
            @Result(property="duration", column="duration"),
            @Result(property="deleted", column="deleted"),
            @Result(property="createdBy", column="created_by"),
            @Result(property="timeZone", column="time_zone"),
    })

    @Select("SELECT DISTINCT e.* FROM events e LEFT JOIN participations p " +
            "ON p.event_id = e.id " +
            "WHERE LOWER(e.title) LIKE LOWER(CONCAT(#{searchPhrase}, '%')) " +
            "AND e.type IN (${types}) " +
            "AND e.event_date BETWEEN #{startDate} AND #{endDate} " +
            "AND e.deleted IS NOT TRUE " +
            "AND (e.type != 'PERSONAL' OR (e.type = 'PERSONAL' AND (e.created_by = #{userId} OR #{isAdmin}))) " +
            "AND (p.user_id = #{userId} OR e.created_by = #{userId}) " +
            "ORDER BY ${sortField} ${sortDirection} " +
            "LIMIT #{limit} OFFSET #{offset}")
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    List<Event> searchParticipantsEvents(
            @Param("searchPhrase") String searchPhrase,
            @Param("types") String types,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            @Param("offset") Integer offset,
            @Param("limit") Integer limit,
            @Param("sortDirection") String sortDirection,
            @Param("sortField") String sortField,
            @Param("userId") String userId,
            @Param("isAdmin") Boolean isAdmin
    );

    @Select("SELECT DISTINCT e.* FROM events e LEFT JOIN shares s " +
            "ON s.event_id = e.id " +
            "WHERE LOWER(e.title) LIKE LOWER(CONCAT(#{searchPhrase}, '%')) " +
            "AND e.type IN (${types}) " +
            "AND e.event_date BETWEEN #{startDate} AND #{endDate} " +
            "AND e.deleted IS NOT TRUE " +
            "AND (e.type != 'PERSONAL' OR (e.type = 'PERSONAL' AND (e.created_by = #{userId} OR #{isAdmin}))) " +
            "AND (s.user_id = #{userId} OR e.created_by = #{userId} OR #{isAdmin}) " +
            "ORDER BY ${sortField} ${sortDirection} " +
            "LIMIT #{limit} OFFSET #{offset}")
    @ResultMap("eventResultMap")
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    List<Event> searchEvents(
            @Param("searchPhrase") String searchPhrase,
            @Param("types") String types,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            @Param("offset") Integer offset,
            @Param("limit") Integer limit,
            @Param("sortDirection") String sortDirection,
            @Param("sortField") String sortField,
            @Param("userId") String userId,
            @Param("isAdmin") Boolean isAdmin
    );

    @Select("SELECT COUNT (DISTINCT e.*) FROM events e LEFT JOIN participations p " +
            "ON p.event_id = e.id " +
            "WHERE LOWER(e.title) LIKE LOWER(CONCAT(#{searchPhrase}, '%')) " +
            "AND e.type IN (${types}) " +
            "AND e.deleted IS NOT TRUE " +
            "AND (p.user_id = #{userId} OR e.created_by = #{userId}) " +
            "AND e.event_date BETWEEN #{startDate} AND #{endDate}")
    Integer findParticipantsCount(
            @Param("searchPhrase") String searchPhrase,
            @Param("types") String types,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            @Param("userId") String userId
    );

    @Select("SELECT COUNT(DISTINCT e.*) FROM events e LEFT JOIN shares s " +
            "ON s.event_id = e.id " +
            "WHERE LOWER(e.title) LIKE LOWER(CONCAT(#{searchPhrase}, '%')) " +
            "AND e.type IN (${types}) " +
            "AND e.deleted IS NOT TRUE " +
            "AND (s.user_id = #{userId} OR e.created_by = #{userId} OR #{isAdmin}) " +
            "AND e.event_date BETWEEN #{startDate} AND #{endDate}")
    Integer findCount(
            @Param("searchPhrase") String searchPhrase,
            @Param("types") String types,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            @Param("userId") String userId,
            @Param("isAdmin") boolean isAdmin
    );


    @Select("INSERT INTO events(title, description, type, subtype, event_date, registration_deadline, image_url, " +
                "start_time, end_time, duration, deleted, created_by, time_zone) " +
            "VALUES (#{event.title}, #{event.description}, #{event.type}, #{event.subtype}, #{event.eventDate}, #{event.registrationDeadline}, " +
                "#{event.imageUrl}, #{event.startTime}, #{event.endTime}, #{event.duration}, false, #{event.createdBy}, #{event.timeZone}) RETURNING *")
    @ResultMap("eventResultMap")
    Event create(@Param("event") Event event);


    @Select("SELECT * FROM events WHERE id = #{id} AND deleted IS NOT TRUE " +
    "AND (type != 'PERSONAL' OR (type = 'PERSONAL' AND (created_by = #{userId} OR #{isAdmin})))")
    @ResultMap("eventResultMap")
    Event findById(@Param("id") Integer id, @Param("userId") String userId, @Param("isAdmin") Boolean isAdmin);

    @Select("SELECT * FROM events WHERE id = #{id} AND deleted IS NOT TRUE ")
    @ResultMap("eventResultMap")
    Event checkIfExists(@Param("id") Integer id);


    @Select("SELECT * FROM events WHERE id = #{id}")
    @ResultMap("eventResultMap")
    Event findAllById(@Param("id")Integer id);

    @Select("UPDATE events SET title = #{event.title}, description = #{event.description}, type = #{event.type}, subtype = #{event.subtype}, " +
    "event_date = #{event.eventDate}, registration_deadline = #{event.registrationDeadline}, image_url = #{event.imageUrl}, " +
    "start_time = #{event.startTime}, end_time = #{event.endTime}, duration = #{event.duration}, deleted = CAST(#{event.deleted} AS BOOLEAN), created_by = #{event.createdBy} WHERE id = #{event.id} RETURNING *")
    @ResultMap("eventResultMap")
    Event update(@Param("event") Event event);

    @Select("UPDATE events SET deleted = true WHERE id = #{id} RETURNING *")
    @ResultMap("eventResultMap")
    Event delete(@Param("id") Integer id);

    @Select("UPDATE events SET deleted = false WHERE id = #{id} RETURNING *")
    @ResultMap("eventResultMap")
    Event restore(@Param("id") Integer id);

    @Select("SELECT * FROM events WHERE event_date <= CURRENT_TIMESTAMP + INTERVAL '24 hours' AND reminder_sent IS NOT TRUE")
    @ResultMap("eventResultMap")
    List<Event> getUpcoming();

    @Select("UPDATE events SET reminder_sent = true WHERE id = #{id} RETURNING *")
    @ResultMap("eventResultMap")
    Event setReminderSent(@Param("id") Integer id);

    @Select("SELECT id FROM events WHERE deleted IS NOT TRUE")
    List<Integer> getAllEventsIds();
}
