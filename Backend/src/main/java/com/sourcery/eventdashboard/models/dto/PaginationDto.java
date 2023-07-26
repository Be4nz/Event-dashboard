package com.sourcery.eventdashboard.models.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaginationDto {

    private Integer limit;

    private Integer offset;

    private Integer total;

}
