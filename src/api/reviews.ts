import api from '../lib/http'

/**
 * Review status enum
 */
export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED',
}

/**
 * Review entity
 */
export interface Review {
  id: string
  message: string
  rating: number // 1-5
  date: string // ISO-8601 datetime
  status: ReviewStatus
  entityType: string // 'spot', 'hotel', 'activity', etc.
  entityId: string
  rejectionReason: string | null
  approvedAt: string | null // ISO-8601 datetime
  userName: string
  userProfilePicture: string | null
}

/**
 * Review statistics
 */
export interface ReviewStats {
  averageRating: number
  totalCount: number
  approvedCount: number
  pendingCount: number
  rejectedCount: number
}

/**
 * Response for getting reviews with stats
 */
export interface ReviewsWithStats {
  reviews: Review[]
  stats: ReviewStats
}

/**
 * Get all reviews across all entities (Admin view)
 * @param status - Optional filter by status (PENDING, APPROVED, REJECTED)
 * @returns Array of reviews
 * 
 * API Endpoint: GET /api/v1/reviews/all?status={status}
 * Auth: Required (ADMIN)
 */
export async function getAllReviews(status?: ReviewStatus): Promise<Review[]> {
  const params: any = {}
  if (status) params.status = status
  const res = await api.get('/api/v1/reviews/all', { params })
  return res.data.data || res.data || []
}

/**
 * Get reviews for a specific entity with statistics
 * @param entityType - Entity type ('spot', 'hotel', 'activity', etc.)
 * @param entityId - Entity ID
 * @param status - Optional filter by status
 * @returns Reviews with statistics
 * 
 * API Endpoint: GET /api/v1/reviews?entityType={type}&entityId={id}&status={status}
 * Auth: None (Public)
 */
export async function getReviewsForEntity(
  entityType: string,
  entityId: string,
  status?: ReviewStatus
): Promise<ReviewsWithStats> {
  const params: any = { entityType, entityId }
  if (status) params.status = status
  const res = await api.get('/api/v1/reviews', { params })
  return res.data.data || res.data || { reviews: [], stats: { averageRating: 0, totalCount: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0 } }
}

/**
 * Update review status (Approve or Reject)
 * @param reviewId - Review ID
 * @param status - New status (APPROVED, REJECTED, PENDING, DELETED)
 * @param rejectionReason - Required when status is REJECTED
 * @returns Updated review
 * 
 * API Endpoint: PUT /api/v1/reviews/{reviewId}/status
 * Auth: Required (ADMIN)
 */
export async function updateReviewStatus(
  reviewId: string,
  status: ReviewStatus,
  rejectionReason?: string
): Promise<Review> {
  const payload: any = { status }
  if (status === ReviewStatus.REJECTED && rejectionReason) {
    payload.rejectionReason = rejectionReason
  }
  const res = await api.put(`/api/v1/reviews/${reviewId}/status`, payload)
  return res.data.data || res.data
}

/**
 * Create a new review (User action, not admin)
 * @param data - Review data
 * @returns Created review
 * 
 * API Endpoint: POST /api/v1/reviews
 * Auth: Required (Any authenticated user)
 */
export async function createReview(data: {
  message: string
  rating: number
  entityType: string
  entityId: string
}): Promise<Review> {
  const res = await api.post('/api/v1/reviews', data)
  return res.data.data || res.data
}

/**
 * Update a review (Owner only)
 * @param reviewId - Review ID
 * @param data - Updated review data
 * @returns Updated review
 * 
 * API Endpoint: PUT /api/v1/reviews/{reviewId}
 * Auth: Required (Review owner)
 */
export async function updateReview(
  reviewId: string,
  data: { message: string; rating: number }
): Promise<Review> {
  const res = await api.put(`/api/v1/reviews/${reviewId}`, data)
  return res.data.data || res.data
}

/**
 * Delete a review (Owner only)
 * @param reviewId - Review ID
 * 
 * API Endpoint: DELETE /api/v1/reviews/{reviewId}
 * Auth: Required (Review owner)
 */
export async function deleteReview(reviewId: string): Promise<void> {
  await api.delete(`/api/v1/reviews/${reviewId}`)
}

