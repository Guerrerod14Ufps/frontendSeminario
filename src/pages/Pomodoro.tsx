/**
 * Página Pomodoro - Temporizador funcional con sesiones configurables
 */

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

type PomodoroType = 'focus' | 'short-break' | 'long-break';

export const Pomodoro = () => {
  const {
    pomodoroSettings,
    currentPomodoro,
    setCurrentPomodoro,
    addPomodoroSession,
    updatePomodoroSettings,
  } = useAppStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(pomodoroSettings);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Inicializar pomodoro si no existe
  useEffect(() => {
    if (!currentPomodoro) {
      setCurrentPomodoro({
        isRunning: false,
        timeLeft: pomodoroSettings.focusDuration * 60,
        type: 'focus',
        sessionCount: 0,
      });
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (currentPomodoro?.isRunning && currentPomodoro.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentPomodoro({
          ...currentPomodoro,
          timeLeft: currentPomodoro.timeLeft - 1,
        });
      }, 1000);
    } else if (currentPomodoro?.timeLeft === 0) {
      handlePomodoroComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentPomodoro?.isRunning, currentPomodoro?.timeLeft]);

  const handleStart = () => {
    if (currentPomodoro) {
      setCurrentPomodoro({ ...currentPomodoro, isRunning: true });
    }
  };

  const handlePause = () => {
    if (currentPomodoro) {
      setCurrentPomodoro({ ...currentPomodoro, isRunning: false });
    }
  };

  const handleStop = () => {
    if (currentPomodoro) {
      setCurrentPomodoro({
        ...currentPomodoro,
        isRunning: false,
        timeLeft: getDurationForType(currentPomodoro.type) * 60,
      });
    }
  };

  const handlePomodoroComplete = async () => {
    if (!currentPomodoro) return;

    // Guardar sesión completada (ahora es async para sincronizar con backend)
    await addPomodoroSession({
      duration: getDurationForType(currentPomodoro.type),
      type: currentPomodoro.type,
    });

    // Notificación (simulada)
    if (pomodoroSettings.soundEnabled) {
      // Aquí se podría reproducir un sonido
      new Audio('/notification.mp3').play().catch(() => {});
    }

    // Determinar siguiente tipo
    let nextType: PomodoroType = 'focus';
    let nextSessionCount = currentPomodoro.sessionCount;

    if (currentPomodoro.type === 'focus') {
      nextSessionCount = currentPomodoro.sessionCount + 1;
      if (nextSessionCount % pomodoroSettings.sessionsUntilLongBreak === 0) {
        nextType = 'long-break';
      } else {
        nextType = 'short-break';
      }
    } else {
      nextType = 'focus';
    }

    setCurrentPomodoro({
      isRunning: pomodoroSettings.autoStartPomodoros && nextType === 'focus',
      timeLeft: getDurationForType(nextType) * 60,
      type: nextType,
      sessionCount: nextSessionCount,
    });
  };

  const getDurationForType = (type: PomodoroType): number => {
    switch (type) {
      case 'focus':
        return pomodoroSettings.focusDuration;
      case 'short-break':
        return pomodoroSettings.shortBreakDuration;
      case 'long-break':
        return pomodoroSettings.longBreakDuration;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!currentPomodoro) return 0;
    const total = getDurationForType(currentPomodoro.type) * 60;
    return ((total - currentPomodoro.timeLeft) / total) * 100;
  };

  const getTypeLabel = (type: PomodoroType): string => {
    switch (type) {
      case 'focus':
        return 'Sesión de Enfoque';
      case 'short-break':
        return 'Descanso Corto';
      case 'long-break':
        return 'Descanso Largo';
    }
  };

  const handleSaveSettings = () => {
    updatePomodoroSettings(localSettings);
    setIsSettingsOpen(false);
    // Reiniciar pomodoro con nuevas configuraciones
    if (currentPomodoro) {
      setCurrentPomodoro({
        ...currentPomodoro,
        timeLeft: getDurationForType(currentPomodoro.type) * 60,
      });
    }
  };

  if (!currentPomodoro) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Pomodoro</h1>
          <p className="mt-2 text-neutral-600">
            Técnica de gestión del tiempo para mejorar la productividad
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Configuración"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Pomodoro Timer */}
      <div className="max-w-2xl mx-auto">
        <Card variant="elevated" className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-6">
              <div>
                <Badge variant="primary" size="md" className="mb-4">
                  {getTypeLabel(currentPomodoro.type)}
                </Badge>
                <div className="text-7xl font-bold text-neutral-900 mb-4 font-mono">
                  {formatTime(currentPomodoro.timeLeft)}
                </div>
                <ProgressBar
                  value={getProgress()}
                  variant={currentPomodoro.type === 'focus' ? 'primary' : 'success'}
                  size="lg"
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                {currentPomodoro.isRunning ? (
                  <Button size="lg" onClick={handlePause} variant="primary">
                    <PauseIcon className="w-5 h-5 mr-2" />
                    Pausar
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleStart} variant="primary">
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Iniciar
                  </Button>
                )}
                <Button size="lg" onClick={handleStop} variant="outline">
                  <StopIcon className="w-5 h-5 mr-2" />
                  Detener
                </Button>
              </div>

              <div className="pt-4 border-t border-surface-muted">
                <p className="text-sm text-neutral-600">
                  Sesión #{currentPomodoro.sessionCount + 1} de enfoque completada
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-600">Duración de Enfoque</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {pomodoroSettings.focusDuration} min
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-600">Descanso Corto</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {pomodoroSettings.shortBreakDuration} min
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-neutral-600">Descanso Largo</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {pomodoroSettings.longBreakDuration} min
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Configuración del Pomodoro"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSettings}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Duración de Enfoque (minutos)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={localSettings.focusDuration}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  focusDuration: parseInt(e.target.value) || 25,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Duración de Descanso Corto (minutos)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={localSettings.shortBreakDuration}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  shortBreakDuration: parseInt(e.target.value) || 5,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Duración de Descanso Largo (minutos)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={localSettings.longBreakDuration}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  longBreakDuration: parseInt(e.target.value) || 15,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Sesiones hasta Descanso Largo
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={localSettings.sessionsUntilLongBreak}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  sessionsUntilLongBreak: parseInt(e.target.value) || 4,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoStartBreaks"
              checked={localSettings.autoStartBreaks}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  autoStartBreaks: e.target.checked,
                })
              }
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="autoStartBreaks" className="text-sm text-neutral-700">
              Iniciar descansos automáticamente
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoStartPomodoros"
              checked={localSettings.autoStartPomodoros}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  autoStartPomodoros: e.target.checked,
                })
              }
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="autoStartPomodoros" className="text-sm text-neutral-700">
              Iniciar pomodoros automáticamente
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="soundEnabled"
              checked={localSettings.soundEnabled}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  soundEnabled: e.target.checked,
                })
              }
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="soundEnabled" className="text-sm text-neutral-700">
              Activar sonidos de notificación
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

