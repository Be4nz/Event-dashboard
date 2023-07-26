package com.sourcery.eventdashboard.mappers;

import com.sourcery.eventdashboard.models.entities.Share;

import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ShareMapper {

    @Select("INSERT INTO shares (event_id, user_id) VALUES (#{share.eventId}, #{share.userId})")
    void create(@Param("share") Share share);

    @Delete("DELETE FROM shares WHERE user_id = #{share.userId} AND event_id = #{share.eventId}")
    void delete(@Param("share") Share share);

    @Select("SELECT user_id FROM shares WHERE event_id = #{eventId}")
    List<String> getSharedWithUsers(@Param("eventId") int eventId);
}
