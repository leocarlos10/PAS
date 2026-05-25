import type { SubmitEvent } from "react"
import { toast } from "sonner"

type FormConfWifiProps = {
  onClose?: () => void
}

export const FormConfWifi = ({ onClose }: FormConfWifiProps) => {

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const wifiName = (formData.get("wifiName") as string) || ""
    const wifiPassword = (formData.get("wifiPassword") as string) || ""

    // Validaciones
    if (!wifiName.trim()) {
      toast.error("Por favor ingresa el nombre de la red Wi-Fi")
      return
    }

    if (!wifiPassword.trim()) {
      toast.error("Por favor ingresa la contraseña de Wi-Fi")
      return
    }

    if (wifiPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres")
      return
    }

    // Aquí ya tienes el FormData listo para enviar a tu API
    console.log("FormData listo para enviar:", {
      wifiName,
      wifiPassword,
    })

    try {
      // AGREGAR AQUÍ LA LÓGICA DE GUARDADO
      // const response = await tuAPI.saveWifiConfig(formData);
      
      toast.success("Configuración Wi-Fi guardada correctamente")
      e.currentTarget.reset()
      onClose?.()
    } catch (error) {
      console.error("Error al guardar configuración Wi-Fi:", error)
      toast.error("Error al guardar la configuración")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Input Nombre Wi-Fi */}
        <div className="space-y-2">
          <label
            htmlFor="wifiName"
            className="block text-sm font-medium text-foreground"
          >
            Nombre de la Red Wi-Fi (SSID)
          </label>
          <input
            id="wifiName"
            name="wifiName"
            type="text"
            placeholder="Ej: MiRedWiFi"
            className="w-full rounded border border-border bg-sidebar px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
            required
          />
          <p className="text-xs text-muted-foreground">
            El nombre de tu red Wi-Fi (visible en dispositivos cercanos)
          </p>
        </div>

        {/* Input Contraseña Wi-Fi */}
        <div className="space-y-2">
          <label
            htmlFor="wifiPassword"
            className="block text-sm font-medium text-foreground"
          >
            Contraseña Wi-Fi
          </label>
          <input
            id="wifiPassword"
            name="wifiPassword"
            type="password"
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded border border-border bg-sidebar px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
            required
          />
          <p className="text-xs text-muted-foreground">
            Contraseña con al menos 8 caracteres
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent/90 cursor-pointer"
        >
          Guardar Configuración
        </button>
      </div>
    </form>
  )
}
