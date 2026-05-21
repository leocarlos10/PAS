-- abre un navegador, escribe localhost:8081, ingresa con tu usuario y contraseña,
-- de phpmyadmin lugo copia y pega este script.

INSERT INTO users (
  username,
  password,
  user_rol,
  name,
  phone,
  active,
  created_at,
  updated_at
) VALUES (
  'leo10',
  '$2a$12$rzIZY.YLMQ4zstc6eXb41e5l/369sb7OOw5SWBF6FRyI1wA2xoX0u', -- Recuerda: normalmente aquí va el hash, no el texto plano
  'ADMIN',
  'Leocarlos Ospina',
  '3113746267',
  true,
  NOW(),
  NOW()
);

-- Dispositivo base
INSERT INTO dispositivos (
  nombre, tipo, mac, ip_local, broquer_mqtt,
  topic_estado, topic_comando, estado_conexion, ultima_conexion
) VALUES (
  'Controlador Central', 'ESP32', 'AA:BB:CC:DD:EE:01', '192.168.1.10', 'mqtt.local',
  'perimetro/estado', 'perimetro/comando', 'ONLINE', NOW()
);
SET @dispositivo_id = LAST_INSERT_ID();

-- Zonas
INSERT INTO zonas (
  id_dispositivo, nombre, descripcion, ubicacion, estado_actual, modo_control, activa
) VALUES
(@dispositivo_id, 'Sector Norte', 'Zona perimetral norte', 'Bloque A', 'ARMADA', 'AUTOMATICO', TRUE),
(@dispositivo_id, 'Acceso Principal', 'Entrada principal', 'Bloque B', 'DESARMADA', 'MANUAL', FALSE),
(@dispositivo_id, 'Laboratorio', 'Area de sensores criticos', 'Bloque C', 'ARMADA', 'AUTOMATICO', TRUE);

SET @zona_norte_id = (SELECT id_zona FROM zonas WHERE nombre = 'Sector Norte' LIMIT 1);
SET @zona_acceso_id = (SELECT id_zona FROM zonas WHERE nombre = 'Acceso Principal' LIMIT 1);
SET @zona_lab_id    = (SELECT id_zona FROM zonas WHERE nombre = 'Laboratorio' LIMIT 1);

-- Sensores
INSERT INTO sensores (
  id_zona, codigo, tipo_sensor, ubicacion_detalle, estado_actual, ultimo_reporte, activo
) VALUES
(@zona_norte_id, 'Cam-N-04', 'CAMARA', 'Perimetro norte', 'OK', NOW(), TRUE),
(@zona_norte_id, 'Motion-N-02', 'MOVIMIENTO', 'Valla norte', 'OK', NOW(), TRUE),
(@zona_acceso_id, 'Gate-P-01', 'BARRERA', 'Porton principal', 'OK', NOW(), TRUE),
(@zona_lab_id, 'Smoke-L-01', 'HUMO', 'Techo lab', 'OK', NOW(), TRUE);

SET @sensor_cam_n_id    = (SELECT id_sensor FROM sensores WHERE codigo = 'Cam-N-04' LIMIT 1);
SET @sensor_motion_n_id = (SELECT id_sensor FROM sensores WHERE codigo = 'Motion-N-02' LIMIT 1);
SET @sensor_gate_p_id   = (SELECT id_sensor FROM sensores WHERE codigo = 'Gate-P-01' LIMIT 1);
SET @sensor_smoke_l_id  = (SELECT id_sensor FROM sensores WHERE codigo = 'Smoke-L-01' LIMIT 1);

-- Eventos (historial)
INSERT INTO eventos (
  id_zona, id_sensor, id_comando, tipo_evento, descripcion, severidad, fecha_hora
) VALUES
(@zona_norte_id,  @sensor_cam_n_id,    NULL, 'Intrusion',     'Movimiento detectado en perimetro norte', 'Alta',  NOW() - INTERVAL 2 HOUR),
(@zona_norte_id,  @sensor_motion_n_id, NULL, 'Intrusion',     'Sensor de movimiento activo',            'Alta',  NOW() - INTERVAL 1 HOUR),
(@zona_acceso_id, @sensor_gate_p_id,   NULL, 'Desactivacion', 'Acceso principal desarmado',             'Baja',  NOW() - INTERVAL 30 MINUTE),
(@zona_lab_id,    @sensor_smoke_l_id,  NULL, 'Fallo Sensor',  'Lectura inestable de humo',              'Media', NOW() - INTERVAL 15 MINUTE),
(@zona_lab_id,    @sensor_smoke_l_id,  NULL, 'Activacion',    'Sistema activado en laboratorio',        'Baja',  NOW() - INTERVAL 5 MINUTE);