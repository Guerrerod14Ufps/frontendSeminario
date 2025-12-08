/**
 * Componente Sidebar para navegación principal
 * Responsive: se convierte en bottom navigation en móvil
 */

import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  ClockIcon as ClockIconSolid,
  ChartBarIcon as ChartBarIconSolid,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useAuthStore } from '../../store/useAuthStore';

const navigation = [
  { name: 'Inicio', href: '/', icon: HomeIcon, iconSolid: HomeIconSolid },
  { name: 'Planificador', href: '/planificador', icon: CalendarIcon, iconSolid: CalendarIconSolid },
  { name: 'Pomodoro', href: '/pomodoro', icon: ClockIcon, iconSolid: ClockIconSolid },
  { name: 'Métricas', href: '/metricas', icon: ChartBarIcon, iconSolid: ChartBarIconSolid },
];

export const Sidebar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-surface-muted">
        <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              PlanificaU
            </h1>
          </div>
          {isAuthenticated() && user && (
            <div className="px-6 pb-4">
              <div className="rounded-lg border border-surface-muted bg-neutral-50 p-3">
                <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                <p className="text-xs text-neutral-500">{user.email}</p>
                <button
                  onClick={() => logout()}
                  className="mt-2 text-xs text-primary-600 hover:text-primary-800 font-medium"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  )
                }
              >
                {({ isActive }) => {
                  const Icon = isActive ? item.iconSolid : item.icon;
                  return (
                    <>
                      <Icon
                        className={clsx(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-500'
                        )}
                      />
                      {item.name}
                    </>
                  );
                }}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-muted z-40">
        <div className="grid grid-cols-4 h-16">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary-600'
                    : 'text-neutral-500 hover:text-neutral-700'
                )
              }
            >
              {({ isActive }) => {
                const Icon = isActive ? item.iconSolid : item.icon;
                return (
                  <>
                    <Icon className="h-6 w-6 mb-1" />
                    <span>{item.name}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};


