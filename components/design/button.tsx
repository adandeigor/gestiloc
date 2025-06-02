import React from 'react';
import { Icon } from 'lucide-react';
import { cn } from '../../lib/utils';
// Définir les types des props
interface ThemedButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'destructive' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  size?: 'small' | 'medium' | 'large';
  type?: 'button' | 'submit';
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  outline?: boolean;
}

// Composant ThemedButton
const ThemedButton: React.FC<ThemedButtonProps> = ({
  variant = 'primary',
  icon: IconComponent,
  size = 'medium',
  type = 'button',
  children,
  disabled = false,
  className,
  onClick,
  outline = false,
}) => {
  // Styles pour les tailles
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  // Styles pour l'icône selon la taille
  const iconSizeStyles = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  // Classes CSS par variant pour style plein
  const filledVariantStyles = {
    primary: 'bg-primary text-background',
    secondary: 'bg-secondary text-foreground',
    accent: 'bg-accent text-foreground',
    success: 'bg-success text-foreground',
    destructive: 'bg-destructive text-foreground',
    neutral: 'bg-background text-foreground',
  };

  // Classes CSS par variant pour style outline
  const outlineVariantStyles = {
    primary: 'border-primary text-primary bg-transparent',
    secondary: 'border-secondary text-secondary bg-transparent',
    accent: 'border-accent text-accent bg-transparent',
    success: 'border-success text-success bg-transparent',
    destructive: 'border-destructive text-destructive bg-transparent',
    neutral: 'border-background text-foreground bg-background',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        // Styles de base
        'inline-flex items-center justify-center rounded-md montserrat-regular border-2',
        'transition-all duration-200',
        // Styles par variant (plein ou outline)
        outline ? outlineVariantStyles[variant] : filledVariantStyles[variant],
        // Styles pour disabled
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Appliquer les styles de taille
        sizeStyles[size],
        // Ajouter un espace si icône et texte
        IconComponent && children ? 'gap-2' : '',
        // Effet hover
        !disabled && (outline ? `hover:bg-${variant}/20` : 'hover:opacity-80'),
        className
      )}
      aria-label={IconComponent && !children ? 'Action button' : undefined}
    >
      {IconComponent && (
        <IconComponent className={cn('shrink-0', iconSizeStyles[size])} />
      )}
      {children}
    </button>
  );
};

export default ThemedButton;