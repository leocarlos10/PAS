import { AdminHeader } from "@/components/admin/AdminHeader"

const HISTORIAL_DATA = [
  {
    fecha: "2023-10-27 14:32:01",
    zona: "Sector Norte",
    sensor: "Cam-N-04",
    tipo: "Intrusion",
    severidad: "Alta",
  },
  {
    fecha: "2023-10-27 10:15:44",
    zona: "Acceso Principal",
    sensor: "Gate-P-01",
    tipo: "Desactivacion",
    severidad: "Baja",
  },
  {
    fecha: "2023-10-27 08:00:12",
    zona: "Perimetro Sur",
    sensor: "Motion-S-02",
    tipo: "Fallo Sensor",
    severidad: "Media",
  },
  {
    fecha: "2023-10-26 22:45:00",
    zona: "Acceso Principal",
    sensor: "Panel-P-01",
    tipo: "Activacion",
    severidad: "Baja",
  },
  {
    fecha: "2023-10-26 18:30:22",
    zona: "Sector Norte",
    sensor: "IR-N-05",
    tipo: "Intrusion",
    severidad: "Alta",
  },
  {
    fecha: "2023-10-26 16:12:09",
    zona: "Laboratorio",
    sensor: "Smoke-L-01",
    tipo: "Fallo Sensor",
    severidad: "Media",
  },
  {
    fecha: "2023-10-26 12:03:55",
    zona: "Bodega Central",
    sensor: "Door-B-03",
    tipo: "Activacion",
    severidad: "Baja",
  },
  {
    fecha: "2023-10-26 09:44:28",
    zona: "Perimetro Este",
    sensor: "Cam-E-02",
    tipo: "Intrusion",
    severidad: "Alta",
  },
  {
    fecha: "2023-10-25 22:18:40",
    zona: "Acceso Principal",
    sensor: "Gate-P-01",
    tipo: "Desactivacion",
    severidad: "Baja",
  },
  {
    fecha: "2023-10-25 20:05:12",
    zona: "Oficinas",
    sensor: "Motion-O-07",
    tipo: "Activacion",
    severidad: "Media",
  },
  {
    fecha: "2023-10-25 18:56:01",
    zona: "Estacionamiento",
    sensor: "Cam-P-09",
    tipo: "Intrusion",
    severidad: "Alta",
  },
  {
    fecha: "2023-10-25 15:22:33",
    zona: "Perimetro Sur",
    sensor: "Motion-S-04",
    tipo: "Fallo Sensor",
    severidad: "Media",
  },
  {
    fecha: "2023-10-25 12:10:47",
    zona: "Sector Norte",
    sensor: "IR-N-06",
    tipo: "Intrusion",
    severidad: "Alta",
  },
  {
    fecha: "2023-10-25 09:08:19",
    zona: "Recepcion",
    sensor: "Panel-R-02",
    tipo: "Activacion",
    severidad: "Baja",
  },
  {
    fecha: "2023-10-24 22:59:03",
    zona: "Bodega Central",
    sensor: "Door-B-04",
    tipo: "Desactivacion",
    severidad: "Baja",
  },
  {
    fecha: "2023-10-24 21:37:15",
    zona: "Perimetro Oeste",
    sensor: "Cam-W-01",
    tipo: "Intrusion",
    severidad: "Alta",
  },
  {
    fecha: "2023-10-24 19:26:42",
    zona: "Laboratorio",
    sensor: "Temp-L-03",
    tipo: "Fallo Sensor",
    severidad: "Media",
  },
  {
    fecha: "2023-10-24 17:05:58",
    zona: "Almacen",
    sensor: "Motion-A-02",
    tipo: "Activacion",
    severidad: "Baja",
  },
  {
    fecha: "2023-10-24 13:41:20",
    zona: "Perimetro Este",
    sensor: "Cam-E-05",
    tipo: "Intrusion",
    severidad: "Alta",
  },
  {
    fecha: "2023-10-24 10:12:34",
    zona: "Oficinas",
    sensor: "Door-O-01",
    tipo: "Desactivacion",
    severidad: "Baja",
  },
  {
    fecha: "2023-10-23 22:08:11",
    zona: "Sector Norte",
    sensor: "IR-N-07",
    tipo: "Intrusion",
    severidad: "Alta",
  },
  {
    fecha: "2023-10-23 19:47:05",
    zona: "Estacionamiento",
    sensor: "Cam-P-02",
    tipo: "Fallo Sensor",
    severidad: "Media",
  },
  {
    fecha: "2023-10-23 16:31:49",
    zona: "Recepcion",
    sensor: "Panel-R-01",
    tipo: "Activacion",
    severidad: "Baja",
  },
  {
    fecha: "2023-10-23 12:22:18",
    zona: "Perimetro Sur",
    sensor: "Motion-S-06",
    tipo: "Intrusion",
    severidad: "Alta",
  },
  {
    fecha: "2023-10-23 09:03:57",
    zona: "Bodega Central",
    sensor: "Door-B-01",
    tipo: "Desactivacion",
    severidad: "Baja",
  },
]

const tipoStyles: Record<string, string> = {
  Intrusion: "bg-red-500/15 text-red-300 border border-red-500/30",
  Desactivacion: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
  "Fallo Sensor": "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  Activacion: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
}

const severidadStyles: Record<string, string> = {
  Alta: "bg-red-500/15 text-red-300 border border-red-500/30",
  Media: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  Baja: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
}

export const HistorialPage = () => {
  return (
    <div className="p-6">
      <AdminHeader
        title="Historial"
        description="Eventos recientes del sistema."
      />

      <section className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted px-3 py-1 text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-[18px]">search</span>
            <input
              type="text"
              placeholder="Buscar eventos..."
              className="h-4 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              aria-label="Buscar eventos"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="max-h-[360px] overflow-x-auto overflow-y-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-muted/40">
                <tr className="border-b border-border text-xs font-semibold uppercase text-muted-foreground">
                  <th className="px-4 py-3">Fecha y hora</th>
                  <th className="px-4 py-3">Zona</th>
                  <th className="px-4 py-3">Sensor</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Severidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm text-foreground">
                {HISTORIAL_DATA.map((evento) => (
                  <tr key={`${evento.fecha}-${evento.sensor}`}>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {evento.fecha}
                    </td>
                    <td className="px-4 py-3">{evento.zona}</td>
                    <td className="px-4 py-3 text-muted-foreground">{evento.sensor}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          tipoStyles[evento.tipo]
                        }`}
                      >
                        {evento.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          severidadStyles[evento.severidad]
                        }`}
                      >
                        {evento.severidad}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
