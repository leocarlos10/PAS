

La sp32 envia esto: 

```
"jardin/zona1/eventos" -m '{"codigo_sensor":"Z1-MAG-01","tipo_sensor":"MAGNETICO","tipo_evento":"ABIERTO","ts":"2026-05-19T12:34:56Z"}'
```

El backend servive y caputura esos datos. 
La esp32 recive los datos del backend atraves del servidor. 
La esp32 debe recivir eso desde el servidor mqtt. 

```
jardin/comando {"zona":"Zona 1","activa":true}
```
Y activar o desactivar. las zona de la alarma. 