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
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Fuel, Plus, TrendingDown, AlertTriangle, BarChart3, Calendar, Truck, Activity } from "lucide-react"
import { fuelService } from "@/lib/fuel-service"
import { useAuth } from "@/lib/auth-context"
import type { CompanyTank, FuelRecord, Truck as TruckType } from "@/lib/types"

export default function TankPage() {
  const { user } = useAuth()
  const [companyTank, setCompanyTank] = useState<CompanyTank | null>(null)
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([])
  const [trucks, setTrucks] = useState<TruckType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [addFuelForm, setAddFuelForm] = useState({
    gallons: "",
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tankData, recordsData, trucksData] = await Promise.all([
        fuelService.getCompanyTank(),
        fuelService.getFuelRecords(),
        fuelService.getTrucks(),
      ])
      setCompanyTank(tankData)
      setFuelRecords(recordsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
      setTrucks(trucksData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFuel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !companyTank) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const gallons = Number.parseFloat(addFuelForm.gallons)

      if (gallons <= 0) {
        throw new Error("La cantidad debe ser mayor a 0")
      }

      if (companyTank.currentFuel + gallons > companyTank.maxCapacity) {
        throw new Error(
          `El tanque no puede recibir ${gallons} galones. Capacidad disponible: ${companyTank.maxCapacity - companyTank.currentFuel} gal`,
        )
      }

      // Actualizar el tanque principal
      await fuelService.updateCompanyTank(companyTank.currentFuel + gallons)

      setMessage({ type: "success", text: `Se agregaron ${gallons} galones al tanque principal` })
      setAddFuelForm({ gallons: "", notes: "" })
      setIsAddDialogOpen(false)
      loadData()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Error al agregar combustible" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="admin">
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

  if (!companyTank) {
    return (
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el tanque</h2>
            <p className="text-gray-600">No se pudo cargar la información del tanque principal.</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const tankPercentage = (companyTank.currentFuel / companyTank.maxCapacity) * 100
  const isLowFuel = tankPercentage < 25
  const isCriticalFuel = tankPercentage < 10

  // Calcular estadísticas
  const refuelRecords = fuelRecords.filter((r) => r.type === "refuel")
  const totalRefueled = refuelRecords.reduce((sum, r) => sum + r.gallons, 0)
  const averageRefuelPerTruck = trucks.length > 0 ? totalRefueled / trucks.length : 0

  // Registros recientes del tanque (simulados - en una implementación real tendrías un log específico del tanque)
  const recentTankActivity = refuelRecords.slice(0, 10)

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Control del Tanque Principal</h1>
              <p className="text-gray-600">Gestiona el suministro principal de combustible de la empresa</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Combustible
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Combustible al Tanque</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddFuel} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gallons">Galones a Agregar</Label>
                    <Input
                      id="gallons"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="500.0"
                      value={addFuelForm.gallons}
                      onChange={(e) => setAddFuelForm({ ...addFuelForm, gallons: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Capacidad disponible: {companyTank.maxCapacity - companyTank.currentFuel} galones
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas (opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Proveedor, número de factura, etc..."
                      value={addFuelForm.notes}
                      onChange={(e) => setAddFuelForm({ ...addFuelForm, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? "Agregando..." : "Agregar Combustible"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Alerts */}
          {isCriticalFuel && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Combustible Crítico:</strong> El tanque principal tiene menos del 10% de combustible (
                {companyTank.currentFuel} gal). Es urgente reabastecer.
              </AlertDescription>
            </Alert>
          )}
          {isLowFuel && !isCriticalFuel && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Combustible Bajo:</strong> El tanque principal tiene menos del 25% de combustible (
                {companyTank.currentFuel} gal). Considera reabastecer pronto.
              </AlertDescription>
            </Alert>
          )}

          {/* Message */}
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Tank Status */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-6 w-6" />
                Estado del Tanque Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{companyTank.currentFuel} gal</div>
                <p className="text-muted-foreground">de {companyTank.maxCapacity} galones totales</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Nivel de combustible</span>
                  <span>{tankPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={tankPercentage} className="h-4" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {companyTank.maxCapacity - companyTank.currentFuel}
                  </p>
                  <p className="text-sm text-muted-foreground">Capacidad disponible</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{companyTank.maxCapacity}</p>
                  <p className="text-sm text-muted-foreground">Capacidad máxima</p>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 inline mr-1" />
                Última actualización: {companyTank.lastUpdated.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Distribuido</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRefueled} gal</div>
                <p className="text-xs text-muted-foreground">a la flota de camiones</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio por Camión</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageRefuelPerTruck.toFixed(1)} gal</div>
                <p className="text-xs text-muted-foreground">combustible distribuido</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">92%</div>
                <p className="text-xs text-muted-foreground">utilización del tanque</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity */}
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList>
              <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
              <TabsTrigger value="analytics">Análisis</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Distribuciones Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentTankActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay actividad reciente</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentTankActivity.map((record) => {
                        const truck = trucks.find((t) => t.id === record.truckId)
                        return (
                          <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="bg-red-100 p-2 rounded-lg">
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium">Combustible distribuido a {truck?.name || "Camión"}</p>
                                <p className="text-sm text-muted-foreground">
                                  {record.timestamp.toLocaleDateString()} - {record.timestamp.toLocaleTimeString()}
                                </p>
                                {record.notes && <p className="text-sm text-gray-600">{record.notes}</p>}
                              </div>
                            </div>
                            <Badge variant="secondary">-{record.gallons} gal</Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen del Tanque</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacidad total:</span>
                      <span className="font-medium">{companyTank.maxCapacity} galones</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Combustible actual:</span>
                      <span className="font-medium">{companyTank.currentFuel} galones</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Porcentaje de llenado:</span>
                      <span className="font-medium">{tankPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <Badge variant={isCriticalFuel ? "destructive" : isLowFuel ? "secondary" : "default"}>
                        {isCriticalFuel ? "Crítico" : isLowFuel ? "Bajo" : "Normal"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas de Uso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total distribuido:</span>
                      <span className="font-medium">{totalRefueled} galones</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Número de recargas:</span>
                      <span className="font-medium">{refuelRecords.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Promedio por recarga:</span>
                      <span className="font-medium">
                        {refuelRecords.length > 0 ? (totalRefueled / refuelRecords.length).toFixed(1) : 0} gal
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Camiones activos:</span>
                      <span className="font-medium">{trucks.filter((t) => t.currentFuel > 10).length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
