import { cn } from '../../../lib/utils';
import NavigationContent from './navigation_content';
import NavigationItem from './navigation_items';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside
      className={cn(
        'bg-primary backdrop-blur-sm fixed top-0 left-0 transition-all duration-500 ease-in-out z-40',
        // Mobile : caché par défaut, plein écran si ouvert
        isOpen
          ? 'md:w-70 md:shadow-xl py-20 w-full h-screen translate-x-0 duration-300 transition-all'
          : 'md:w-16 w-full h-screen py-20 -translate-x-full  md:translate-x-0 md:h-screen hidden md:block',
      )}
    >
      <nav className="flex flex-col gap-1 p-3 h-full">
        {NavigationContent.map((item, index) => (
          <NavigationItem key={index} {...item} isOpen={isOpen} />
        ))}
        
      </nav>
    </aside>
  );
};

export default Sidebar;