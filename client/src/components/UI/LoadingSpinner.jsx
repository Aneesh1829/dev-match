import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <motion.div
          className={`${sizes[size]} rounded-full border-2 border-accent-500/20 border-t-accent-400`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className={`absolute inset-1 rounded-full border-2 border-neon-purple/20 border-b-neon-purple`}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {text && <p className="text-sm text-ink-400 font-medium">{text}</p>}
    </div>
  );
}

export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }) {
  return (
    <div className={`${width} ${height} rounded-lg bg-ink-100 overflow-hidden ${className}`}>
      <motion.div
        className="h-full w-1/2 bg-gradient-to-r from-transparent via-ink-100 to-transparent"
        animate={{ x: ['-100%', '300%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="glass-card p-6 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-ink-100 animate-pulse" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-1/3" />
          <SkeletonLine width="w-1/2" height="h-3" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={i === lines - 1 ? 'w-2/3' : 'w-full'} />
      ))}
    </div>
  );
}
