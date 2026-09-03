import { useRef } from 'react';
import { motion } from 'framer-motion';

export default function GlowButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const ref = useRef(null);

  const handleClick = (e) => {
    if (disabled) return;
    // Ripple effect
    const rect = ref.current.getBoundingClientRect();
    const ripple = document.createElement('span');
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripple.style.cssText = `
      position: absolute; border-radius: 50%; pointer-events: none;
      width: 20px; height: 20px; left: ${x}px; top: ${y}px;
      transform: translate(-50%, -50%); background: rgba(255,255,255,0.3);
      animation: ripple 0.6s linear;
    `;
    ref.current.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    onClick?.(e);
  };

  const variants = {
    primary: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-md shadow-accent-500/15 hover:shadow-lg hover:shadow-accent-500/25',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/15 hover:shadow-lg hover:shadow-emerald-500/25',
    danger: 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-md shadow-rose-500/15',
    ghost: 'bg-surface-100 text-ink-700 border border-ink-100 hover:bg-surface-200 hover:border-ink-200',
    outline: 'bg-transparent text-accent-600 border border-accent-200 hover:bg-accent-50 hover:border-accent-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3 text-base rounded-xl',
    xl: 'px-8 py-4 text-lg rounded-2xl',
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`relative overflow-hidden font-semibold transition-all duration-300
        ${variants[variant]} ${sizes[size]}
        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
        ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}
