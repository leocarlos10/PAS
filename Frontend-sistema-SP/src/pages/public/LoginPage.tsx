import logo from "@/assets/logo_sistema_seguridad_perimetral_v3.svg"
import { useAuth } from "@/hooks";
import type { LoginRequest } from "@/types";
import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";

export const InicioSesionPage = () => {

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  const {login, loading} = useAuth();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Obtenemos los datos del formulario
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Validamos que los campos no estén vacíos
    if (!username.trim() || !password.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    // ejecutamos el login con los datos del formulario
    const loginRequest = await login({ username, password } as LoginRequest);

    if(loginRequest && loginRequest.responseCode == 200){
      alert(`${loginRequest.responseMessage}, bienvenido ${loginRequest.data?.username}`);
      navigate("/admin");
    } else {
     console.error(loginRequest?.errorList, "Error en login");
     alert( `No se pudo iniciar sesion ${loginRequest?.errorList[0]?.message}` || "Error en login" );
    }

  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-12 flex items-center justify-center ">
        <div className="w-full max-w-[22rem] sm:max-w-md">
          <div className="relative rounded-2xl border border-border/10 bg-card/95 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur">
            {<div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />}
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Logo del sistema"
                    className="h-50 w-auto sm:h-60"
                  />
                </div>

                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                  Acceso restringido a personal autorizado
                </p>
              </div>

              <form className="space-y-3 sm:space-y-4"
                    onSubmit={handleSubmit}
              >
                <div>
                  <label className="sr-only" htmlFor="username">
                    Usuario
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg sm:text-xl text-muted-foreground">
                      person
                    </span>
                    <input
                      className="w-full rounded border border-border bg-sidebar py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                      id="username"
                      name="username"
                      placeholder="Usuario"
                      type="text"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="sr-only" htmlFor="password">
                    Contrasena
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg sm:text-xl text-muted-foreground">
                      lock
                    </span>
                    <input
                      className="w-full rounded border border-border bg-sidebar py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
                      id="password"
                      name="password"
                      placeholder="Contrasena"
                      type={showPassword ? "text" : "password"}
                      required
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground cursor-pointer"
                      type="button"
                      aria-label="Mostrar contrasena"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">visibility</span>
                    </button>
                  </div>
                </div>

                <div className="pt-1 sm:pt-2">
                  <button
                    className="group relative flex w-full items-center justify-center rounded bg-accent py-2.5 text-sm sm:text-base font-medium text-accent-foreground transition hover:bg-accent/90 cursor-pointer"
                    type="submit"
                  >
                    <span className="relative z-10 flex items-center gap-2 ">
                      Iniciar sesion
                      {loading && (
                             <span className="material-symbols-outlined text-base sm:text-lg opacity-60 animate-spin">
                        progress_activity
                      </span>
                      )}
                    </span>
                  </button>
                </div>
              </form>

              <div className="mt-6 sm:mt-8 border-t border-border/40 pt-3 sm:pt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-[0.6rem] sm:text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  <span className="material-symbols-outlined text-xs sm:text-sm">warning</span>
                  Solo personal autorizado puede acceder.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
