// Servicios para manejar los datos de combustible
import type { User, Truck, FuelRecord, CompanyTank, FuelConsumptionSummary } from "./types"
import { defaultUsers, defaultTrucks, defaultFuelRecords, defaultCompanyTank } from "./data"

// Simulación de almacenamiento local (en producción sería base de datos)
const users = [...defaultUsers]
const trucks = [...defaultTrucks]
const fuelRecords = [...defaultFuelRecords]
const companyTank = { ...defaultCompanyTank }

export const fuelService = {
  // Usuarios
  async getUsers(): Promise<User[]> {
    return users
  },

  async getUserByCredentials(username: string, password: string): Promise<User | null> {
    return users.find((u) => u.username === username && u.password === password) || null
  },

  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    users.push(newUser)
    return newUser
  },

  async updateUser(userId: string, userData: Partial<Omit<User, "id" | "createdAt">>): Promise<User | null> {
    const userIndex = users.findIndex((u) => u.id === userId)
    if (userIndex === -1) return null

    users[userIndex] = { ...users[userIndex], ...userData }
    return users[userIndex]
  },

  async deleteUser(userId: string): Promise<boolean> {
    const userIndex = users.findIndex((u) => u.id === userId)
    if (userIndex === -1) return false

    users.splice(userIndex, 1)
    return true
  },

  // Camiones
  async getTrucks(): Promise<Truck[]> {
    return trucks
  },

  async getTruckById(id: string): Promise<Truck | null> {
    return trucks.find((t) => t.id === id) || null
  },

  async createTruck(truckData: Omit<Truck, "id" | "createdAt">): Promise<Truck> {
    const newTruck: Truck = {
      ...truckData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    trucks.push(newTruck)
    return newTruck
  },

  async updateTruckFuel(truckId: string, newFuelAmount: number): Promise<void> {
    const truckIndex = trucks.findIndex((t) => t.id === truckId)
    if (truckIndex !== -1) {
      trucks[truckIndex].currentFuel = newFuelAmount
    }
  },

  async updateTruckImage(truckId: string, imageUrl: string): Promise<Truck | null> {
    const truckIndex = trucks.findIndex((t) => t.id === truckId)
    if (truckIndex === -1) return null

    trucks[truckIndex].imageUrl = imageUrl
    return trucks[truckIndex]
  },

  async removeTruckImage(truckId: string): Promise<Truck | null> {
    const truckIndex = trucks.findIndex((t) => t.id === truckId)
    if (truckIndex === -1) return null

    delete trucks[truckIndex].imageUrl
    return trucks[truckIndex]
  },

  // Tanque de la empresa
  async getCompanyTank(): Promise<CompanyTank> {
    return companyTank
  },

  async updateCompanyTank(newFuelAmount: number): Promise<void> {
    companyTank.currentFuel = newFuelAmount
    companyTank.lastUpdated = new Date()
  },

  // Registros de combustible
  async getFuelRecords(): Promise<FuelRecord[]> {
    return fuelRecords
  },

  async getFuelRecordsByTruck(truckId: string): Promise<FuelRecord[]> {
    return fuelRecords.filter((r) => r.truckId === truckId)
  },

  async addFuelRecord(recordData: Omit<FuelRecord, "id">): Promise<FuelRecord> {
    const newRecord: FuelRecord = {
      ...recordData,
      id: Date.now().toString(),
    }
    fuelRecords.push(newRecord)

    // Actualizar combustible del camión y tanque de la empresa
    if (recordData.type === "refuel") {
      const truck = trucks.find((t) => t.id === recordData.truckId)
      if (truck) {
        truck.currentFuel += recordData.gallons
        companyTank.currentFuel -= recordData.gallons
      }
    } else if (recordData.type === "consumption") {
      const truck = trucks.find((t) => t.id === recordData.truckId)
      if (truck) {
        truck.currentFuel = Math.max(0, truck.currentFuel - recordData.gallons)
      }
    }

    return newRecord
  },

  // Resúmenes de consumo
  async getConsumptionSummary(truckId: string, period: "week" | "month" | "year"): Promise<FuelConsumptionSummary> {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }

    const records = fuelRecords.filter(
      (r) => r.truckId === truckId && r.type === "consumption" && r.timestamp >= startDate,
    )

    const totalConsumption = records.reduce((sum, r) => sum + r.gallons, 0)
    const days = period === "week" ? 7 : period === "month" ? 30 : 365
    const averageDaily = totalConsumption / days

    return {
      truckId,
      period,
      totalConsumption,
      averageDaily,
      recordCount: records.length,
    }
  },
}

export function getAllUsers(): User[] {
  return users
}

export function createUser(userData: Omit<User, "id" | "createdAt">): User {
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date(),
  }
  users.push(newUser)
  return newUser
}

export function updateUser(userId: string, userData: Partial<Omit<User, "id" | "createdAt">>): User | null {
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex === -1) return null

  users[userIndex] = { ...users[userIndex], ...userData }
  return users[userIndex]
}

export function deleteUser(userId: string): boolean {
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex === -1) return false

  users.splice(userIndex, 1)
  return true
}

export type FuelUser = User
