import cloudinary from '@/lib/cloudinary'
import { 
  CloudinaryResponse, 
  CloudinaryUploadResult, 
  ImageOptimizationOptions, 
  UploadOptions 
} from '@/types/cloudinary'

// Upload image to Cloudinary
export async function uploadToCloudinary(
  file: string, // Only accept string (base64 or URL)
  options: UploadOptions = {}
): Promise<CloudinaryResponse> {
  try {
    const {
      folder = 'uploads',
      public_id,
      overwrite = true,
      resource_type = 'auto',
      transformation = []
    } = options

    const result = await cloudinary.uploader.upload(file, {
      folder,
      public_id,
      overwrite,
      resource_type,
      transformation,
      quality: 'auto',
      fetch_format: 'auto',
    })

    return {
      success: true,
      result: {
        public_id: result.public_id,
        url: result.secure_url,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        created_at: result.created_at,
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Upload failed'
    }
  }
}

// Delete image from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<CloudinaryResponse> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return {
      success: result.result === 'ok',
      result: result as any
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Delete failed'
    }
  }
}

// Generate optimized image URL
export function getOptimizedImageUrl(
  publicId: string, 
  options: ImageOptimizationOptions = {}
): string {
  const {
    width = 'auto',
    height = 'auto',
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto'
  } = options

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: format,
    gravity,
    secure: true,
  })
}

// Get image details
export async function getImageDetails(publicId: string): Promise<CloudinaryResponse> {
  try {
    const result = await cloudinary.api.resource(publicId)
    return {
      success: true,
      result
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get image details'
    }
  }
}

// Upload multiple images
export async function uploadMultipleToCloudinary(
  files: string[], // Only accept string[] (base64 or URLs)
  options: UploadOptions = {}
): Promise<{
  successful: CloudinaryUploadResult[]
  failed: { error: string, index: number }[]
  total: number
}> {
  const uploadPromises = files.map(async (file, index) => {
    const result = await uploadToCloudinary(file, options)
    return { result, index }
  })

  const results = await Promise.all(uploadPromises)
  
  const successful: CloudinaryUploadResult[] = []
  const failed: { error: string, index: number }[] = []

  results.forEach(({ result, index }) => {
    if (result.success && result.result) {
      successful.push(result.result)
    } else {
      failed.push({ error: result.error || 'Unknown error', index })
    }
  })

  return {
    successful,
    failed,
    total: files.length
  }
} 