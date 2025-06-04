
import { motion } from 'framer-motion';
import Image from 'next/image';

const WelcomeSection = ()=> {
    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative h-[calc(100vh-200px)] md:h-[calc(100vh-300px)] bg-cover bg-center bg-no-repeat bg-gray-900"
            style={{ backgroundImage:  "url('/images/immeubles.jpg')" }}
        >
            <Image
                width={1920}
                height={1080}
                src="/images/immeubles.jpg"
                alt="Immeubles"
                className={`absolute inset-0 w-full h-full object-cover z-0`}
                draggable={false}
            />
            {/* Skeleton overlay, visible seulement si l'image n'est pas chargée */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent"></div>
            <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
                <div className="relative z-10  md:text-start lg:max-w-2xl">
                    <p className="mb-4 text-2xl tracking-tight font-bold md:font-extrabold text-white md:text-5xl lg:text-6xl font-sans">Gérez vos biens immobiliers en toute simplicité</p>
                    <p className="mb-4 text-md font-semibold text-white md:text-lg lg:text-xl font-mono">GestiLoc vous offre une solution complète pour la gestion de vos propriétés locatives, du suivi des paiements à la communication avec vos locataires.</p>
                    <div className="flex flex-col gap-4 md:flex-row md:gap-6 lg:gap-8">
                        <button className="px-10 py-4 rounded font-semibold text-sm text-white bg-accent hover:bg-accent/10 focus:ring-4 focus:ring-accent/50 transition-colors cursor-pointer duration-300 ease-in-out">
                            Commencer maintenant
                        </button>
                        <button className="px-10 py-4 rounded font-semibold text-sm text-white border border-white hover:bg-white/10 focus:ring-4 focus:ring-accent/50 transition-colors cursor-pointer duration-300 ease-in-out">
                            Voir la démo
                        </button>
                    </div>
                </div>            
            </div>
        </motion.section>
    )   
}

export default WelcomeSection;