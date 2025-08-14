"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Truck, Fuel, TrendingUp, AlertTriangle } from "lucide-react"
import { fuelService } from "@/lib/fuel-service"
import type { Truck as TruckType, CompanyTank } from "@/lib/types"

export function DashboardStats() {
  const [trucks, setTrucks] = useState<TruckType[]>([])
  const [companyTank, setCompanyTank] = useState<CompanyTank | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trucksData, tankData] = await Promise.all([fuelService.getTrucks(), fuelService.getCompanyTank()])
        setTrucks(trucksData)
        setCompanyTank(tankData)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalTrucks = trucks.length
  const activeTrucks = trucks.filter((truck) => truck.currentFuel > 10).length
  const lowFuelTrucks = trucks.filter((truck) => truck.currentFuel < 20).length
  const tankPercentage = companyTank ? (companyTank.currentFuel / companyTank.maxCapacity) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total de Camiones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Camiones</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTrucks}</div>
          <p className="text-xs text-muted-foreground">{activeTrucks} activos</p>
        </CardContent>
      </Card>

      {/* Tanque Principal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tanque Principal</CardTitle>
          <Fuel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{companyTank?.currentFuel || 0} gal</div>
          <div className="mt-2">
            <Progress value={tankPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{tankPercentage.toFixed(1)}% disponible</p>
          </div>
        </CardContent>
      </Card>

      {/* Combustible Bajo */}
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

      {/* Eficiencia */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">85%</div>
          <p className="text-xs text-muted-foreground">promedio de la flota</p>
        </CardContent>
      </Card>
    </div>
  )
}
