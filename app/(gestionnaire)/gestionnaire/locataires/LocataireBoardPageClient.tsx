'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
    MoreHorizontal,
    Download,
    Loader2,
    AlertCircleIcon,
} from 'lucide-react';
import { getUserStats } from '../services/getUserStats';
import { LocataireDialog } from '../components/LocataireDialog';
import getCookie from '@/core/getCookie';
import Image from 'next/image';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { httpClient } from '@/core/httpClient';

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
    const [userStats, setUserStats] = useState<{
        gestionnaire?: { statut: string };
    }>({});
    const [filteredLocataires, setFilteredLocataires] = useState<Locataire[]>(
        []
    );
    const [proprietes, setProprietes] = useState<Propriete[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openDocumentsDialog, setOpenDocumentsDialog] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [selectedLocataire, setSelectedLocataire] =
        useState<Locataire | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [previewDocument, setPreviewDocument] = useState<Document | null>(
        null
    );

    // Charger les données initiales
    const fetchData = async () => {
        setLoading(true);
        try {
            const stats = await getUserStats();
            setUserStats(stats as { gestionnaire?: { statut: string } });
            const locatairesList =
                (stats as { locataires?: Locataire[] }).locataires || [];
            setLocataires(locatairesList);
            setFilteredLocataires(locatairesList);
            setProprietes(
                (stats as { proprietes?: Propriete[] }).proprietes || []
            );
            console.log('Locataires chargés:', locatairesList);
        } catch (error) {
            console.error('Erreur lors du chargement des locataires:', error);
            toast.error('Erreur lors du chargement des locataires');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const userIdStr = getCookie('userId');
        setUserId(userIdStr ? parseInt(userIdStr, 10) : null);
    }, []);

    useEffect(() => {
        console.log('Recherche:', searchQuery);
        const trimmedQuery = searchQuery.trim().toLowerCase();
        const filtered = locataires.filter(locataire => {
            const nom = locataire.nom?.toLowerCase() || '';
            const prenom = locataire.prenom?.toLowerCase() || '';
            const fullName = `${nom} ${prenom}`.trim();
            return (
                fullName.includes(trimmedQuery) ||
                nom.includes(trimmedQuery) ||
                prenom.includes(trimmedQuery)
            );
        });
        setFilteredLocataires(filtered);
        console.log('Locataires filtrés:', filtered);
    }, [searchQuery, locataires]);

    const handleCreate = () => setOpenCreateDialog(true);

    const handleEdit = (locataire: Locataire) => {
        setSelectedLocataire(locataire);
        setOpenEditDialog(true);
    };

    const handleDelete = async () => {
        if (!selectedLocataire || !userId) {
            toast.error('Locataire ou utilisateur non valide');
            setOpenDeleteDialog(false);
            setSelectedLocataire(null);
            return;
        }
        setActionLoading(true);
        try {
            const prop = proprietes.find(p =>
                p.unitesLocatives.some(
                    u => u.id === selectedLocataire.uniteLocativeId
                )
            );
            const unite = prop?.unitesLocatives.find(
                u => u.id === selectedLocataire.uniteLocativeId
            );
            if (!prop || !unite) {
                throw new Error('Propriété ou unité locative non trouvée');
            }
            const url = `/api/user/${userId}/propriete/${prop.id}/uniteLocative/${unite.id}/locataire/${selectedLocataire.id}`;
            await httpClient.delete(url);
            toast.success('Locataire supprimé avec succès !');
            setOpenDeleteDialog(false);
            setSelectedLocataire(null);
            await fetchData();
        } catch (error) {
            console.error('Erreur lors de la suppression du locataire:', error);
            toast.error(
                (error as Error).message ||
                    'Erreur lors de la suppression du locataire'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const fetchDocuments = async (locataire: Locataire) => {
        setDocumentsLoading(true);
        setDocuments([]);
        if (!userId) {
            toast.error('Utilisateur non valide');
            setDocumentsLoading(false);
            return;
        }
        try {
            const prop = proprietes.find(p =>
                p.unitesLocatives.some(u => u.id === locataire.uniteLocativeId)
            );
            const unite = prop?.unitesLocatives.find(
                u => u.id === locataire.uniteLocativeId
            );
            if (!prop || !unite) {
                throw new Error('Propriété ou unité locative non trouvée');
            }

            const contratData = await httpClient.get(
                `/api/user/${userId}/propriete/${prop.id}/uniteLocative/${unite.id}/locataire/${locataire.id}/contrat`
            );
            interface Contrat {
                id: number;
                locataireId: number;
                url?: string;
            }
            const contratsArray = Array.isArray(contratData) ? contratData : [];
            const contrats: Contrat[] = contratsArray.filter(
                (c: { locataireId: number }) => c.locataireId === locataire.id
            ) as Contrat[];
            const newDocuments: Document[] = [];

            if (contrats.length > 0) {
                const contrat = contrats[0];
                if (contrat.url)
                    newDocuments.push({ type: 'Contrat', url: contrat.url });

                const etatData = await httpClient.get(
                    `/api/user/${userId}/propriete/${prop.id}/uniteLocative/${unite.id}/locataire/${locataire.id}/contrat/${contrat.id}/etatdeslieux`
                );
                if (
                    Array.isArray(etatData) &&
                    etatData.length > 0 &&
                    etatData[0]?.details?.file
                ) {
                    newDocuments.push({
                        type: 'État des lieux',
                        url: etatData[0].details.file,
                    });
                }

                const avenantData = await httpClient.get(
                    `/api/user/${userId}/propriete/${prop.id}/uniteLocative/${unite.id}/locataire/${locataire.id}/contrat/${contrat.id}/avenant`
                );
                if (
                    Array.isArray(avenantData) &&
                    avenantData.length > 0 &&
                    avenantData[0]?.file
                ) {
                    newDocuments.push({
                        type: 'Avenant',
                        url: avenantData[0].file,
                    });
                }
            }

            if (locataire.carte_identite)
                newDocuments.push({
                    type: "Carte d'identité",
                    url: locataire.carte_identite,
                });
            if (locataire.photo_identite)
                newDocuments.push({
                    type: "Photo d'identité",
                    url: locataire.photo_identite,
                });

            setDocuments(newDocuments);
            setOpenDocumentsDialog(true);
        } catch (error) {
            console.error(
                'Erreur lors de la récupération des documents:',
                error
            );
            toast.error(
                (error as Error).message ||
                    'Erreur lors de la récupération des documents'
            );
        } finally {
            setDocumentsLoading(false);
        }
    };

    // Téléchargement robuste pour fichiers Supabase (blob)
    const handleDownload = async (url: string, type: string) => {
        try {
            const res = await fetch(url);
            if (!res.ok)
                throw new Error('Erreur lors du téléchargement du fichier');
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `${type}_${selectedLocataire?.nom}_${selectedLocataire?.prenom}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch (error) {
            toast.error('Erreur lors du téléchargement du fichier');
            console.error(error);
        }
    };

    const isImage = (url: string) => /\.(jpg|jpeg|png|gif)$/i.test(url);
    const isPDF = (url: string) => /\.pdf$/i.test(url);

    if (userStats.gestionnaire?.statut === 'EN_ATTENTE') {
        return (
            <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
                <AlertCircleIcon
                    className="mr-4 h-4 w-4"
                    aria-label="Icône d'avertissement"
                />
                <AlertTitle>Compte en attente</AlertTitle>
                <AlertDescription>
                    Votre compte est en attente de validation. Veuillez
                    patienter pour sa validation.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
                <Input
                    placeholder="Rechercher un locataire par nom ou prénom..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
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
                <p className="text-center text-gray-500">
                    Aucun locataire trouvé.
                </p>
            ) : (
                <div className="space-y-4">
                    {filteredLocataires.map(locataire => {
                        // Trouver l'unité locative et la propriété associée
                        const uniteLocative = proprietes
                            .flatMap(p => p.unitesLocatives)
                            .find(u => u.id === locataire.uniteLocativeId);
                        const propriete = proprietes.find(p =>
                            p.unitesLocatives.some(
                                u => u.id === locataire.uniteLocativeId
                            )
                        );
                        return (
                            <div
                                key={locataire.id}
                                className="flex justify-between items-center p-4 border rounded-lg shadow-sm"
                            >
                                <div>
                                    <p className="font-semibold">
                                        {locataire.nom} {locataire.prenom}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {locataire.email}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {locataire.telephone}
                                    </p>
                                    {/* Affichage de l'unité locative et de la propriété */}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Unité locative :{' '}
                                        <span className="font-medium">
                                            {uniteLocative?.nom ||
                                                'Non trouvée'}
                                        </span>
                                        {'  |  '}
                                        Propriété :{' '}
                                        <span className="font-medium">
                                            {propriete?.nom || 'Non trouvée'}
                                        </span>
                                    </p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleEdit(locataire)
                                            }
                                        >
                                            Modifier
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setSelectedLocataire(locataire);
                                                setOpenDeleteDialog(true);
                                            }}
                                            className="text-red-600"
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
                                            {documentsLoading &&
                                            selectedLocataire?.id ===
                                                locataire.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : null}
                                            Voir les documents
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        );
                    })}
                </div>
            )}
            <LocataireDialog
                open={openCreateDialog}
                onClose={() => {
                    setOpenCreateDialog(false);
                    fetchData();
                }}
                userId={userId?.toString() ?? ''}
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
                    userId={userId?.toString() ?? ''}
                    proprietes={proprietes}
                    locataire={selectedLocataire}
                />
            )}
            <Dialog
                open={openDeleteDialog}
                onOpenChange={() => setOpenDeleteDialog(false)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                    </DialogHeader>
                    <p>
                        Êtes-vous sûr de vouloir supprimer le locataire{' '}
                        <strong>
                            {selectedLocataire?.nom} {selectedLocataire?.prenom}
                        </strong>{' '}
                        ?
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
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
            <Dialog
                open={openDocumentsDialog}
                onOpenChange={() => {
                    setOpenDocumentsDialog(false);
                    setPreviewDocument(null);
                }}
            >
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            Documents de {selectedLocataire?.nom}{' '}
                            {selectedLocataire?.prenom}
                        </DialogTitle>
                    </DialogHeader>
                    {documentsLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : previewDocument ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">
                                    {previewDocument.type}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPreviewDocument(null)}
                                >
                                    Retour à la liste
                                </Button>
                            </div>
                            {isImage(previewDocument.url) ? (
                                <Image
                                    src={previewDocument.url}
                                    alt={previewDocument.type}
                                    className="max-w-full h-auto max-h-[60vh] object-contain mx-auto"
                                    width={800}
                                    height={600}
                                />
                            ) : isPDF(previewDocument.url) ? (
                                <iframe
                                    src={previewDocument.url}
                                    className="w-full h-[60vh] border rounded"
                                    title={previewDocument.type}
                                    allow="autoplay"
                                />
                            ) : (
                                <p className="text-gray-500">
                                    Prévisualisation non disponible pour ce type
                                    de fichier.
                                </p>
                            )}
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handleDownload(
                                            previewDocument.url,
                                            previewDocument.type
                                        )
                                    }
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Télécharger
                                </Button>
                            </div>
                        </div>
                    ) : documents.length === 0 ? (
                        <p className="text-gray-500">
                            Aucun document disponible.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {documents.map((doc, index) =>
                                doc.url ? (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center p-2 border rounded"
                                    >
                                        <span>{doc.type}</span>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setPreviewDocument(doc)
                                                }
                                                disabled={
                                                    !(
                                                        isImage(doc.url) ||
                                                        isPDF(doc.url)
                                                    )
                                                }
                                            >
                                                Prévisualiser
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleDownload(
                                                        doc.url,
                                                        doc.type
                                                    )
                                                }
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : null
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
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
