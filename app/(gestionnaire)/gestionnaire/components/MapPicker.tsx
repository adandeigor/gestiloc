// components/MapPicker.tsx
'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import L from 'leaflet';
import { toast } from 'sonner';

// Corriger l'icône par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPickerProps {
  initialPosition: [number, number];
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ initialPosition, onLocationSelect }) => {
  const [position, setPosition] = useState<[number, number]>(initialPosition);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Composant pour gérer les événements de la carte
  const MapEvents = () => {
    const map = useMap();

    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect({ lat, lng });
      },
    });

    useEffect(() => {
      map.setView(position, map.getZoom());
    }, [position, map]);

    return null;
  };

  // Recherche de localité via Nominatim
  const handleSearch = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) event.preventDefault();

    if (!searchQuery) return;

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 1,
        },
      });

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const newPosition: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPosition);
        onLocationSelect({ lat: newPosition[0], lng: newPosition[1] });
        toast.success('Localité trouvée !');
      } else {
        toast.error('Localité non trouvée.');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche :', error);
      toast.error('Une erreur est survenue lors de la recherche.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Rechercher une ville ou localité (ex: Paris)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="button" onClick={handleSearch}>Rechercher</Button>
      </div>
      {mounted && (
        <MapContainer
          center={position}
          zoom={13}
          className="w-full h-[200px] sm:h-[300px] md:h-[400px]"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position} />
          <MapEvents />
        </MapContainer>
      )}
    </div>
  );
};

export default MapPicker;