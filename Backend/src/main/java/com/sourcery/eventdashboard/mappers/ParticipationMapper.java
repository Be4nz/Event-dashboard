package com.sourcery.eventdashboard.mappers;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.type.InstantTypeHandler;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Delete;


import java.time.Instant;
import java.util.List;

import com.sourcery.eventdashboard.models.entities.Participation;


@Mapper
public interface ParticipationMapper {

    @Results(id="participationResultMap", value={
            @Result(property="id", column="id", id=true),
            @Result(property="notes", column="notes"),
            @Result(property="createdAt", column="created_at", javaType=Instant.class, typeHandler=InstantTypeHandler.class),
            @Result(property="eventId", column="event_id"),
            @Result(property="userId", column="user_id"),
            @Result(property="appointmentTime", column="appointment_time"),
    })

    @Select("SELECT * FROM participations")
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    List<Participation> getAll(
    );

    @Select("INSERT INTO participations(notes, created_at, event_id, user_id, appointment_time) " +
            "VALUES (#{participation.notes}, #{participation.createdAt}, #{participation.eventId}, #{participation.userId}, #{participation.appointmentTime}) RETURNING *")
    @ResultMap("participationResultMap")
    Participation create(@Param("participation") Participation participation);

    @Select("SELECT * FROM participations WHERE id = #{id}")
    @ResultMap("participationResultMap")
    Participation findById(@Param("id")Integer id);

    @Select("SELECT * FROM participations WHERE user_id = #{id}")
    @ResultMap("participationResultMap")
    List<Participation> findByUserId(@Param("id")Integer id);

    @Select("SELECT * FROM participations WHERE event_id = #{id}")
    @ResultMap("participationResultMap")
    List<Participation> findByEventId(@Param("id")Integer id);

    @Select("SELECT * FROM participations WHERE event_id = #{id} LIMIT #{limit} OFFSET #{offset}")
    @ResultMap("participationResultMap")
    List<Participation> searchByEventId(@Param("id")Integer id, @Param("offset") Integer offset, @Param("limit") Integer limit);

   @Select("UPDATE participations SET notes = #{participation.notes}, created_at = #{participation.createdAt}, user_id = #{participation.userId}, " +
    "event_id = #{participation.eventId}, appointment_time = #{participation.appointmentTime} RETURNING *")
    @ResultMap("participationResultMap")
    Participation update(@Param("participation") Participation participation);

    @Select("SELECT * FROM participations WHERE event_id = #{eventId} AND user_id = #{userId}")
    @ResultMap("participationResultMap")
    Participation checkParticipation(@Param("eventId") Integer eventId, @Param("userId") String userId);

    @Delete("DELETE FROM participations WHERE event_id = #{eventId} AND user_id = #{userId}")
    void deleteParticipation(@Param("eventId") Integer eventId, @Param("userId") String userId);

    @Delete("DELETE FROM participations WHERE event_id = #{eventId}")
    void deleteAllEventParticipations(@Param("eventId") Integer eventId);

    @Select("SELECT * FROM participations WHERE event_id = #{eventId} AND appointment_time = #{appointmentTime}")
    @ResultMap("participationResultMap")
    Participation findByAppointmentTimeAndEventId(@Param("eventId")Integer eventId, @Param("appointmentTime") Instant appointmentTime);

    @Select("SELECT COUNT(*) FROM participations WHERE event_id = #{eventId}")
    Integer findCount(@Param("eventId") Integer eventId);
}
