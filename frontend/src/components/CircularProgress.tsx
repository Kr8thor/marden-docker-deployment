
import { useEffect, useState, memo } from 'react';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradientStart?: string;
  gradientEnd?: string;
  showValue?: boolean;
  animate?: boolean;
  duration?: number;
  label?: string;
}

const CircularProgress = ({
  value,
  size = 120,
  strokeWidth = 6,
  color = '#8b5cf6',
  gradientStart = '#8b5cf6',
  gradientEnd = '#0ea5e9',
  showValue = true,
  animate = true,
  duration = 1500,
  label
}: CircularProgressProps) => {
  const [progress, setProgress] = useState(0);
  
  // Calculate the radius and circumference
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const gradientId = `gradient-${Math.random().toString(36).substring(2, 9)}`;
  
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setProgress(value);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setProgress(value);
    }
  }, [value, animate]);
  
  // Calculate stroke dash offset
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="circle-progress"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          className="circle-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          className="circle-progress-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animate ? strokeDashoffset : circumference - (value / 100) * circumference}
          stroke={gradientStart && gradientEnd ? `url(#${gradientId})` : color}
          style={animate ? {
            transition: `stroke-dashoffset ${duration}ms ease-in-out`
          } : undefined}
        />
      </svg>
      
      {showValue && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-2xl font-bold">{Math.round(progress)}</div>
          {label && <div className="text-xs text-muted-foreground">{label}</div>}
        </div>
      )}
    </div>
  );
};

export default memo(CircularProgress);
