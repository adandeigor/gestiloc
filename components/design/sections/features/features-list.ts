import {
    CircleGauge,
    FilePenLine,
    HandCoins,
    Home,
    LucideProps,
} from 'lucide-react';

export interface FeaturesListProps {
    title: string;
    description: string;
    icon: React.ForwardRefExoticComponent<
        Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
    >;
}
const FeaturesList: FeaturesListProps[] = [
    {
        title: 'Gestion locative simplifiée',
        description:
            'Centralisez vos propriétés, locataires et contrats dans une plateforme intuitive. Organisez vos contrats, états des lieux et documents importants, et accédez-y instantanément depuis n’importe quel appareil.',
        icon: Home,
    },
    {
        title: 'Signatures électroniques sécurisées',
        description:
            'Signez contrats, avenants et états des lieux en ligne en quelques clics. Bénéficiez d’une sécurité renforcée avec chiffrement et horodatage, pour des signatures légales sans papier.',
        icon: FilePenLine,
    },
    {
        title: 'Suivi des paiements simplifié',
        description:
            'Suivez les paiements de vos locataires en temps réel. Recevez des notifications pour les paiements en cours et les paiements en retard, ainsi que des statistiques sur vos revenus et vos charges.',
        icon: HandCoins,
    },
    {
        title: 'Tableaux de bord intuitifs',
        description:
            'Visualisez les performances de vos propriétés grâce à des graphiques dynamiques. Suivez taux d’occupation, revenus et paiements en retard pour optimiser vos décisions.',
        icon: CircleGauge,
    },
];

export default FeaturesList;
