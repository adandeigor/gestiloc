'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios, { AxiosError } from 'axios';
import L from 'leaflet';
import { toast } from 'sonner';

// Corriger l'icône par défaut de Leaflet
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPickerProps {
    initialPosition: [number, number];
    onLocationSelect: (coords: { lat: number; lng: number }) => void;
}

// Interface pour la réponse de Nominatim
interface NominatimResult {
    lat: string;
    lon: string;
}

const MapPicker: React.FC<MapPickerProps> = ({
    initialPosition,
    onLocationSelect,
}) => {
    const [position, setPosition] = useState<[number, number]>(initialPosition);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Composant pour gérer les événements de la carte
    const MapEvents = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                onLocationSelect({ lat, lng });
            },
        });

        return null;
    };

    // Mettre à jour la vue de la carte lorsque la position change
    // Utiliser un effet dans le composant parent pour éviter l'avertissement de dépendance
    useEffect(() => {
        // On ne peut accéder à la carte qu'après le montage, donc on utilise document.querySelector pour obtenir la carte
        // Mais avec react-leaflet, il est préférable d'utiliser une ref ou un état pour stocker la carte
        // Ici, on ne fait rien car la vue est déjà centrée via le state 'position' passé à MapContainer
        // Si vous souhaitez absolument centrer la carte, vous pouvez utiliser une ref sur MapContainer
    }, [position]);

    // Recherche de localité via Nominatim
    const handleSearch = async (
        event?: React.MouseEvent<HTMLButtonElement>
    ) => {
        if (event) event.preventDefault();
        if (!searchQuery.trim()) {
            toast.error('Veuillez entrer une localité à rechercher.');
            return;
        }

        try {
            const response = await axios.get<NominatimResult[]>(
                'https://nominatim.openstreetmap.org/search',
                {
                    params: {
                        q: searchQuery,
                        format: 'json',
                        limit: 1,
                    },
                    headers: {
                        'User-Agent': 'YourAppName/1.0 (contact@example.com)', // Remplacer par votre nom d'app et contact
                    },
                }
            );

            const results = response.data;
            if (results.length > 0) {
                const { lat, lon } = results[0];
                const newPosition: [number, number] = [
                    parseFloat(lat),
                    parseFloat(lon),
                ];
                setPosition(newPosition);
                onLocationSelect({ lat: newPosition[0], lng: newPosition[1] });
                toast.success('Localité trouvée !');
            } else {
                toast.error('Localité non trouvée.');
            }
        } catch (error: unknown) {
            const errorMessage =
                error instanceof AxiosError && error.response?.data?.error
                    ? error.response.data.error
                    : 'Une erreur est survenue lors de la recherche.';
            console.error('Erreur lors de la recherche :', error);
            toast.error(errorMessage);
        }
    };

    if (!mounted) {
        return null; // Éviter le rendu côté serveur
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <Input
                    placeholder="Rechercher une ville ou localité (ex: Paris)"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <Button type="button" onClick={handleSearch}>
                    Rechercher
                </Button>
            </div>
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
        </div>
    );
};

export default MapPicker;
