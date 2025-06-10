import { z } from 'zod';

// Utilitaire pour accepter soit une string (pour l'update), soit un File (pour la création)
const fileOrString = z.union([
    z.instanceof(File),
    z.string().min(1, 'Ce champ est requis'),
]);

export const ProfileValidator = z.object({
    nationalite: z.string().min(1, 'La nationalité est requise'),
    adresse: z.string().min(1, "L'adresse est requise"),
    ville: z.string().min(1, 'La ville est requise'),
    code_postal: z.string().min(1, 'Le code postal est requis'),
    pays: z.string().min(1, 'Le pays est requis'),
    date_naissance: z.date({
        required_error: 'La date de naissance est requise',
        invalid_type_error: 'Format de date invalide',
    }),
    role: z.enum(['GESTIONNAIRE', 'PARTICULIER'], {
        errorMap: () => ({ message: 'Rôle invalide' }),
    }),
    ifu: z.instanceof(File, { message: 'Le fichier IFU est requis' }),
    carte_identite: z.instanceof(File, {
        message: "La carte d'identité est requise",
    }),
});

export const ProfileValidatorUpdate = z.object({
    ifu: fileOrString.optional().nullable(),
    carte_identite: fileOrString.optional().nullable(),
    nationalite: z.string().optional().nullable(),
    adresse: z.string().optional().nullable(),
    ville: z.string().optional().nullable(),
    code_postal: z.string().optional().nullable(),
    pays: z.string().optional().nullable(),
    date_naissance: z.coerce
        .date({ invalid_type_error: 'Date de naissance invalide' })
        .optional()
        .nullable(),
});
export type ProfileValidatorUpdateType = z.infer<typeof ProfileValidatorUpdate>;
export type ProfileValidatorType = z.infer<typeof ProfileValidator>;
