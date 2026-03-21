package com.healthgrid.monitoring.repository;

import com.healthgrid.monitoring.model.ProcessedMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedMessageRepository extends JpaRepository<ProcessedMessage, Long> {
    // Additional query methods can be defined here
}