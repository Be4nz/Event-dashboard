package com.sourcery.eventdashboard.models.dto;
import java.util.List;

import com.microsoft.graph.models.extensions.Group;

import com.microsoft.graph.models.extensions.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GroupsInfoResponse {

    private String id;

    private String displayName;

    private List<UserInfoResponse> users;

    public static GroupsInfoResponse fromEntity(Group group) {
        if (group.members != null) {
            List<UserInfoResponse> members = group.members.getCurrentPage()
                    .stream()
                    .filter(user -> user instanceof User)
                    .map(user -> UserInfoResponse.fromEntity((User) user))
                    .toList();

            return new GroupsInfoResponse(group.id, group.displayName, members);
        } else {
            return new GroupsInfoResponse(group.id, group.displayName, null);
        }
    }


    public static List<GroupsInfoResponse> fromEntityList(List<Group> groupList){
        return groupList.stream().map(GroupsInfoResponse::fromEntity).toList();
    }
}
