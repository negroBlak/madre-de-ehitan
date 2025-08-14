"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Truck, Fuel, Calendar } from "lucide-react"
import { fuelService } from "@/lib/fuel-service"
import type { Truck as TruckType } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

export function TruckGrid() {
  const [trucks, setTrucks] = useState<TruckType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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

    loadTrucks()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-32 bg-orange-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-orange-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-orange-200 rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-orange-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getFuelStatus = (currentFuel: number, maxCapacity: number) => {
    const percentage = (currentFuel / maxCapacity) * 100
    if (percentage < 25) return { status: "Crítico", color: "destructive" as const }
    if (percentage < 50) return { status: "Bajo", color: "secondary" as const }
    if (percentage < 75) return { status: "Medio", color: "default" as const }
    return { status: "Alto", color: "default" as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Flota de Camiones
        </h2>
        <Button
          asChild
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
        >
          <Link href="/dashboard/trucks">Ver Todos</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trucks.map((truck) => {
          const fuelPercentage = (truck.currentFuel / truck.maxCapacity) * 100
          const fuelStatus = getFuelStatus(truck.currentFuel, truck.maxCapacity)

          return (
            <Card
              key={truck.id}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-orange-50 border-orange-200 hover:border-orange-300"
            >
              <CardHeader className="pb-3">
                {truck.imageUrl && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 bg-gray-100">
                    <Image
                      src={truck.imageUrl || "/placeholder.svg"}
                      alt={`Foto de ${truck.name}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-2 rounded-lg border border-orange-200">
                      <Truck className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-orange-900">{truck.name}</CardTitle>
                      <p className="text-sm text-orange-700 font-mono">{truck.plateNumber}</p>
                    </div>
                  </div>
                  <Badge variant={fuelStatus.color}>{fuelStatus.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Combustible Actual */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-orange-700">
                      <Fuel className="h-3 w-3" />
                      Combustible
                    </span>
                    <span className="font-medium text-orange-900">
                      {truck.currentFuel}/{truck.maxCapacity} gal
                    </span>
                  </div>
                  <Progress value={fuelPercentage} className="h-2" />
                  <p className="text-xs text-orange-600">{fuelPercentage.toFixed(1)}% del tanque</p>
                </div>

                {/* Información adicional */}
                <div className="flex items-center justify-between text-xs text-orange-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Registrado: {truck.createdAt.toLocaleDateString()}
                  </span>
                </div>

                {/* Botón de acción */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
                >
                  <Link href={`/dashboard/trucks/${truck.id}`}>Ver Detalles</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {trucks.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Truck className="h-12 w-12 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-orange-900 mb-2">No hay camiones registrados</h3>
          <p className="text-orange-700 mb-4">Agrega el primer camión a tu flota para comenzar</p>
          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
          >
            <Link href="/dashboard/trucks">Gestionar Camiones</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
