import { z } from 'zod';

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
export type UniteLocativeType = {
  id?: number;
  nom: string;
  description?: string;
  prix: number;
  _new?: boolean;
  _edit?: boolean;
  _showDesc?: boolean;
};

// Type pour les statistiques utilisateur
export type UserStats = {
  proprietes: ProprieteType[];
  gestionnaire?: {
    id: number;
  };
};