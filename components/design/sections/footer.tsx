import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Facebook, Linkedin, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
    const quickLinks = [
        { name: 'Accueil', href: '/' },
        { name: 'À propos', href: '/about' },
        { name: 'Tarifs', href: '/pricing' },
        { name: 'Contacts', href: '/contact' },
    ];

    const resources = [
        { name: "Centre d'aide", href: '/help' },
        { name: 'Documentation', href: '/docs' },
        { name: 'Politique de confidentialité', href: '/privacy' },
        { name: "Conditions d'utilisation", href: '/terms' },
        { name: 'Mentions légales', href: '/legal' },
    ];

    return (
        <footer
            className="bg-primary text-white py-12"
            aria-label="Pied de page GestiLoc"
        >
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 max-w-screen-xl mx-auto gap-8 mb-12">
                    <div className="flex flex-col items-center md:items-start mb-12">
                        <p className="text-2xl font-bold text-white montserrat-bold">
                            Gestiloc
                        </p>
                        <p className="text-white text-center md:text-left montserrat-regular max-w-md">
                            La solution complète pour la gestion de vos biens
                            immobiliers.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <Button
                                size={'icon'}
                                variant={'ghost'}
                                className="cursor-pointer"
                            >
                                <Facebook />
                            </Button>
                            <Button
                                size={'icon'}
                                variant={'ghost'}
                                className="cursor-pointer"
                            >
                                <Twitter />
                            </Button>
                            <Button
                                size={'icon'}
                                variant={'ghost'}
                                className="cursor-pointer"
                            >
                                <Linkedin />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white montserrat-bold mb-4">
                            Liens rapides
                        </h3>
                        <ul className="space-y-2">
                            {quickLinks.map(link => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-white hover:text-white montserrat-regular transition-colors duration-300"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white montserrat-bold mb-4">
                            Ressources
                        </h3>
                        <ul className="space-y-2">
                            {resources.map(resource => (
                                <li key={resource.name}>
                                    <Link
                                        href={resource.href}
                                        className="text-white hover:text-white montserrat-regular transition-colors duration-300"
                                    >
                                        {resource.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white montserrat-bold mb-4">
                            Contact
                        </h3>
                        <ul className="space-y-2 text-white montserrat-regular">
                            <li>Cotonou, Bénin</li>
                            <li>+229 0199663322</li>
                            <li>
                                <a
                                    href="mailto:contact@gestiloc.com"
                                    className="hover:text-white transition-colors duration-300"
                                >
                                    contact@gestiloc.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-primary/80 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-white montserrat-regular text-sm">
                        © 2025 GestiLoc. Tous droits réservés.
                    </p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link
                            href="/privacy"
                            className="text-white hover:text-white montserrat-regular text-sm transition-colors duration-300"
                        >
                            Politique de confidentialité
                        </Link>
                        <Link
                            href="/terms"
                            className="text-white hover:text-white montserrat-regular text-sm transition-colors duration-300"
                        >
                            Conditions d&#39;utilisation
                        </Link>
                        <Link
                            href="/legal"
                            className="text-white hover:text-white montserrat-regular text-sm transition-colors duration-300"
                        >
                            Mentions légales
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
