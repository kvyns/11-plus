import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, LocateFixed, Minus, Plus, Search } from 'lucide-react'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

const schoolTypes = {
  independent: { label: 'Independent School', color: '#1e88e5' },
  primary: { label: 'Primary School', color: '#ff9800' },
  secondary: { label: 'Secondary School', color: '#43a047' },
  both: { label: 'Both', color: '#ffeb3b' },
}

const sampleSchools = [
  {
    id: 1,
    name: 'Brampton Primary School',
    type: 'primary',
    position: { lat: 54.941, lng: -2.733 },
  },
  {
    id: 2,
    name: 'William Howard School',
    type: 'secondary',
    position: { lat: 54.947, lng: -2.748 },
  },
  {
    id: 3,
    name: 'Austin Friars',
    type: 'independent',
    position: { lat: 54.905, lng: -2.956 },
  },
  {
    id: 4,
    name: 'Newcastle School for Boys',
    type: 'both',
    position: { lat: 54.998, lng: -1.621 },
  },
]

let googleMapsPromise

function loadGoogleMaps() {
  if (window.google?.maps?.importLibrary) {
    return Promise.all([
      window.google.maps.importLibrary('maps'),
      window.google.maps.importLibrary('marker'),
    ]).then(([mapsLibrary, markerLibrary]) => ({
      maps: window.google.maps,
      Map: mapsLibrary.Map,
      AdvancedMarkerElement: markerLibrary.AdvancedMarkerElement,
    }))
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error('Google Maps API key is missing.'))
  }

  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      window.gm_authFailure = () => {
        reject(new Error('Google Maps key is blocked for this site or the Maps JavaScript API is not enabled.'))
      }

      const googleLoader = window.google || (window.google = {})
      const mapsLoader = googleLoader.maps || (googleLoader.maps = {})
      const requestedLibraries = new Set()
      const params = new URLSearchParams()
      let loadPromise

      const loadScript = () => {
        if (loadPromise) {
          return loadPromise
        }

        loadPromise = new Promise((scriptResolve, scriptReject) => {
          const script = document.createElement('script')
          params.set('libraries', [...requestedLibraries].join(','))
          params.set('key', GOOGLE_MAPS_API_KEY)
          params.set('v', 'weekly')
          params.set('loading', 'async')
          params.set('callback', 'google.maps.__ib__')
          script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`
          mapsLoader.__ib__ = scriptResolve
          script.onerror = () => scriptReject(new Error('Unable to load Google Maps.'))
          document.head.appendChild(script)
        })

        return loadPromise
      }

      if (!mapsLoader.importLibrary) {
        mapsLoader.importLibrary = (libraryName) => {
          requestedLibraries.add(libraryName)
          return loadScript().then(() => window.google.maps.importLibrary(libraryName))
        }
      }

      Promise.all([
        mapsLoader.importLibrary('maps'),
        mapsLoader.importLibrary('marker'),
      ])
        .then(([mapsLibrary, markerLibrary]) => {
          resolve({
            maps: window.google.maps,
            Map: mapsLibrary.Map,
            AdvancedMarkerElement: markerLibrary.AdvancedMarkerElement,
          })
        })
        .catch((error) => {
          reject(error.message ? error : new Error('Unable to initialize Google Maps.'))
        })
    })
  }

  return googleMapsPromise
}

function createMarkerElement(color) {
  const marker = document.createElement('div')
  marker.style.width = '42px'
  marker.style.height = '52px'
  marker.style.transform = 'translateY(-2px)'
  marker.innerHTML = `
    <svg width="42" height="52" viewBox="0 0 42 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21 51C21 51 40 31.5 40 20.5C40 9.73 31.5 1 21 1C10.5 1 2 9.73 2 20.5C2 31.5 21 51 21 51Z" fill="${color}" stroke="rgba(15,23,42,.28)" stroke-width="2"/>
      <circle cx="21" cy="21" r="7.5" fill="rgba(15,23,42,.24)"/>
    </svg>
  `

  return marker
}

function SchoolsPage() {
  const navigate = useNavigate()
  const mapElementRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const infoWindowRef = useRef(null)
  const [postcode, setPostcode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedSchool, setSelectedSchool] = useState(null)

  const legendItems = useMemo(() => Object.entries(schoolTypes), [])

  useEffect(() => {
    let isMounted = true

    loadGoogleMaps()
      .then(({ maps, Map, AdvancedMarkerElement }) => {
        if (!isMounted || !mapElementRef.current) {
          return
        }

        const map = new Map(mapElementRef.current, {
          center: { lat: 54.941, lng: -2.733 },
          zoom: 12,
          mapId: GOOGLE_MAPS_MAP_ID,
          disableDefaultUI: true,
          clickableIcons: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        mapRef.current = map
        infoWindowRef.current = new maps.InfoWindow()
        markersRef.current = sampleSchools.map((school) => {
          const marker = new AdvancedMarkerElement({
            position: school.position,
            map,
            title: school.name,
            content: createMarkerElement(schoolTypes[school.type].color),
          })

          marker.addListener('click', () => {
            setSelectedSchool(school)
            infoWindowRef.current.setContent(`
              <div style="font-family: Inter, system-ui, sans-serif; min-width: 180px">
                <strong>${school.name}</strong>
                <div style="margin-top: 4px">${schoolTypes[school.type].label}</div>
              </div>
            `)
            infoWindowRef.current.open({ map, anchor: marker })
          })

          return marker
        })
      })
      .catch((error) => setErrorMessage(error.message || 'Unable to load the map.'))

    return () => {
      isMounted = false
      markersRef.current.forEach((marker) => {
        marker.map = null
      })
      markersRef.current = []
    }
  }, [])

  const handlePostcodeSearch = async (e) => {
    e.preventDefault()
    if (!postcode.trim() || !mapRef.current || !window.google?.maps) {
      return
    }

    setErrorMessage('')
    setIsSearching(true)

    try {
      const geocoder = new window.google.maps.Geocoder()
      const result = await geocoder.geocode({
        address: postcode,
        componentRestrictions: { country: 'GB' },
      })

      const location = result.results[0]?.geometry?.location
      if (!location) {
        throw new Error('Postcode not found.')
      }

      mapRef.current.panTo(location)
      mapRef.current.setZoom(13)
    } catch (error) {
      setErrorMessage(error.message || 'Postcode not found.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleLocate = () => {
    if (!navigator.geolocation || !mapRef.current) {
      setErrorMessage('Location is not available on this device.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current.panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        mapRef.current.setZoom(13)
      },
      () => setErrorMessage('Unable to access your location.'),
    )
  }

  const zoomBy = (amount) => {
    if (!mapRef.current) {
      return
    }

    mapRef.current.setZoom(mapRef.current.getZoom() + amount)
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-indigo-600 text-white py-6 px-6 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="text-2xl">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-2xl font-bold">Schools</h1>
        <div className="w-8"></div>
      </div>

      <div className="relative h-[calc(100vh-88px)] overflow-hidden">
        <div ref={mapElementRef} className="absolute inset-0 bg-green-50" />

        <div className="absolute left-3 top-3 z-10 rounded-lg bg-white/95 px-4 py-3 shadow-lg">
          <div className="space-y-2">
            {legendItems.map(([key, item]) => (
              <div key={key} className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="h-4 w-8 rounded-sm" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleLocate}
          className="absolute right-4 top-6 z-10 flex h-16 w-16 items-center justify-center rounded-md bg-white text-slate-600 shadow-lg"
          aria-label="Use current location"
        >
          <LocateFixed className="h-8 w-8" />
        </button>

        <div className="absolute bottom-36 right-4 z-10 grid gap-4">
          <button
            onClick={() => zoomBy(1)}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-card"
            aria-label="Zoom in"
          >
            <Plus className="h-8 w-8" />
          </button>
          <button
            onClick={() => zoomBy(-1)}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-card"
            aria-label="Zoom out"
          >
            <Minus className="h-8 w-8" />
          </button>
        </div>

        <form
          onSubmit={handlePostcodeSearch}
          className="absolute bottom-5 left-4 right-4 z-10 mx-auto max-w-3xl rounded-xl bg-white p-4 shadow-2xl"
        >
          {errorMessage && <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>}
          {selectedSchool && (
            <p className="mb-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
              {selectedSchool.name} - {schoolTypes[selectedSchool.type].label}
            </p>
          )}
          <div className="flex items-center gap-3">
            <input
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              placeholder="Enter UK postcode"
              className="min-w-0 flex-1 rounded-lg border-2 border-indigo-100 bg-white px-4 py-3 text-lg text-slate-900 outline-none focus:border-indigo-500"
            />
            <button
              disabled={isSearching}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white disabled:opacity-60"
              aria-label="Search postcode"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        {!GOOGLE_MAPS_API_KEY && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 px-6 text-center">
            <p className="max-w-md rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              Missing VITE_GOOGLE_MAPS_API_KEY. Add it to your Vite environment file and restart the dev server.
            </p>
          </div>
        )}

        {!window.google?.maps && !errorMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-50 text-sm font-semibold text-slate-600">
            Loading map...
          </div>
        )}
        </div>
    </div>
  )
}

export default SchoolsPage
