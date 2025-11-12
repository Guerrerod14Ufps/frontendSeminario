/**
 * Componente ProgressBar para mostrar progreso visual
 */

import { type HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar = ({
  value,
  max = 100,
  showLabel = false,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variants = {
    primary: 'bg-primary-600',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={clsx('w-full', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-neutral-600">Progreso</span>
          <span className="text-sm font-medium text-neutral-700">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-neutral-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

