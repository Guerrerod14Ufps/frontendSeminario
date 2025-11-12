/**
 * Componente Input reutilizable con soporte para labels y errores
 */

import { type InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, fullWidth = false, className, id, ...props },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'px-4 py-2 rounded-lg border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            error
              ? 'border-danger focus:ring-danger'
              : 'border-neutral-300 hover:border-primary-400',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed',
            fullWidth && 'w-full',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="text-sm text-danger" role="alert">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={`${inputId}-helper`} className="text-sm text-neutral-500">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

