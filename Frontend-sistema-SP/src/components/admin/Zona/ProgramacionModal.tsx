import { useState, useEffect, type SubmitEvent } from "react";
import type { ProgramacionHoraria, DiaSemana } from "@/types";
import { Dialog } from "@/components/ui/dialog";

type ProgramacionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  programacionActual?: ProgramacionHoraria;
  onSave: (programacion: Omit<ProgramacionHoraria, "id" | "zonaId">) => Promise<void>;
  isLoading?: boolean;
};

const diasSemanaOpciones: { valor: DiaSemana; etiqueta: string; corto: string }[] = [
  { valor: "lunes", etiqueta: "Lunes", corto: "L" },
  { valor: "martes", etiqueta: "Martes", corto: "M" },
  { valor: "miercoles", etiqueta: "Miércoles", corto: "M" },
  { valor: "jueves", etiqueta: "Jueves", corto: "J" },
  { valor: "viernes", etiqueta: "Viernes", corto: "V" },
  { valor: "sabado", etiqueta: "Sábado", corto: "S" },
  { valor: "domingo", etiqueta: "Domingo", corto: "D" },
];

export const ProgramacionModal = ({
  isOpen,
  onClose,
  programacionActual,
  onSave,
  isLoading = false,
}: ProgramacionModalProps) => {
  const [horaArmado, setHoraArmado] = useState("08:00");
  const [horaDesarmado, setHoraDesarmado] = useState("18:00");
  const [diasSeleccionados, setDiasSeleccionados] = useState<DiaSemana[]>([
    "lunes", "martes", "miercoles", "jueves", "viernes",
  ]);

  useEffect(() => {
    if (!isOpen) return;
    setHoraArmado(programacionActual?.horaInicio || "08:00");
    setHoraDesarmado(programacionActual?.horaFin || "18:00");
    setDiasSeleccionados(
      programacionActual?.diasSemana || ["lunes", "martes", "miercoles", "jueves", "viernes"]
    );
  }, [isOpen, programacionActual]);

  const handleDiaToggle = (dia: DiaSemana) => {
    if (diasSeleccionados.includes(dia)) {
      setDiasSeleccionados(diasSeleccionados.filter((d) => d !== dia));
    } else {
      setDiasSeleccionados([...diasSeleccionados, dia]);
    }
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (diasSeleccionados.length === 0) {
      alert("Selecciona al menos un día");
      return;
    }

    try {
      await onSave({
        horaInicio: horaArmado,
        horaFin: horaDesarmado,
        diasSemana: diasSeleccionados,
        activa: true,
      });
      onClose();
    } catch (error) {
      console.error("Error al guardar programación:", error);
    }
  };

  const esEdicion = Boolean(programacionActual?.id);

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            {esEdicion ? "Editar horario" : "Agregar horario"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Este horario se repetirá cada semana en los días seleccionados.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
            Días activos
          </label>
          <div className="flex justify-center gap-3 flex-wrap">
            {diasSemanaOpciones.map((dia) => (
              <button
                key={dia.valor}
                type="button"
                onClick={() => handleDiaToggle(dia.valor)}
                disabled={isLoading}
                title={dia.etiqueta}
                className={`w-12 h-12 rounded-full font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center ${
                  diasSeleccionados.includes(dia.valor)
                    ? "bg-cyan-500 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                }`}
              >
                {dia.corto}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Hora armado
            </label>
            <input
              type="time"
              value={horaArmado}
              onChange={(e) => setHoraArmado(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Hora desarmado
            </label>
            <input
              type="time"
              value={horaDesarmado}
              onChange={(e) => setHoraDesarmado(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 text-center"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2 font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || diasSeleccionados.length === 0}
            className="flex-1 rounded-lg bg-cyan-500 px-4 py-2 font-medium text-white transition-colors hover:bg-cyan-600 disabled:opacity-50"
          >
            {isLoading ? "Guardando..." : esEdicion ? "Actualizar" : "Agregar"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
