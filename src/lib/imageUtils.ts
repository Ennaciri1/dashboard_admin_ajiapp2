const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export function getImageUrl(imagePath: string | undefined | null): string {
  if (!imagePath) return ''
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  
  // Concatenate with API base URL
  return `${API_BASE_URL}/${cleanPath}`
}

export function getImageUrls(imagePaths: string[] | undefined | null): string[] {
  if (!imagePaths || !Array.isArray(imagePaths)) return []
  return imagePaths.map(path => getImageUrl(path))
}
