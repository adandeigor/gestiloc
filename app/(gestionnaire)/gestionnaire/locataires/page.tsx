"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { MoreHorizontal, Download, Loader2 } from 'lucide-react';
import { getUserStats } from '../services/getUserStats';
import { LocataireDialog } from '../components/LocataireDialog';
import getCookie from '@/core/getCookie';

interface Locataire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  carte_identite: string;
  photo_identite?: string;
  uniteLocativeId: number;
}

interface UniteLocative {
  id: number;
  nom: string;
  proprieteId: number;
}

interface Propriete {
  id: number;
  nom: string;
  unitesLocatives: UniteLocative[];
}

interface Document {
  type: string;
  url: string;
}

export default function LocataireBoardPage() {
  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [filteredLocataires, setFilteredLocataires] = useState<Locataire[]>([]);
  const [proprietes, setProprietes] = useState<Propriete[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDocumentsDialog, setOpenDocumentsDialog] = useState(false);
  const [userId, setUserId] = useState<string | number>('');
  const [selectedLocataire, setSelectedLocataire] = useState<Locataire | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  // Charger les données initiales
  const fetchData = async () => {
    setLoading(true);
    try {
      const stats = await getUserStats();
      const locatairesList = stats.locataires || [];
      setLocataires(locatairesList);
      setFilteredLocataires(locatairesList);
      setProprietes(stats.proprietes || []);
      console.log('Locataires chargés:', locatairesList); // Débogage
    } catch (error) {
      toast.error('Erreur lors du chargement des locataires');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setUserId(getCookie('userId') || '');
  }, []);

  useEffect(() => {
    console.log('Recherche:', searchQuery); // Débogage
    const trimmedQuery = searchQuery.trim().toLowerCase();
    const filtered = locataires.filter((locataire) => {
      const nom = locataire.nom?.toLowerCase() || '';
      const prenom = locataire.prenom?.toLowerCase() || '';
      const fullName = `${nom} ${prenom}`.trim();
      // Recherche dans nom, prenom, ou leur combinaison
      return (
        fullName.includes(trimmedQuery) ||
        nom.includes(trimmedQuery) ||
        prenom.includes(trimmedQuery)
      );
    });
    setFilteredLocataires(filtered);
    console.log('Locataires filtrés:', filtered); // Débogage
  }, [searchQuery, locataires]);

  const handleCreate = () => setOpenCreateDialog(true);

  const handleEdit = (locataire: Locataire) => {
    setSelectedLocataire(locataire);
    setOpenEditDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedLocataire) return;
    setActionLoading(true);
    try {
      const prop = proprietes.find(p => p.unitesLocatives.some(u => u.id === selectedLocataire.uniteLocativeId));
      const unite = prop?.unitesLocatives.find(u => u.id === selectedLocataire.uniteLocativeId);
      if (!prop || !unite) throw new Error('Propriété ou unité locative introuvable');
      const url = `/api/user/${userId}/propriete/${prop.id}/uniteLocative/${unite.id}/locataire/${selectedLocataire.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erreur lors de la suppression du locataire');
      }
      toast.success('Locataire supprimé avec succès !');
      setOpenDeleteDialog(false);
      setSelectedLocataire(null);
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression du locataire');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchDocuments = async (locataire: Locataire) => {
    setDocumentsLoading(true);
    setDocuments([]);
    try {
      const prop = proprietes.find(p => p.unitesLocatives.some(u => u.id === locataire.uniteLocativeId));
      const unite = prop?.unitesLocatives.find(u => u.id === locataire.uniteLocativeId);
      if (!prop || !unite) throw new Error('Propriété ou unité locative introuvable');
      const contratRes = await fetch(`/api/user/${userId}/propriete/${prop.id}/uniteLocative/${unite.id}/locataire/${locataire.id}/contrat`);
      const contratData = await contratRes.json();
      const contrats = contratData?.filter((c: any) => c.locataireId === locataire.id) || [];
      const newDocuments: Document[] = [];
      if (contrats.length > 0) {
        const contrat = contrats[0];
        newDocuments.push({ type: 'Contrat', url: contrat?.url || '' });
        const etatRes = await fetch(`/api/user/${userId}/propriete/${prop.id}/uniteLocative/${unite.id}/locataire/${locataire.id}/contrat/${contrat.id}/etatdeslieux`);
        const etatData = await etatRes.json();
        if (etatData?.length > 0) newDocuments.push({ type: 'État des lieux', url: etatData[0]?.details?.file || '' });
        const avenantRes = await fetch(`/api/user/${userId}/propriete/${prop.id}/uniteLocative/${unite.id}/locataire/${locataire.id}/contrat/${contrat.id}/avenant`);
        const avenantData = await avenantRes.json();
        if (avenantData?.length > 0) newDocuments.push({ type: 'Avenant', url: avenantData[0]?.file || '' });
      }
      if (locataire.carte_identite) newDocuments.push({ type: "Carte d'identité", url: locataire.carte_identite });
      if (locataire.photo_identite) newDocuments.push({ type: "Photo d'identité", url: locataire.photo_identite });
      setDocuments(newDocuments);
      setOpenDocumentsDialog(true);
    } catch (error) {
      toast.error('Erreur lors de la récupération des documents');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleDownload = (url: string, type: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_${selectedLocataire?.nom}_${selectedLocataire?.prenom}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif)$/i.test(url);
  const isPDF = (url: string) => /\.pdf$/i.test(url);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <Input
          placeholder="Rechercher un locataire par nom ou prénom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/3 placeholder:text-sm placeholder:text-gray-500 text-sm sm:text-base"
        />
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          Ajouter un locataire
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredLocataires.length === 0 ? (
        <p className="text-center text-gray-500">Aucun locataire trouvé.</p>
      ) : (
        <div className="space-y-4">
          {filteredLocataires.map((locataire) => (
            <div
              key={locataire.id}
              className="flex justify-between items-center p-4 border rounded-lg shadow-sm"
            >
              <div>
                <p className="font-semibold">{locataire.nom} {locataire.prenom}</p>
                <p className="text-sm text-gray-600">{locataire.email}</p>
                <p className="text-sm text-gray-600">{locataire.telephone}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(locataire)}>
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedLocataire(locataire);
                      setOpenDeleteDialog(true);
                    }}
                  >
                    Supprimer
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedLocataire(locataire);
                      fetchDocuments(locataire);
                    }}
                    disabled={documentsLoading}
                  >
                    {documentsLoading && selectedLocataire?.id === locataire.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Voir les documents
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
      <LocataireDialog
        open={openCreateDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          fetchData();
        }}
        userId={userId as string}
        proprietes={proprietes}
      />
      {selectedLocataire && (
        <LocataireDialog
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setSelectedLocataire(null);
            fetchData();
          }}
          userId={userId as string}
          proprietes={proprietes}
          locataire={selectedLocataire}
        />
      )}
      <Dialog open={openDeleteDialog} onOpenChange={() => setOpenDeleteDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>
            Êtes-vous sûr de vouloir supprimer le locataire{' '}
            {selectedLocataire?.nom} {selectedLocataire?.prenom} ?
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpenDeleteDialog(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openDocumentsDialog} onOpenChange={() => {
        setOpenDocumentsDialog(false);
        setPreviewDocument(null);
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Documents de {selectedLocataire?.nom} {selectedLocataire?.prenom}
            </DialogTitle>
          </DialogHeader>
          {documentsLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : previewDocument ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{previewDocument.type}</span>
                <Button
                  variant="ghost"
                  onClick={() => setPreviewDocument(null)}
                >
                  Retour à la liste
                </Button>
              </div>
              {isImage(previewDocument.url) ? (
                <img
                  src={previewDocument.url}
                  alt={previewDocument.type}
                  className="max-w-full h-auto max-h-[60vh] object-contain mx-auto"
                />
              ) : isPDF(previewDocument.url) ? (
                <iframe
                  src={previewDocument.url}
                  className="w-full h-[60vh] border rounded"
                  title={previewDocument.type}
                />
              ) : (
                <p className="text-gray-500">Prévisualisation non disponible pour ce type de fichier.</p>
              )}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(previewDocument.url, previewDocument.type)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <p className="text-gray-500">Aucun document disponible.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc, index) => (
                doc.url ? (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span>{doc.type}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewDocument(doc)}
                        disabled={!isImage(doc.url) && !isPDF(doc.url)}
                      >
                        Prévisualiser
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc.url, doc.type)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setOpenDocumentsDialog(false);
                setPreviewDocument(null);
              }}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}