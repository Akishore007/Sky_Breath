import React from 'react';

const SkyBreathLogo: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = '' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="url(#gradient1)" opacity="0.1" />
      
      {/* Air Waves - representing pollution monitoring */}
      <path
        d="M 30 50 Q 40 40 50 50 T 70 50"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 25 60 Q 35 48 50 60 T 75 60"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 35 70 Q 45 62 50 70 T 65 70"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.4"
      />
      
      {/* Center Breathing Circle */}
      <circle
        cx="50"
        cy="50"
        r="8"
        fill="currentColor"
        opacity="0.9"
      />
      
      {/* Inner circle for depth */}
      <circle
        cx="50"
        cy="50"
        r="5"
        fill="white"
        opacity="0.8"
      />
      
      {/* Decorative dots for air particles */}
      <circle cx="25" cy="35" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="75" cy="40" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="20" cy="60" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="80" cy="70" r="1" fill="currentColor" opacity="0.4" />
      
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D9FF" />
          <stop offset="100%" stopColor="#0099CC" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SkyBreathLogo;
