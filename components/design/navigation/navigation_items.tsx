import React from 'react';
import Link from 'next/link';
import { NavigationContentProps } from './navigation_content';
import { cn } from '../../../lib/utils';

interface NavigationItemProps extends NavigationContentProps {
    isOpen: boolean;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
    name,
    icon: Icon,
    href,
    isOpen,
}) => {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg text-white montserrat-regular text-sm relative overflow-hidden group',
                'hover:bg-white/10 transition-all duration-300',
                isOpen ? 'justify-start' : 'justify-center'
            )}
            aria-label={name}
        >
            <Icon className="w-5 h-5 shrink-0 transform transition-transform duration-300 group-hover:scale-110" />
            {isOpen && (
                <span className=" group-hover:opacity-100 transition-opacity duration-300">
                    {name}
                </span>
            )}
            {isOpen && (
                <span className="absolute left-0 top-0 h-full w-1 bg-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />
            )}
        </Link>
    );
};

export default NavigationItem;
