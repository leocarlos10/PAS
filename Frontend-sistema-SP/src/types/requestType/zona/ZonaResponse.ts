import type { SensorResponse } from "./SensorResponse";
import type { ProgramacionHoraria } from "./ProgramacionHoraria";

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
    programaciones?: ProgramacionHoraria[];
}
