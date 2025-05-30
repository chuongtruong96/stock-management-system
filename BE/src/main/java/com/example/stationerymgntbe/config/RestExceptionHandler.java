package com.example.stationerymgntbe.config;

import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice @Slf4j
public class RestExceptionHandler {

  private ResponseEntity<Map<String,String>> json(HttpStatus s,String m){
      return ResponseEntity.status(s).body(Map.of("status",s.name(),"message",m));
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex){
      return json(HttpStatus.NOT_FOUND,ex.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex){
      var msg = ex.getBindingResult().getFieldErrors().stream()
                  .map(e->e.getField()+" "+e.getDefaultMessage())
                  .findFirst().orElse("Validation error");
      return json(HttpStatus.BAD_REQUEST,msg);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleGeneric(Exception ex){
      log.error("Unhandled",ex);
      return json(HttpStatus.INTERNAL_SERVER_ERROR,"Server error");
  }
}
