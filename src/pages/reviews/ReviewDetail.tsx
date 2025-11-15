import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAllReviews, updateReviewStatus, Review, ReviewStatus } from '../../api/reviews'
import { PageHeader } from '../../components/UI'
import { TableSkeleton } from '../../components/Loading'
import Alert from '../../components/Alert'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/Modal'

export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const loadReview = useCallback(async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    try {
      const reviews = await getAllReviews()
      const foundReview = reviews.find(r => r.id === id)
      
      if (!foundReview) {
        setError('Review not found')
      } else {
        setReview(foundReview)
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load review')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadReview()
  }, [loadReview])

  const handleApprove = useCallback(async () => {
    if (!review) return
    
    setProcessing(true)
    try {
      await updateReviewStatus(review.id, ReviewStatus.APPROVED)
      await loadReview()
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || 'Failed to approve review')
    } finally {
      setProcessing(false)
    }
  }, [review, loadReview])

  const handleReject = useCallback(async () => {
    if (!review || !rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    
    setProcessing(true)
    try {
      await updateReviewStatus(review.id, ReviewStatus.REJECTED, rejectionReason)
      setShowRejectModal(false)
      setRejectionReason('')
      await loadReview()
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || 'Failed to reject review')
    } finally {
      setProcessing(false)
    }
  }, [review, rejectionReason, loadReview])

  const handleSetPending = useCallback(async () => {
    if (!review) return
    if (!confirm('Do you want to set this review back to pending?')) return
    
    setProcessing(true)
    try {
      await updateReviewStatus(review.id, ReviewStatus.PENDING)
      await loadReview()
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || 'Failed to set review to pending')
    } finally {
      setProcessing(false)
    }
  }, [review, loadReview])

  const getStatusBadge = useCallback((status: ReviewStatus) => {
    const variants: Record<ReviewStatus, 'success' | 'warning' | 'danger' | 'secondary'> = {
      [ReviewStatus.APPROVED]: 'success',
      [ReviewStatus.PENDING]: 'warning',
      [ReviewStatus.REJECTED]: 'danger',
      [ReviewStatus.DELETED]: 'secondary'
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }, [])

  const getRatingStars = useCallback((rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }, [])

  // Memoized formatted dates
  const formattedDate = useMemo(() => {
    if (!review) return ''
    return new Date(review.date).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [review])

  const formattedApprovedDate = useMemo(() => {
    if (!review?.approvedAt) return null
    return new Date(review.approvedAt).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [review])

  if (loading) return <TableSkeleton />
  if (error) return (
    <div className="px-8 py-6">
      <PageHeader title="Review Details" icon="⭐" />
      <Alert variant="danger">{error}</Alert>
      <Button onClick={() => navigate('/reviews')} className="mt-4">
        Back to list
      </Button>
    </div>
  )

  if (!review) {
    return (
      <div className="px-8 py-6">
        <PageHeader title="Review Details" icon="⭐" />
        <Alert variant="warning">Review not found.</Alert>
        <Button onClick={() => navigate('/reviews')} className="mt-4">
          Back to list
        </Button>
      </div>
    )
  }

  return (
    <div className="px-8 py-6">
      <PageHeader title="Review Details" icon="⭐" />

      {/* Review Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Reviews #{review.id.slice(0, 8)}
            </h3>
            {getStatusBadge(review.status)}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
            {review.userProfilePicture ? (
              <img 
                src={review.userProfilePicture} 
                alt={review.userName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-2xl">👤</span>
              </div>
            )}
            
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-900 mb-1">
                {review.userName}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{getRatingStars(review.rating)}</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Review Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Review ID</div>
              <div className="font-mono text-sm text-gray-900">{review.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Rating</div>
              <div className="text-lg font-semibold text-gray-900">
                {review.rating}/5 {getRatingStars(review.rating)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Entity Type</div>
              <div className="font-medium text-gray-900 capitalize">{review.entityType}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Entity ID</div>
              <div className="font-mono text-sm text-gray-900">{review.entityId}</div>
            </div>
            {formattedApprovedDate && (
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  {review.status === ReviewStatus.APPROVED ? 'Approved on' : 'Moderated on'}
                </div>
                <div className="text-sm text-gray-900">
                  {formattedApprovedDate}
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Message</div>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-900">
              {review.message}
            </div>
          </div>

          {/* Rejection Reason */}
          {review.rejectionReason && (
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">Rejection Reason</div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {review.rejectionReason}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            {review.status === ReviewStatus.PENDING && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✓ Approve
                </Button>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                  variant="danger"
                >
                  ✗ Reject
                </Button>
              </>
            )}

            {review.status === ReviewStatus.APPROVED && (
              <>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                  variant="danger"
                >
                  ✗ Reject
                </Button>
                <Button
                  onClick={handleSetPending}
                  disabled={processing}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  ⏳ Set to Pending
                </Button>
              </>
            )}

            {review.status === ReviewStatus.REJECTED && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✓ Approve
                </Button>
                <Button
                  onClick={handleSetPending}
                  disabled={processing}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  ⏳ Set to Pending
                </Button>
              </>
            )}

            <Button
              onClick={() => navigate('/reviews')}
              variant="secondary"
              className="ml-auto"
            >
              Back to list
            </Button>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false)
            setRejectionReason('')
          }}
          title="Reject Review"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              You are about to reject this review. Please provide a reason.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-600">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="E.g., Inappropriate content, spam, offensive language..."
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

