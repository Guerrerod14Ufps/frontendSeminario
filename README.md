# PlanificaU 📚

**PlanificaU** es una aplicación web progresiva (PWA) diseñada para mejorar la gestión del tiempo académico de estudiantes universitarios colombianos. La aplicación promueve la organización, planificación efectiva y reducción de la procrastinación mediante herramientas de productividad y gamificación responsable.

## 🎯 Características Principales

### 📊 Dashboard
- Resumen de progreso diario y semanal
- Estadísticas de tareas completadas
- Seguimiento de sesiones Pomodoro
- Sistema de niveles y experiencia (gamificación)
- Racha de días consecutivos

### 📅 Planificador / Agenda
- Crear, editar y eliminar tareas
- Sistema de prioridades (Baja, Media, Alta, Urgente)
- Categorización de tareas
- Fechas de vencimiento
- Filtros por estado (Todas, Pendientes, Completadas)

### ⏱️ Temporizador Pomodoro
- Temporizador funcional con sesiones configurables
- Sesiones de enfoque (25 min por defecto)
- Descansos cortos (5 min) y largos (15 min)
- Configuración personalizable
- Notificaciones visuales y sonoras
- Seguimiento automático de sesiones completadas

### 📈 Métricas
- Gráficos de progreso con Recharts
- Estadísticas de tareas completadas (últimos 7 días)
- Visualización de sesiones Pomodoro
- Análisis por prioridad
- Logros y badges

## 🛠️ Stack Tecnológico

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Estado Global**: Zustand con persistencia
- **Estilos**: TailwindCSS
- **Gráficos**: Recharts
- **Iconos**: Heroicons
- **Fechas**: date-fns
- **PWA**: Vite PWA Plugin

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── feedback/       # Componentes de gamificación
│   ├── layout/         # Layout y navegación
│   └── ui/             # Componentes UI base (Button, Card, Modal, etc.)
├── pages/              # Páginas principales
│   ├── Dashboard.tsx
│   ├── Planificador.tsx
│   ├── Pomodoro.tsx
│   └── Metricas.tsx
├── store/              # Store de Zustand
│   └── useAppStore.ts
├── types/              # Tipos TypeScript
│   └── index.ts
├── styles/             # Estilos globales
│   └── tailwind.css
└── App.tsx            # Componente principal con rutas
```

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 18+ y npm

### Pasos

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

3. **Compilar para producción**:
   ```bash
   npm run build
   ```

4. **Previsualizar build de producción**:
   ```bash
   npm run preview
   ```

## 🎨 Diseño

### Paleta de Colores
- **Primario**: Indigo (#4f46e5) - Enfoque y productividad
- **Acento**: Ámbar (#f59e0b) - Gamificación y logros
- **Éxito**: Verde (#22c55e) - Completado
- **Advertencia**: Amarillo (#facc15) - Alertas
- **Peligro**: Rojo (#ef4444) - Urgencia

### Tipografía
- **Sans**: Plus Jakarta Sans (principal)
- **Display**: Outfit (títulos)

## 📱 PWA (Progressive Web App)

La aplicación está configurada como PWA y puede instalarse en dispositivos móviles y desktop. Incluye:
- Manifest.json configurado
- Service Worker para funcionamiento offline
- Iconos adaptativos
- Tema personalizado

## 🚀 Despliegue en GitHub Pages

### Configuración Automática (Recomendado)

1. **Habilita GitHub Pages en tu repositorio**:
   - Ve a `Settings` > `Pages` en tu repositorio de GitHub
   - En `Source`, selecciona `GitHub Actions`

2. **El workflow ya está configurado**:
   - El archivo `.github/workflows/deploy.yml` se ejecutará automáticamente al hacer push a `main`
   - El workflow detecta automáticamente el nombre de tu repositorio

3. **Haz push de tus cambios**:
   ```bash
   git add .
   git commit -m "Configurar despliegue en GitHub Pages"
   git push origin main
   ```

4. **Espera a que se complete el workflow**:
   - Ve a la pestaña `Actions` en tu repositorio
   - El despliegue tomará unos minutos
   - Una vez completado, tu app estará disponible en:
     `https://[tu-usuario].github.io/[nombre-repositorio]/`

### Configuración Manual

Si prefieres desplegar manualmente:

1. **Construye el proyecto con el base path correcto**:
   ```bash
   # Reemplaza 'frontendSeminario' con el nombre de tu repositorio
   VITE_BASE_PATH=/frontendSeminario/ npm run build
   ```

2. **Habilita GitHub Pages**:
   - Ve a `Settings` > `Pages`
   - En `Source`, selecciona la rama `gh-pages` y carpeta `/root`
   - O usa el script: `npm run build:gh-pages` y luego sube la carpeta `dist` a la rama `gh-pages`

### Notas Importantes

- **Base Path**: Si cambias el nombre del repositorio, actualiza la variable `VITE_BASE_PATH` en el workflow o en el script de build
- **Rama principal**: El workflow está configurado para `main`. Si tu rama es `master`, actualiza `.github/workflows/deploy.yml`
- **Dominio personalizado**: Si usas un dominio personalizado, cambia el `base` en `vite.config.ts` a `'/'`

## 🔮 Próximas Mejoras

- [ ] Integración con backend (API REST o Firebase)
- [ ] Sincronización en la nube
- [ ] Recordatorios push
- [ ] Calendario visual interactivo
- [ ] Exportación de reportes
- [ ] Modo oscuro
- [ ] Soporte multi-idioma
- [ ] Integración con calendarios externos (Google Calendar, etc.)

## 📝 Notas de Desarrollo

- El estado se persiste automáticamente en localStorage
- Los datos se almacenan localmente (preparado para migración a backend)
- La aplicación es completamente responsiva (mobile-first)
- Accesibilidad: ARIA labels y navegación por teclado

## 📄 Licencia

Este proyecto es parte de un trabajo académico para estudiantes universitarios.

---

**Desarrollado con ❤️ para estudiantes colombianos**
