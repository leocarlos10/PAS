-- ============================================================================
-- DATOS DE PRUEBA - SISTEMA DE SEGURIDAD PERIMETRAL CON 2 ZONAS
-- ============================================================================
-- Abre un navegador, escribe localhost:8081, ingresa con tu usuario y contraseña
-- de phpMyAdmin y luego copia y pega este script.
-- 
-- Flujo del Sistema:
-- ESP32 -> MQTT (jardin/zona1/eventos) -> Backend -> BD
-- Backend -> MQTT (jardin/zona1/comando) -> ESP32 (ARMAR/DESARMAR)
-- ============================================================================

-- ============================================================================
-- 1. USUARIOS DEL SISTEMA
-- ============================================================================
INSERT INTO users (
  username,
  password,
  user_rol,
  name,
  phone,
  active,
  created_at,
  updated_at
) VALUES 
(
  'leo10',
  '$2a$12$rzIZY.YLMQ4zstc6eXb41e5l/369sb7OOw5SWBF6FRyI1wA2xoX0u',
  'ADMIN',
  'Leocarlos Ospina',
  '3113746267',
  true,
  NOW(),
  NOW()
);
SET @user_admin = LAST_INSERT_ID();

INSERT INTO users (
  username,
  password,
  user_rol,
  name,
  phone,
  active,
  created_at,
  updated_at
) VALUES 
(
  'admin_seguridad',
  '$2a$12$rzIZY.YLMQ4zstc6eXb41e5l/369sb7OOw5SWBF6FRyI1wA2xoX0u',
  'ADMIN',
  'Administrador Seguridad',
  '3115555555',
  true,
  NOW(),
  NOW()
);

INSERT INTO users (
  username,
  password,
  user_rol,
  name,
  phone,
  active,
  created_at,
  updated_at
) VALUES 
(
  'operador_zona1',
  '$2a$12$rzIZY.YLMQ4zstc6eXb41e5l/369sb7OOw5SWBF6FRyI1wA2xoX0u',
  'USUARIO',
  'Operador Zona 1',
  '3116666666',
  true,
  NOW(),
  NOW()
);
SET @user_operador = LAST_INSERT_ID();

-- ============================================================================
-- 2. DISPOSITIVOS ESP32 (UNO POR ZONA)
-- ============================================================================
-- ESP32 para Zona 1
INSERT INTO dispositivos (
  nombre,
  tipo,
  mac,
  ip_local,
  broquer_mqtt,
  topic_estado,
  topic_comando,
  estado_conexion,
  ultima_conexion
) VALUES (
  'ESP32-Zona1',
  'ESP32',
  'AA:BB:CC:DD:EE:01',
  '192.168.1.101',
  'tcp://161.35.14.62:1883',
  'jardin/zona1/estado',
  'jardin/zona1/comando',
  'CONECTADO',
  NOW()
);
SET @dispositivo_zona1 = LAST_INSERT_ID();

-- ESP32 para Zona 2
INSERT INTO dispositivos (
  nombre,
  tipo,
  mac,
  ip_local,
  broquer_mqtt,
  topic_estado,
  topic_comando,
  estado_conexion,
  ultima_conexion
) VALUES (
  'ESP32-Zona2',
  'ESP32',
  'AA:BB:CC:DD:EE:02',
  '192.168.1.102',
  'tcp://161.35.14.62:1883',
  'jardin/zona2/estado',
  'jardin/zona2/comando',
  'CONECTADO',
  NOW()
);
SET @dispositivo_zona2 = LAST_INSERT_ID();

-- ============================================================================
-- 3. ZONAS (zona1 y zona2)
-- ============================================================================
-- Zona 1 - Controlada por ESP32-Zona1
INSERT INTO zonas (
  id_dispositivo,
  nombre,
  descripcion,
  ubicacion,
  estado_actual,
  modo_control,
  activa
) VALUES (
  @dispositivo_zona1,
  'Zona 1',
  'Zona perimetral norte - Sensores de movimiento y magnético',
  'Bloque A',
  'ARMADA',
  'AUTOMATICO',
  true
);
SET @zona1_id = LAST_INSERT_ID();

-- Zona 2 - Controlada por ESP32-Zona2
INSERT INTO zonas (
  id_dispositivo,
  nombre,
  descripcion,
  ubicacion,
  estado_actual,
  modo_control,
  activa
) VALUES (
  @dispositivo_zona2,
  'Zona 2',
  'Zona perimetral sur - Sensores de movimiento y magnético',
  'Bloque B',
  'DESARMADA',
  'MANUAL',
  true
);
SET @zona2_id = LAST_INSERT_ID();

-- ============================================================================
-- 4. SENSORES POR ZONA (2 sensores por zona: movimiento + magnético)
-- ============================================================================
-- ZONA 1 - Sensor de Movimiento
INSERT INTO sensores (
  id_zona,
  codigo,
  tipo_sensor,
  ubicacion_detalle,
  estado_actual,
  ultimo_reporte,
  activo
) VALUES (
  @zona1_id,
  'Z1-MOV-01',
  'MOVIMIENTO',
  'Puerta principal entrada norte',
  'ACTIVO',
  NOW(),
  true
);
SET @zona1_mov = LAST_INSERT_ID();

-- ZONA 1 - Sensor Magnético
INSERT INTO sensores (
  id_zona,
  codigo,
  tipo_sensor,
  ubicacion_detalle,
  estado_actual,
  ultimo_reporte,
  activo
) VALUES (
  @zona1_id,
  'Z1-MAG-01',
  'MAGNETICO',
  'Ventana lateral norte',
  'INACTIVO',
  NOW(),
  true
);
SET @zona1_mag = LAST_INSERT_ID();

-- ZONA 2 - Sensor de Movimiento
INSERT INTO sensores (
  id_zona,
  codigo,
  tipo_sensor,
  ubicacion_detalle,
  estado_actual,
  ultimo_reporte,
  activo
) VALUES (
  @zona2_id,
  'Z2-MOV-01',
  'MOVIMIENTO',
  'Puerta principal entrada sur',
  'INACTIVO',
  NOW(),
  true
);
SET @zona2_mov = LAST_INSERT_ID();

-- ZONA 2 - Sensor Magnético
INSERT INTO sensores (
  id_zona,
  codigo,
  tipo_sensor,
  ubicacion_detalle,
  estado_actual,
  ultimo_reporte,
  activo
) VALUES (
  @zona2_id,
  'Z2-MAG-01',
  'MAGNETICO',
  'Ventana lateral sur',
  'ACTIVO',
  NOW(),
  true
);
SET @zona2_mag = LAST_INSERT_ID();

-- ============================================================================
-- 5. EVENTOS - FLUJO REAL DEL SISTEMA
-- ============================================================================
-- Evento 1: Zona 1 - Sensor magnético detecta apertura (desde ESP32)
INSERT INTO eventos (
  id_zona,
  id_sensor,
  id_comando,
  tipo_evento,
  descripcion,
  severidad,
  fecha_hora
) VALUES (
  @zona1_id,
  @zona1_mag,
  NULL,
  'PUERTA_ABIERTA',
  'Sensor magnético Z1-MAG-01 detectó apertura de ventana - Origen: jardin/zona1/eventos',
  'ALTA',
  NOW() - INTERVAL 2 HOUR
);
SET @evento1_id = LAST_INSERT_ID();

-- Evento 2: Zona 1 - Sensor de movimiento activo
INSERT INTO eventos (
  id_zona,
  id_sensor,
  id_comando,
  tipo_evento,
  descripcion,
  severidad,
  fecha_hora
) VALUES (
  @zona1_id,
  @zona1_mov,
  NULL,
  'MOVIMIENTO_DETECTADO',
  'Sensor de movimiento Z1-MOV-01 activado en puerta principal - Origen: jardin/zona1/eventos',
  'ALTA',
  NOW() - INTERVAL 90 MINUTE
);
SET @evento2_id = LAST_INSERT_ID();

-- Evento 3: Comando de ARMAR enviado a Zona 1
INSERT INTO comandos_control (
  id_usuario,
  id_zona,
  accion,
  payload,
  topic_enviado
) VALUES (
  @user_admin,
  @zona1_id,
  'ARMAR',
  '{\"accion\":\"ARMAR\", \"timestamp\":\"2026-05-24T14:30:00Z\"}',
  'jardin/zona1/comando'
);
SET @comando1_id = LAST_INSERT_ID();

-- Evento 4: Zona 1 - Confirmación de ARMADO
INSERT INTO eventos (
  id_zona,
  id_sensor,
  id_comando,
  tipo_evento,
  descripcion,
  severidad,
  fecha_hora
) VALUES (
  @zona1_id,
  NULL,
  @comando1_id,
  'ARMADA',
  'Zona 1 armada exitosamente por admin - Comando enviado a: jardin/zona1/comando',
  'BAJA',
  NOW() - INTERVAL 60 MINUTE
);

-- Evento 5: Comando de DESARMAR enviado a Zona 2
INSERT INTO comandos_control (
  id_usuario,
  id_zona,
  accion,
  payload,
  topic_enviado
) VALUES (
  @user_operador,
  @zona2_id,
  'DESARMAR',
  '{\"accion\":\"DESARMAR\", \"timestamp\":\"2026-05-24T14:45:00Z\"}',
  'jardin/zona2/comando'
);
SET @comando2_id = LAST_INSERT_ID();

-- Evento 6: Zona 2 - Confirmación de DESARMADO
INSERT INTO eventos (
  id_zona,
  id_sensor,
  id_comando,
  tipo_evento,
  descripcion,
  severidad,
  fecha_hora
) VALUES (
  @zona2_id,
  NULL,
  @comando2_id,
  'DESARMADA',
  'Zona 2 desarmada por operador - Comando enviado a: jardin/zona2/comando',
  'BAJA',
  NOW() - INTERVAL 45 MINUTE
);

-- Evento 7: Zona 2 - Sensor magnético cerrado (desde ESP32)
INSERT INTO eventos (
  id_zona,
  id_sensor,
  id_comando,
  tipo_evento,
  descripcion,
  severidad,
  fecha_hora
) VALUES (
  @zona2_id,
  @zona2_mag,
  NULL,
  'PUERTA_CERRADA',
  'Sensor magnético Z2-MAG-01 detectó cierre de ventana - Origen: jardin/zona2/eventos',
  'BAJA',
  NOW() - INTERVAL 30 MINUTE
);
SET @evento7_id = LAST_INSERT_ID();

-- Evento 8: Zona 1 - Intrusión detectada
INSERT INTO eventos (
  id_zona,
  id_sensor,
  id_comando,
  tipo_evento,
  descripcion,
  severidad,
  fecha_hora
) VALUES (
  @zona1_id,
  @zona1_mov,
  NULL,
  'MOVIMIENTO_DETECTADO',
  'ALERTA: Movimiento detectado en zona armada (Z1-MOV-01) - Origen: jardin/zona1/eventos',
  'ALTA',
  NOW() - INTERVAL 15 MINUTE
);
SET @evento8_id = LAST_INSERT_ID();

-- Evento 9: Zona 2 - Sensor de movimiento sin movimiento
INSERT INTO eventos (
  id_zona,
  id_sensor,
  id_comando,
  tipo_evento,
  descripcion,
  severidad,
  fecha_hora
) VALUES (
  @zona2_id,
  @zona2_mov,
  NULL,
  'SIN_MOVIMIENTO',
  'Sensor de movimiento Z2-MOV-01 sin actividad - Origen: jardin/zona2/eventos',
  'BAJA',
  NOW() - INTERVAL 5 MINUTE
);

-- ============================================================================
-- 6. ALERTAS - Notificaciones generadas por eventos críticos
-- ============================================================================
-- Alerta por intrusión en Zona 1 (evento 8)
INSERT INTO alertas (
  id_evento,
  id_usuario_destino,
  canal,
  telefono_destino,
  estado_alerta,
  fecha_generada,
  fecha_notificada
) VALUES (
  @evento8_id,
  @user_admin,
  'SMS',
  '3113746267',
  'ENVIADA',
  NOW() - INTERVAL 15 MINUTE,
  NOW() - INTERVAL 14 MINUTE
);

-- Alerta por intrusión en Zona 1 - Email
INSERT INTO alertas (
  id_evento,
  id_usuario_destino,
  canal,
  telefono_destino,
  estado_alerta,
  fecha_generada,
  fecha_notificada
) VALUES (
  @evento8_id,
  @user_admin,
  'EMAIL',
  NULL,
  'ENVIADA',
  NOW() - INTERVAL 15 MINUTE,
  NOW() - INTERVAL 14 MINUTE
);

-- ============================================================================
-- RESUMEN DE DATOS CARGADOS
-- ============================================================================
-- Usuarios: 3 (1 Admin, 2 Operadores)
-- Dispositivos: 2 ESP32 (uno por zona)
-- Zonas: 2 (Zona 1 y Zona 2, cada una con su ESP32)
-- Sensores: 4 (2 por zona: movimiento + magnético)
-- Eventos: 9 (flujo completo con comandos ARMAR/DESARMAR)
-- Alertas: 2 (por eventos críticos)
-- Comandos Control: 2 (ARMAR Zona 1, DESARMAR Zona 2)
-- ============================================================================