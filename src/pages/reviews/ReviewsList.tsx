import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllReviews, updateReviewStatus, Review, ReviewStatus } from '../../api/reviews'
import { PageHeader } from '../../components/UI'
import { TableSkeleton } from '../../components/Loading'
import Alert from '../../components/Alert'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'

export default function ReviewsList() {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtres
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all')
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  
  // Modération
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [statusFilter])

  async function loadReviews() {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllReviews(statusFilter === 'all' ? undefined : statusFilter)
      setReviews(data)
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(review: Review) {
    setProcessing(true)
    try {
      await updateReviewStatus(review.id, ReviewStatus.APPROVED)
      await loadReviews()
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || 'Failed to approve review')
    } finally {
      setProcessing(false)
    }
  }

  async function handleReject() {
    if (!selectedReview || !rejectionReason.trim()) {
      alert('Veuillez fournir une raison de rejet')
      return
    }
    
    setProcessing(true)
    try {
      await updateReviewStatus(selectedReview.id, ReviewStatus.REJECTED, rejectionReason)
      setShowRejectModal(false)
      setRejectionReason('')
      setSelectedReview(null)
      await loadReviews()
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || 'Failed du rejet de l\'avis')
    } finally {
      setProcessing(false)
    }
  }

  async function handleSetPending(review: Review) {
    if (!confirm('Do you really want to remettre cet avis en attente ?')) return
    
    setProcessing(true)
    try {
      await updateReviewStatus(review.id, ReviewStatus.PENDING)
      await loadReviews()
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || 'Failed de la mise en attente')
    } finally {
      setProcessing(false)
    }
  }

  function openRejectModal(review: Review) {
    setSelectedReview(review)
    setShowRejectModal(true)
  }

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === ReviewStatus.PENDING).length,
    approved: reviews.filter(r => r.status === ReviewStatus.APPROVED).length,
    rejected: reviews.filter(r => r.status === ReviewStatus.REJECTED).length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'
  }

  const getStatusBadge = (status: ReviewStatus) => {
    const variants: Record<ReviewStatus, 'success' | 'warning' | 'danger' | 'secondary'> = {
      [ReviewStatus.APPROVED]: 'success',
      [ReviewStatus.PENDING]: 'warning',
      [ReviewStatus.REJECTED]: 'danger',
      [ReviewStatus.DELETED]: 'secondary'
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  // Filtrage avancé
  const filteredReviews = reviews.filter(review => {
    // Filtre par note
    if (ratingFilter !== 'all' && review.rating !== ratingFilter) {
      return false
    }
    
    // Recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchesName = review.userName.toLowerCase().includes(query)
      const matchesMessage = review.message.toLowerCase().includes(query)
      const matchesEntity = review.entityType.toLowerCase().includes(query)
      return matchesName || matchesMessage || matchesEntity
    }
    
    return true
  })

  if (loading) return <TableSkeleton />
  if (error) return (
    <div className="px-8 py-6">
      <PageHeader title="Reviews et Commentaires" icon="⭐" />
      <Alert variant="danger">{error}</Alert>
    </div>
  )

  return (
    <div className="px-8 py-6">
      <PageHeader title="Reviews et Commentaires" icon="⭐" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Rejected</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Rating moyenne</div>
          <div className="text-2xl font-bold text-primary-600">{stats.avgRating} ⭐</div>
        </div>
      </div>

      {/* Filtres avec slide */}
      <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
        {/* Header des filtres */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-semibold text-gray-900">Filtres avancés</span>
            {(statusFilter !== 'all' || ratingFilter !== 'all' || searchQuery) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Actifs
              </span>
            )}
          </div>
          <svg 
            className={`w-5 h-5 text-gray-600 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Contenu des filtres (slide) */}
        <div 
          className={`transition-all duration-300 ease-in-out ${
            showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{ overflow: showFilters ? 'visible' : 'hidden' }}
        >
          <div className="px-6 pb-6 pt-2 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtre par statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | 'all')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All ({stats.total})</option>
                  <option value={ReviewStatus.PENDING}>Pending ({stats.pending})</option>
                  <option value={ReviewStatus.APPROVED}>Approved ({stats.approved})</option>
                  <option value={ReviewStatus.REJECTED}>Rejected ({stats.rejected})</option>
                </select>
              </div>

              {/* Filtre par note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (stars)
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All les notes</option>
                  <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 stars)</option>
                  <option value="3">⭐⭐⭐ (3 stars)</option>
                  <option value="2">⭐⭐ (2 stars)</option>
                  <option value="1">⭐ (1 star)</option>
                </select>
              </div>

              {/* Recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, message, type..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Bouton réinitialiser */}
            {(statusFilter !== 'all' || ratingFilter !== 'all' || searchQuery) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setStatusFilter('all')
                    setRatingFilter('all')
                    setSearchQuery('')
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">None avis found</h3>
          <p className="text-gray-600">Les avis des users apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div key={review.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="flex items-start gap-4 flex-1 cursor-pointer"
                    onClick={() => navigate(`/reviews/${review.id}`)}
                  >
                    {review.userProfilePicture ? (
                      <img 
                        src={review.userProfilePicture} 
                        alt={review.userName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-lg">👤</span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{review.userName}</span>
                        {getStatusBadge(review.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                        <span>{getRatingStars(review.rating)}</span>
                        <span>•</span>
                        <span>{new Date(review.date).toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span className="capitalize">{review.entityType}</span>
                      </div>
                      <p className="text-gray-800 mb-2 line-clamp-2">{review.message}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/reviews/${review.id}`)
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View details →
                      </button>
                      
                      {review.rejectionReason && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Raison du rejet :</strong> {review.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions dynamiques selon le statut */}
                  <div className="flex flex-col gap-2 ml-4">
                    {/* Actions pour avis EN ATTENTE */}
                    {review.status === ReviewStatus.PENDING && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(review)}
                          disabled={processing}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                          title="Approuver cet avis"
                        >
                          ✓ Approuver
                        </button>
                        <button
                          onClick={() => openRejectModal(review)}
                          disabled={processing}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                          title="Rejeter cet avis"
                        >
                          ✗ Rejeter
                        </button>
                      </div>
                    )}

                    {/* Actions pour avis APPROUVÉ */}
                    {review.status === ReviewStatus.APPROVED && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openRejectModal(review)}
                          disabled={processing}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                          title="Rejeter cet avis"
                        >
                          ✗ Rejeter
                        </button>
                        <button
                          onClick={() => handleSetPending(review)}
                          disabled={processing}
                          className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium disabled:opacity-50"
                          title="Remettre en attente"
                        >
                          ⏳ Pending
                        </button>
                      </div>
                    )}

                    {/* Actions pour avis REJETÉ */}
                    {review.status === ReviewStatus.REJECTED && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(review)}
                          disabled={processing}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                          title="Approuver cet avis"
                        >
                          ✓ Approuver
                        </button>
                        <button
                          onClick={() => handleSetPending(review)}
                          disabled={processing}
                          className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium disabled:opacity-50"
                          title="Remettre en attente"
                        >
                          ⏳ Pending
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedReview && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false)
            setRejectionReason('')
            setSelectedReview(null)
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
                  setSelectedReview(null)
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

