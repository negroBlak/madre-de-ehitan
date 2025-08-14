"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface TruckImageUploadProps {
  currentImageUrl?: string
  onImageUpdate: (imageUrl: string) => void
  onImageRemove: () => void
}

export function TruckImageUpload({ currentImageUrl, onImageUpdate, onImageRemove }: TruckImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido")
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es muy grande. Por favor selecciona una imagen menor a 5MB")
        return
      }

      setIsUploading(true)

      // Convertir archivo a base64 para mostrar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        // Simular carga de imagen
        setTimeout(() => {
          onImageUpdate(result)
          setIsUploading(false)
        }, 1000)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    onImageRemove()
    // Limpiar el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">Foto del Camión</Label>

          {currentImageUrl ? (
            <div className="relative">
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={currentImageUrl || "/placeholder.svg"}
                  alt="Foto del camión"
                  fill
                  className="object-cover"
                />
              </div>
              <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleRemoveImage}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={handleUploadClick}
            >
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">Sin foto del camión</p>
                <p className="text-xs text-gray-400">Haz clic para subir una imagen</p>
              </div>
            </div>
          )}

          {/* Input file oculto */}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

          <div className="space-y-3">
            <Button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Subiendo imagen...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Seleccionar imagen desde PC
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center">Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
