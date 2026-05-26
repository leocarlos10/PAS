-- ============================================================================
-- DATOS DE PRUEBA - SISTEMA DE SEGURIDAD PERIMETRAL ACTUALIZADO
-- ============================================================================
-- Este script inserta datos de ejemplo compatibles con los modelos actuales.
-- Incluye Usuarios, Dispositivos, Zonas, Sensores, Programaciones y Eventos.
-- ============================================================================

-- ============================================================================
-- 1. USUARIOS DEL SISTEMA
-- ============================================================================
-- Contraseña por defecto para todos: '12341234' (bcrypt $2a$12$rzIZY.YLMQ4zstc6eXb41e5l/369sb7OOw5SWBF6FRyI1wA2xoX0u)
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
  'calebsenm',
  '$2a$12$rzIZY.YLMQ4zstc6eXb41e5l/369sb7OOw5SWBF6FRyI1wA2xoX0u',
  'ADMIN',
  'Caleb',
  '300000000',
  true,
  NOW(),
  NOW()
),
(
  'admin_seguridad',
  '$2a$12$rzIZY.YLMQ4zstc6eXb41e5l/369sb7OOw5SWBF6FRyI1wA2xoX0u',
  'ADMIN',
  'Administrador Seguridad',
  '3115555555',
  true,
  NOW(),
  NOW()
),
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

SET @user_admin = (SELECT id_user FROM users WHERE username = 'leo10');
SET @user_operador = (SELECT id_user FROM users WHERE username = 'operador_zona1');

-- ============================================================================
-- 2. DISPOSITIVOS ESP32 (UNO POR ZONA)
-- ============================================================================
INSERT INTO dispositivos (
  nombre,
  tipo,
  mac,
  ip_local,
  broquer_mqtt,
  topic_estado,
  topic_comando,
  estado_conexion,
  wifi_ssid,
  wifi_password,
  ultima_conexion
) VALUES 
(
  'ESP32-Perimetro-Norte',
  'ESP32',
  'AA:BB:CC:DD:EE:01',
  '192.168.1.101',
  'tcp://161.35.14.62:1883',
  'jardin/zona1/estado',
  'jardin/zona1/comando',
  'CONECTADO',
  'MiRedWiFi_Norte',
  'pass12345',
  NOW()
),
(
  'ESP32-Perimetro-Sur',
  'ESP32',
  'AA:BB:CC:DD:EE:02',
  '192.168.1.102',
  'tcp://161.35.14.62:1883',
  'jardin/zona2/estado',
  'jardin/zona2/comando',
  'CONECTADO',
  'MiRedWiFi_Sur',
  'pass67890',
  NOW()
);

SET @dispositivo_norte = (SELECT id_dispositivo FROM dispositivos WHERE mac = 'AA:BB:CC:DD:EE:01');
SET @dispositivo_sur = (SELECT id_dispositivo FROM dispositivos WHERE mac = 'AA:BB:CC:DD:EE:02');

-- ============================================================================
-- 3. ZONAS
-- ============================================================================
INSERT INTO zonas (
  id_dispositivo,
  nombre,
  descripcion,
  ubicacion,
  estado_actual,
  modo_control,
  activa
) VALUES 
(
  @dispositivo_norte,
  'Zona Norte',
  'Perímetro frontal y lateral izquierdo',
  'Bloque A',
  'ARMADA',
  'AUTOMATICO',
  true
),
(
  @dispositivo_sur,
  'Zona Sur',
  'Perímetro posterior y lateral derecho',
  'Bloque B',
  'DESARMADA',
  'MANUAL',
  true
);

SET @zona_norte_id = (SELECT id_zona FROM zonas WHERE nombre = 'Zona Norte');
SET @zona_sur_id = (SELECT id_zona FROM zonas WHERE nombre = 'Zona Sur');

-- ============================================================================
-- 4. SENSORES POR ZONA
-- ============================================================================
INSERT INTO sensores (
  id_zona,
  codigo,
  tipo_sensor,
  ubicacion_detalle,
  estado_actual,
  ultimo_reporte,
  activo
) VALUES 
-- Sensores Zona Norte
(
  @zona_norte_id,
  'Z1-MOV-01',
  'MOVIMIENTO',
  'Portón Principal',
  'ACTIVO',
  NOW(),
  true
),
(
  @zona_norte_id,
  'Z1-MAG-01',
  'MAGNETICO',
  'Puerta Peatonal',
  'INACTIVO',
  NOW(),
  true
),
-- Sensores Zona Sur
(
  @zona_sur_id,
  'Z2-MOV-01',
  'MOVIMIENTO',
  'Entrada Garaje',
  'INACTIVO',
  NOW(),
  true
),
(
  @zona_sur_id,
  'Z2-MAG-01',
  'MAGNETICO',
  'Ventana Trasera',
  'ACTIVO',
  NOW(),
  true
);

SET @sensor_zn_mov = (SELECT id_sensor FROM sensores WHERE codigo = 'ZN-MOV-01');
SET @sensor_zn_mag = (SELECT id_sensor FROM sensores WHERE codigo = 'ZN-MAG-01');
SET @sensor_zs_mov = (SELECT id_sensor FROM sensores WHERE codigo = 'ZS-MOV-01');
SET @sensor_zs_mag = (SELECT id_sensor FROM sensores WHERE codigo = 'ZS-MAG-01');

-- ============================================================================
-- 5. PROGRAMACIONES HORARIAS
-- ============================================================================
INSERT INTO programaciones_zona (
  id_zona,
  dias_semana,
  hora_inicio,
  hora_fin,
  activa
) VALUES 
(
  @zona_norte_id,
  'lunes,martes,miercoles,jueves,viernes',
  '18:00',
  '06:00',
  true
),
(
  @zona_sur_id,
  'sabado,domingo',
  '20:00',
  '08:00',
  true
);

-- ============================================================================
-- 6. COMANDOS DE CONTROL
-- ============================================================================
INSERT INTO comandos_control (
  id_usuario,
  id_zona,
  accion,
  payload,
  topic_enviado
) VALUES 
(
  @user_admin,
  @zona_norte_id,
  'ARMAR',
  '{"accion":"ARMAR", "timestamp":"2026-05-24T18:00:00Z"}',
  'jardin/zona1/comando'
);

SET @ultimo_comando = LAST_INSERT_ID();

-- ============================================================================
-- 7. EVENTOS
-- ============================================================================
INSERT INTO eventos (
  id_zona,
  id_sensor,
  id_comando,
  tipo_evento,
  descripcion,
  fecha_hora
) VALUES 
-- Evento de armado por comando
(
  @zona_norte_id,
  NULL,
  @ultimo_comando,
  'ARMADA',
  'Zona armada exitosamente vía comando web',
  NOW() - INTERVAL 1 HOUR
),
-- Detección de movimiento
(
  @zona_norte_id,
  @sensor_zn_mov,
  NULL,
  'MOVIMIENTO_DETECTADO',
  'Movimiento detectado en Portón Principal',
  NOW() - INTERVAL 30 MINUTE
),
-- Apertura de puerta
(
  @zona_sur_id,
  @sensor_zs_mag,
  NULL,
  'PUERTA_ABIERTA',
  'Apertura detectada en Ventana Trasera',
  NOW() - INTERVAL 15 MINUTE
);

SET @evento_critico = (SELECT id_evento FROM eventos WHERE tipo_evento = 'MOVIMIENTO_DETECTADO' ORDER BY id_evento DESC LIMIT 1);

-- ============================================================================
-- 8. ALERTAS
-- ============================================================================
INSERT INTO alertas (
  id_evento,
  id_usuario_destino,
  canal,
  telefono_destino,
  estado_alerta,
  fecha_generada,
  fecha_notificada
) VALUES 
(
  @evento_critico,
  @user_admin,
  'SMS',
  '3113746267',
  'ENVIADA',
  NOW() - INTERVAL 29 MINUTE,
  NOW() - INTERVAL 28 MINUTE
);

-- ============================================================================
-- RESUMEN DE DATOS CARGADOS
-- ============================================================================
-- Usuarios: 3
-- Dispositivos: 2
-- Zonas: 2
-- Sensores: 4
-- Programaciones: 2
-- Comandos: 1
-- Eventos: 3
-- Alertas: 1
-- ============================================================================
