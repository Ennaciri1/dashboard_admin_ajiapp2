const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || ''

/**
 * Builds full image URL by concatenating API base URL with image path
 * @param imagePath - The relative image path from API (e.g., "/uploads/public/hotels/image.jpg")
 * @returns Full image URL
 */
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return ''
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Remove trailing slash from base URL and leading slash from path if needed
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  return `${baseUrl}${path}`
}
