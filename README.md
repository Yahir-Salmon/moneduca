This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Restauración de servicios (2026)

Este proyecto utiliza **Next.js 14**, **Supabase Auth y Postgres**, **Groq** para Monedoki y **Resend** para el formulario de contacto y los recordatorios.

### Configuración local

1. Ejecuta `npm ci`.
2. Crea un archivo `.env.local` (no lo subas a GitHub):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica
GROQ_API_KEY=tu_clave_privada_groq
RESEND_API_KEY=tu_clave_privada_resend
SUPABASE_SERVICE_ROLE_KEY=tu_clave_privada_supabase_service_role
CRON_SECRET=un_secreto_largo_y_aleatorio
```

3. Ejecuta `npm run dev` y verifica registro, acceso, contacto y chatbot.
4. Configura estas mismas variables en tu proveedor de hosting; no uses claves de servicio en variables `NEXT_PUBLIC_`.

### Comprobaciones externas necesarias

- **Supabase:** valida que el proyecto esté activo y que existan las tablas `profiles`, `modulos`, `unidades` y `progreso_unidad`, sus políticas RLS, y el mecanismo de creación de perfiles. Si Auth requiere confirmar correo, configura las URLs de redirección para `/auth/callback`, así como el dominio público y proveedor Google cuando corresponda. Antes de lanzar, confirma que un usuario nuevo obtiene su fila de perfil después de verificar correo; si no existe trigger, se deberá añadir una migración según el esquema real.
- **Groq:** comprueba que la clave sea válida y que el modelo configurado siga disponible.
- **Resend:** verifica el dominio remitente `moneduca.mx` y los permisos de envío. Contacto entrega mensajes a `moneduca.finanzas@gmail.com`.
- **Cron:** configura el trabajo programado y `CRON_SECRET`, además de las opciones de consentimiento de los usuarios.
- **Imágenes:** el archivo disponible es `public/monedoki.png`; referencias a variantes que no existan deben migrarse o añadir los recursos originales.
- **Seguridad:** el endpoint de cancelación de correos actualmente usa un ID de usuario en el enlace; antes de activar envíos masivos se debe sustituir por un token verificable y con expiración, preservando el comportamiento de enlaces previamente enviados. Los límites de solicitudes en memoria no sustituyen protección persistente en producción.

### Estado de la recuperación

La rama `fix/recuperar-funciones-y-diseno` incluye ajustes de interfaz, manejo de errores de APIs y flujo de registro. **No significa que los servicios externos ya hayan sido probados**: necesitan variables de entorno, acceso a los servicios externos y una prueba completa en staging. Integra esta rama únicamente después de revisar la configuración y ejecutar las comprobaciones.
