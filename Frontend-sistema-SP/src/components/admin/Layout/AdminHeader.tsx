import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react" 
import { FormCreateUser } from "../User";

type AdminHeaderProps = {
    title: string;
    description: string;
    showLive?: boolean;
    showButton? : boolean
    descriptionButton?: string
    reloadUsers?: () => void

}


export const AdminHeader = ({ title, description, showLive, showButton, descriptionButton = "Agregar", reloadUsers }: AdminHeaderProps) => {
  // estado para controlar la apertura del modal de agregar usuario.
   const [open, setOpen] = useState<boolean>(false);

  return (
    <header className="mb-6 flex flex-col gap-2 border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {showLive && (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-success" />
                En vivo
              </span>
            )}
          </div>
          {showButton && (
            /* este boton es el encargado de abrir el modal */
            <Button size="lg"
             variant="outline" 
             className="border-success text-success hover:bg-success/10 cursor-pointer"
             onClick={() => setOpen(true)}
            >
              <span className="material-symbols-outlined mr-2 align-middle">add</span>
              {descriptionButton}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>

        <Dialog isOpen={open} onClose={() => setOpen(false)}>
          <FormCreateUser onClose={() => setOpen(false)} onSuccess={reloadUsers} />
        </Dialog>
      </header>
  )
}
