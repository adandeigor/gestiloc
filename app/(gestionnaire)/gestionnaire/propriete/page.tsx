"use client"

import { useEffect, useState } from 'react';
import { getUserStats } from '../services/getUserStats';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProprieteDialog } from '../components/ProprieteDialog';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@/components/ui/table';
import { ChevronDown } from 'lucide-react';
import { UniteLocativeDialog } from '../components/UniteLocativeDialog';
import { z } from 'zod';

const ITEMS_PER_PAGE = 10;

// Validateur pour l'ajout de propriété
export const ProprieteSchemaValidator = z.object({
  nom: z.string().min(1, "Le nom de la propriété est requis"),
  adresse: z.string().min(1, "L'adresse de la propriété est requis"),
  ville: z.string().min(1, "La ville de localisation de la propriété est requise"),
  codePostal: z.string().min(3, "Le code postal de la propriété est requis"),
  pays: z.string().min(2, "Le nom du pays est requis"),
  localisation: z.object({
    longitude: z.number().min(1, "La longitude est requise"),
    latitude: z.number().min(1, "La latitude est requise")
  })
});

const Page = () => {
  const [proprietes, setProprietes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPropriete, setSelectedPropriete] = useState<any>(null);
  const [selectedMapPropriete, setSelectedMapPropriete] = useState<any>(null);
  const [userId, setUserId] = useState<string | number>('');
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [uniteDialogPropriete, setUniteDialogPropriete] = useState<any>(null);
  const [unites, setUnites] = useState<any[]>([]);
  const [loadingUnites, setLoadingUnites] = useState(false);

  // Charger les propriétés
  const fetchProprietes = async () => {
    setLoading(true);
    try {
      const stats = await getUserStats();
      setProprietes(stats.proprietes || []);
      setUserId(stats.gestionnaire?.id || '');
    } catch (e: any) {
      toast.error("Impossible de charger les propriétés");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProprietes();
  }, []);

  // Afficher la carte pour une propriété
  const handleShowMap = (propriete: any) => {
    if (propriete.localisation?.latitude && propriete.localisation?.longitude) {
      const lat = propriete.localisation.latitude;
      const lon = propriete.localisation.longitude;
      const offset = 0.002; // zone plus précise
      setMapUrl(
        `https://www.openstreetmap.org/export/embed.html?bbox=${lon - offset}%2C${lat - offset}%2C${lon + offset}%2C${lat + offset}&layer=mapnik&marker=${lat}%2C${lon}`
      );
      setSelectedMapPropriete(propriete);
    } else {
      toast.error("Localisation non disponible pour cette propriété");
    }
  };

  // CRUD actions (delete, edit)
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette propriété ?')) return;
    try {
      const res = await fetch(`/api/user/${userId}/propriete/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      toast.success('Propriété supprimée');
      fetchProprietes();
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la suppression');
    }
  };

  const handleShowUnites = async (propriete: any) => {
    console.log('handleShowUnites called', propriete, userId);
    setUniteDialogPropriete(propriete);
    setLoadingUnites(true);
    try {
      const res = await fetch(`/api/user/${userId}/propriete/${propriete.id}/uniteLocative`);
      if (!res.ok) throw new Error('Erreur lors du chargement des unités locatives');
      const data = await res.json();
      // Robustesse : toujours retourner un tableau, même si la structure varie
      let unites = [];
      if (Array.isArray(data?.data)) {
        unites = data.data;
      } else if (Array.isArray(data)) {
        unites = data;
      } else {
        unites = [];
      }
      setUnites(unites);
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors du chargement des unités locatives');
      setUnites([]);
    } finally {
      setLoadingUnites(false);
    }
  };

  const totalPages = Math.ceil(proprietes.length / ITEMS_PER_PAGE);
  const paginatedProprietes = proprietes.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Sécurité supplémentaire avant le rendu
  const safeUnites = Array.isArray(unites) ? unites : [];

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
                        <Button size="icon" variant="ghost"><ChevronDown /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleShowMap(prop)}>Voir sur la carte</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedPropriete(prop)}>Modifier</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(prop.id)} className="text-red-600">Supprimer</DropdownMenuItem>
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
          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Précédent</Button>
            <span className="text-sm">Page {page} / {totalPages || 1}</span>
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>Suivant</Button>
          </div>
        </div>
      <ProprieteDialog 
        open={openDialog || !!selectedPropriete}
        onClose={() => { setOpenDialog(false); setSelectedPropriete(null); fetchProprietes(); }}
        userId={userId}
        propriete={selectedPropriete}
      />
      {/* Carte Map */}
      {mapUrl && selectedMapPropriete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-5xl min-h-1/2 w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={() => { setMapUrl(null); setSelectedMapPropriete(null); }}>✕</button>
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
            <button className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl" onClick={() => setUniteDialogPropriete(null)}>&times;</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unités locatives de {uniteDialogPropriete.nom}</h2>
            <>
                <div className="flex justify-end mb-2">
                  <Button onClick={() => setUnites((prev) => [...prev, { _new: true }])} variant="default">Ajouter une unité</Button>
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
                        <tr><td colSpan={4} className="text-center text-gray-400 py-6">Aucune unité locative</td></tr>
                      )}
                      {safeUnites.map((unite, idx) => (
                        <tr key={unite.id || `new-${idx}`} className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition">
                          <td className="px-4 py-2 text-gray-900">{unite.nom}</td>
                          <td className="px-4 py-2 text-gray-600">
                            {unite.description?.slice(0, 7)}...
                            {/* Dialog pour voir la description complète */}
                            {unite._showDesc && (
                              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
                                  <button className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl" onClick={() => setUnites((prev) => prev.map((u, i) => i === idx ? { ...u, _showDesc: false } : u))}>&times;</button>
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
                                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setUnites((prev) => prev.map((u, i) => i === idx ? { ...u, _edit: true } : u))}>Modifier</DropdownMenuItem>
                                <DropdownMenuItem onClick={async () => {
                                  if (!unite.id) return setUnites((prev) => prev.filter((_, i) => i !== idx));
                                  if (!confirm('Supprimer cette unité ?')) return;
                                  try {
                                    setLoadingUnites(true);
                                    const res = await fetch(`/api/user/${userId}/propriete/${uniteDialogPropriete.id}/uniteLocative/${unite.id}`, { method: 'DELETE' });
                                    if (!res.ok) throw new Error('Erreur lors de la suppression');
                                    toast.success('Unité supprimée');
                                    setUnites((prev) => prev.filter((_, i) => i !== idx));
                                  } catch (e: any) {
                                    toast.error(e.message || 'Erreur lors de la suppression');
                                  } finally {
                                    setLoadingUnites(false);
                                  }
                                }}>Supprimer</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setUnites((prev) => prev.map((u, i) => i === idx ? { ...u, _showDesc: true } : u))}>Voir la description</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            {/* Dialog d'ajout/modification */}
            {safeUnites.map((unite, idx) => (unite._new || unite._edit) && (
              <UniteLocativeDialog
                key={unite.id || `dialog-${idx}`}
                open={true}
                onClose={() => setUnites((prev) => prev.filter((u, i) => i !== idx || !u._new).map((u, i) => i === idx ? { ...u, _edit: false, _new: false } : u))}
                proprieteId={uniteDialogPropriete.id}
                unite={unite._edit ? unite : undefined}
                loading={loadingUnites}
                onSaved={async () => {
                  setLoadingUnites(true);
                  try {
                    const res = await fetch(`/api/user/${userId}/propriete/${uniteDialogPropriete.id}/uniteLocative`);
                    if (!res.ok) throw new Error('Erreur lors du rafraîchissement');
                    let data = await res.json();
                    // Toujours récupérer data.data et s'assurer que c'est un tableau
                    const unites = Array.isArray(data?.data) ? data.data : [];
                    setUnites(unites);
                  } catch (e: any) {
                    toast.error(e.message || 'Erreur lors du rafraîchissement');
                  } finally {
                    setLoadingUnites(false);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;