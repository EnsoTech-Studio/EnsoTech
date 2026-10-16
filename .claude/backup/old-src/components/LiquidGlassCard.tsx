import type { PropsWithChildren } from 'react';

interface LiquidGlassCardProps extends PropsWithChildren {
  className?: string;
  dark?: boolean;
}

export function LiquidGlassCard({ children, className = '', dark = false }: LiquidGlassCardProps) {
  return <div className={`${dark ? 'liquid-glass-dark' : 'liquid-glass'} rounded-lg ${className}`}>{children}</div>;
}
