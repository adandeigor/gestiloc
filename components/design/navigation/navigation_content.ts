import {
    Home,
    Info,
    Mail,
    Book,
    FileText,
    Shield,
    LucideProps,
    Banknote,
} from 'lucide-react';

export interface NavigationContentProps {
    name: string;
    icon: React.ForwardRefExoticComponent<
        Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
    >;
    href: string;
}

const NavigationContent: NavigationContentProps[] = [
    {
        name: 'Accueil',
        icon: Home,
        href: '/',
    },
    {
        name: 'A propos',
        icon: Info,
        href: '/about',
    },
    {
        name: 'Contact',
        icon: Mail,
        href: '/contact',
    },
    {
        name: 'Documentation',
        icon: Book,
        href: '/docs',
    },
    {
        name: 'Tarifs',
        icon: Banknote,
        href: '/pricing',
    },
    {
        name: "Conditions d'utilisation",
        icon: FileText,
        href: '/terms',
    },
    {
        name: 'Politique de confidentialité',
        icon: Shield,
        href: '/privacy',
    },
];

export default NavigationContent;
