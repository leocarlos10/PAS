import { useAuthContext } from "@/context/auth.context"
import type { AdminUserResponse } from "@/types"
import { Dialog } from "../../ui/dialog"
import { useState } from "react"
import { EditUserForm } from "./EditUserForm"
import { toast } from "sonner"
import { ChangeUserStatusApi } from "@/api/usuarios.api"

type UserCardProps = {
  user: AdminUserResponse
}

const estadoStyles: Record<string, string> = {
  Activo: "border-success/30 bg-success/15 text-success-muted",
  Inactivo: "border-neutral/30 bg-neutral/15 text-neutral-muted",
}

export const UserCard = ({ user }: UserCardProps) => {
  const { auth, logout,token } = useAuthContext()
  const isAdmin = Boolean(auth?.roles?.includes("ROLE_ADMIN") || auth?.roles?.includes("ADMIN"))
  const [currentUser, setCurrentUser] = useState(user)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const estado = currentUser.active ? "Activo" : "Inactivo"

  const handleUserUpdated = (updated?: AdminUserResponse) => {
    if (!updated) return
    if (auth && updated.id === auth.id) {
      toast.info("Has actualizado tu propio usuario. Se cerrara la sesion para refrescar los datos.")
      logout()
      return
    }
    setCurrentUser(updated)
  }

  const handleChangeUserStatus = async (newStatus: boolean) => {
    try {
      setIsLoading(true)

      const response = await ChangeUserStatusApi(currentUser.id, newStatus, token)
      
      if (response && response.responseCode === 200 && response.data) {
        setCurrentUser(response.data)
        const statusText = newStatus ? "Activo" : "Inactivo"
        toast.success(`Usuario ${statusText} correctamente`)
      } else {
        const errorMsg = response?.errorList?.[0]?.message || "No se pudo cambiar el estado"
        toast.error(`Error: ${errorMsg}`)
      }
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error)
      toast.error("Error al cambiar el estado del usuario")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <article className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted">
            <span className="material-symbols-outlined text-[24px]">person</span>
          </div>
          <div>
            <h3 className="text-base font-semibold">{currentUser.name}</h3>
            <p className="text-xs text-muted-foreground">{currentUser.username}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            estadoStyles[estado]
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {estado}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">Rol</span>
          <p className="text-sm text-foreground">{currentUser.role}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">Telefono</span>
          <p className="text-sm text-foreground">{currentUser.phone}</p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted cursor-pointer disabled:opacity-50 "
            onClick={() => setIsEditOpen(true)}
            disabled={isLoading}
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Editar
          </button>

        {isAdmin && (estado === "Activo" ? (
          <button 
            className="inline-flex items-center justify-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-muted transition-colors hover:bg-danger/20 disabled:opacity-50 cursor-pointer"
            onClick={() => handleChangeUserStatus(false)}
            disabled={isLoading}
          >
            <span className="material-symbols-outlined text-[16px]">block</span>
            Desactivar
          </button>
        ) : (
          <button 
            className="inline-flex items-center justify-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-muted transition-colors hover:bg-success/20 disabled:opacity-50 cursor-pointer"
            onClick={() => handleChangeUserStatus(true)}
            disabled={isLoading}
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Activar
          </button>
        ))}
      </div>

      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <EditUserForm user={currentUser} onClose={() => setIsEditOpen(false)} onSaved={handleUserUpdated} />
      </Dialog>
    </article>
  )
}