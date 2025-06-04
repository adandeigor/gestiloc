'use client'

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserStats } from "../services/getUserStats";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import getCookie from "@/core/getCookie";

// Interface minimale pour ne conserver que ce qui est nécessaire
interface Gestionnaire {
  id: number;
  statut: string;
}

interface UserStats {
  gestionnaire: Gestionnaire;
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
        // Récupérer l'userId depuis le cookie
        const storedUserId = getCookie("userId");
        if (!storedUserId) {
          throw new Error("Utilisateur non authentifié. Veuillez vous reconnecter.");
        }
        setUserId(storedUserId);

        // Récupérer les stats de l'utilisateur
        const result = await getUserStats();
        if (!result?.gestionnaire) {
          throw new Error("Données utilisateur introuvables.");
        }
        setData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue.";
        setError(errorMessage);
        toast.error(errorMessage);
        // Rediriger vers la page de connexion en cas d'erreur d'authentification
        if (errorMessage.includes("authentifié")) {
          router.push("/auth/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Afficher un spinner pendant le chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Afficher une alerte en cas d'erreur
  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircleIcon className="mr-4 h-4 w-4" aria-label="Icône d'erreur" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Vérifier si le compte est en attente
  if (data?.gestionnaire?.statut === "EN_ATTENTE") {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircleIcon className="mr-4 h-4 w-4" aria-label="Icône d'avertissement" />
        <AlertTitle>Compte en attente</AlertTitle>
        <AlertDescription>
          Votre compte est en attente de validation. Veuillez patienter jusqu'à ce qu'un administrateur active votre compte.
        </AlertDescription>
      </Alert>
    );
  }

  // Rendre le dashboard si le compte est confirmé
  return <DashboardClient />;
}