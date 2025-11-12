/**
 * Componente ProgressCard para mostrar progreso con gamificación visual
 */

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { TrophyIcon } from '@heroicons/react/24/outline';

interface ProgressCardProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  showBadge?: boolean;
  badgeText?: string;
}

export const ProgressCard = ({
  title,
  current,
  target,
  unit = '',
  variant = 'primary',
  showBadge = false,
  badgeText,
}: ProgressCardProps) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {isComplete && (
            <div className="p-2 bg-accent-100 rounded-full">
              <TrophyIcon className="w-5 h-5 text-accent-600" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">
              {current}
            </span>
            <span className="text-lg text-neutral-600">
              / {target} {unit}
            </span>
            {showBadge && badgeText && (
              <Badge variant={isComplete ? 'success' : 'primary'} size="sm">
                {badgeText}
              </Badge>
            )}
          </div>
          <ProgressBar
            value={percentage}
            variant={isComplete ? 'success' : variant}
            size="md"
            showLabel
          />
          {isComplete && (
            <p className="text-sm text-success font-medium">
              ¡Objetivo alcanzado! 🎉
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


