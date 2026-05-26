

La sp32 envia esto: 

```
"jardin/zona1/eventos" -m '{"codigo_sensor":"Z1-MAG-01","tipo_sensor":"MAGNETICO","tipo_evento":"ABIERTO","ts":"2026-05-19T12:34:56Z"}'
```

El backend servive y caputura esos datos. 
La esp32 recive los datos del backend atraves del servidor. 
La esp32 debe recivir eso desde el servidor mqtt. 

```
jardin/zona1/comando {"accion":"ARMAR"}
jardin/zona1/comando {"accion":"DESARMAR"}
jardin/zona2/comando {"accion":"DESARMAR"}
jardin/zona2/comando {"accion":"ARMAR"}
```

### Configuración Wi-Fi
La ESP32 debe estar suscrita a:
`jardin/{zona}/config`

Recibirá un JSON con la acción `set_wifi`:
```json
{"action": "set_wifi", "ssid": "...", "password": "..."}
```

Para activar la sincronización automática al inicio, la ESP32 debe publicar su estado:
`jardin/{zona}/estado` -> `{"estado": "online"}`

Y activar o desactivar. las zona de la alarma. 
