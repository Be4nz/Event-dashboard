package com.sourcery.eventdashboard.models.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class IncorrectSubtypeException extends RuntimeException {
    public IncorrectSubtypeException(){
        super();
    }
}
