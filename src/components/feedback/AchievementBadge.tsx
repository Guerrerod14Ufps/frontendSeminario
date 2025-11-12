/**
 * Componente AchievementBadge para mostrar logros y recompensas
 */

import { TrophyIcon, FireIcon, StarIcon } from '@heroicons/react/24/solid';

interface AchievementBadgeProps {
  type: 'trophy' | 'fire' | 'star';
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AchievementBadge = ({
  type,
  label,
  size = 'md',
}: AchievementBadgeProps) => {
  const icons = {
    trophy: TrophyIcon,
    fire: FireIcon,
    star: StarIcon,
  };

  const Icon = icons[type];

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl border border-accent-200">
      <div className="p-2 bg-white rounded-full shadow-sm">
        <Icon className={`${sizes[size]} text-accent-600`} />
      </div>
      <span className="text-xs font-medium text-neutral-700 text-center">
        {label}
      </span>
    </div>
  );
};

