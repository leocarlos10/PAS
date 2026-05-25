export type DiaSemana = "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo" | "todos";

export type ProgramacionHoraria = {
    id?: number;
    zonaId?: number;
    horaInicio: string; // Formato HH:mm
    horaFin: string; // Formato HH:mm
    diasSemana: DiaSemana[];
    activa: boolean;
};

export type ProgramacionHorariaRequest = {
    horaInicio: string;
    horaFin: string;
    diasSemana: DiaSemana[];
    activa: boolean;
};
