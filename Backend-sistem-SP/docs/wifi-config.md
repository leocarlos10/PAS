# Configuración de Wi-Fi - Guía Técnica

Esta documentación describe el flujo de cambio y persistencia de credenciales Wi-Fi para los dispositivos ESP32.

## 1. Flujo de Configuración

1. **Frontend:** El administrador ingresa el SSID y Password en el formulario de configuración (Zonas o Menú de Perfil).
2. **Backend (API):** Recibe la solicitud, valida los datos y los persiste en la tabla `dispositivos` (columnas `wifi_ssid` y `wifi_password`).
3. **Backend (MQTT):** Publica un mensaje JSON en el tópico de configuración del dispositivo.
4. **ESP32:** Recibe el comando, intenta conectarse a la nueva red y reinicia si es necesario.

## 2. Tópicos MQTT

El backend deriva el tópico de configuración automáticamente. Si el tópico de estado es `jardin/zona1/estado`, el de configuración será:

| Canal | Tópico | Descripción |
|-------|--------|-------------|
| **Comando** | `jardin/{zona}/config` | Envío de credenciales desde el Backend. |
| **Estado** | `jardin/{zona}/estado` | Reporte de inicio del ESP32 para sincronización. |

## 3. Payloads (JSON)

### Envío de Configuración (Backend -> ESP32)
**Tópico:** `jardin/zona1/config`
```json
{
  "action": "set_wifi",
  "ssid": "NombreDeMiRed",
  "password": "ContraseñaSegura123"
}
```

### Reporte de Inicio (ESP32 -> Backend)
Para activar la sincronización automática (re-envío de la última configuración guardada), el ESP32 debe enviar uno de estos estados al iniciar o reconectar:
**Tópico:** `jardin/zona1/estado`
```json
{
  "estado": "online"
}
```
*(También acepta: `"start"` o `"conectado"`)*

## 4. Sincronización Automática
El backend está configurado para que, cada vez que reciba un mensaje en el tópico de estado con valor `online`, verifique si hay credenciales guardadas en la base de datos para ese dispositivo. Si existen, las re-envía inmediatamente por el tópico `/config` para asegurar que el dispositivo esté actualizado.

---
*Nota: Asegúrese de que el ESP32 esté suscrito al tópico `/config` correspondiente a su zona.*
