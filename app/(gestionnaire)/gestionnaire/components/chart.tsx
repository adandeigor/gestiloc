'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import { getUserStats } from '../services/getUserStats';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Base data for the chart
const initialChartData = {
    labels: ['Occupée', 'Libre'],
    datasets: [
        {
            label: 'Statut des Logements',
            data: [0, 0], // Initial placeholder
            backgroundColor: [
                '#004E64', // blue-500
                'rgb(229, 231, 235)', // gray-200
            ],
            hoverOffset: 4,
        },
    ],
};

const LocataireChart = () => {
    const [chartData, setChartData] = useState(initialChartData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const stats = await getUserStats();
                // Utilise les stats pour remplir le graphique
                setChartData({
                    ...initialChartData,
                    datasets: [
                        {
                            ...initialChartData.datasets[0],
                            data: [
                                stats.unitsOccupied || 0,
                                stats.unitsAvailable || 0,
                            ],
                        },
                    ],
                });
            } catch {
                setChartData(initialChartData);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="w-full max-w-2xl p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold  mb-3 text-center">
                Répartition des Logements
            </h2>
            {loading ? (
                <div className="flex items-center h-[200px]">
                    <p className="text-gray-500 text-center w-full">
                        Chargement...
                    </p>
                </div>
            ) : (
                <Doughnut
                    className="h-[200px] w-[200px] max-w-[200px] max-h-[200px] mx-auto"
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        cutout: '70%',
                        plugins: {
                            legend: {
                                position: 'left',
                                labels: {
                                    boxWidth: 10,
                                    padding: 6,
                                    font: {
                                        size: 11,
                                    },
                                },
                            },
                            title: {
                                display: true,
                                text: 'Statut des Logements',
                                font: {
                                    size: 12,
                                },
                            },
                        },
                    }}
                />
            )}
        </div>
    );
};

export default LocataireChart;
