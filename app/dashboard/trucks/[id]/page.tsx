"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TruckImageUpload } from "@/components/truck-image-upload"
import { ArrowLeft, Truck, Fuel, TrendingUp, Activity } from "lucide-react"
import { fuelService } from "@/lib/fuel-service"
import { useAuth } from "@/lib/auth-context"
import type { Truck as TruckType, FuelRecord, FuelConsumptionSummary } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

export default function TruckDetailPage() {
  const params = useParams()
  const truckId = params.id as string
  const { user } = useAuth()

  const [truck, setTruck] = useState<TruckType | null>(null)
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([])
  const [weeklyConsumption, setWeeklyConsumption] = useState<FuelConsumptionSummary | null>(null)
  const [monthlyConsumption, setMonthlyConsumption] = useState<FuelConsumptionSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTruckData()
  }, [truckId])

  const loadTruckData = async () => {
    try {
      const [truckData, recordsData, weeklyData, monthlyData] = await Promise.all([
        fuelService.getTruckById(truckId),
        fuelService.getFuelRecordsByTruck(truckId),
        fuelService.getConsumptionSummary(truckId, "week"),
        fuelService.getConsumptionSummary(truckId, "month"),
      ])

      setTruck(truckData)
      setFuelRecords(recordsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
      setWeeklyConsumption(weeklyData)
      setMonthlyConsumption(monthlyData)
    } catch (error) {
      console.error("Error loading truck data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpdate = async (imageUrl: string) => {
    try {
      const updatedTruck = await fuelService.updateTruckImage(truckId, imageUrl)
      if (updatedTruck) {
        setTruck(updatedTruck)
      }
    } catch (error) {
      console.error("Error updating truck image:", error)
    }
  }

  const handleImageRemove = async () => {
    try {
      const updatedTruck = await fuelService.removeTruckImage(truckId)
      if (updatedTruck) {
        setTruck(updatedTruck)
      }
    } catch (error) {
      console.error("Error removing truck image:", error)
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

  if (!truck) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Camión no encontrado</h2>
            <p className="text-gray-600 mb-4">El camión que buscas no existe o fue eliminado.</p>
            <Button asChild>
              <Link href="/dashboard/trucks">Volver a Camiones</Link>
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const fuelPercentage = (truck.currentFuel / truck.maxCapacity) * 100
  const getFuelStatus = (currentFuel: number, maxCapacity: number) => {
    const percentage = (currentFuel / maxCapacity) * 100
    if (percentage < 25) return { status: "Crítico", color: "destructive" as const }
    if (percentage < 50) return { status: "Bajo", color: "secondary" as const }
    if (percentage < 75) return { status: "Medio", color: "default" as const }
    return { status: "Alto", color: "default" as const }
  }

  const fuelStatus = getFuelStatus(truck.currentFuel, truck.maxCapacity)

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
            >
              <Link href="/dashboard/trucks">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-3 rounded-lg border border-orange-200">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {truck.name}
                </h1>
                <p className="text-gray-600 font-mono">{truck.plateNumber}</p>
              </div>
            </div>
            <Badge variant={fuelStatus.color} className="ml-auto">
              {fuelStatus.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800">Foto del Camión</CardTitle>
                </CardHeader>
                <CardContent>
                  {truck.imageUrl ? (
                    <div className="space-y-4">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={truck.imageUrl || "/placeholder.svg"}
                          alt={`Foto de ${truck.name}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {user?.role === "admin" && (
                        <TruckImageUpload
                          currentImageUrl={truck.imageUrl}
                          onImageUpdate={handleImageUpdate}
                          onImageRemove={handleImageRemove}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-full h-48 rounded-lg border-2 border-dashed border-orange-300 flex items-center justify-center bg-orange-50">
                        <div className="text-center">
                          <Truck className="h-12 w-12 text-orange-400 mx-auto mb-2" />
                          <p className="text-sm text-orange-600">Sin foto del camión</p>
                        </div>
                      </div>
                      {user?.role === "admin" && (
                        <TruckImageUpload onImageUpdate={handleImageUpdate} onImageRemove={handleImageRemove} />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Combustible Actual</CardTitle>
                  <Fuel className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{truck.currentFuel} gal</div>
                  <div className="mt-2">
                    <Progress value={fuelPercentage} className="h-2" />
                    <p className="text-xs text-blue-600 mt-1">
                      {fuelPercentage.toFixed(1)}% de {truck.maxCapacity} gal
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Consumo Semanal</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {weeklyConsumption?.totalConsumption || 0} gal
                  </div>
                  <p className="text-xs text-green-600">
                    {weeklyConsumption?.averageDaily.toFixed(1) || 0} gal/día promedio
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Consumo Mensual</CardTitle>
                  <Activity className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {monthlyConsumption?.totalConsumption || 0} gal
                  </div>
                  <p className="text-xs text-purple-600">{monthlyConsumption?.recordCount || 0} registros</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="history" className="space-y-4">
            <TabsList className="bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200">
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
              >
                Historial
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
              >
                Estadísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-800">Historial de Combustible</CardTitle>
                </CardHeader>
                <CardContent>
                  {fuelRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay registros de combustible para este camión</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fuelRecords.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${record.type === "refuel" ? "bg-green-100" : "bg-red-100"}`}
                            >
                              <Fuel
                                className={`h-4 w-4 ${record.type === "refuel" ? "text-green-600" : "text-red-600"}`}
                              />
                            </div>
                            <div>
                              <p className="font-medium">
                                {record.type === "refuel" ? "Recarga" : "Consumo"}: {record.gallons} galones
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {record.timestamp.toLocaleDateString()} - {record.timestamp.toLocaleTimeString()}
                              </p>
                              {record.notes && <p className="text-sm text-gray-600">{record.notes}</p>}
                            </div>
                          </div>
                          <Badge variant={record.type === "refuel" ? "default" : "secondary"}>
                            {record.type === "refuel" ? "+" : "-"}
                            {record.gallons} gal
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-orange-800">Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-orange-700">Capacidad máxima:</span>
                      <span className="font-medium text-orange-900">{truck.maxCapacity} galones</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">Combustible actual:</span>
                      <span className="font-medium text-orange-900">{truck.currentFuel} galones</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">Fecha de registro:</span>
                      <span className="font-medium text-orange-900">{truck.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">Total de registros:</span>
                      <span className="font-medium text-orange-900">{fuelRecords.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-amber-800">Resumen de Consumo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-amber-700">Esta semana:</span>
                      <span className="font-medium text-amber-900">{weeklyConsumption?.totalConsumption || 0} gal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Este mes:</span>
                      <span className="font-medium text-amber-900">
                        {monthlyConsumption?.totalConsumption || 0} gal
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Promedio diario:</span>
                      <span className="font-medium text-amber-900">
                        {weeklyConsumption?.averageDaily.toFixed(1) || 0} gal
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Eficiencia:</span>
                      <span className="font-medium text-green-600">85%</span>
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
