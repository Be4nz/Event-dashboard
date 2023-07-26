package com.sourcery.eventdashboard.controllers;

import com.microsoft.graph.models.extensions.Group;
import com.sourcery.eventdashboard.models.dto.GroupsInfoResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.microsoft.graph.models.extensions.User;
import com.sourcery.eventdashboard.models.dto.UserInfoResponse;
import com.sourcery.eventdashboard.services.UserService;
import com.sourcery.eventdashboard.utils.AuthUtils;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/roles")
    public List<String> getCurrentUserRoles() {
        return AuthUtils.getCurrentUserRoles();
    }
    
    @GetMapping("/{oid}")
    public UserInfoResponse getUserInfoFromOid(@PathVariable String oid) throws Exception {
        User user = userService.getUserInformation(oid);
        return UserInfoResponse.fromEntity(user);
    }

    @GetMapping("/all")
    public List<UserInfoResponse> getAllUsers() throws Exception {
        List<User> allUsers = userService.getAllUsers();
        return UserInfoResponse.fromEntityList(allUsers);
    }

    @GetMapping("/groups")
    public List<GroupsInfoResponse> getAllGroups() throws Exception {
        List<Group> groups = userService.getAllGroups();
        return  GroupsInfoResponse.fromEntityList(groups);
    }

}
