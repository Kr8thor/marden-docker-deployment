
import { ButtonHTMLAttributes, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  glowColor?: 'purple' | 'blue' | 'teal';
  rippleEffect?: boolean;
  glowEffect?: boolean;
  hoverScale?: boolean;
}

const AnimatedButton = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  glowColor = 'purple',
  rippleEffect = true,
  glowEffect = true,
  hoverScale = true,
  ...props
}: AnimatedButtonProps) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (rippleEffect) {
      // Create a ripple effect at the click position
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate ripple size based on button dimensions
      const size = Math.max(rect.width, rect.height) * 1.5;
      
      const rippleId = Date.now();
      setRipples([...ripples, { id: rippleId, x, y, size }]);
      
      // Remove the ripple after animation completes
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== rippleId));
      }, 600);
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'bg-transparent border border-white/20 text-white hover:bg-white/10'
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5',
    lg: 'px-6 py-3 text-lg'
  };
  
  const glowStyles = {
    purple: 'neon-glow-purple',
    blue: 'neon-glow-blue',
    teal: 'neon-glow-teal'
  };
  
  return (
    <button
      className={cn(
        'relative overflow-hidden rounded-md font-medium transition-all duration-300',
        variantStyles[variant],
        sizeStyles[size],
        glowEffect && glowStyles[glowColor],
        hoverScale && 'hover:scale-105',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple"
          style={{
            top: ripple.y - ripple.size / 2,
            left: ripple.x - ripple.size / 2,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center">{children}</span>
    </button>
  );
};

export default AnimatedButton;
