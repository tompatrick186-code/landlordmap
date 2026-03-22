'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import type { Property, Tenant } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface PropertyMapProps {
  properties: Property[]
  tenants: Tenant[]
  selectedId?: string
  onSelect?: (property: Property) => void
}

const STATUS_COLORS: Record<string, string> = {
  occupied: '#10B981',
  vacant: '#EF4444',
  maintenance: '#F59E0B',
  expiring_soon: '#8B5CF6',
}

export function PropertyMap({ properties, tenants, selectedId, onSelect }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [noToken, setNoToken] = useState(false)

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  useEffect(() => {
    if (!token || token === 'pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJ5b3VyLXRva2VuIn0.xxx') {
      setNoToken(true)
      return
    }

    if (mapRef.current || !mapContainer.current) return

    let map: mapboxgl.Map

    import('mapbox-gl').then((mapboxgl) => {
      // @ts-ignore
      mapboxgl.default.accessToken = token

      map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-0.1278, 51.5074], // London default
        zoom: 11,
      })

      mapRef.current = map

      map.on('load', () => {
        setMapLoaded(true)
      })

      // Add navigation controls
      map.addControl(new mapboxgl.default.NavigationControl(), 'top-right')
    })

    return () => {
      if (map) map.remove()
      mapRef.current = null
    }
  }, [token])

  const addMarkers = useCallback(() => {
    if (!mapRef.current || !mapLoaded) return

    import('mapbox-gl').then((mapboxgl) => {
      // Remove existing markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const propertiesWithCoords = properties.filter((p) => p.lat && p.lng)

      propertiesWithCoords.forEach((property) => {
        const color = STATUS_COLORS[property.status] || '#64748b'
        const tenant = tenants.find((t) => t.property_id === property.id && t.status === 'active')

        // Create custom marker element
        const el = document.createElement('div')
        el.className = 'property-marker'
        el.style.cssText = `
          width: 14px;
          height: 14px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          transition: transform 0.15s ease;
        `

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.4)'
        })
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)'
        })

        const popup = new mapboxgl.default.Popup({
          offset: 14,
          closeButton: false,
          maxWidth: '240px',
        }).setHTML(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <div style="font-weight: 600; font-size: 13px; color: #0f172a; margin-bottom: 4px;">${property.title}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${property.address}</div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="background: ${color}22; color: ${color}; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px;">
                ${property.status.replace('_', ' ')}
              </span>
              <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${formatCurrency(property.rent)}/mo</span>
            </div>
            ${tenant ? `<div style="margin-top: 6px; font-size: 11px; color: #64748b;">Tenant: ${tenant.first_name} ${tenant.last_name}</div>` : ''}
          </div>
        `)

        const marker = new mapboxgl.default.Marker({ element: el })
          .setLngLat([property.lng!, property.lat!])
          .setPopup(popup)
          .addTo(mapRef.current!)

        el.addEventListener('click', () => {
          onSelect?.(property)
          mapRef.current?.flyTo({
            center: [property.lng!, property.lat!],
            zoom: 14,
            duration: 800,
            essential: true,
          })
        })

        if (selectedId === property.id) {
          el.style.transform = 'scale(1.5)'
          popup.addTo(mapRef.current!)
        }

        markersRef.current.push(marker)
      })

      // Fit bounds if we have properties
      if (propertiesWithCoords.length > 1) {
        const bounds = propertiesWithCoords.reduce(
          (b, p) => b.extend([p.lng!, p.lat!]),
          new mapboxgl.default.LngLatBounds(
            [propertiesWithCoords[0].lng!, propertiesWithCoords[0].lat!],
            [propertiesWithCoords[0].lng!, propertiesWithCoords[0].lat!]
          )
        )
        mapRef.current?.fitBounds(bounds, { padding: 80, maxZoom: 14 })
      } else if (propertiesWithCoords.length === 1) {
        mapRef.current?.flyTo({
          center: [propertiesWithCoords[0].lng!, propertiesWithCoords[0].lat!],
          zoom: 14,
        })
      }
    })
  }, [properties, tenants, selectedId, onSelect, mapLoaded])

  useEffect(() => {
    addMarkers()
  }, [addMarkers])

  if (noToken) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-center p-8">
        <div className="text-4xl mb-4">🗺️</div>
        <h3 className="text-white font-semibold text-lg mb-2">Map not configured</h3>
        <p className="text-slate-400 text-sm max-w-sm">
          Add your <code className="bg-slate-800 px-1 rounded text-emerald-400">NEXT_PUBLIC_MAPBOX_TOKEN</code> to{' '}
          <code className="bg-slate-800 px-1 rounded text-emerald-400">.env.local</code> to enable the interactive map.
        </p>
        <a
          href="https://account.mapbox.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm underline"
        >
          Get a Mapbox token →
        </a>
      </div>
    )
  }

  return (
    <div ref={mapContainer} className="w-full h-full" />
  )
}
