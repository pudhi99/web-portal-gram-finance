export interface CloudinaryUploadResult {
  public_id: string
  url: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
  bytes: number
  created_at: string
}

export interface CloudinaryResponse {
  success: boolean
  result?: CloudinaryUploadResult
  error?: string
}

export interface ImageOptimizationOptions {
  width?: number | 'auto'
  height?: number | 'auto'
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'auto'
  quality?: number | 'auto'
  format?: string | 'auto'
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west'
}

export interface CloudinaryTransformation {
  width?: number | string
  height?: number | string
  crop?: string
  quality?: number | string
  format?: string
  gravity?: string
  [key: string]: unknown
}

export interface UploadOptions {
  folder?: string
  public_id?: string
  overwrite?: boolean
  resource_type?: 'image' | 'video' | 'raw' | 'auto'
  transformation?: CloudinaryTransformation[]
} 