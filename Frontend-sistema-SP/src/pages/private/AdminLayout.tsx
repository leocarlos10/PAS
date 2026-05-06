import { LayoutAdmin } from "@/components"
import { Outlet } from "react-router-dom"

export const AdminLayout = () => {
  return (
    <LayoutAdmin>
      <Outlet />
    </LayoutAdmin>
  )
}
