'use client';

import { useEffect, useState } from 'react';
import { getUserStats } from '../services/getUserStats';
import { Button } from '@/components/ui/button';
import { ProprieteDialog } from '../components/ProprieteDialog';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@/components/ui/table';
import { ChevronDown } from 'lucide-react';
import { UniteLocativeDialog } from '../components/UniteLocativeDialog';
import { z } from 'zod';
import getCookie from '@/core/getCookie';

// Schéma de validation pour Propriete
export const ProprieteSchemaValidator = z.object({
  nom: z.string().min(1, 'Le nom de la propriété est requis'),
  adresse: z.string().min(1, "L'adresse de la propriété est requis"),
  ville: z.string().min(1, 'La ville de localisation de la propriété est requise'),
  codePostal: z.string().min(3, 'Le code postal de la propriété est requis'),
  pays: z.string().min(2, 'Le nom du pays est requis'),
  localisation: z.object({
    longitude: z.number().min(-180).max(180, 'Longitude invalide'),
    latitude: z.number().min(-90).max(90, 'Latitude invalide'),
  }),
});

export type ProprieteType = z.infer<typeof ProprieteSchemaValidator> & {
  id: number;
  createdAt: string;
  unitesLocatives?: UniteLocativeType[];
};

// Type pour UniteLocative
type UniteLocativeType = {
  id?: number;
  nom: string;
  description?: string;
  prix: number;
  _new?: boolean;
  _edit?: boolean;
  _showDesc?: boolean;
};

// Type pour les statistiques utilisateur
type UserStats = {
  proprietes: ProprieteType[];
  gestionnaire?: {
    id: number;
  };
};

const ITEMS_PER_PAGE = 10;

export default function ProprietePage() {
  const [proprietes, setProprietes] = useState<ProprieteType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedPropriete, setSelectedPropriete] = useState<ProprieteType | null>(null);
  const [selectedMapPropriete, setSelectedMapPropriete] = useState<ProprieteType | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [uniteDialogPropriete, setUniteDialogPropriete] = useState<ProprieteType | null>(null);
  const [unites, setUnites] = useState<UniteLocativeType[]>([]);
  const [loadingUnites, setLoadingUnites] = useState<boolean>(false);

  // Charger les propriétés
  const fetchProprietes = async () => {
    setLoading(true);
    try {
      const stats: UserStats = await getUserStats();
      console.log('User stats:', stats);
      setProprietes(stats.proprietes || []);
      setUserId(stats.gestionnaire?.id ?? null);
    } catch {
      toast.error('Impossible de charger les propriétés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProprietes();
  }, []);

  // Afficher la carte pour une propriété
  const handleShowMap = (propriete: ProprieteType) => {
    if (propriete.localisation?.latitude && propriete.localisation?.longitude) {
      const lat = propriete.localisation.latitude;
      const lon = propriete.localisation.longitude;
      const offset = 0.002;
      setMapUrl(
        `https://www.openstreetmap.org/export/embed.html?bbox=${lon - offset}%2C${lat - offset}%2C${
          lon + offset
        }%2C${lat + offset}&layer=mapnik&marker=${lat}%2C${lon}`
      );
      setSelectedMapPropriete(propriete);
    } else {
      toast.error('Localisation non disponible pour cette propriété');
    }
  };

  // Supprimer une propriété
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette propriété ?')) return;
    try {
      const res = await fetch(`/api/user/${userId}/propriete/${id}`, { method: 'DELETE' , 
        headers: {
          'Content-Type': 'application/json',
          'Authorization-JWT': `Bearer ${getCookie('jwt')}`,
          Authorization: process.env.NEXT_PUBLIC_API_TOKEN as string,
        }
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      toast.success('Propriété supprimée');
      fetchProprietes();
    } catch (error) {
      toast.error((error as Error).message || 'Erreur lors de la suppression');
    }
  };
  const jwt = getCookie('jwt') as string

  // Charger les unités locatives
  const handleShowUnites = async (propriete: ProprieteType) => {
    setUniteDialogPropriete(propriete);
    setLoadingUnites(true);
    try {
      const res = await fetch(`/api/user/${userId}/propriete/${propriete.id}/uniteLocative`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization-JWT': `Bearer ${jwt}`,
          Authorization: process.env.NEXT_PUBLIC_API_TOKEN as string,
        },
        method: 'GET'
      });
      if (!res.ok) throw new Error('Erreur lors du chargement des unités locatives');
      const data = await res.json();
      const unites = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setUnites(unites);
      console.log('Unites locatives:', unites);
    } catch (error) {
      toast.error((error as Error).message || 'Erreur lors du chargement des unités locatives');
      setUnites([]);
    } finally {
      setLoadingUnites(false);
    }
  };

  const totalPages = Math.ceil(proprietes.length / ITEMS_PER_PAGE);
  const paginatedProprietes = proprietes.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const safeUnites = Array.isArray(unites) ? unites : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold">Chargement des propriétés...</div>
      </div>
    );
  }
  return (
    <div className="max-w-5xl mx-auto py-8 px-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes propriétés</h1>
        <Button onClick={() => setOpenDialog(true)}>Ajouter une propriété</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Pays</TableHead>
              <TableHead>Code postal</TableHead>
              <TableHead>Créée le</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProprietes.map((prop) => (
              <TableRow key={prop.id}>
                <TableCell className="font-semibold">{prop.nom}</TableCell>
                <TableCell>{prop.adresse}</TableCell>
                <TableCell>{prop.ville}</TableCell>
                <TableCell>{prop.pays}</TableCell>
                <TableCell>{prop.codePostal}</TableCell>
                <TableCell>{new Date(prop.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleShowMap(prop)}>
                        Voir sur la carte
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedPropriete(prop)}>Modifier</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(prop.id)} className="text-red-600">
                        Supprimer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShowUnites(prop)}>
                        Gérer les unités locatives
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end items-center gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <span className="text-sm">Page {page} / {totalPages || 1}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            Suivant
          </Button>
        </div>
      </div>
      <ProprieteDialog
        open={openDialog || !!selectedPropriete}
        onClose={() => {
          setOpenDialog(false);
          setSelectedPropriete(null);
          fetchProprietes();
        }}
        userId={userId ?? 0}
        propriete={selectedPropriete}
      />
      {mapUrl && selectedMapPropriete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-5xl min-h-1/2 w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover-text-black"
              onClick={() => {
                setMapUrl(null);
                setSelectedMapPropriete(null);
              }}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-2">Emplacement de {selectedMapPropriete.nom}</h2>
            <iframe
              src={mapUrl}
              width="100%"
              height="350"
              className="rounded border"
              style={{ minHeight: 300 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      )}
      {uniteDialogPropriete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative border border-gray-200">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl"
              onClick={() => setUniteDialogPropriete(null)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Unités locatives de {uniteDialogPropriete.nom}
            </h2>
            <div className="flex justify-end mb-2">
              <Button
                onClick={() => setUnites((prev) => [...prev, { _new: true, nom: '', prix: 0 }])}
                variant="default"
              >
                Ajouter une unité
              </Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-600 bg-gray-500">
              <table className="min-w-full futuristic-table">
                <thead className="text-white">
                  <tr>
                    <th className="px-4 py-2">Nom</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Prix (Fcfa)</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {safeUnites.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-400 py-6">
                        Aucune unité locative
                      </td>
                    </tr>
                  )}
                  {safeUnites.map((unite, idx) => (
                    <tr
                      key={unite.id || `new-${idx}`}
                      className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <td className="px-4 py-2 text-gray-900">{unite.nom}</td>
                      <td className="px-4 py-2 text-gray-600">
                        {unite.description?.slice(0, 7)}...
                        {unite._showDesc && (
                          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
                              <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                                onClick={() =>
                                  setUnites((prev) =>
                                    prev.map((u, i) => (i === idx ? { ...u, _showDesc: false } : u))
                                  )
                                }
                              >
                                ×
                              </button>
                              <h3 className="text-lg font-semibold mb-2">Description complète</h3>
                              <div className="text-gray-800 whitespace-pre-line">{unite.description}</div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-primary font-semibold">{unite.prix}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <span className="sr-only">Actions</span>
                              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                <circle cx="5" cy="12" r="2" fill="currentColor" />
                                <circle cx="12" cy="12" r="2" fill="currentColor" />
                                <circle cx="19" cy="12" r="2" fill="currentColor" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                setUnites((prev) =>
                                  prev.map((u, i) => (i === idx ? { ...u, _edit: true } : u))
                                )
                              }
                            >
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                if (!unite.id) {
                                  setUnites((prev) => prev.filter((_, i) => i !== idx));
                                  return;
                                }
                                if (!confirm('Supprimer cette unité ?')) return;
                                try {
                                  setLoadingUnites(true);
                                  const res = await fetch(
                                    `/api/user/${userId}/propriete/${uniteDialogPropriete.id}/uniteLocative/${unite.id}`,
                                    { method: 'DELETE' }
                                  );
                                  if (!res.ok) throw new Error('Erreur lors de la suppression');
                                  toast.success('Unité supprimée');
                                  setUnites((prev) => prev.filter((_, i) => i !== idx));
                                } catch (error) {
                                  toast.error((error as Error).message || 'Erreur lors de la suppression');
                                } finally {
                                  setLoadingUnites(false);
                                }
                              }}
                            >
                              Supprimer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setUnites((prev) =>
                                  prev.map((u, i) => (i === idx ? { ...u, _showDesc: true } : u))
                                )
                              }
                            >
                              Voir la description
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {safeUnites.map(
              (unite, idx) =>
                (unite._new || unite._edit) && (
                  <UniteLocativeDialog
                    key={unite.id || `dialog-${idx}`}
                    open={true}
                    onClose={() =>
                      setUnites((prev) =>
                        prev
                          .filter((u, i) => i !== idx || !u._new)
                          .map((u, i) => (i === idx ? { ...u, _edit: false, _new: false } : u))
                      )
                    }
                    proprieteId={uniteDialogPropriete.id}
                    unite={
                      unite._edit && unite.id !== undefined
                        ? {
                            id: unite.id,
                            nom: unite.nom,
                            description: unite.description ?? '',
                            prix: unite.prix,
                          }
                        : undefined
                    }
                    loading={loadingUnites}
                    onSaved={async () => {
                      setLoadingUnites(true);
                      try {
                        const res = await fetch(
                          `/api/user/${userId}/propriete/${uniteDialogPropriete.id}/uniteLocative`, {
                            method: 'GET',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization-JWT': `Bearer ${jwt}`,
                              Authorization: process.env.NEXT_PUBLIC_API_TOKEN as string,
                            }
                          }
                        );
                        if (!res.ok) throw new Error('Erreur lors du rafraîchissement');
                        const data = await res.json();
                        const unites = Array.isArray(data?.data) ? data.data : [];
                        setUnites(unites);
                      } catch (error) {
                        toast.error((error as Error).message || 'Erreur lors du rafraîchissement');
                      } finally {
                        setLoadingUnites(false);
                      }
                    }}
                  />
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
}