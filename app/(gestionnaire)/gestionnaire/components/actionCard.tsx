import { LucideIcon } from 'lucide-react';

interface ActionCardProps {
    title: string;
    icon: LucideIcon;
    onClick?: () => void;
    color?: string;
}

export function ActionCard({
    title,
    icon: Icon,
    onClick,
    color = 'text-blue-500',
}: ActionCardProps) {
    return (
        <div
            className={`flex flex-col py-[30px] max-w-sm items-center rounded-md cursor-pointer border-[2px] border-gray-200 hover:bg-gray-100 duration-200`}
            onClick={onClick}
        >
            <Icon className={`w-6 h-6 ${color ? color : 'text-blue-500'}`} />
            <span className="font-semibold text-[15px] text-center">
                {title}
            </span>
        </div>
    );
}
