import {  Files, HandCoins, LayoutDashboard, LucideIcon, SquareUserRound, TableProperties } from "lucide-react";

export interface Navigation {
    name: string;
    path: string;
    icon: LucideIcon;
}

export const navigationList: Navigation[] = [
    {
        name : "Tableau de bord",
        path : "/gestionnaire/dashboard",
        icon : LayoutDashboard
    },
    {
        name : "Mes Propriétés",
        path : "/gestionnaire/propriete",
        icon : TableProperties
    },
    {
        name : "Locataires",
        path : "/gestionnaire/locataires",
        icon : SquareUserRound
    },
    {
        name : "Finances",
        path : "/gestionnaire/finances",
        icon : HandCoins
    },
    {
        name : "Documents",
        path : "/gestionnaire/documents",
        icon : Files
    }
]

export const LocataireData = {
    labels: [
        'occupée',
        'libre',
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [ 50, 100],
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(229, 231, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
      }]
}
