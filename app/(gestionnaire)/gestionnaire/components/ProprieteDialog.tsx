"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import MapPicker from './MapPicker'; // Importer le composant MapPicker
import getCookie from '@/core/getCookie';

const ProprieteSchema = z.object({
  nom: z.string().min(1, "Le nom de la propriété est requis"),
  adresse: z.string().min(1, "L'adresse de la propriété est requis"),
  ville: z.string().min(1, "La ville de localisation de la propriété est requise"),
  codePostal: z.string().min(3, "Le code postal de la propriété est requis"),
  pays: z.string().min(2, "Le nom du pays est requis"),
  localisation: z.object({
    longitude: z.number({ invalid_type_error: 'La longitude est requise' }).min(-180).max(180, "La longitude doit être entre -180 et 180"),
    latitude: z.number({ invalid_type_error: 'La latitude est requise' }).min(-90).max(90, "La latitude doit être entre -90 et 90"),
  })
});

type ProprieteFormType = z.infer<typeof ProprieteSchema>;

export function ProprieteDialog({ open, onClose, userId, propriete }: { open: boolean; onClose: () => void; userId: number | string; propriete?: any }) {
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<ProprieteFormType>({
    resolver: zodResolver(ProprieteSchema),
    defaultValues: {
      nom: '',
      adresse: '',
      ville: '',
      codePostal: '',
      pays: '',
      localisation: { longitude: undefined, latitude: undefined },
    },
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);

  // Pré-remplir le formulaire si propriete (édition)
  useEffect(() => {
    setJwt(getCookie("jwt") as string)
    if (open && propriete) {
      reset({
        nom: propriete.nom || '',
        adresse: propriete.adresse || '',
        ville: propriete.ville || '',
        codePostal: propriete.codePostal || '',
        pays: propriete.pays || '',
        localisation: {
          longitude: propriete.localisation?.longitude ?? undefined,
          latitude: propriete.localisation?.latitude ?? undefined,
        },
      });
      // Si des coordonnées existent, les passer à la carte
      if (propriete.localisation?.latitude && propriete.localisation?.longitude) {
        setValue('localisation.latitude', propriete.localisation.latitude);
        setValue('localisation.longitude', propriete.localisation.longitude);
      }
    } else if (open && !propriete) {
      reset({
        nom: '',
        adresse: '',
        ville: '',
        codePostal: '',
        pays: '',
        localisation: { longitude: undefined, latitude: undefined },
      });
    }
  }, [open, propriete, reset, setValue]);

  // Récupérer la localisation du navigateur
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('localisation.longitude', position.coords.longitude);
        setValue('localisation.latitude', position.coords.latitude);
        toast.success('Localisation récupérée !');
        setLocationLoading(false);
      },
      (error) => {
        toast.error("Impossible de récupérer la localisation : " + error.message);
        setLocationLoading(false);
      }
    );
  };

  const onSubmit = async (data: ProprieteFormType) => {
    setLoading(true);
    try {
      const url = propriete ? `/api/user/${userId}/propriete/${propriete.id}` : `/api/user/${userId}/propriete`;
      const method = propriete ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          "Authorization-JWT": `Bearer ${jwt}`,
          Authorization : process.env.NEXT_PUBLIC_API_TOKEN as string
         },
        body: JSON.stringify(data),

      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || (propriete ? 'Erreur lors de la modification' : 'Erreur lors de la création de la propriété'));
      }
      toast.success(propriete ? 'Propriété modifiée avec succès !' : 'Propriété enregistrée avec succès !');
      onClose();
    } catch (e: any) {
      toast.error(e.message || (propriete ? 'Erreur lors de la modification' : 'Erreur lors de la création de la propriété'));
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les champs du formulaire lorsque la carte sélectionne une position
  const handleLocationSelect = (coords: { lat: number; lng: number }) => {
    setValue('localisation.latitude', coords.lat);
    setValue('localisation.longitude', coords.lng);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg w-full p-2 sm:p-6 rounded-lg overflow-y-auto max-h-[90dvh] sm:max-h-[80vh]"
        style={{
          // Pour garantir le scroll sur mobile
          overscrollBehavior: 'contain',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
            {propriete ? 'Modifier la propriété' : 'Ajouter une propriété'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
          <div>
            <label htmlFor="nom" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nom de la propriété</label>
            <Input id="nom" {...register('nom')} placeholder="Nom de la propriété" disabled={loading} className="text-xs sm:text-sm px-2 py-1 sm:py-2" />
            {errors.nom && <span className="text-red-500 text-xs">{errors.nom.message}</span>}
          </div>
          <div>
            <label htmlFor="adresse" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <Input id="adresse" {...register('adresse')} placeholder="Adresse" disabled={loading} className="text-xs sm:text-sm px-2 py-1 sm:py-2" />
            {errors.adresse && <span className="text-red-500 text-xs">{errors.adresse.message}</span>}
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <label htmlFor="ville" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Ville</label>
              <Input id="ville" {...register('ville')} placeholder="Ville" disabled={loading} className="text-xs sm:text-sm px-2 py-1 sm:py-2" />
              {errors.ville && <span className="text-red-500 text-xs">{errors.ville.message}</span>}
            </div>
            <div className="flex-1">
              <label htmlFor="codePostal" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Code postal</label>
              <Input id="codePostal" {...register('codePostal')} placeholder="Code postal" disabled={loading} className="text-xs sm:text-sm px-2 py-1 sm:py-2" />
              {errors.codePostal && <span className="text-red-500 text-xs">{errors.codePostal.message}</span>}
            </div>
          </div>
          <div>
            <label htmlFor="pays" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Pays</label>
            <Input id="pays" {...register('pays')} placeholder="Pays" disabled={loading} className="text-xs sm:text-sm px-2 py-1 sm:py-2" />
            {errors.pays && <span className="text-red-500 text-xs">{errors.pays.message}</span>}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Localisation</label>
            <div className="rounded-md overflow-hidden border border-gray-200">
              <MapPicker
                initialPosition={[
                  propriete?.localisation?.latitude || 48.8566, // Paris par défaut
                  propriete?.localisation?.longitude || 2.3522,
                ]}
                onLocationSelect={handleLocationSelect}
              />
            </div>
            {errors.localisation?.latitude && <span className="text-red-500 text-xs">{errors.localisation.latitude.message}</span>}
            {errors.localisation?.longitude && <span className="text-red-500 text-xs">{errors.localisation.longitude.message}</span>}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGetLocation}
              disabled={loading || locationLoading}
              className="w-full sm:w-auto text-xs sm:text-sm px-2 py-1 sm:py-2"
            >
              {locationLoading ? 'Récupération...' : 'Récupérer ma position'}
            </Button>
            <Button
              type="submit"
              disabled={loading || locationLoading}
              className="w-full sm:w-auto text-xs sm:text-sm px-2 py-1 sm:py-2"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto text-xs sm:text-sm px-2 py-1 sm:py-2"
            >
              Annuler
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}