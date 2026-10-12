package com.fleetops.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class DriverIneligibleException extends RuntimeException {
    public DriverIneligibleException(String message) {
        super(message);
    }
}
