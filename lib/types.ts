// Tipos para el sistema de gestión de combustible

export interface User {
  id: string
  username: string
  password: string // En producción esto debería estar hasheado
  role: "admin" | "operator"
  name: string
  createdAt: Date
}

export interface Truck {
  id: string
  plateNumber: string
  name: string
  currentFuel: number // Galones actuales en el tanque del camión
  maxCapacity: number // Capacidad máxima del tanque del camión
  imageUrl?: string // URL de la imagen del camión
  createdAt: Date
}

export interface FuelRecord {
  id: string
  truckId: string
  userId: string // Usuario que registró el consumo
  gallons: number // Galones consumidos/agregados
  type: "consumption" | "refuel" // Tipo de registro
  timestamp: Date
  notes?: string
}

export interface CompanyTank {
  id: string
  name: string
  currentFuel: number // Galones actuales
  maxCapacity: number // Capacidad máxima
  lastUpdated: Date
}

export interface FuelConsumptionSummary {
  truckId: string
  period: "week" | "month" | "year"
  totalConsumption: number
  averageDaily: number
  recordCount: number
}
