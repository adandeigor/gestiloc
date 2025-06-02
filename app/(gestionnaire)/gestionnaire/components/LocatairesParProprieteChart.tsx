'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import { getUserStats } from '../services/getUserStats';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const initialBarData = {
  labels: [],
  datasets: [
    {
      label: 'Nombre de locataires',
      data: [],
      backgroundColor: '#004E64',
      borderRadius: 6,
    },
  ],
};

const LocatairesParProprieteChart = () => {
  const [barData, setBarData] = useState(initialBarData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getUserStats();
        const proprietes = stats.proprietes || [];
        const labels = proprietes.map((p: any) => p.nom);
        const data = proprietes.map((p: any) => {
          // Compte le nombre de locataires uniques par propriété
          const locataires = new Set();
          (p.unitesLocatives || []).forEach((u: any) => {
            (u.locataires || []).forEach((l: any) => locataires.add(l.id));
          });
          return locataires.size;
        });
        setBarData({
          ...initialBarData,
          labels,
          datasets: [{ ...initialBarData.datasets[0], data }],
        });
      } catch (e) {
        setBarData(initialBarData);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full max-w-2xl p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">
        Nombre de locataires par propriété
      </h2>
      {loading ? (
        <div className="flex items-center h-[200px]">
          <p className="text-gray-500 text-center w-full">Chargement...</p>
        </div>
      ) : (
        <Bar
          className="h-[300px] w-full mx-auto"
          data={barData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: {
                display: true,
                text: 'Locataires par propriété',
                font: { size: 14 },
                color: '#ffffff',
              },
            },
            scales: {
              x: {
                title: { display: true, text: 'Propriété' },
                grid: { display: false },
              },
              y: {
                title: { display: true, text: 'Nombre de locataires' },
                beginAtZero: true,
                ticks: { stepSize: 1 },
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default LocatairesParProprieteChart;
