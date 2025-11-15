import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import type { LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapPickerProps {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number) => void
  searchQuery?: string
}

interface SearchResult {
  place_id: string
  lat: string
  lon: string
  display_name: string
  name?: string
  address?: any
}

const DEFAULT_CENTER: [number, number] = [31.7917, -7.0926] // Centre du Maroc
const DEFAULT_ZOOM = 6
const SELECTED_ZOOM = 14
const DEBOUNCE_DELAY = 500
const MIN_SEARCH_LENGTH = 3

// Composant optimisé pour mettre à jour la vue de la carte
const MapUpdater = React.memo(({ center, zoom }: { center: [number, number]; zoom?: number }) => {
  const map = useMap()
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom(), { animate: true })
    }
  }, [center, zoom, map])
  
  return null
})

MapUpdater.displayName = 'MapUpdater'

// Composant optimisé pour le marqueur
const LocationMarker = React.memo(({ position, onLocationChange, draggable = true }: { 
  position: [number, number]
  onLocationChange: (lat: number, lng: number) => void
  draggable?: boolean
}) => {
  const markerRef = useRef<any>(null)

  useMapEvents({
    click(e: LeafletMouseEvent) {
      onLocationChange(e.latlng.lat, e.latlng.lng)
    },
  })

  useEffect(() => {
    const marker = markerRef.current
    if (marker && draggable) {
      const handleDragEnd = (e: any) => {
        const { lat, lng } = e.target.getLatLng()
        onLocationChange(lat, lng)
      }
      
      marker.on('dragend', handleDragEnd)
      
      return () => {
        marker.off('dragend', handleDragEnd)
      }
    }
  }, [draggable, onLocationChange])

  if (!position || !position[0] || !position[1]) return null

  return <Marker ref={markerRef} position={position} draggable={draggable} />
})

LocationMarker.displayName = 'LocationMarker'

export default function MapPicker({ 
  latitude, 
  longitude, 
  onLocationChange,
  searchQuery 
}: MapPickerProps) {
  // Position initiale : utilise les props ou le centre du Maroc
  const initialPosition = useMemo<[number, number]>(() => {
    return (latitude && longitude) ? [latitude, longitude] : DEFAULT_CENTER
  }, [])
  
  const initialZoom = useMemo(() => {
    return (latitude && longitude) ? 13 : DEFAULT_ZOOM
  }, [])

  const [position, setPosition] = useState<[number, number]>(initialPosition)
  const [zoom, setZoom] = useState<number>(initialZoom)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fonction de recherche optimisée avec AbortController
  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.trim().length < MIN_SEARCH_LENGTH) {
      setSearchResults([])
      setError('')
      return
    }

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setSearching(true)
    setError('')
    
    try {
      // D'abord chercher au Maroc
      const moroccoUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=8&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=ma`
      
      const moroccoResponse = await fetch(moroccoUrl, {
        headers: {
          'Accept-Language': 'fr,en',
          'User-Agent': 'AdminDashboard/1.0'
        },
        signal: abortControllerRef.current.signal
      })

      let results: SearchResult[] = []
      
      if (moroccoResponse.ok) {
        results = await moroccoResponse.json()
      }

      // Si aucun résultat au Maroc, recherche globale
      if (!results || results.length === 0) {
        const globalUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}&addressdetails=1`
        
        const globalResponse = await fetch(globalUrl, {
          headers: {
            'Accept-Language': 'fr,en',
            'User-Agent': 'AdminDashboard/1.0'
          },
          signal: abortControllerRef.current.signal
        })
        
        if (globalResponse.ok) {
          results = await globalResponse.json()
        }
      }

      setSearchResults(results)
      setShowResults(true)
      
      if (!results || results.length === 0) {
        setError('Aucun résultat trouvé')
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erreur de recherche:', err)
        setError('Erreur lors de la recherche')
        setSearchResults([])
      }
    } finally {
      setSearching(false)
    }
  }, [])

  // Recherche automatique avec debounce optimisé
  useEffect(() => {
    if (searchTerm && searchTerm.trim().length >= MIN_SEARCH_LENGTH) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(searchTerm.trim())
      }, DEBOUNCE_DELAY)
    } else {
      setSearchResults([])
      setShowResults(false)
      setError('')
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, searchLocation])

  // Synchroniser avec searchQuery externe
  useEffect(() => {
    if (searchQuery && searchQuery !== searchTerm) {
      setSearchTerm(searchQuery)
    }
  }, [searchQuery, searchTerm])

  // Mise à jour de la position depuis les props
  useEffect(() => {
    if (latitude && longitude && !searching) {
      setPosition([latitude, longitude])
      setZoom(13)
    }
  }, [latitude, longitude, searching])

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng])
    setZoom(13)
    onLocationChange(lat, lng)
  }, [onLocationChange])

  const handleResultSelect = useCallback((result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setPosition([lat, lng])
      setZoom(SELECTED_ZOOM)
      onLocationChange(lat, lng)
      setSearchResults([])
      setShowResults(false)
      setSearchTerm('')
    }
  }, [onLocationChange])

  const handleCloseResults = useCallback(() => {
    setShowResults(false)
    setSearchResults([])
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  return (
    <div className="relative space-y-3">
      {/* Barre de recherche */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Rechercher un lieu (ville, adresse, pays...)"
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#981B21] focus:border-transparent transition-all"
          autoComplete="off"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-[#981B21] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm animate-fadeIn">
          {error}
        </div>
      )}

      {/* Résultats de recherche */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-[1000] w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto animate-slideDown">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 sticky top-0">
            <span className="text-sm font-medium text-gray-700">
              {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={handleCloseResults}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none transition-colors"
              aria-label="Fermer les résultats"
            >
              ×
            </button>
          </div>
          <ul className="divide-y divide-gray-100">
            {searchResults.map((result) => (
              <li key={result.place_id}>
                <button
                  type="button"
                  onClick={() => handleResultSelect(result)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors focus:bg-gray-100 focus:outline-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {result.name || result.display_name.split(',')[0]}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {result.display_name}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                      {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Carte */}
      <MapContainer
        center={initialPosition}
        zoom={initialZoom}
        style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
        className="z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapUpdater center={position} zoom={zoom} />
        <LocationMarker position={position} onLocationChange={handleLocationChange} draggable />
      </MapContainer>
      
      {/* Instructions */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>💡</span>
        <span>
          Recherchez une adresse ou cliquez sur la carte. Le marqueur est déplaçable.
        </span>
      </div>
    </div>
  )
}

