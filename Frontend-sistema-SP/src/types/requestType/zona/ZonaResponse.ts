import type { SensorResponse } from "./SensorResponse";

export type ZonaResponse = {
    id: number;
    dispositivoId?: number;
    nombre: string;
    descripcion?: string;
    ubicacion?: string;
    estadoActual?: string;
    modoControl?: string;
    activa: boolean;
    sensores?: SensorResponse[];
}
