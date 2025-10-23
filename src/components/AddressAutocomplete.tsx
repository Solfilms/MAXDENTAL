"use client";

import React, { useEffect, useRef, useState } from "react";

// Declaraciones de tipos para Google Maps
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

interface AddressData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (addressData: AddressData) => void;
  placeholder?: string;
  className?: string;
}

// Variable global para evitar cargar la API múltiples veces
let isGoogleMapsLoading = false;
let isGoogleMapsLoaded = false;

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Ingresa tu dirección",
  className = ""
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        // Verificar si Google Maps ya está cargado
        if (window.google && window.google.maps && isGoogleMapsLoaded) {
          initializeAutocompleteComponent();
          return;
        }

        // Si ya está cargando, esperar
        if (isGoogleMapsLoading) {
          const checkLoaded = setInterval(() => {
            if (isGoogleMapsLoaded && window.google && window.google.maps) {
              clearInterval(checkLoaded);
              initializeAutocompleteComponent();
            }
          }, 100);
          return;
        }

        // Verificar si ya existe el script
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          isGoogleMapsLoading = true;
          const checkLoaded = setInterval(() => {
            if (isGoogleMapsLoaded && window.google && window.google.maps) {
              clearInterval(checkLoaded);
              initializeAutocompleteComponent();
            }
          }, 100);
          return;
        }

        // Marcar como cargando
        isGoogleMapsLoading = true;

        // Cargar Google Maps API dinámicamente
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE"}&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;

        // Función global de callback
        (window as any).initGoogleMaps = () => {
          isGoogleMapsLoaded = true;
          isGoogleMapsLoading = false;
          initializeAutocompleteComponent();
        };

        document.head.appendChild(script);

      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        setError('Error cargando autocompletado de direcciones');
        isGoogleMapsLoading = false;
      }
    };

    const initializeAutocompleteComponent = () => {
      if (inputRef.current && window.google && window.google.maps) {
        // Crear autocompletado
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' } // Solo direcciones de USA
        });

        // Escuchar cuando se selecciona una dirección
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (place && place.address_components) {
            let address = "";
            let city = "";
            let state = "";
            let zipCode = "";

            // Procesar componentes de la dirección
            place.address_components.forEach((component) => {
              const types = component.types;
              
              if (types.includes('street_number') || types.includes('route')) {
                address += component.long_name + " ";
              } else if (types.includes('locality')) {
                city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                state = component.short_name;
              } else if (types.includes('postal_code')) {
                zipCode = component.long_name;
              }
            });

            // Limpiar dirección
            address = address.trim();

            // Llamar callback con los datos
            onChange({
              address,
              city,
              state,
              zipCode
            });
          }
        });

        setIsLoaded(true);
      }
    };

    initializeAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      // Limpiar función global
      if ((window as any).initGoogleMaps) {
        delete (window as any).initGoogleMaps;
      }
    };
  }, [onChange]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          // Actualizar siempre para permitir edición manual
          setError(null); // Limpiar error al escribir
          onChange({
            address: e.target.value,
            city: "",
            state: "",
            zipCode: ""
          });
        }}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
      />
      {error ? (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
          ⚠️
        </div>
      ) : isLoaded ? (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600">
          📍
        </div>
      ) : null}
      {error && (
        <div className="absolute -bottom-6 left-0 text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}
