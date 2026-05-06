import { AdminLayout, HistorialPage, UsuariosPage, ZonasPage } from "@/pages/private"
import { InicioSesionPage } from "@/pages/public"
import { Navigate, Route, Routes } from "react-router-dom"

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<InicioSesionPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="zonas" replace />} />
        <Route path="zonas" element={<ZonasPage />} />
        <Route path="historial" element={<HistorialPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
      </Route>
    </Routes>
  )
}

