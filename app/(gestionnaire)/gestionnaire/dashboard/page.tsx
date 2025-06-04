'use client'

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserStats } from "../services/getUserStats";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

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
      } catch (err: any) {
        const errorMessage = err.response?.status === 401
          ? "Session expirée, veuillez vous reconnecter"
          : "Erreur lors de la récupération des données utilisateur";
        setError(errorMessage);
        toast.error(`${errorMessage}. Veuillez actualiser la page.`);
        if (err.response?.status === 401) {
          router.push("/auth/login");
        }
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
          Votre compte est actuellement en attente de validation. Veuillez patienter jusqu'à ce que votre compte soit activé par un administrateur avant d'accéder au tableau de bord.
        </AlertDescription>
      </Alert>
    );
  }

  // Rendu du composant DashboardClient avec les props nécessaires
  return <DashboardClient/>;
}