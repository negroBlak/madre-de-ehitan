"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, Shield, ArrowLeft, UserCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getAllUsers, createUser, updateUser, deleteUser, type FuelUser } from "@/lib/fuel-service"

export default function UsersPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<FuelUser[]>(getAllUsers())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<FuelUser | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "operator" as "admin" | "operator",
  })

  const handleCreateUser = () => {
    if (!formData.name || !formData.username || !formData.password) return

    const newUser = createUser({
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: formData.role,
    })

    setUsers(getAllUsers())
    setFormData({ name: "", username: "", password: "", role: "operator" })
    setIsCreateDialogOpen(false)
  }

  const handleEditUser = () => {
    if (!editingUser || !formData.name || !formData.username) return

    updateUser(editingUser.id, {
      name: formData.name,
      username: formData.username,
      role: formData.role,
      ...(formData.password && { password: formData.password }),
    })

    setUsers(getAllUsers())
    setEditingUser(null)
    setFormData({ name: "", username: "", password: "", role: "operator" })
    setIsEditDialogOpen(false)
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) return // No permitir eliminar el usuario actual

    deleteUser(userId)
    setUsers(getAllUsers())
  }

  const openEditDialog = (user: FuelUser) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      username: user.username,
      password: "",
      role: user.role,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: "", username: "", password: "", role: "operator" })
    setEditingUser(null)
  }

  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="mb-4 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>

          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto border border-orange-100">
              <Shield className="h-16 w-16 text-orange-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Acceso Restringido</h3>
              <p className="text-gray-600">Solo los administradores pueden gestionar usuarios.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="mb-4 border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100 flex-1 mr-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600 mt-2">Administra los usuarios del sistema de combustible</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Completa la información para crear un nuevo usuario del sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Usuario</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Ej: jperez"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Contraseña segura"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: "admin" | "operator") => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operator">Operador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser}>Crear Usuario</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Usuarios</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{users.length}</div>
                <p className="text-xs text-gray-500 mt-1">Usuarios registrados</p>
              </CardContent>
            </Card>

            <Card className="border-amber-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Administradores</CardTitle>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Shield className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {users.filter((u) => u.role === "admin").length}
                </div>
                <p className="text-xs text-gray-500 mt-1">Con permisos completos</p>
              </CardContent>
            </Card>

            <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Operadores</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <UserCheck className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {users.filter((u) => u.role === "operator").length}
                </div>
                <p className="text-xs text-gray-500 mt-1">Usuarios operativos</p>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="border-orange-100 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg">
              <CardTitle className="text-gray-800">Lista de Usuarios</CardTitle>
              <CardDescription className="text-gray-600">Gestiona todos los usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-orange-100">
                    <TableHead className="text-gray-700">Usuario</TableHead>
                    <TableHead className="text-gray-700">Nombre</TableHead>
                    <TableHead className="text-gray-700">Rol</TableHead>
                    <TableHead className="text-gray-700">Estado</TableHead>
                    <TableHead className="text-right text-gray-700">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-orange-50 hover:bg-orange-25">
                      <TableCell className="font-medium text-gray-900">{user.username}</TableCell>
                      <TableCell className="text-gray-700">{user.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "admin" ? "default" : "secondary"}
                          className={
                            user.role === "admin"
                              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          }
                        >
                          {user.role === "admin" ? "Administrador" : "Operador"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          Activo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="border-orange-200 text-orange-700 hover:bg-orange-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.id !== currentUser?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogDescription>Modifica la información del usuario seleccionado.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nombre Completo</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-username">Usuario</Label>
                  <Input
                    id="edit-username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Dejar vacío para mantener la actual"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Rol</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "operator") => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operator">Operador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditUser}>Guardar Cambios</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
