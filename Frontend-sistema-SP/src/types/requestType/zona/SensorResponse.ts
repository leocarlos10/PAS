export type SensorResponse = {
    id: number;
    codigo: string;
    tipoSensor: string;
    ubicacionDetalle?: string;
    estadoActual?: string;
    ultimoReporte?: string;
    activo: boolean;
}
