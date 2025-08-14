"use client"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardStats } from "@/components/dashboard-stats"
import { TruckGrid } from "@/components/truck-grid"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Bienvenida */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control</h1>
            <p className="text-gray-600">Resumen general del sistema de gestión de combustible</p>
          </div>

          {/* Estadísticas */}
          <DashboardStats />

          {/* Grid de Camiones */}
          <TruckGrid />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
