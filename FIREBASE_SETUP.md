# Configuración de Firebase Auth - Solución de Errores

## Error: CONFIGURATION_NOT_FOUND

Este error indica que **Google Sign-In no está habilitado** en tu proyecto de Firebase.

## Pasos para Solucionarlo

### 1. Habilitar Google Sign-In en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **planificau-d20d4**
3. Ve a **Authentication** en el menú lateral
4. Haz clic en **Sign-in method** (o "Métodos de inicio de sesión")
5. En la lista de proveedores, busca **Google**
6. Haz clic en **Google**
7. **Habilita** el toggle "Enable"
8. Selecciona un **Email de soporte** (puede ser tu email)
9. Haz clic en **Save**

### 2. Verificar Dominios Autorizados

1. En la misma página de Authentication
2. Ve a la pestaña **Settings**
3. Desplázate hasta **Authorized domains**
4. Asegúrate de que estén incluidos:
   - `localhost` (ya debería estar)
   - `planificau.vercel.app` (agrega este si no está)

### 3. Verificar Configuración del Proyecto

Asegúrate de que tu proyecto tenga:
- ✅ Firebase Authentication habilitado
- ✅ Google como proveedor habilitado
- ✅ Dominios autorizados configurados

### 4. Verificar Credenciales

Verifica que las credenciales en `src/config/firebase.ts` sean correctas:
- `apiKey`: Debe coincidir con tu proyecto
- `authDomain`: Debe ser `planificau-d20d4.firebaseapp.com`
- `projectId`: Debe ser `planificau-d20d4`

## Verificación Rápida

Después de habilitar Google Sign-In:

1. Recarga la aplicación
2. Intenta iniciar sesión con Google
3. Deberías ver el popup de Google para seleccionar cuenta
4. Si aún hay errores, revisa la consola del navegador

## Errores Comunes

### "Popup blocked"
- **Solución**: Permite popups en tu navegador para este sitio

### "Unauthorized domain"
- **Solución**: Agrega tu dominio a "Authorized domains" en Firebase Console

### "Configuration not found"
- **Solución**: Habilita Google Sign-In en Firebase Console (pasos arriba)

## Notas Importantes

- Los cambios en Firebase Console pueden tardar unos minutos en aplicarse
- Si usas un dominio diferente en producción, agrégalo a "Authorized domains"
- El email de soporte es requerido por Google para el OAuth consent screen

