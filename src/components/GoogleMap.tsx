import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  provincia: string;
  localidad: string;
  className?: string;
}

const GoogleMap = ({ provincia, localidad, className = "" }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provincia || !localidad) return;

    const loadMap = async () => {
      setLoading(true);
      setError(null);

      try {
        const loader = new Loader({
          apiKey: 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg', // Clave de ejemplo - reemplazar con tu clave
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();
        
        if (!mapRef.current) return;

        // Geocodificar la ubicación
        const geocoder = new google.maps.Geocoder();
        const address = `${localidad}, ${provincia}, Argentina`;
        
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            
            const mapInstance = new google.maps.Map(mapRef.current!, {
              center: location,
              zoom: 12,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            });

            // Agregar marcador
            new google.maps.Marker({
              position: location,
              map: mapInstance,
              title: `${localidad}, ${provincia}`
            });

            setMap(mapInstance);
          } else {
            setError('No se pudo encontrar la ubicación en el mapa');
          }
          setLoading(false);
        });
      } catch (err) {
        setError('Error al cargar el mapa');
        setLoading(false);
      }
    };

    loadMap();
  }, [provincia, localidad]);

  if (!provincia || !localidad) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 text-center text-gray-500 ${className}`}>
        Selecciona una provincia y localidad para ver el mapa
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 text-center ${className}`}>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700">
          Ubicación: {localidad}, {provincia}
        </h4>
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-64"
        style={{ minHeight: '256px' }}
      />
    </div>
  );
};

export default GoogleMap; 