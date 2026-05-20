import { useState } from "react"
import type { AdminUserResponse, Response, UpdateUserRequest } from "@/types"
import type { SubmitEvent } from "react"
import { UpdateUserApi } from "@/api/usuarios.api"
import { useAuthContext } from "@/context/auth.context"
import { toast } from "sonner"
import { handleApiError, getErrorToastType } from "@/utils/apiErrorHandler"

type Props = {
  user: AdminUserResponse
  onClose: () => void
  onSaved?: (updated?: Partial<UpdateUserRequest>) => void
}

export const EditUserForm = ({ user, onClose, onSaved }: Props) => {
  const [saving, setSaving] = useState(false)
  const { token } = useAuthContext();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const name = (formData.get("name") as string) || ""
    const username = (formData.get("username") as string) || ""
    const phone = (formData.get("phone") as string) || ""


    // validación simple
    if (!name.trim() || !username.trim() || !phone.trim()) {
      toast.warning("Nombre, usuario y teléfono son obligatorios.")
      return
    }

    setSaving(true)
    try {

      const updated = await UpdateUserApi(user.id, { name, username, phone }, token) as Response<Partial<UpdateUserRequest>>

      // Usar el handler centralizado
      const result = handleApiError(updated)
      
      if (result.success && updated.data) {
        toast.success(result.message)
        onSaved?.(updated.data)
        onClose()
      } else {
        const toastType = getErrorToastType(result.statusCode)
        toast[toastType](result.message)
        console.error(`Error al actualizar usuario [${result.statusCode}]:`, result.message)
      }

     
    } catch (err: any) {
      console.error(err?.message ?? "Error al guardar")
      toast.error("Error al guardar los cambios")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="name">Nombre</label>
        <input
          className="w-full rounded border border-border bg-sidebar px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
          id="name"
          name="name"
          type="text"
          defaultValue={user.name ?? ""}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="username">Usuario</label>
        <input
          className="w-full rounded border border-border bg-sidebar px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
          id="username"
          name="username"
          type="text"
          defaultValue={user.username ?? ""}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="phone">Teléfono</label>
        <input
          className="w-full rounded border border-border bg-sidebar px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
          id="phone"
          name="phone"
          type="tel"
          defaultValue={user.phone ?? ""}
          required
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          className="inline-flex items-center justify-center rounded border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
          type="button"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          className="inline-flex items-center justify-center rounded bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
          type="submit"
          disabled={saving}
        >
          <span className="relative z-10 flex items-center gap-2">
            {saving ? "Guardando..." : "Guardar"}
            {saving && (
              <span className="material-symbols-outlined text-base sm:text-lg opacity-60 animate-spin">
                progress_activity
              </span>
            )}
          </span>
        </button>
      </div>
    </form>
  )
}