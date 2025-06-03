import Loader from "@/components/Loader";
import { SidebarNavigation } from "./gestionnaire/components/Navigation";
import { Suspense } from "react";
import "leaflet/dist/leaflet.css"; // Ajout des styles Leaflet
const gestionnaireLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="">
        <SidebarNavigation />
        <Suspense  fallback={<div className="flex justify-center items-center h-screen">Chargement...</div>}>
          <Loader />
        </Suspense>
        <div className="max-w-screen-xl mx-auto w-full">
          <Suspense fallback={<div>Chargement...</div>}>{children}</Suspense>
        </div>
      </div>
    </>
  );
};
export default gestionnaireLayout;
