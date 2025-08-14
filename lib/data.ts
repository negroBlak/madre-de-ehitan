// Datos simulados para desarrollo
import type { User, Truck, FuelRecord, CompanyTank } from "./types"

// Usuario admin por defecto
export const defaultUsers: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123", // En producción usar hash
    role: "admin",
    name: "Administrador",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    username: "operator1",
    password: "op123",
    role: "operator",
    name: "Operador Juan",
    createdAt: new Date("2024-01-15"),
  },
]

// Camiones de ejemplo
export const defaultTrucks: Truck[] = [
  {
    id: "1",
    plateNumber: "ABC-123",
    name: "Camión Ruta Norte",
    currentFuel: 45,
    maxCapacity: 80,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    plateNumber: "DEF-456",
    name: "Camión Ruta Sur",
    currentFuel: 32,
    maxCapacity: 75,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    plateNumber: "GHI-789",
    name: "Camión Carga Pesada",
    currentFuel: 60,
    maxCapacity: 120,
    createdAt: new Date("2024-01-01"),
  },
]

// Tanque principal de la empresa
export const defaultCompanyTank: CompanyTank = {
  id: "1",
  name: "Tanque Principal",
  currentFuel: 500,
  maxCapacity: 1000,
  lastUpdated: new Date(),
}

// Registros de combustible de ejemplo
export const defaultFuelRecords: FuelRecord[] = [
  {
    id: "1",
    truckId: "1",
    userId: "2",
    gallons: 20,
    type: "refuel",
    timestamp: new Date("2024-01-10"),
    notes: "Llenado completo",
  },
  {
    id: "2",
    truckId: "1",
    userId: "2",
    gallons: 15,
    type: "consumption",
    timestamp: new Date("2024-01-12"),
    notes: "Ruta Norte - Día completo",
  },
  {
    id: "3",
    truckId: "2",
    userId: "2",
    gallons: 25,
    type: "refuel",
    timestamp: new Date("2024-01-11"),
    notes: "Llenado parcial",
  },
]
