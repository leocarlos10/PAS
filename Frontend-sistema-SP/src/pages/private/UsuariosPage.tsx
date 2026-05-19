import { AdminHeader } from "@/components/admin/Layout/AdminHeader"
import { UserCard, UserCardSkeleton } from "@/components/admin/User"
import { useUser } from "@/hooks/useUser"
import type { AdminUserResponse } from "@/types"
import { useEffect, useState } from "react"

export const UsuariosPage = () => {
  const { GetAllUsers, loading } = useUser()
  const [users, setUsers] = useState<AdminUserResponse[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await GetAllUsers()
      if (response?.responseCode === 200 && response.data) {
        setUsers(response.data)
      } else {
        console.error(response?.responseMessage || "Error al obtener usuarios")
      }
    }

    fetchUsers()
  }, [GetAllUsers])

  const reloadUsers = async () => {
    const response = await GetAllUsers()
    if (response?.responseCode === 200 && response.data) {
      setUsers(response.data)
    } else {
      console.error(response?.responseMessage || "Error al obtener usuarios")
    }
  }

  return (
    <div className="p-6">
      <AdminHeader
        title="Usuarios"
        description="Administracion de usuarios."
        showButton = {true}
        descriptionButton = "Agregar Usuario"
        reloadUsers={reloadUsers}

      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, index) => (
          <UserCardSkeleton key={`user-skeleton-${index}`} />
        ))}
        {!loading && users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </section>
    </div>
  )
}
