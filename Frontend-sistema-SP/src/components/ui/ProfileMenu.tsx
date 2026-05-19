import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { useAuthContext } from "@/context/auth.context";

export const ProfileMenu = () => {
    const [open, setOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const {logout, auth} = useAuthContext();
    const isAdmin = auth?.roles?.includes("ROLE_ADMIN") || auth?.roles?.includes("ADMIN");

    useEffect(()=> {

        // la funcion detecta los clicks fuera del contenedor
        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current) return;

            const clickedOutside = !containerRef.current.contains(event.target as Node);

            if (clickedOutside) {
                setOpen(false);
            }
        };

        // solo escucha clicks cuando el menú está abierto
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // cuando se cierra el componente, o se desmonta, se limpia el listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }

    }, [open])

    return (
        <div ref={containerRef} className="relative">
            {/* Botón trigger */}
            <button 
                onClick={() => setOpen(!open)}
                className=" 
                flex items-center 
                gap-3
                rounded-lg 
                bg-sidebar-accent/60 
                p-2 
                group-data-[collapsible=icon]:size-8
                group-data-[collapsible=icon]:justify-center 
                hover:bg-sidebar-accent/80 
                transition-colors
                cursor-pointer
                "
            >
                <div className="flex size-9 items-center justify-center rounded-full bg-sidebar group-data-[collapsible=icon]:size-6">
                    <span className="material-symbols-outlined">person</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-medium">
                        {
                            isAdmin ? "Administrador sistema" : "Usuario sistema"
                        }
                        </span>
                    <span className=" flex justify-start truncate text-xs text-sidebar-foreground/60">
                        {auth?.username}
                    </span>
                </div>
            </button>

            {/* Menú dropdown */}
            {open && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-50 overflow-hidden">
                    <a href="#configuracion" className="flex items-center gap-3 px-4 py-2.5 text-sm text-sidebar-foreground hover:bg-primary/15 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-base">settings</span>
                        <span>Configuración</span>
                    </a>
                    <div className="border-t border-sidebar-border/50"></div>
                    <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors">
                        <span className="material-symbols-outlined text-base">logout</span>
                        <Button
                            variant="ghost"
                            className="p-0 text-danger bg-transparent hover:bg-transparent shadow-none cursor-pointer"
                            onClick={logout}
                        >
                            Cerrar sesión
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
