import { authHeader } from "@/core/auth-header";
import getCookie from "@/core/getCookie";
import { toast } from "sonner";

const getUserStats = async () => {
    const userid = getCookie("userId");
    const jwt = getCookie("jwt");

    if (!userid || !jwt) {
        toast.error("Utilisateur non authentifié");
        return;
    }
   const headers: Record<string, string> = {
            "Content-Type": "application/json", 
            ...authHeader(jwt as string)
        };
   Object.keys(headers).forEach(key => {
       if (headers[key] === undefined) delete headers[key];
   });
   const response = await fetch(`/api/user/${userid}/stats`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        toast.error("Erreur lors de la récupération des statistiques de l'utilisateur");
    }
    const data = await response.json();
    return data;    
};

export { getUserStats };
