
# This project uses.

+ Java:25
+ gradle:Gradle 9.5.0 

For configure the project. create the archive `seccrets.properties`
add the db credencials and run. 

```
gradle bootRun
```

### Solución al error "Communications link failure / Connection refused"

Ese error significa que **el backend no logra conectarse a MySQL** (por ejemplo, MySQL no está corriendo o el host/puerto no coincide).

Opciones:

1. **Docker Compose (recomendado)**: desde la raíz del repo levanta `mysql` + backend + frontend con `docker-compose.dev.yml` y asegúrate que `DB_URL` apunte a `jdbc:mysql://mysql:3306/...` (ver `.env` en la raíz).
2. **MySQL local**: instala/levanta MySQL en tu máquina y usa `jdbc:mysql://localhost:3306/...`.

Ejemplos listos en `src/main/resources/secrets.properties.example`.

## MQTT

The MQTT listener can be configured using environment variables (or `application.yaml` overrides):

- `MQTT_BROKER_URL` (default: `tcp://localhost:1883`)
- `MQTT_CLIENT_ID` (optional; if empty a random id is generated)
- `MQTT_TOPIC_FILTER` (default: `jardin/#`)
- `MQTT_USERNAME` (optional)
- `MQTT_PASSWORD` (optional)


####  Visist API docs
```
http://localhost:8080/swagger-ui.html
```
for activate visit secrest.example

## Endpoints (Frontend)

- `GET /api/zonas` lista zonas.
  - Filtros opcionales: `?dispositivoId=<id>` y/o `?activa=true|false`
- `GET /api/zonas/{zonaId}` obtiene una zona por id.

