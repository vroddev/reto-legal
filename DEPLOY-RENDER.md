# RETO LEGAL en Render — guía de despliegue

El juego queda preparado para correr fuera de Muse como **un solo Web
Service** en Render: el mismo servicio sirve la pantalla del juego y las
acciones de sala (crear sala, unirse, responder, tablero), así que el QR
y el enlace de sala funcionan con la URL pública de Render, porque el
cliente los genera con `window.location.origin` (la dirección real donde
esté abierto el juego), sin ninguna URL fija de Muse.

No se usa ninguna credencial ni variable secreta. Las salas y los
jugadores viven en una base SQLite local del servicio
(`DATABASE_PATH=/tmp/reto-legal.db`): las salas son por partida, así que
no necesitan disco persistente. En el plan gratuito de Render el servicio
se duerme tras ~15 minutos sin uso y la primera visita después tarda
hasta ~1 minuto en despertar; para uso en una sesión de equipo conviene
abrir la URL unos minutos antes de jugar, o pasar el servicio al plan
Starter para que no se duerma.

## Archivos de despliegue (ya están en el proyecto)

| Archivo | Para qué sirve |
| --- | --- |
| `render.yaml` | Blueprint: crea el Web Service `reto-legal` con runtime Docker y chequeo de salud. |
| `Dockerfile` | Imagen Node 22 LTS + Bun 1.3.10; instala, compila cliente y servidor, y arranca. |
| `deploy/server.ts` | Servidor autónomo: escucha en `PORT` (la inyecta Render; respaldo local 10000), sirve `client/dist` y atiende `POST /actions` con los handlers reales del juego. |
| `deploy/build-client.mjs` | Compilador del cliente para fuera de Muse: reproduce con `Bun.build` la misma compilación que usa la plataforma (el compilador interno del SDK solo corre dentro de Muse y en Render fallaría). |
| `deploy/package.json` | Manifiesto usado dentro de Docker; igual al del proyecto pero con el SDK vendorizado y con el build del cliente apuntando a `deploy/build-client.mjs`. |
| `vendor/space-sdk.tgz` | Copia local del SDK `@hatch/space-sdk` (dentro de Muse se resuelve desde una ruta interna de la plataforma; fuera hace falta vendorizarlo). |
| `.gitignore` | Deja fuera del repo la base local, `node_modules` y todo lo compilado: el Dockerfile lo compila todo desde el código. |

Comandos que usa Render (vía Dockerfile):

- **Build:** `bun install` y después `bun run build`
  (compila el cliente a `client/dist` con `deploy/build-client.mjs` y el
  servidor a `deploy/dist/server.js`).
- **Start:** `bun run start` → `bun ./deploy/dist/server.js`.

## Pasos exactos

### Primero: el repositorio (si Render dice «No repositories found»)

Ese mensaje significa que Render todavía no puede ver ningún
repositorio: falta crear el repo con el código y conectar tu cuenta de
GitHub a Render. Sin ese paso no hay nada que desplegar. Haz esto:

1. **Crea el repositorio en GitHub:** entra a tu cuenta de GitHub y crea
   un repositorio nuevo llamado `reto-legal` (puede ser privado). No
   marques «Add a README» ni agregues `.gitignore` o licencia: el
   proyecto ya trae sus archivos y un README inicial puede causar
   conflictos al subir.
2. **Sube el código:** sube TODO el contenido de esta carpeta a la raíz
   del repositorio (las carpetas y archivos sueltos, no la carpeta que
   los contiene), conservando la estructura: `client/`, `server/`,
   `deploy/`, `vendor/`, `drizzle/`, `Dockerfile`, `render.yaml`,
   `space.json`, `bunfig.toml`, `package.json`, `.gitignore`. El
   `.gitignore` del proyecto ya excluye `app.db`, `node_modules` y lo
   compilado (`client/dist`, `deploy/dist`): no los subas, el Dockerfile
   los genera. Ojo: `vendor/space-sdk.tgz` SÍ debe subirse, sin él el
   servidor no compila fuera de Muse.
3. **Conecta GitHub a Render:** en la pantalla de crear el Web Service,
   junto a «Git Provider», usa el botón para conectar GitHub (**Connect
   GitHub** / **Configure GitHub**), inicia sesión y autoriza la app de
   Render. Si te pide alcance de repositorios, elige «Only select
   repositories» y selecciona `reto-legal` (o «All repositories»).
   Al volver a Render, la lista ya debe mostrar `reto-legal`; si no
   aparece, recarga la página.

### Después: crear el servicio

4. En Render (cuenta **victor_abogado**), en la pantalla **Create a new
   Service** elige **Web Services** — NO Static Sites: el juego es
   dinámico, con servidor y salas compartidas; un sitio estático no puede
   crear salas ni recibir jugadores.
5. Conecta el repositorio `reto-legal`. Render detecta `render.yaml` y
   propone el servicio **reto-legal** con runtime **Docker**; confirma
   con **Apply / Create Web Service**. (Si lo creas a mano en vez de por
   Blueprint: Runtime = **Docker**, Dockerfile Path = `./Dockerfile`,
   Docker Context = `.`, Health Check Path = `/healthz`, y la variable de
   entorno `DATABASE_PATH` = `/tmp/reto-legal.db`. No agregues ninguna
   otra variable: `PORT` la pone Render solo.)
6. Espera a que el primer despliegue termine (instala dependencias y
   compila; tarda unos minutos). El estado debe quedar en **Live**.
7. **URL pública:** Render la muestra en la parte superior del servicio.
   Si el nombre `reto-legal` está libre, será
   `https://reto-legal.onrender.com`; si no, Render asigna una variante
   con sufijo (p. ej. `https://reto-legal-xxxx.onrender.com`). Usa
   siempre la URL exacta que muestre el panel: esa es la dirección que
   abrirá el anfitrión, y el QR de la sala se genera solo a partir de
   ella, sin configurar nada más.
8. **Prueba rápida:** abre la URL, crea una sala y escanea el QR con un
   celular (con datos o Wi-Fi, sin necesidad de estar en la red del
   anfitrión): debe abrir la misma URL pública con el código de la sala y
   permitir unirse.

## Probar en local antes de subir (opcional)

Esto reproduce lo que hace el Dockerfile, en una copia limpia del
proyecto (sin `node_modules`). No uses `client/build.mjs` fuera de Muse:
ese compilador es interno de la plataforma y se detiene; el de despliegue
es `deploy/build-client.mjs`, invocado por el manifiesto de despliegue.

```bash
cp deploy/package.json package.json   # el manifiesto de despliegue manda
bun install
bun run build                          # cliente (deploy/build-client.mjs) + servidor
PORT=10000 DATABASE_PATH=/tmp/reto-legal.db bun run start
# Abrir http://localhost:10000
```
