# 🔒 GUÍA INTERNA: PRIMER DESPLIEGUE EN NPM
> **DOCUMENTO INTERNO DE USO EXCLUSIVO PARA EL EQUIPO DE ANGELITO SYSTEMS**  
> *Este documento contiene instrucciones operativas internas y NUNCA debe publicarse en paquetes NPM.*

---

## 📋 Índice
1. [Requisitos Previos](#1-requisitos-previos)
2. [Configuración de Organización y Cuenta en NPM](#2-configuración-de-organización-y-cuenta-en-npm)
3. [Inicio de Sesión en Terminal (`npm login`)](#3-inicio-de-sesión-en-terminal-npm-login)
4. [La Regla de Oro: Orden de Dependencias](#4-la-regla-de-oro-orden-de-dependencias)
5. [Prueba de Simulación Segura (Dry-Run)](#5-prueba-de-simulación-segura-dry-run)
6. [Paso a Paso del Primer Despliegue Oficial](#6-paso-a-paso-del-primer-despliegue-oficial)
7. [Manejo de 2FA / OTP (Códigos de Autenticación)](#7-manejo-de-2fa--otp-códigos-de-autenticación)
8. [Verificación Post-Publicación](#8-verificación-post-publicación)
9. [Resolución de Problemas Frecuentes (Troubleshooting)](#9-resolución-de-problemas-frecuentes-troubleshooting)

---

## 1. Requisitos Previos

Antes de ejecutar cualquier comando de publicación, asegúrate de tener instalado:
- **Node.js**: v18.0.0 o superior (recomendado v20+ o v22+ LTS).
- **NPM**: v9.0.0 o superior (`npm -v`).
- Tu aplicación de autenticación en dos pasos (Google Authenticator, Microsoft Authenticator o 1Password) vinculada a tu cuenta de NPM.

---

## 2. Configuración de Organización y Cuenta en NPM

El ecosistema contiene 5 paquetes bajo el scope empresarial **`@angelitosystems`** y 1 paquete CLI global:

| Paquete | Tipo | Acceso |
| :--- | :--- | :--- |
| `@angelitosystems/nest-auth` | Paquete Scoped | `--access public` |
| `@angelitosystems/nest-auth-prisma` | Paquete Scoped | `--access public` |
| `@angelitosystems/nest-auth-typeorm` | Paquete Scoped | `--access public` |
| `@angelitosystems/nest-auth-sequelize` | Paquete Scoped | `--access public` |
| `@angelitosystems/nest-auth-mongoose` | Paquete Scoped | `--access public` |
| `nest-auth-kit` | Paquete Global CLI | `--access public` |

> [!IMPORTANT]
> **Crear la Organización en NPM:**  
> Si es la primera vez que publicas paquetes bajo `@angelitosystems`:
> 1. Inicia sesión en [https://www.npmjs.com](https://www.npmjs.com).
> 2. Haz clic en tu avatar superior derecho y selecciona **"Add Organization"**.
> 3. Nombra la organización: `angelitosystems`.
> 4. Elige el plan gratuito (**Unlimited public packages**).
> 5. Asegúrate de que tu usuario tenga permisos de **Owner** o **Admin**.

---

## 3. Inicio de Sesión en Terminal (`npm login`)

Abre tu terminal en la raíz del proyecto (`C:\Proyectos\AngelitoSystems\npm\nest-auth`):

```bash
# 1. Iniciar sesión con tus credenciales de NPM
npm login
```

NPM te pedirá:
1. **Username**: Tu usuario de npmjs.com.
2. **Password**: Tu contraseña.
3. **Email**: Tu correo asociado.
4. **OTP / 2FA**: El código de 6 dígitos de tu aplicación autenticadora.

Verifica que la sesión esté activa ejecutando:
```bash
npm whoami
# Debe responder: tu_usuario_npm (ej. angelitosystems)
```

---

## 4. La Regla de Oro: Orden de Dependencias

> [!CAUTION]
> **NUNCA publiques los adaptadores antes del paquete Core.**  
> Los adaptadores (`prisma`, `typeorm`, etc.) declaran a `@angelitosystems/nest-auth` como dependencia. Si publicas un adaptador primero, los usuarios que intenten instalarlo obtendrán un error de resolución en NPM porque `@angelitosystems/nest-auth` aún no existirá en el registro público.

### Secuencia Obligatoria de Despliegue:

```text
┌────────────────────────────────────────────────────────┐
│ 1º PASO OBLIGATORIO:                                   │
│    @angelitosystems/nest-auth (packages/core)          │
└──────────────────────────┬─────────────────────────────┘
                           │ (Una vez publicado en NPM)
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 2º Adaptador │     │ 3º Adaptador │     │ 4º Adaptador │ ...
│ Prisma       │     │ TypeORM      │     │ Sequelize    │
└──────────────┘     └──────────────┘     └──────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 6º nest-auth-kit (CLI)                                 │
└────────────────────────────────────────────────────────┘
```

---

## 5. Prueba de Simulación Segura (Dry-Run)

Antes de publicar nada real, ejecuta una simulación completa que compila, valida y genera los tarballs temporales sin subir nada a internet:

```bash
npm run deploy:dry-run
```

Si deseas simular un solo paquete:
```bash
node scripts/deploy.mjs --dry-run --package=core --skip-tests
```

Deberás ver:
```text
✔ Compilación global completada con éxito.
✔ Empaquetado de @angelitosystems/nest-auth verificado correctamente.
🔍 MODO DRY-RUN: Listo para publicarse. No se realizaron cambios en NPM.
```

---

## 6. Paso a Paso del Primer Despliegue Oficial

### Método Recomendado: Despliegue Secuencial Paquete por Paquete

Para el **primer despliegue**, se recomienda publicar manualmente el Core primero para confirmar que el registro público de NPM lo indexe correctamente:

#### Paso 1: Publicar el Core (`@angelitosystems/nest-auth`)
```bash
npm run deploy:core
```
- El script compilará el código, verificará las pruebas y empaquetará los archivos.
- Te preguntará: `¿Confirmas la publicación de @angelitosystems/nest-auth@1.0.0 en NPM?` -> Escribe `si`.
- Si tu cuenta requiere 2FA, el script te solicitará ingresar el código OTP de 6 dígitos.
- Espera a ver: `✔ ¡@angelitosystems/nest-auth@1.0.0 publicado exitosamente en NPM!`.

Verifica en tu navegador:  
👉 **[https://www.npmjs.com/package/@angelitosystems/nest-auth](https://www.npmjs.com/package/@angelitosystems/nest-auth)**

---

#### Paso 2: Publicar los Adaptadores de Base de Datos
Ahora que el paquete Core ya existe en NPM, puedes publicar los adaptadores individualmente:

```bash
# Publicar adaptador Prisma
npm run deploy:prisma

# Publicar adaptador TypeORM
npm run deploy:typeorm

# Publicar adaptador Sequelize
npm run deploy:sequelize

# Publicar adaptador Mongoose
npm run deploy:mongoose
```

---

#### Paso 3: Publicar el CLI (`nest-auth-kit`)
Por último, publica la herramienta de consola:

```bash
npm run deploy:cli
```

Verifica en tu navegador:  
👉 **[https://www.npmjs.com/package/nest-auth-kit](https://www.npmjs.com/package/nest-auth-kit)**

---

### Método Alternativo: Despliegue Automatizado Total

Si prefieres que el script gestione todos los paquetes en serie respetando automáticamente el orden de dependencias:

```bash
npm run deploy:all
```
O simplemente:
```bash
npm run deploy
# Y selecciona la opción [1] en el menú interactivo
```

---

## 7. Manejo de 2FA / OTP (Códigos de Autenticación)

Si tu cuenta de NPM tiene activada la autenticación en dos factores (muy recomendado por seguridad):

1. **Vía consola interactiva**: Si el script detecta que NPM solicita un código OTP, pausará la ejecución y te pedirá:
   ```text
   Ingresa el código 2FA / TOTP (o presiona Enter para abortar): ______
   ```
   Abres tu app autenticadora en tu teléfono, ingresas los 6 dígitos y presionas `Enter`. El script reintentará automáticamente.

2. **Vía parámetro directo**: Si prefieres pasarlo desde el inicio (ten en cuenta que expira en 30 segundos):
   ```bash
   node scripts/deploy.mjs --package=core --otp=123456
   ```

---

## 8. Verificación Post-Publicación

Una vez publicados los paquetes, prueba la instalación en un proyecto limpio o temporal:

```bash
# 1. Probar el CLI directamente desde npm
npx nest-auth-kit doctor

# 2. Probar instalación de paquetes
npm install @angelitosystems/nest-auth @angelitosystems/nest-auth-prisma
```

Comprueba los enlaces públicos oficiales:
- [https://www.npmjs.com/package/@angelitosystems/nest-auth](https://www.npmjs.com/package/@angelitosystems/nest-auth)
- [https://www.npmjs.com/package/@angelitosystems/nest-auth-prisma](https://www.npmjs.com/package/@angelitosystems/nest-auth-prisma)
- [https://www.npmjs.com/package/@angelitosystems/nest-auth-typeorm](https://www.npmjs.com/package/@angelitosystems/nest-auth-typeorm)
- [https://www.npmjs.com/package/@angelitosystems/nest-auth-sequelize](https://www.npmjs.com/package/@angelitosystems/nest-auth-sequelize)
- [https://www.npmjs.com/package/@angelitosystems/nest-auth-mongoose](https://www.npmjs.com/package/@angelitosystems/nest-auth-mongoose)
- [https://www.npmjs.com/package/nest-auth-kit](https://www.npmjs.com/package/nest-auth-kit)

---

## 9. Resolución de Problemas Frecuentes (Troubleshooting)

### Error `403 Forbidden - You do not have permission to publish`
- **Causa**: No eres miembro/propietario del scope `@angelitosystems` en npmjs.com, o el nombre de paquete `nest-auth-kit` ya fue tomado por otro usuario.
- **Solución**:
  - Para los paquetes `@angelitosystems/*`: Crea la organización `angelitosystems` en [npmjs.com/org/create](https://www.npmjs.com/org/create).
  - Asegúrate de que el comando incluya `--access public` (nuestros scripts ya lo incluyen por defecto).

### Error `ENEEDAUTH - You need to authorize this machine using "npm login"`
- **Causa**: Tu token de sesión local caducó o no has iniciado sesión.
- **Solución**: Ejecuta `npm login` nuevamente.

### Error `EOTP - This action requires a one-time password (OTP)`
- **Causa**: Tu cuenta requiere 2FA y no se suministró el código o el código ingresado caducó.
- **Solución**: Ingresa el código nuevo generado en tu app de 2FA cuando el script lo solicite.

### Error `404 Not Found - Scope not found`
- **Causa**: Intentas publicar `@angelitosystems/nombre` pero la organización `angelitosystems` no ha sido creada todavía en la web de npmjs.com.
- **Solución**: Ve a [npmjs.com](https://www.npmjs.com) -> Crear Organización -> nombra `angelitosystems` (es gratis).

---

> © **Angelito Systems**. Documento Confidencial de Operaciones.
