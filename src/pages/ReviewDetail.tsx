import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAllReviews, updateReviewStatus, Review, ReviewStatus } from '../api/reviews'
import { PageHeader } from '../components/UI'
import { TableSkeleton } from '../components/Loading'
import Alert from '../components/Alert'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'

/**
 * ReviewDetail Component - Optimized
 * Displays full review details with moderation actions
 * Uses React.memo(), useCallback(), and useMemo() for optimal performance
 */
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
        setError('Avis non trouvé')
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
      alert('Veuillez fournir une raison de rejet')
      return
    }
    
    setProcessing(true)
    try {
      await updateReviewStatus(review.id, ReviewStatus.REJECTED, rejectionReason)
      setShowRejectModal(false)
      setRejectionReason('')
      await loadReview()
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || 'Failed du rejet de l\'avis')
    } finally {
      setProcessing(false)
    }
  }, [review, rejectionReason, loadReview])

  const handleSetPending = useCallback(async () => {
    if (!review) return
    if (!confirm('Do you really want to remettre cet avis en attente ?')) return
    
    setProcessing(true)
    try {
      await updateReviewStatus(review.id, ReviewStatus.PENDING)
      await loadReview()
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || 'Failed de la mise en attente')
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
      <PageHeader title="Details de l'avis" icon="⭐" />
      <Alert variant="danger">{error}</Alert>
      <Button onClick={() => navigate('/reviews')} className="mt-4">
        Back to list
      </Button>
    </div>
  )

  if (!review) {
    return (
      <div className="px-8 py-6">
        <PageHeader title="Details de l'avis" icon="⭐" />
        <Alert variant="warning">Avis non trouvé.</Alert>
        <Button onClick={() => navigate('/reviews')} className="mt-4">
          Back to list
        </Button>
      </div>
    )
  }

  return (
    <div className="px-8 py-6">
      <PageHeader title="Details de l'avis" icon="⭐" />

      {/* Review Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Avis #{review.id.slice(0, 8)}
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
              <div className="text-sm text-gray-500 mb-1">ID de l'avis</div>
              <div className="font-mono text-sm text-gray-900">{review.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Rating</div>
              <div className="text-lg font-semibold text-gray-900">
                {review.rating}/5 {getRatingStars(review.rating)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Type d'entité</div>
              <div className="font-medium text-gray-900 capitalize">{review.entityType}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">ID de l'entité</div>
              <div className="font-mono text-sm text-gray-900">{review.entityId}</div>
            </div>
            {formattedApprovedDate && (
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  {review.status === ReviewStatus.APPROVED ? 'Approved le' : 'Modéré le'}
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
              <div className="text-sm text-gray-500 mb-2">Raison du rejet</div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {review.rejectionReason}
              </div>
            </div>
          )}

          {/* Actions dynamiques selon le statut */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            {/* Actions pour avis EN ATTENTE */}
            {review.status === ReviewStatus.PENDING && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✓ Approuver cet avis
                </Button>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                  variant="danger"
                >
                  ✗ Rejeter cet avis
                </Button>
              </>
            )}

            {/* Actions pour avis APPROUVÉ */}
            {review.status === ReviewStatus.APPROVED && (
              <>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                  variant="danger"
                >
                  ✗ Rejeter cet avis
                </Button>
                <Button
                  onClick={handleSetPending}
                  disabled={processing}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  ⏳ Remettre en attente
                </Button>
              </>
            )}

            {/* Actions pour avis REJETÉ */}
            {review.status === ReviewStatus.REJECTED && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✓ Approuver cet avis
                </Button>
                <Button
                  onClick={handleSetPending}
                  disabled={processing}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  ⏳ Remettre en attente
                </Button>
              </>
            )}

            {/* Bouton retour (toujours visible) */}
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

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false)
            setRejectionReason('')
          }}
          title="Rejeter l'avis"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Vous êtes sur le point de rejeter cet avis. Veuillez fournir une raison.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du rejet <span className="text-red-600">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Contenu inapproprié, spam, langage offensant..."
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
                {processing ? 'Rejet...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

