import getCookie from "@/core/getCookie";
import { toast } from "sonner";
import { httpClient } from "@/core/httpClient";

const getUserStats = async () => {
    const userid = getCookie("userId");
    const jwt = getCookie("jwt");

    if (!userid || !jwt) {
        toast.error("Utilisateur non authentifié");
        return;
    }
    try {
        // Utilisation de httpClient.get
        const data = await httpClient.get(`/api/user/${userid}/stats`);
        return data;
    } catch (error) {
        toast.error(
            error instanceof Error
                ? error.message
                : "Erreur lors de la récupération des statistiques de l'utilisateur"
        );
        return;
    }
};

export { getUserStats };
