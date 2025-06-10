'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { uploadToSupabase } from '@/core/uploadFIle';
import { Loader2 } from 'lucide-react';
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

const LocataireSchema = z
    .object({
        nom: z.string().min(1, 'Le nom du locataire est requis'),
        prenom: z.string().min(1, 'Le prénom du locataire est requis'),
        email: z
            .string()
            .email("L'email doit être valide")
            .min(1, "L'email du locataire est requis"),
        telephone: z
            .string()
            .min(1, 'Le numéro de téléphone du locataire est requis'),
        carte_identite: z
            .union([z.string(), z.instanceof(File)])
            .refine(
                val => (typeof val === 'string' ? val.length > 0 : true),
                "La carte d'identité du locataire est requise"
            ),
        photo_identite: z
            .union([z.string(), z.instanceof(File)])
            .optional()
            .nullable(),
        proprieteId: z.string().min(1, 'La propriété est requise'),
        uniteLocativeId: z.string().optional(),
    })
    .refine(data => !data.proprieteId || data.uniteLocativeId, {
        message:
            "L'unité locative est requise si une propriété est sélectionnée",
        path: ['uniteLocativeId'],
    });

type LocataireFormType = z.infer<typeof LocataireSchema>;

interface LocataireDialogProps {
    open: boolean;
    onClose: () => void;
    userId: string | number;
    proprietes: Propriete[];
    locataire?: Locataire;
}

export function LocataireDialog({
    open,
    onClose,
    userId,
    proprietes,
    locataire,
}: LocataireDialogProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm<LocataireFormType>({
        resolver: zodResolver(LocataireSchema),
        defaultValues: {
            nom: locataire?.nom || '',
            prenom: locataire?.prenom || '',
            email: locataire?.email || '',
            telephone: locataire?.telephone || '',
            carte_identite: locataire?.carte_identite || '',
            photo_identite: locataire?.photo_identite || '',
            proprieteId: '',
            uniteLocativeId: locataire?.uniteLocativeId
                ? String(locataire.uniteLocativeId)
                : '',
        },
    });
    const [loading, setLoading] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const [unitOptions, setUnitOptions] = useState<UniteLocative[]>([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [formDataToSubmit, setFormDataToSubmit] =
        useState<LocataireFormType | null>(null);
    const selectedProprieteId = watch('proprieteId');
    const selectedUniteLocativeId = watch('uniteLocativeId');

    useEffect(() => {
        if (locataire && proprietes.length > 0) {
            const prop = proprietes.find(p =>
                p.unitesLocatives.some(u => u.id === locataire.uniteLocativeId)
            );
            if (prop) {
                setValue('proprieteId', String(prop.id));
                setUnitOptions(prop.unitesLocatives || []);
                setValue('uniteLocativeId', String(locataire.uniteLocativeId));
                console.log(
                    'Pre-selected uniteLocativeId:',
                    String(locataire.uniteLocativeId)
                );
            }
        } else {
            setUnitOptions([]);
            setValue('proprieteId', '');
            setValue('uniteLocativeId', '');
        }
    }, [locataire, proprietes, setValue]);

    useEffect(() => {
        if (selectedProprieteId) {
            const prop = proprietes.find(
                p => String(p.id) === String(selectedProprieteId)
            );
            setUnitOptions(prop?.unitesLocatives || []);
            if (
                locataire &&
                prop?.unitesLocatives.some(
                    u => u.id === locataire.uniteLocativeId
                )
            ) {
                setValue('uniteLocativeId', String(locataire.uniteLocativeId));
            } else if (
                !locataire ||
                !prop?.unitesLocatives.some(
                    u => u.id === locataire.uniteLocativeId
                )
            ) {
                setValue('uniteLocativeId', '');
            }
        } else {
            setUnitOptions([]);
            setValue('uniteLocativeId', '');
        }
    }, [selectedProprieteId, proprietes, setValue, locataire]);

    useEffect(() => {
        // Débogage : vérifier selectedUniteLocativeId et unitOptions
        console.log('selectedUniteLocativeId:', selectedUniteLocativeId);
        console.log('unitOptions:', unitOptions);
    }, [selectedUniteLocativeId, unitOptions]);

    const onSubmit = async (data: LocataireFormType) => {
        if (
            locataire &&
            data.uniteLocativeId &&
            data.uniteLocativeId !== String(locataire.uniteLocativeId)
        ) {
            setFormDataToSubmit(data);
            setConfirmDialogOpen(true);
            return;
        }

        await submitLocataire(data);
    };

    const submitLocataire = async (data: LocataireFormType) => {
        setLoading(true);
        try {
            let photoUrl = data.photo_identite;
            let carteUrl = data.carte_identite;
            if (data.photo_identite instanceof File) {
                setFileUploading(true);
                photoUrl = await uploadToSupabase(
                    data.photo_identite,
                    'profil_picture',
                    String(userId)
                );
                setFileUploading(false);
            }
            if (data.carte_identite instanceof File) {
                setFileUploading(true);
                carteUrl = await uploadToSupabase(
                    data.carte_identite,
                    'carte_identite',
                    String(userId)
                );
                setFileUploading(false);
            }

            const prop = proprietes.find(
                p => String(p.id) === String(data.proprieteId)
            );
            const unite = data.uniteLocativeId
                ? prop?.unitesLocatives.find(
                      u => String(u.id) === String(data.uniteLocativeId)
                  )
                : locataire
                  ? prop?.unitesLocatives.find(
                        u => u.id === locataire.uniteLocativeId
                    )
                  : null;

            if (!prop || (!unite && !locataire)) {
                throw new Error('Propriété ou unité locative introuvable');
            }

            const url = locataire
                ? `/api/user/${userId}/propriete/${data.proprieteId}/uniteLocative/${data.uniteLocativeId || locataire.uniteLocativeId}/locataire/${locataire.id}`
                : `/api/user/${userId}/propriete/${data.proprieteId}/uniteLocative/${data.uniteLocativeId}/locataire`;

            const body = {
                nom: data.nom,
                prenom: data.prenom,
                email: data.email,
                telephone: data.telephone,
                carte_identite: carteUrl,
                photo_identite: photoUrl || undefined,
                uniteLocativeId:
                    data.uniteLocativeId ||
                    (locataire ? String(locataire.uniteLocativeId) : undefined),
            };

            if (locataire) {
                await httpClient.put(url, body);
                toast.success('Locataire mis à jour avec succès !');
            } else {
                await httpClient.post(url, body);
                toast.success('Locataire enregistré avec succès !');
            }
            onClose();
            reset();
        } catch (e) {
            const errorMessage =
                typeof e === 'object' && e !== null && 'message' in e
                    ? (e as { message?: string }).message
                    : undefined;
            toast.error(
                errorMessage ||
                    (locataire
                        ? 'Erreur lors de la mise à jour du locataire'
                        : 'Erreur lors de la création du locataire')
            );
        } finally {
            setLoading(false);
            setFileUploading(false);
            setConfirmDialogOpen(false);
            setFormDataToSubmit(null);
        }
    };

    const handleConfirmChange = async () => {
        if (formDataToSubmit) {
            await submitLocataire(formDataToSubmit);
        }
    };

    const handleCancelChange = () => {
        setConfirmDialogOpen(false);
        setFormDataToSubmit(null);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent
                    className="max-w-lg w-full p-2 sm:p-6 rounded-lg overflow-y-auto max-h-[90dvh] sm:max-h-[80vh]"
                    style={{ overscrollBehavior: 'contain' }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                            {locataire
                                ? 'Modifier un locataire'
                                : 'Ajouter un locataire'}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-3 sm:space-y-4 text-xs sm:text-sm"
                    >
                        <div className="flex flex-col md:flex-row gap-2">
                            <div className="flex-1">
                                <label className="block text-xs sm:text-sm font-medium mb-1">
                                    Nom
                                </label>
                                <Input
                                    {...register('nom')}
                                    placeholder="Nom"
                                    disabled={loading}
                                    className="text-xs sm:text-sm px-2 py-1 sm:py-2"
                                />
                                {errors.nom && (
                                    <span className="text-red-500 text-xs">
                                        {errors.nom.message}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs sm:text-sm font-medium mb-1">
                                    Prénom
                                </label>
                                <Input
                                    {...register('prenom')}
                                    placeholder="Prénom"
                                    disabled={loading}
                                    className="text-xs sm:text-sm px-2 py-1 sm:py-2"
                                />
                                {errors.prenom && (
                                    <span className="text-red-500 text-xs">
                                        {errors.prenom.message}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-1">
                                Email
                            </label>
                            <Input
                                {...register('email')}
                                placeholder="Email"
                                disabled={loading}
                                className="text-xs sm:text-sm px-2 py-1 sm:py-2"
                            />
                            {errors.email && (
                                <span className="text-red-500 text-xs">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-1">
                                Téléphone
                            </label>
                            <Input
                                {...register('telephone')}
                                placeholder="Téléphone"
                                disabled={loading}
                                className="text-xs sm:text-sm px-2 py-1 sm:py-2"
                            />
                            {errors.telephone && (
                                <span className="text-red-500 text-xs">
                                    {errors.telephone.message}
                                </span>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-1">
                                Carte d&#39;identité (image)
                            </label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    setValue(
                                        'carte_identite',
                                        file || locataire?.carte_identite || ''
                                    );
                                }}
                                disabled={loading || fileUploading}
                                className="text-xs sm:text-sm px-2 py-1 sm:py-2"
                            />
                            {locataire?.carte_identite && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Fichier actuel :{' '}
                                    {locataire.carte_identite.split('/').pop()}
                                </p>
                            )}
                            {fileUploading && (
                                <span className="text-blue-500 text-xs">
                                    Téléversement en cours...
                                </span>
                            )}
                            {errors.carte_identite && (
                                <span className="text-red-500 text-xs">
                                    {errors.carte_identite.message}
                                </span>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-1">
                                Photo d&#39;identité (image)
                            </label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    setValue(
                                        'photo_identite',
                                        file || locataire?.photo_identite || ''
                                    );
                                }}
                                disabled={loading || fileUploading}
                                className="text-xs sm:text-sm px-2 py-1 sm:py-2"
                            />
                            {locataire?.photo_identite && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Fichier actuel :{' '}
                                    {locataire.photo_identite.split('/').pop()}
                                </p>
                            )}
                            {fileUploading && (
                                <span className="text-blue-500 text-xs">
                                    Téléversement en cours...
                                </span>
                            )}
                            {errors.photo_identite && (
                                <span className="text-red-500 text-xs">
                                    {errors.photo_identite.message}
                                </span>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-1">
                                Propriété
                            </label>
                            <Select
                                value={selectedProprieteId || undefined}
                                onValueChange={v => setValue('proprieteId', v)}
                                disabled={loading}
                            >
                                <SelectTrigger className="text-xs sm:text-sm px-2 py-1 sm:py-2">
                                    <SelectValue placeholder="Sélectionner une propriété" />
                                </SelectTrigger>
                                <SelectContent>
                                    {proprietes.length === 0 && (
                                        <SelectItem value="none" disabled>
                                            Aucune propriété disponible
                                        </SelectItem>
                                    )}
                                    {proprietes.map(p => (
                                        <SelectItem
                                            key={p.id}
                                            value={String(p.id)}
                                        >
                                            {p.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.proprieteId && (
                                <span className="text-red-500 text-xs">
                                    {errors.proprieteId.message}
                                </span>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-1">
                                Unité locative {locataire ? '(optionnel)' : ''}
                            </label>
                            <Select
                                value={selectedUniteLocativeId}
                                onValueChange={v =>
                                    setValue('uniteLocativeId', v)
                                }
                                disabled={loading || !selectedProprieteId}
                                key={unitOptions.map(u => u.id).join('-')} // Forcer le re-rendu si unitOptions change
                            >
                                <SelectTrigger className="text-xs sm:text-sm px-2 py-1 sm:py-2">
                                    <SelectValue placeholder="Sélectionner une unité locative" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedProprieteId &&
                                        unitOptions.length === 0 && (
                                            <SelectItem value="none" disabled>
                                                Aucune unité locative
                                            </SelectItem>
                                        )}
                                    {unitOptions.map(u => (
                                        <SelectItem
                                            key={u.id}
                                            value={String(u.id)}
                                        >
                                            {u.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.uniteLocativeId && (
                                <span className="text-red-500 text-xs">
                                    {errors.uniteLocativeId.message}
                                </span>
                            )}
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                            <Button
                                type="submit"
                                disabled={
                                    loading ||
                                    (!!selectedProprieteId &&
                                        unitOptions.length === 0 &&
                                        !locataire) ||
                                    fileUploading
                                }
                                className="w-full sm:w-auto text-xs sm:text-sm px-2 py-1 sm:py-2"
                            >
                                {loading || fileUploading
                                    ? 'Enregistrement...'
                                    : locataire
                                      ? 'Mettre à jour'
                                      : 'Enregistrer'}
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

            <Dialog open={confirmDialogOpen} onOpenChange={handleCancelChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Confirmer le changement d&#39;unité locative
                        </DialogTitle>
                    </DialogHeader>
                    <p>
                        Vous êtes sur le point de changer l&#39;unité locative
                        de {locataire?.nom} {locataire?.prenom}. Cette action
                        affectera l&#39;association du locataire avec
                        l&#39;unité locative. Voulez-vous confirmer ce
                        changement ?
                    </p>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={handleCancelChange}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleConfirmChange}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
