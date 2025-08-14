"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Fuel, Plus, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { fuelService } from "@/lib/fuel-service"
import { useAuth } from "@/lib/auth-context"
import type { Truck, CompanyTank, FuelRecord } from "@/lib/types"

export default function FuelPage() {
  const { user } = useAuth()
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [companyTank, setCompanyTank] = useState<CompanyTank | null>(null)
  const [recentRecords, setRecentRecords] = useState<FuelRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form states
  const [refuelForm, setRefuelForm] = useState({
    truckId: "",
    gallons: "",
    notes: "",
  })

  const [consumptionForm, setConsumptionForm] = useState({
    truckId: "",
    gallons: "",
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [trucksData, tankData, recordsData] = await Promise.all([
        fuelService.getTrucks(),
        fuelService.getCompanyTank(),
        fuelService.getFuelRecords(),
      ])
      setTrucks(trucksData)
      setCompanyTank(tankData)
      setRecentRecords(recordsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10))
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefuel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !companyTank) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const gallons = Number.parseFloat(refuelForm.gallons)
      const selectedTruck = trucks.find((t) => t.id === refuelForm.truckId)

      if (!selectedTruck) {
        throw new Error("Camión no encontrado")
      }

      // Validaciones
      if (gallons <= 0) {
        throw new Error("La cantidad debe ser mayor a 0")
      }

      if (gallons > companyTank.currentFuel) {
        throw new Error(
          `No hay suficiente combustible en el tanque principal (disponible: ${companyTank.currentFuel} gal)`,
        )
      }

      if (selectedTruck.currentFuel + gallons > selectedTruck.maxCapacity) {
        throw new Error(
          `El camión no puede recibir ${gallons} galones. Capacidad disponible: ${selectedTruck.maxCapacity - selectedTruck.currentFuel} gal`,
        )
      }

      // Registrar la recarga
      await fuelService.addFuelRecord({
        truckId: refuelForm.truckId,
        userId: user.id,
        gallons,
        type: "refuel",
        timestamp: new Date(),
        notes: refuelForm.notes,
      })

      setMessage({ type: "success", text: `Recarga registrada exitosamente: ${gallons} galones` })
      setRefuelForm({ truckId: "", gallons: "", notes: "" })
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Error al registrar la recarga" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConsumption = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const gallons = Number.parseFloat(consumptionForm.gallons)
      const selectedTruck = trucks.find((t) => t.id === consumptionForm.truckId)

      if (!selectedTruck) {
        throw new Error("Camión no encontrado")
      }

      // Validaciones
      if (gallons <= 0) {
        throw new Error("La cantidad debe ser mayor a 0")
      }

      if (gallons > selectedTruck.currentFuel) {
        throw new Error(`El camión no tiene suficiente combustible (disponible: ${selectedTruck.currentFuel} gal)`)
      }

      // Registrar el consumo
      await fuelService.addFuelRecord({
        truckId: consumptionForm.truckId,
        userId: user.id,
        gallons,
        type: "consumption",
        timestamp: new Date(),
        notes: consumptionForm.notes,
      })

      setMessage({ type: "success", text: `Consumo registrado exitosamente: ${gallons} galones` })
      setConsumptionForm({ truckId: "", gallons: "", notes: "" })
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Error al registrar el consumo" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const tankPercentage = companyTank ? (companyTank.currentFuel / companyTank.maxCapacity) * 100 : 0
  const lowFuelTrucks = trucks.filter((truck) => truck.currentFuel < 20).length

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registro de Combustible</h1>
            <p className="text-gray-600">Gestiona las recargas y consumos de combustible de la flota</p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tanque Principal</CardTitle>
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{companyTank?.currentFuel || 0} gal</div>
                <div className="mt-2">
                  <Progress value={tankPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {tankPercentage.toFixed(1)}% de {companyTank?.maxCapacity || 0} gal
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Camiones Activos</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trucks.filter((t) => t.currentFuel > 10).length}</div>
                <p className="text-xs text-muted-foreground">de {trucks.length} camiones</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Combustible Bajo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{lowFuelTrucks}</div>
                <p className="text-xs text-muted-foreground">camiones con menos de 20 gal</p>
              </CardContent>
            </Card>
          </div>

          {/* Message */}
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Forms */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="refuel" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="refuel" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Recarga
                  </TabsTrigger>
                  <TabsTrigger value="consumption" className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Consumo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="refuel">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Registrar Recarga
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleRefuel} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="refuel-truck">Camión</Label>
                          <Select
                            value={refuelForm.truckId}
                            onValueChange={(value) => setRefuelForm({ ...refuelForm, truckId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un camión" />
                            </SelectTrigger>
                            <SelectContent>
                              {trucks.map((truck) => (
                                <SelectItem key={truck.id} value={truck.id}>
                                  {truck.name} ({truck.plateNumber}) - {truck.currentFuel}/{truck.maxCapacity} gal
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="refuel-gallons">Galones a Recargar</Label>
                          <Input
                            id="refuel-gallons"
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="20.5"
                            value={refuelForm.gallons}
                            onChange={(e) => setRefuelForm({ ...refuelForm, gallons: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="refuel-notes">Notas (opcional)</Label>
                          <Textarea
                            id="refuel-notes"
                            placeholder="Información adicional sobre la recarga..."
                            value={refuelForm.notes}
                            onChange={(e) => setRefuelForm({ ...refuelForm, notes: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Registrando..." : "Registrar Recarga"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="consumption">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" />
                        Registrar Consumo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleConsumption} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="consumption-truck">Camión</Label>
                          <Select
                            value={consumptionForm.truckId}
                            onValueChange={(value) => setConsumptionForm({ ...consumptionForm, truckId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un camión" />
                            </SelectTrigger>
                            <SelectContent>
                              {trucks.map((truck) => (
                                <SelectItem key={truck.id} value={truck.id}>
                                  {truck.name} ({truck.plateNumber}) - {truck.currentFuel} gal disponibles
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="consumption-gallons">Galones Consumidos</Label>
                          <Input
                            id="consumption-gallons"
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="15.0"
                            value={consumptionForm.gallons}
                            onChange={(e) => setConsumptionForm({ ...consumptionForm, gallons: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="consumption-notes">Notas (opcional)</Label>
                          <Textarea
                            id="consumption-notes"
                            placeholder="Ruta realizada, distancia recorrida, etc..."
                            value={consumptionForm.notes}
                            onChange={(e) => setConsumptionForm({ ...consumptionForm, notes: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                          {isSubmitting ? "Registrando..." : "Registrar Consumo"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Recent Records */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Registros Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay registros recientes</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentRecords.map((record) => {
                        const truck = trucks.find((t) => t.id === record.truckId)
                        return (
                          <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-1 rounded ${record.type === "refuel" ? "bg-green-100" : "bg-red-100"}`}
                              >
                                <Fuel
                                  className={`h-3 w-3 ${record.type === "refuel" ? "text-green-600" : "text-red-600"}`}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{truck?.name || "Camión desconocido"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {record.timestamp.toLocaleDateString()} {record.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant={record.type === "refuel" ? "default" : "secondary"}>
                              {record.type === "refuel" ? "+" : "-"}
                              {record.gallons} gal
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
