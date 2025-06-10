// gestionnaire/components/StatCard.tsx
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    subText: string;
    trend?: number; // Pour le pourcentage de variation (optionnel)
    trendPositive?: boolean; // Indique si la variation est positive ou négative
}

export const StatCard = ({
    title,
    value,
    icon: Icon,
    subText,
    trend,
    trendPositive,
}: StatCardProps) => {
    return (
        <div className="bg-gray-100  rounded-lg shadow-md shadow-gray-300 flex flex-col gap-2  justify-between">
            <div className="p-4 flex flex-row items-start gap-5">
                <div className="p-3 bg-[#9FC131]/20 rounded-lg overflow-hidden">
                    <Icon className="w-6 h-6 text-[#9FC131]" />
                </div>
                <div className="flex flex-col items-start gap-2">
                    <p className="text-sm text-[#2C2C2C]">{title}</p>
                    <div className="flex items-center gap-2">
                        <p
                            className={` font-semibold text-[#2C2C2C] ${typeof value === 'string' ? 'text-[14px]' : 'text-2xl'}`}
                        >
                            {value}
                        </p>
                        {trend !== undefined && (
                            <span
                                className={`text-sm ${
                                    trendPositive
                                        ? 'text-[#3E8E41]'
                                        : 'text-[#D1495B]'
                                }`}
                            >
                                {trendPositive ? '+' : ''}
                                {trend}%
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <a
                href="#"
                className="text-[#004E64] font-bold text-sm hover:underline bg-gray-200 p-4 rounded-b-lg"
            >
                {subText}
            </a>
        </div>
    );
};
