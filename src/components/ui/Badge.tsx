/**
 * Componente Badge para mostrar etiquetas y estados
 */

import { type HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-neutral-100 text-neutral-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    neutral: 'bg-neutral-200 text-neutral-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={clsx(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};

