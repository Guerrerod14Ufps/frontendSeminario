# 🚀 Guía de Despliegue en GitHub Pages

## Pasos Rápidos

### 1. Preparar el Repositorio

Asegúrate de que tu repositorio esté en GitHub y que tengas todos los cambios guardados:

```bash
git add .
git commit -m "Preparar para despliegue en GitHub Pages"
git push origin main
```

### 2. Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, busca **Pages**
4. En **Source**, selecciona **GitHub Actions**
5. Guarda los cambios

### 3. Activar el Workflow

El workflow se activará automáticamente cuando:
- Hagas push a la rama `main`
- O manualmente desde la pestaña **Actions** > **Deploy to GitHub Pages** > **Run workflow**

### 4. Verificar el Despliegue

1. Ve a la pestaña **Actions** en tu repositorio
2. Espera a que el workflow termine (puede tomar 2-5 minutos)
3. Una vez completado, tu aplicación estará disponible en:
   ```
   https://[tu-usuario].github.io/[nombre-repositorio]/
   ```

## ⚙️ Configuración del Base Path

El workflow detecta automáticamente el nombre de tu repositorio. Si necesitas cambiarlo manualmente:

### Opción 1: Editar el Workflow

Edita `.github/workflows/deploy.yml` y cambia esta línea:

```yaml
VITE_BASE_PATH: /${{ github.event.repository.name }}/
```

Por ejemplo, si tu repositorio se llama `planificau`:
```yaml
VITE_BASE_PATH: /planificau/
```

### Opción 2: Build Manual

Si prefieres hacer el build manualmente:

```bash
# Reemplaza 'frontendSeminario' con el nombre de tu repositorio
VITE_BASE_PATH=/frontendSeminario/ npm run build
```

Luego sube la carpeta `dist` a la rama `gh-pages`.

## 🔧 Solución de Problemas

### El workflow falla

- Verifica que la rama principal sea `main` (o cambia `main` por `master` en el workflow)
- Asegúrate de que todos los archivos estén commiteados
- Revisa los logs en la pestaña **Actions**

### Las rutas no funcionan

- Verifica que el `basePath` en `vite.config.ts` coincida con el nombre de tu repositorio
- Asegúrate de que `BrowserRouter` tenga el `basename` configurado (ya está en `main.tsx`)

### La página muestra 404

- Verifica que GitHub Pages esté habilitado
- Espera unos minutos después del despliegue
- Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)

## 📝 Notas

- El primer despliegue puede tardar más tiempo
- Los cambios se reflejan automáticamente en cada push a `main`
- Si cambias el nombre del repositorio, actualiza el `VITE_BASE_PATH`

## 🌐 Dominio Personalizado

Si tienes un dominio personalizado:

1. Cambia el `base` en `vite.config.ts` a `'/'`
2. Actualiza el workflow para usar `VITE_BASE_PATH: '/'`
3. Configura tu dominio en GitHub Pages Settings

