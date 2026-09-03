import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  tilt = true,
  glow = false,
  glowColor = 'accent',
  hover = true,
  onClick,
  as = 'div',
  ...props
}) {
  const ref = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!tilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 20);
    setRotateY((centerX - x) / 20);
    setGlowPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlowPos({ x: 50, y: 50 });
  };

  const glowColors = {
    accent: 'rgba(232, 120, 138, 0.10)',
    purple: 'rgba(168, 85, 247, 0.10)',
    green: 'rgba(5, 150, 105, 0.10)',
    pink: 'rgba(236, 72, 153, 0.10)',
  };

  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      className={`glass-card relative overflow-hidden p-6 ${hover ? 'glass-card-hover cursor-pointer' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      {...props}
    >
      {/* Glow follow cursor */}
      {glow && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${glowColors[glowColor]}, transparent 60%)`,
          }}
        />
      )}
      {/* Top edge glow line */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent-500/30 to-transparent" />
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
