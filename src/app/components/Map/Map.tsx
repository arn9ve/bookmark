"use client";
import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import type { ScrapedData } from "@/src/types";
import { getMarkerIcon, getMarkerSize } from "./MarkerIcons";
import { classifyRestaurant } from "@/src/lib/scraping/classification";
import { MapLegend } from "./MapLegend";

// Stile minimale per la mappa
const mapStyles = [
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#7c93a3" },
      { "lightness": "0" }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#a0a4a5" }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#62838e" }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#f2f4f6" }
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#a0a4a5" }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "road",
    "elementType": "all",
    "stylers": [
      { "color": "#ffffff" }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
        { "visibility": "off" }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [
      { "color": "#62838e" },
      { "saturation": "-40" }
    ]
  }
];

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const center = {
  lat: 41.9027835,
  lng: 12.4963655, // Roma come fallback
};

function getCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

interface MapProps {
  data: ScrapedData[];
  onSelect?: (item: ScrapedData | null) => void;
  selectedItem?: ScrapedData | null;
}

const Map = ({ data, onSelect, selectedItem }: MapProps) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDKs0ZWA1bAaNXpiaEeabAXnfAEfgJuolU",
    libraries: ['places'],
  });

  const [selected, setSelected] = useState<ScrapedData | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
    const bounds = new window.google.maps.LatLngBounds();
    let hasValidLocations = false;
    
    data.forEach(item => {
        if(item.analysis?.latitude && item.analysis?.longitude) {
            bounds.extend(new window.google.maps.LatLng(item.analysis.latitude, item.analysis.longitude));
            hasValidLocations = true;
        }
    });

    if (hasValidLocations) {
      map.fitBounds(bounds);
    } else {
      map.setCenter(center);
      map.setZoom(6);
    }
  }, [data]);

  // Center and highlight when selection comes from sidebar
  useEffect(() => {
    if (!selectedItem || !selectedItem.analysis?.latitude || !selectedItem.analysis?.longitude) return;
    setSelected(selectedItem);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: selectedItem.analysis.latitude, lng: selectedItem.analysis.longitude });
      const currentZoom = mapRef.current.getZoom() ?? 12;
      if (currentZoom < 15) mapRef.current.setZoom(15);
    }
  }, [selectedItem]);

  const mapBackground = getCssVar('--surface-secondary', '#FFFBEA');

  return isLoaded ? (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        options={{ styles: mapStyles, streetViewControl: false, mapTypeControl: false, fullscreenControl: false, backgroundColor: mapBackground }}
        onLoad={onLoad}
      >
        {data.map(item => {
            if (!item.analysis?.latitude || !item.analysis?.longitude) return null;
            
            // Applica la classificazione se non è già presente
            const analysis = item.analysis.priority ? item.analysis : classifyRestaurant(item.analysis);
            const priority = analysis.priority || 'if-in-area';
            const isPorkSpecialist = analysis.isPorkSpecialist || false;
            
            const isSelectedMarker = selected?.id === item.id;
            const baseSize = getMarkerSize(priority);
            const markerSize = isSelectedMarker
              ? { width: baseSize.width + 8, height: baseSize.height + 8 }
              : baseSize;
            // Use brutalist accent for selected marker and thicker border
            const highlight = isSelectedMarker ? getCssVar('--accent-1', '#FFDD00') : undefined;
            const icon = {
              url: getMarkerIcon(priority, isPorkSpecialist, markerSize.width, highlight),
              scaledSize: new window.google.maps.Size(markerSize.width, markerSize.height),
              anchor: new window.google.maps.Point(markerSize.width / 2, markerSize.height - 5)
            };
            
            return (
                <Marker 
                    key={item.id} 
                    position={{ lat: analysis.latitude!, lng: analysis.longitude! }}
                    title={analysis.restaurantName}
                    icon={icon}
                    zIndex={isSelectedMarker ? 999 : undefined}
                    onClick={() => {
                      const selectedItem = { ...item, analysis } as ScrapedData;
                      setSelected(selectedItem);
                      onSelect?.(selectedItem);
                    }}
                />
            );
        })}
      </GoogleMap>
      <MapLegend />
    </div>
  ) : (
    <div className="w-full h-[80vh] flex items-center justify-center bg-gray-200">
        <p>Caricamento mappa...</p>
    </div>
  );
};

export default Map;
