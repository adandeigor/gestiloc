import { motion } from 'framer-motion';
import Image from 'next/image';

const CallToAction = () => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-gray-100 py-12"
        >
            <div className="max-w-screen-xl mx-auto text-center  bg-white rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex flex-col items-start  p-8 gap-4 max-w-xl">
                        <p className="text-2xl font-bold text-start">
                            Prêt à simplifier votre gestion locative ?
                        </p>
                        <p className="text-md font-mono text-start">
                            Rejoignez des milliers de propriétaires qui ont déjà
                            transformé leur façon de gérer leurs biens
                            immobiliers.
                        </p>
                        <div className="flex flex-row gap-4">
                            <button className="px-8 py-4 rounded font-semibold text-sm text-white bg-accent hover:bg-accent/10 focus:ring-4 focus:ring-accent/50 transition-colors cursor-pointer duration-300 ease-in-out">
                                Essai gratuit de 30 jours
                            </button>
                            <button className="px-8 py-4 rounded font-semibold text-sm text-primary border border-primary hover:bg-primary/10 focus:ring-4 focus:ring-accent/50 transition-colors cursor-pointer duration-300 ease-in-out">
                                Démander une démo
                            </button>
                        </div>
                    </div>
                    <div className="relative min-w-[500px] min-h-[500px] flex items-center justify-center">
                        <Image
                            src="/images/cta.jpg"
                            alt="Call to Action Illustration"
                            width={500}
                            height={500}
                            className={`mx-auto md:rounded-r-lg`}
                            draggable={false}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </div>
                </div>
            </div>
        </motion.section>
    );
};
export default CallToAction;
