import logo from "@/assets/logo_sistema_seguridad_perimetral_v3.svg"
import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";

export const InicioSesionPage = () => {

  const [formEstate, setFormState] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
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

    // Simulamos un proceso de inicio de sesión
    setFormState(true);
    setTimeout(() => {
      setFormState(false);
      alert(`Bienvenido, ${username} - ${password}! inicio de sesion simulado .`);
      navigate("/admin");
    }, 2000);

  }

  return (
    <div className="min-h-screen bg-[#101414] text-[#e0e3e3]">
      <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-12 flex items-center justify-center ">
        <div className="w-full max-w-[22rem] sm:max-w-md">
          <div className="relative  rounded-2xl border border-[rgba(136,147,147,0.1)] bg-[linear-gradient(145deg,rgba(28,32,33,0.9)_0%,rgba(24,28,29,0.95)_100%)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur">
            {<div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-[#85d3da] to-transparent opacity-50" />}
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Logo del sistema"
                    className="h-50 w-auto sm:h-60"
                  />
                </div>

                <p className="mt-2 text-xs sm:text-sm text-[#bec8c9]">
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
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg sm:text-xl text-[#bec8c9]">
                      person
                    </span>
                    <input
                      className="w-full rounded border border-[#3f4949] bg-[#181c1d] py-2.5 pl-10 pr-3 text-sm text-[#e0e3e3] placeholder:text-[#889393] outline-none transition focus:border-[#85d3da] focus:ring-1 focus:ring-[#85d3da]"
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
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg sm:text-xl text-[#bec8c9]">
                      lock
                    </span>
                    <input
                      className="w-full rounded border border-[#3f4949] bg-[#181c1d] py-2.5 pl-10 pr-10 text-sm text-[#e0e3e3] placeholder:text-[#889393] outline-none transition focus:border-[#85d3da] focus:ring-1 focus:ring-[#85d3da]"
                      id="password"
                      name="password"
                      placeholder="Contrasena"
                      type={showPassword ? "text" : "password"}
                      required
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#889393] transition hover:text-[#e0e3e3] cursor-pointer"
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
                    className="group relative flex w-full items-center justify-center rounded bg-[#01696f] py-2.5 text-sm sm:text-base font-medium text-[#97e6ec] transition hover:bg-[#01838a]"
                    type="submit"
                  >
                    <span className="relative z-10 flex items-center gap-2 cursor-pointer">
                      Iniciar sesion
                      {formEstate && (
                             <span className="material-symbols-outlined text-base sm:text-lg opacity-60 animate-spin">
                        progress_activity
                      </span>
                      )}
                    </span>
                  </button>
                </div>
              </form>

              <div className="mt-6 sm:mt-8 border-t border-[#3f4949]/40 pt-3 sm:pt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-[0.6rem] sm:text-xs uppercase tracking-[0.28em] text-[#889393]">
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
