/**
 * Componente Card para contener contenido relacionado
 */

import { type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}: CardProps) => {
  const baseStyles = 'rounded-xl bg-white';

  const variants = {
    default: 'border border-surface-muted shadow-sm',
    elevated: 'shadow-lg border border-surface-muted/50',
    outlined: 'border-2 border-primary-200',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={clsx(baseStyles, variants[variant], paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={clsx('text-lg font-semibold text-neutral-800', className)} {...props}>
    {children}
  </h3>
);

export const CardContent = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('text-neutral-600', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('mt-4 pt-4 border-t border-surface-muted', className)} {...props}>
    {children}
  </div>
);

