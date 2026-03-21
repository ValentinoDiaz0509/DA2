# Patient Monitoring Service

Una aplicación Spring Boot 3.3 con Java 17 para el módulo de monitoreo de pacientes de un hospital, integrando PostgreSQL y AWS SQS (con soporte para LocalStack).

## Características

- ✅ Spring Boot 3.3 con Java 17
- ✅ Spring Data JPA para persistencia de datos
- ✅ PostgreSQL como base de datos
- ✅ Spring Cloud Stream para procesamiento de eventos con AWS SQS
- ✅ Swagger/OpenAPI para documentación de API
- ✅ Validation con Jakarta Bean Validation
- ✅ Lombok para reducir boilerplate
- ✅ Arquitectura en capas (Controller, Service, Repository)
- ✅ Transaccionalidad y logging configurados
- ✅ Soporte para LocalStack en desarrollo

## Estructura del Proyecto

```
src/main/java/com/healthgrid/monitoring/
├── MonitoringServiceApplication.java     # Clase principal
├── config/
│   └── AwsSqsConfig.java                # Configuración de AWS SQS
├── controller/
│   └── PatientController.java           # Endpoints REST
├── service/
│   └── PatientService.java              # Lógica de negocio
├── repository/
│   └── PatientRepository.java           # Acceso a datos
├── model/
│   └── Patient.java                     # Entidad de base de datos
├── dto/
│   └── PatientDTO.java                  # Objeto de transferencia de datos
└── consumer/
    └── PatientEventConsumer.java        # Consumidor de eventos SQS

src/main/resources/
└── application.yml                       # Configuración de la aplicación
```

## Dependencias Principales

- **Spring Web**: Para desarrollar APIs REST
- **Spring Data JPA**: ORM y acceso a datos
- **PostgreSQL Driver**: Driver JDBC para PostgreSQL
- **Lombok**: Generación automática de getters/setters
- **Spring Cloud Stream**: Framework para aplicaciones event-driven
- **AWS SDK for SQS**: Cliente para AWS SQS
- **SpringDoc OpenAPI**: Documentación automática de API (Swagger)
- **Spring Boot Validation**: Validación de datos

## Requisitos Previos

- Java 17 o superior
- Maven 3.8.1+
- PostgreSQL 12+
- Docker (opcional, para LocalStack)

## Configuración Inicial

### 1. Base de Datos PostgreSQL

Crear una base de datos para el proyecto:

```sql
CREATE DATABASE monitoring_db;
```

O usar Docker:

```bash
docker run --name postgres-monitoring \
  -e POSTGRES_DB=monitoring_db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 2. LocalStack para AWS SQS (Desarrollo)

```bash
docker run --name localstack \
  -p 4566:4566 \
  -e SERVICES=sqs \
  -e DOCKER_HOST=unix:///var/run/docker.sock \
  -d localstack/localstack
```

O usar `docker-compose.yml`:

```bash
docker-compose up -d
```

### 3. Compilar el Proyecto

```bash
mvn clean install
```

### 4. Ejecutar la Aplicación

```bash
mvn spring-boot:run
```

La aplicación estará disponible en: `http://localhost:8080/api/v1`

## Documentación de API

Una vez que la aplicación esté ejecutándose, accede a Swagger UI:

```
http://localhost:8080/api/v1/swagger-ui.html
```

## Endpoints Principales

### Patients

- **POST** `/patients` - Crear un nuevo paciente
- **GET** `/patients` - Obtener todos los pacientes
- **GET** `/patients/{id}` - Obtener paciente por ID
- **GET** `/patients/mrn/{mrn}` - Obtener paciente por MRN
- **GET** `/patients/status/{status}` - Obtener pacientes por estado
- **GET** `/patients/critical` - Obtener pacientes críticos
- **PUT** `/patients/{id}` - Actualizar un paciente
- **DELETE** `/patients/{id}` - Eliminar un paciente

## Ejemplo de Uso

### Crear un Paciente

```bash
curl -X POST http://localhost:8080/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "mrn": "MRN-001",
    "firstName": "Juan",
    "lastName": "Pérez",
    "age": 45,
    "gender": "M",
    "status": "ADMITTED",
    "diagnosis": "Hipertensión",
    "roomNumber": "101",
    "bedNumber": "A"
  }'
```

### Obtener Todos los Pacientes

```bash
curl http://localhost:8080/api/v1/patients
```

### Obtener Pacientes Críticos

```bash
curl http://localhost:8080/api/v1/patients/critical
```

## Configuración de Propiedades

Editar `src/main/resources/application.yml` para personalizar:

- **Base de datos**: Conexión PostgreSQL
- **AWS SQS**: Endpoint y credenciales
- **Logging**: Niveles de log
- **Server**: Puerto y contexto de la aplicación

## Monitoreo y Métricas

Endpoints de Actuator disponibles:

```
http://localhost:8080/api/v1/actuator/health
http://localhost:8080/api/v1/actuator/metrics
http://localhost:8080/api/v1/actuator/prometheus
```

## Procesamiento de Eventos

El consumidor `PatientEventConsumer` procesa mensajes desde la cola SQS `patient-events-queue`:

```java
@Bean
public Consumer<PatientDTO> patientEventInput() {
    return patientEvent -> {
        // Procesar evento de paciente
    };
}
```

### Escenarios de Procesamiento

- **CRITICAL**: Envía alertas urgentes al personal médico
- **STABLE**: Reduce la frecuencia de monitoreo
- **ADMITTED**: Inicializa monitoreo del paciente
- **DISCHARGED**: Archiva datos y detiene monitoreo

## Desarrollo

### Ejecutar Tests

```bash
mvn test
```

### Compilar con Skip Tests

```bash
mvn clean install -DskipTests
```

### Generar JAR Ejecutable

```bash
mvn clean package
java -jar target/monitoring-service-1.0.0.jar
```

## Docker

Crear una imagen Docker:

```dockerfile
FROM openjdk:17-jdk-slim
COPY target/monitoring-service-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

```bash
docker build -t patient-monitoring-service:1.0 .
docker run -p 8080:8080 patient-monitoring-service:1.0
```

## Mejores Prácticas Implementadas

1. ✅ Transaccionalidad en operaciones críticas
2. ✅ Validación de datos con anotaciones
3. ✅ Logging estructurado con Slf4j
4. ✅ DTOs para separación de capas
5. ✅ Repositorios con métodos especializados
6. ✅ Servicios con lógica de negocio
7. ✅ Controllers con documentación OpenAPI
8. ✅ Configuración externalizada
9. ✅ Manejo de excepciones
10. ✅ Integración con eventos asincronos

## Próximos Pasos

- [ ] Implementar servicio de autenticación (JWT)
- [ ] Agregar caché con Redis
- [ ] Implementar búsqueda avanzada con Elasticsearch
- [ ] Crear tests de integración
- [ ] Configurar CI/CD con GitHub Actions
- [ ] Implementar métricas de negocio
- [ ] Agregar documentación de arquitectura
- [ ] Crear migraciones de base de datos con Flyway/Liquibase

## Soporte y Contribución

Para reportar problemas o contribuir, contactar al equipo de HealthGrid.

---

**Versión**: 1.0.0  
**Última actualización**: Marzo 2026  
**Mantendedor**: HealthGrid Development Team
