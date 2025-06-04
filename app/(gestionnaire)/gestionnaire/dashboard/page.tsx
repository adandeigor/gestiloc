'use client'

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserStats } from "../services/getUserStats";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

// Interfaces TypeScript (basées sur les données fournies précédemment)
interface Gestionnaire {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  isAdmin: boolean;
  statut: string;
  createdAt: string;
  updatedAt: string;
}

interface DossierGestionnaire {
  id: number;
  gestionnaireId: number;
  ifu_number: string;
  ifu_file: string;
  carte_identite_number: string;
  carte_identite_file: string;
  registre_commerce: string;
  adresse: string;
  code_postal: string;
  ville: string;
  pays: string;
  nationalite: string;
  date_naissance: string;
  role: string;
}

interface Company {
  id: number;
  gestionnaireId: number;
  name: string;
  type: string;
  address: string;
  description: string;
  registre_commerce_number: string;
  registre_commerce_file: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

interface Localisation {
  latitude: number;
  longitude: number;
}

interface Locataire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  carte_identite: string;
  photo_identite: string;
  uniteLocativeId: number;
  createdAt: string;
  updatedAt: string;
}

interface EtatDesLieuxDetails {
  etat: string;
  observations: string;
}

interface EtatDesLieux {
  id: number;
  contratId: number;
  type: string;
  date: string;
  details: EtatDesLieuxDetails;
  createdAt: string;
  updatedAt: string;
}

interface Paiement {
  id: number;
  contratId: number;
  locataireId: number;
  montant: number;
  datePaiement: string;
  paymentMethod: string;
  status: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

interface Contrat {
  id: number;
  locataireId: number;
  uniteLocativeId: number;
  typeContrat: string;
  loyerMensuel: number;
  dateDebut: string;
  dateFin: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  locataire: Locataire;
  paiements: Paiement[];
  etatsDesLieux: EtatDesLieux[];
}

interface UniteLocative {
  id: number;
  proprieteId: number;
  nom: string;
  description: string;
  prix: number;
  createdAt: string;
  updatedAt: string;
  contrats: Contrat[];
  locataires: Locataire[];
}

interface Propriete {
  id: number;
  gestionnaireId: number;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  localisation: Localisation;
  createdAt: string;
  updatedAt: string;
  unitesLocatives: UniteLocative[];
}

interface Notification {
  id: number;
  gestionnaireId: number;
  adminId: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  id: number;
  gestionnaireId: number;
  adminId: number;
  token: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: number;
  gestionnaireId: number;
  adminId: number;
  action: string;
  details: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  gestionnaire: Gestionnaire;
  dossiergestionnaire: DossierGestionnaire;
  company: Company;
  proprietes: Propriete[];
  totalProperties: number;
  unitesLocatives: UniteLocative[];
  totalUnits: number;
  unitsOccupied: number;
  unitsAvailable: number;
  contrats: Contrat[];
  totalContrats: number;
  locataires: Locataire[];
  totalLocataires: number;
  etatsDesLieux: EtatDesLieux[];
  totalEtatsDesLieux: number;
  paiements: Paiement[];
  totalPaiements: number;
  notifications: Notification[];
  totalNotifications: number;
  sessions: Session[];
  totalSessions: number;
  auditLogs: AuditLog[];
  totalAuditLogs: number;
  chiffreAffaire: number;
}

const DashboardClient = dynamic(() => import("./DashboardClient"), { ssr: false });

export default function Page() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vérifier si userId existe dans localStorage
        const storedUserId = localStorage.getItem("userId");
        
        if (!storedUserId) {
          router.push("/auth/login");
          return;
        }

        setUserId(storedUserId);
        
        // Récupérer les stats de l'utilisateur
        const result = await getUserStats();
        setData(result);
      } catch (err) {
        if(err instanceof Error){
          setError(err.message);
        }
        toast.error('Veuillez vous reconnecter pour accéder à votre tableau de bord.')
        return router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Gestion des états de chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircleIcon className="mr-4 h-4 w-4" aria-label="Icône d'erreur" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Vérification si les données ou userId sont absents
  if (!userId || !data) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircleIcon className="mr-4 h-4 w-4" aria-label="Icône d'erreur" />
        <AlertTitle>Données manquantes</AlertTitle>
        <AlertDescription>
          Impossible de charger les données utilisateur. Veuillez vous reconnecter.
        </AlertDescription>
      </Alert>
    );
  }

  // Vérification du statut du gestionnaire
  if (data?.gestionnaire?.statut === "EN_ATTENTE") {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircleIcon className="mr-4 h-4 w-4" aria-label="Icône d'avertissement" />
        <AlertTitle>Compte en attente</AlertTitle>
        <AlertDescription>
          Votre compte est actuellement en attente de validation. Veuillez patienter  que votre compte soit activé par un administrateur avant de pouvoir accéder au tableau de bord.
        </AlertDescription>
      </Alert>
    );
  }

  // Rendu du composant DashboardClient avec les props nécessaires
  return <DashboardClient/>;
}