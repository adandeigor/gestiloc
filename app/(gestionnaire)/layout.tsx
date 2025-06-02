import Loader from "@/components/Loader"
import { SidebarNavigation } from "./gestionnaire/components/Navigation"
import "leaflet/dist/leaflet.css"; // Ajout des styles Leaflet
const gestionnaireLayout = ({children}:{children:React.ReactNode})=>{
    return (<>
        <div className="">
            <SidebarNavigation  />
            <Loader/>
            <div className="max-w-screen-xl mx-auto w-full">
                {children}
            </div>
        </div>
    </>)
}
export default gestionnaireLayout