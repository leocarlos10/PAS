import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { NavLink, useLocation } from "react-router-dom"
import logo from "@/assets/logo_sistema_seguridad_perimetral_v4.svg"
import { ProfileMenu } from "../../ui"

const itemStyles =
  `text-sidebar-foreground/70 
  hover:bg-primary/10 
  hover:text-primary 
  data-active:bg-primary/15 
  data-active:text-primary 
  data-active:ring-1 
  data-active:ring-primary/40
  group-data-[collapsible=icon]:justify-center
  `

export const AppSidebar = () => {
  const { pathname } = useLocation()
  const isZonas = pathname.startsWith("/admin/zonas")
  const isHistorial = pathname.startsWith("/admin/historial")
  const isUsuarios = pathname.startsWith("/admin/usuarios")

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className=" p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center group-data-[collapsible=icon]:justify-center">
            <img
              src={logo}
              alt="Guardia Perimetral"
              className="h-20 w-20 object-cover rounded-full"
            />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Seguridad</span>
            <span className="text-sm font-semibold">Perimetral</span>
          </div>
        </div>
        <div className="space-y-1 pl-5 group-data-[collapsible=icon]:hidden">
          <span className="text-xs uppercase tracking-wide text-sidebar-foreground/60">
            Security Admin
          </span>
          <div className="flex items-center gap-2 text-xs text-success">
            <span className="size-2 rounded-full bg-success" />
            <span>System Status: MQTT Online</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isZonas}
                  tooltip="Zonas"
                  className={itemStyles}
                >
                  <NavLink to="/admin/zonas">
                    <span className="material-symbols-outlined">shield</span>
                    <span className="group-data-[collapsible=icon]:hidden">Zonas</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isHistorial}
                  tooltip="Historial"
                  className={itemStyles}
                >
                  <NavLink to="/admin/historial" >
                    <span className="material-symbols-outlined">list</span>
                    <span className="group-data-[collapsible=icon]:hidden">Historial</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isUsuarios}
                  tooltip="Usuarios"
                  className={itemStyles}
                >
                  <NavLink to="/admin/usuarios">
                    <span className="material-symbols-outlined">group</span>
                    <span className="group-data-[collapsible=icon]:hidden">Usuarios</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="gap-3 p-4 group-data-[collapsible=icon]:p-2">
        <ProfileMenu />
        <SidebarGroup className="p-0">
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
