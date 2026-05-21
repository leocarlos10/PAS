

import { useUser } from "@/hooks/useUser";
import type { rol } from "@/types/requestType/usuario/RegisterRequest";
import type { SubmitEvent } from "react"
import { toast } from "sonner";
import { handleApiError, getErrorToastType } from "@/utils/apiErrorHandler";

type FormCreateUserProps = {
    onClose: () => void;
    onSuccess?: () => void;
}

export const FormCreateUser = ({ onClose, onSuccess }: FormCreateUserProps) => {

    const { CreateUser, loading } = useUser();

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const username = (formData.get("username") as string) || ""
        const name = (formData.get("name") as string) || ""
        const phone = (formData.get("phone") as string) || ""
        const password = (formData.get("password") as string) || ""
        const role = (formData.get("role") as rol) || ""

        if (!username.trim() || !name.trim() || !phone.trim() || !password.trim() || !role.trim()) {
            toast.warning("Por favor completa todos los campos")
            return
        }

        const response = await CreateUser({ username, name, phone, password, role });

        // Usar el handler centralizado
        const result = handleApiError(response);

        if (result.success) {
            toast.success(result.message);
            onSuccess?.();
            onClose();
        } else {
            const toastType = getErrorToastType(result.statusCode);
            toast[toastType](result.message);
            console.error(`Error al crear usuario [${result.statusCode}]:`, result.message);
        }
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="username">
                    Username
                </label>
                <input
                    className="w-full rounded border border-border bg-sidebar px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                    id="username"
                    name="username"
                    placeholder="Usuario"
                    type="text"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="name">
                    Name
                </label>
                <input
                    className="w-full rounded border border-border bg-sidebar px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                    id="name"
                    name="name"
                    placeholder="Nombre"
                    type="text"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="phone">
                    Phone
                </label>
                <input
                    className="w-full rounded border border-border bg-sidebar px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                    id="phone"
                    name="phone"
                    placeholder="Telefono"
                    type="tel"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="password">
                    Password
                </label>
                <input
                    className="w-full rounded border border-border bg-sidebar px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                    id="password"
                    name="password"
                    placeholder="Contrasena"
                    type="password"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="role">
                    Rol
                </label>
                <select
                    className="w-full rounded border border-border bg-sidebar px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                    id="role"
                    name="role"
                    required
                >
                    <option value="">Seleccionar rol...</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USUARIO">Usuario</option>
                </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
                <button
                    className="inline-flex items-center justify-center rounded border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                    type="reset"
                >
                    Limpiar
                </button>
                <button
                    className="inline-flex items-center justify-center rounded bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent/90 cursor-pointer"
                    type="submit"
                >
                    <span className="relative z-10 flex items-center gap-2 ">
                        Guardar
                        {loading && (
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
