package com.healthgrid.monitoring.model;

/**
 * Enum para los estados de salud de un paciente
 */
public enum PatientStatus {
    /**
     * Estado normal - Paciente estable
     */
    NORMAL("Normal"),

    /**
     * Estado de advertencia - Requiere atención
     */
    WARNING("Warning"),

    /**
     * Estado crítico - Requiere atención inmediata
     */
    CRITICAL("Critical");

    private final String displayName;

    PatientStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
