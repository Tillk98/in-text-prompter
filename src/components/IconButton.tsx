import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  variant: 'brand-primary' | 'neutral-tertiary';
  size: 'small' | 'medium';
  icon: string | LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(({ variant, size, icon, onClick }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    'brand-primary': 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    'neutral-tertiary': 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizeStyles = {
    small: 'h-6 w-6 p-1',
    medium: 'h-8 w-8 p-1.5'
  };

  // Icon rendering - supports both string identifiers and React components
  const renderIcon = () => {
    // If icon is a React component, render it directly
    if (typeof icon !== 'string') {
      const IconComponent = icon;
      const iconSize = size === 'small' ? 14 : 16;
      return <IconComponent size={iconSize} className="w-full h-full" />;
    }

    // Fallback to string-based icons for backward compatibility
    switch (icon) {
      case 'FeatherX':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        );
      case 'FeatherPlus':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
      onClick={onClick}
      type="button"
    >
      {renderIcon()}
    </button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
