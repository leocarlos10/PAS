import { AdminHeader } from "@/components/admin/AdminHeader"

const USUARIOS_DATA = [
  {
    id: "user-01",
    nombre: "Carlos Mendoza",
    usuario: "c.mendoza",
    rol: "Administrador",
    telefono: "+52 55 1234 5678",
    estado: "Activo",
  },
  {
    id: "user-02",
    nombre: "Elena Rios",
    usuario: "e.rios",
    rol: "Responsable",
    telefono: "+52 55 8765 4321",
    estado: "Activo",
  },
  {
    id: "user-03",
    nombre: "Roberto Jimenez",
    usuario: "r.jimenez",
    rol: "Responsable",
    telefono: "+52 33 4455 6677",
    estado: "Inactivo",
  },
  {
    id: "user-04",
    nombre: "Lucia Salazar",
    usuario: "l.salazar",
    rol: "Operador",
    telefono: "+52 81 2233 8899",
    estado: "Activo",
  },
  {
    id: "user-05",
    nombre: "Diego Ortega",
    usuario: "d.ortega",
    rol: "Supervisor",
    telefono: "+52 33 5577 1122",
    estado: "Inactivo",
  },
  {
    id: "user-06",
    nombre: "Mariana Lopez",
    usuario: "m.lopez",
    rol: "Administrador",
    telefono: "+52 55 3344 7788",
    estado: "Activo",
  },
]

const estadoStyles: Record<string, string> = {
  Activo: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  Inactivo: "border-slate-500/30 bg-slate-500/15 text-slate-300",
}

export const UsuariosPage = () => {
  return (
    <div className="p-6">
      <AdminHeader
        title="Usuarios"
        description="Administracion de usuarios."
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {USUARIOS_DATA.map((usuario) => (
          <article
            key={usuario.id}
            className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <header className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
                  <span className="material-symbols-outlined text-[24px]">person</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold">{usuario.nombre}</h3>
                  <p className="text-xs text-muted-foreground">{usuario.usuario}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  estadoStyles[usuario.estado]
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {usuario.estado}
              </span>
            </header>

            <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">Rol</span>
                <p className="text-sm text-foreground">{usuario.rol}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">Telefono</span>
                <p className="text-sm text-foreground">{usuario.telefono}</p>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
              <button className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted">
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Editar
              </button>
              {usuario.estado === "Activo" ? (
                <button className="inline-flex items-center justify-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/20">
                  <span className="material-symbols-outlined text-[16px]">block</span>
                  Desactivar
                </button>
              ) : (
                <button className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 transition-colors hover:bg-emerald-500/20">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Activar
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
