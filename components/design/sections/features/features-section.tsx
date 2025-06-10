import { motion } from 'framer-motion';
import FeatureCard from './featureCard';
import FeaturesList from './features-list';

const FeaturesSection = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white"
        >
            <div className="max-w-screen-xl mx-auto py-16">
                <p className="text-3xl font-bold font-sans text-center">
                    Simplifiez votre gestion locative
                </p>
                <p className="text-lg text-center font-mono text-gray-600">
                    Notre plateforme vous offre tous les outils nécessaires pour
                    gérer efficacement vos biens immobiliers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 center px-4">
                    {FeaturesList.map((item, index) => (
                        <FeatureCard key={index} {...item} />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default FeaturesSection;
