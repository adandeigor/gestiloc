'use client';

import { useEffect, useState } from 'react';
import { getUserStats } from '../services/getUserStats';
import { Button } from '@/components/ui/button';
import { ProprieteDialog } from '../components/ProprieteDialog';
import { ConfirmDeleteDialog } from '../components/confirmDeleteDialog';
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
import getCookie from '@/core/getCookie';
import { authHeader } from '@/core/auth-header';
import { ProprieteType, UserStats, UniteLocativeType } from './type';   

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
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [proprieteToDelete, setProprieteToDelete] = useState<ProprieteType | null>(null);
  const [confirmUniteDeleteOpen, setConfirmUniteDeleteOpen] = useState<boolean>(false);
  const [uniteToDelete, setUniteToDelete] = useState<{ unite: UniteLocativeType; index: number } | null>(null);

  // Charger les propriétés
  const fetchProprietes = async () => {
    setLoading(true);
    try {
      const stats: UserStats = await getUserStats();
      console.log('User stats:', stats);
      setProprietes(stats.proprietes || []);
      setUserId(stats.gestionnaire?.id ?? null);
    } catch (error) {
      console.error('Erreur lors du chargement des propriétés:', error);
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

  // Ouvrir le dialog de confirmation pour la suppression d'une propriété
  const handleDelete = (propriete: ProprieteType) => {
    setProprieteToDelete(propriete);
    setConfirmDeleteOpen(true);
  };

  // Confirmer la suppression d'une propriété
  const confirmDelete = async () => {
    if (!proprieteToDelete || !userId) {
      toast.error('Utilisateur ou propriété non valide');
      setConfirmDeleteOpen(false);
      setProprieteToDelete(null);
      return;
    }

    const jwt = getCookie('jwt');
    if (!jwt) {
      toast.error('Session non valide. Veuillez vous reconnecter.');
      setConfirmDeleteOpen(false);
      setProprieteToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeader(jwt),
      };
      Object.keys(headers).forEach((key) => {
        if (headers[key] === undefined) delete headers[key];
      });

      const res = await fetch(`/api/user/${userId}/propriete/${proprieteToDelete.id}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Erreur de suppression de la propriété:', {
          status: res.status,
          statusText: res.statusText,
          url: res.url,
          error: errorData.message || 'Aucune information supplémentaire',
        });
        throw new Error(errorData.message || `Erreur ${res.status}: ${res.statusText}`);
      }

      toast.success('Propriété supprimée');
      await fetchProprietes();
    } catch (error) {
      console.error('Erreur lors de la suppression de la propriété:', error);
      toast.error((error as Error).message || 'Erreur lors de la suppression de la propriété');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteOpen(false);
      setProprieteToDelete(null);
    }
  };

  // Charger les unités locatives
  const fetchUnites = async (propriete: ProprieteType) => {
    if (!userId) {
      toast.error('Utilisateur non valide');
      return;
    }

    setUniteDialogPropriete(propriete);
    setLoadingUnites(true);
    try {
      const jwt = getCookie('jwt');
      if (!jwt) {
        throw new Error('Session non valide');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeader(jwt),
      };
      Object.keys(headers).forEach((key) => {
        if (headers[key] === undefined) delete headers[key];
      });

      const res = await fetch(`/api/user/${userId}/propriete/${propriete.id}/uniteLocative`, {
        headers,
        method: 'GET',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Erreur de chargement des unités:', {
          status: res.status,
          statusText: res.statusText,
          url: res.url,
          error: errorData.message || 'Aucune information supplémentaire',
        });
        throw new Error(errorData.message || `Erreur ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const unites = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setUnites(unites);
      console.log('Unités locatives:', unites);
    } catch (error) {
      console.error('Erreur lors du chargement des unités:', error);
      toast.error((error as Error).message || 'Erreur lors du chargement des unités locatives');
      setUnites([]);
    } finally {
      setLoadingUnites(false);
    }
  };

  // Ouvrir le dialog de confirmation pour la suppression d'une unité
  const handleDeleteUnite = (unite: UniteLocativeType, index: number) => {
    setUniteToDelete({ unite, index });
    setConfirmUniteDeleteOpen(true);
  };

  // Confirmer la suppression d'une unité locative
  const confirmDeleteUnite = async () => {
    if (!uniteToDelete || !uniteDialogPropriete || !userId) {
      toast.error('Données non valides pour la suppression');
      setConfirmUniteDeleteOpen(false);
      setUniteToDelete(null);
      return;
    }

    const { unite, index } = uniteToDelete;

    if (!unite.id) {
      setUnites((prev) => prev.filter((_, i) => i !== index));
      setConfirmUniteDeleteOpen(false);
      setUniteToDelete(null);
      return;
    }

    const jwt = getCookie('jwt');
    if (!jwt) {
      toast.error('Session non valide. Veuillez vous reconnecter.');
      setConfirmUniteDeleteOpen(false);
      setUniteToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeader(jwt),
      };
      Object.keys(headers).forEach((key) => {
        if (headers[key] === undefined) delete headers[key];
      });

      const res = await fetch(
        `/api/user/${userId}/propriete/${uniteDialogPropriete.id}/uniteLocative/${unite.id}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Erreur de suppression de l\'unité:', {
          status: res.status,
          statusText: res.statusText,
          url: res.url,
          error: errorData.message || 'Aucune information supplémentaire',
        });
        throw new Error(errorData.message || `Erreur ${res.status}: ${res.statusText}`);
      }

      toast.success('Unité supprimée');
      setUnites((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'unité:', error);
      toast.error((error as Error).message || 'Erreur lors de la suppression de l\'unité');
    } finally {
      setIsDeleting(false);
      setConfirmUniteDeleteOpen(false);
      setUniteToDelete(null);
    }
  };

  const totalPages = Math.ceil(proprietes.length / ITEMS_PER_PAGE);
  const paginatedProprietes = proprietes.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const safeUnites = Array.isArray(unites) ? unites : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-light text-gray-400">Chargement des propriétés...</div>
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
                      <DropdownMenuItem onClick={() => handleDelete(prop)} className="text-red-600">
                        Supprimer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => fetchUnites(prop)}>
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
        propriete={selectedPropriete as ProprieteType}
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
                  {loadingUnites ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8">
                        <span className="animate-spin inline-block mr-2 border-2 border-gray-300 border-t-primary rounded-full w-6 h-6 align-middle"></span>
                        Chargement des unités locatives...
                      </td>
                    </tr>
                  ) : safeUnites.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-400 py-6">
                        Aucune unité locative
                      </td>
                    </tr>
                  ) : (
                    safeUnites.map((unite, idx) => (
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
                              <DropdownMenuItem onClick={() => handleDeleteUnite(unite, idx)} className="text-red-600">
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
                    ))
                  )}
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
                        const jwt = getCookie('jwt');
                        if (!jwt) {
                          throw new Error('Session non valide');
                        }
                        const headers: Record<string, string> = {
                          'Content-Type': 'application/json',
                          ...authHeader(jwt),
                        };
                        Object.keys(headers).forEach((key) => {
                          if (headers[key] === undefined) delete headers[key];
                        });
                        const res = await fetch(
                          `/api/user/${userId}/propriete/${uniteDialogPropriete.id}/uniteLocative`,
                          {
                            method: 'GET',
                            headers,
                          }
                        );
                        if (!res.ok) {
                          const errorData = await res.json().catch(() => ({}));
                          console.error('Erreur de rafraîchissement des unités:', {
                            status: res.status,
                            statusText: res.statusText,
                            url: res.url,
                            error: errorData.message || 'Aucune information supplémentaire',
                          });
                          throw new Error(errorData.message || `Erreur ${res.status}: ${res.statusText}`);
                        }
                        const data = await res.json();
                        const unites = Array.isArray(data?.data) ? data.data : [];
                        setUnites(unites);
                      } catch (error) {
                        console.error('Erreur lors du rafraîchissement des unités:', error);
                        toast.error((error as Error).message || 'Erreur lors du rafraîchissement des unités');
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
      {proprieteToDelete && (
        <ConfirmDeleteDialog
          open={confirmDeleteOpen}
          onClose={() => {
            setConfirmDeleteOpen(false);
            setProprieteToDelete(null);
          }}
          onConfirm={confirmDelete}
          loading={isDeleting}
          proprieteNom={`la propriété "${proprieteToDelete.nom}"`}
        />
      )}
      {uniteToDelete && (
        <ConfirmDeleteDialog
          open={confirmUniteDeleteOpen}
          onClose={() => {
            setConfirmUniteDeleteOpen(false);
            setUniteToDelete(null);
          }}
          onConfirm={confirmDeleteUnite}
          loading={isDeleting}
          proprieteNom={`l'unité locative "${uniteToDelete.unite.nom}"`}
        />
      )}
    </div>
  );
}