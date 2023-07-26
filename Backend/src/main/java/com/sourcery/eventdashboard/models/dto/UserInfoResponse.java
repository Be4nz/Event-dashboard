package com.sourcery.eventdashboard.models.dto;
import java.util.List;

import com.microsoft.graph.models.extensions.User;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoResponse {

    private String id;

    private String displayName;

    private String email;

    public static UserInfoResponse fromEntity(User user) {
    return new UserInfoResponse(user.id,user.displayName, user.mail);
    }

    public static List<UserInfoResponse> fromEntityList(List<User> userList){
        return userList.stream().map(UserInfoResponse::fromEntity).toList();
    }
}
