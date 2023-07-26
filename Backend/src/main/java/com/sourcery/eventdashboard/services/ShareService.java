package com.sourcery.eventdashboard.services;

import com.sourcery.eventdashboard.mappers.ShareMapper;
import com.sourcery.eventdashboard.models.entities.Share;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShareService {

    private final ShareMapper shareMapper;

    public ShareService(ShareMapper shareMapper) {
        this.shareMapper = shareMapper;
    }

    public void create(Share share){
        shareMapper.create(share);
    }

    public void delete(Share share){
        shareMapper.delete(share);
    }

    public List<String> getSharedIds(Integer eventId){
        return shareMapper.getSharedWithUsers(eventId);
    }

}
