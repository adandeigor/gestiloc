'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface StatProps {
  value: string;
  label: string;
}

const StatCard: React.FC<StatProps> = ({ value, label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    const duration = 2000;
    const increment = end / (duration / 60);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-3xl md:text-4xl font-bold text-accent montserrat-bold">
        {value.includes('%') || value.includes('/')
          ? value
          : `${count.toLocaleString()}${value.includes('+') ? '+' : ''}`}
      </h3>
      <p className="text-white mt-2 text-center montserrat-regular">{label}</p>
    </motion.div>
  );
};

const StatsSection: React.FC = () => {
  const stats = [
    { value: '5000+', label: 'Propriétaires' },
    { value: '15000+', label: 'Biens gérés' },
    { value: '98%', label: 'Satisfaction client' },
    { value: '24/7', label: 'Support client' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="py-16 bg-primary"
    >
      <div className="max-w-screen-xl mx-auto px-6">
        <h2
          className="text-2xl md:text-3xl font-bold text-center text-white mb-12 montserrat-bold"
          aria-label="Statistiques de GestiLoc"
        >
          GestiLoc en chiffres
        </h2>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default StatsSection;