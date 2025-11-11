import api from '../lib/http'

export type ImageUploadResponse = {
  imageUrl: string
}

export async function uploadImage(file: File, subdirectory?: string){
  const formData = new FormData()
  formData.append('file', file)
  if (subdirectory) formData.append('subdirectory', subdirectory)
  
  const res = await api.post('/api/v1/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function deleteImage(imageUrl: string){
  const res = await api.delete('/api/v1/images', { params: { imageUrl } })
  return res.data
}
