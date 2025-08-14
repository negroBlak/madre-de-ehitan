"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Truck, Fuel, Calendar, Edit } from "lucide-react"
import { fuelService } from "@/lib/fuel-service"
import { useAuth } from "@/lib/auth-context"
import type { Truck as TruckType } from "@/lib/types"
import Link from "next/link"

export default function TrucksPage() {
  const { user } = useAuth()
  const [trucks, setTrucks] = useState<TruckType[]>([])
  const [filteredTrucks, setFilteredTrucks] = useState<TruckType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTruck, setNewTruck] = useState({
    plateNumber: "",
    name: "",
    maxCapacity: "",
    currentFuel: "",
  })

  useEffect(() => {
    loadTrucks()
  }, [])

  useEffect(() => {
    const filtered = trucks.filter(
      (truck) =>
        truck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredTrucks(filtered)
  }, [trucks, searchTerm])

  const loadTrucks = async () => {
    try {
      const trucksData = await fuelService.getTrucks()
      setTrucks(trucksData)
    } catch (error) {
      console.error("Error loading trucks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fuelService.createTruck({
        plateNumber: newTruck.plateNumber,
        name: newTruck.name,
        maxCapacity: Number.parseInt(newTruck.maxCapacity),
        currentFuel: Number.parseInt(newTruck.currentFuel),
      })
      setNewTruck({ plateNumber: "", name: "", maxCapacity: "", currentFuel: "" })
      setIsAddDialogOpen(false)
      loadTrucks()
    } catch (error) {
      console.error("Error adding truck:", error)
    }
  }

  const getFuelStatus = (currentFuel: number, maxCapacity: number) => {
    const percentage = (currentFuel / maxCapacity) * 100
    if (percentage < 25) return { status: "Crítico", color: "destructive" as const }
    if (percentage < 50) return { status: "Bajo", color: "secondary" as const }
    if (percentage < 75) return { status: "Medio", color: "default" as const }
    return { status: "Alto", color: "default" as const }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Camiones</h1>
              <p className="text-gray-600">Administra la flota de vehículos de la empresa</p>
            </div>
            {user?.role === "admin" && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Camión
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Camión</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddTruck} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="plateNumber">Número de Placa</Label>
                      <Input
                        id="plateNumber"
                        value={newTruck.plateNumber}
                        onChange={(e) => setNewTruck({ ...newTruck, plateNumber: e.target.value })}
                        placeholder="ABC-123"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Camión</Label>
                      <Input
                        id="name"
                        value={newTruck.name}
                        onChange={(e) => setNewTruck({ ...newTruck, name: e.target.value })}
                        placeholder="Camión Ruta Norte"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxCapacity">Capacidad Máxima (galones)</Label>
                      <Input
                        id="maxCapacity"
                        type="number"
                        value={newTruck.maxCapacity}
                        onChange={(e) => setNewTruck({ ...newTruck, maxCapacity: e.target.value })}
                        placeholder="80"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentFuel">Combustible Actual (galones)</Label>
                      <Input
                        id="currentFuel"
                        type="number"
                        value={newTruck.currentFuel}
                        onChange={(e) => setNewTruck({ ...newTruck, currentFuel: e.target.value })}
                        placeholder="45"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Agregar Camión
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre o placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Trucks Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrucks.map((truck) => {
                const fuelPercentage = (truck.currentFuel / truck.maxCapacity) * 100
                const fuelStatus = getFuelStatus(truck.currentFuel, truck.maxCapacity)

                return (
                  <Card key={truck.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <Truck className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{truck.name}</CardTitle>
                            <p className="text-sm text-muted-foreground font-mono">{truck.plateNumber}</p>
                          </div>
                        </div>
                        <Badge variant={fuelStatus.color}>{fuelStatus.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Combustible */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Fuel className="h-3 w-3" />
                            Combustible
                          </span>
                          <span className="font-medium">
                            {truck.currentFuel}/{truck.maxCapacity} gal
                          </span>
                        </div>
                        <Progress value={fuelPercentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">{fuelPercentage.toFixed(1)}% del tanque</p>
                      </div>

                      {/* Fecha de registro */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Registrado: {truck.createdAt.toLocaleDateString()}
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <Button asChild variant="outline" className="flex-1 bg-transparent">
                          <Link href={`/dashboard/trucks/${truck.id}`}>Ver Detalles</Link>
                        </Button>
                        {user?.role === "admin" && (
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {filteredTrucks.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron camiones</h3>
              <p className="text-gray-600">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "Agrega el primer camión a la flota"}
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
