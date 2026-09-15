# CLAUDE.md — Panel Herramientas (herramientas-panel.vercel.app)

## SOBRE MÍ
Soy Victor Alvarez Ojeda, desarrollador independiente, Argentina.
NO SOY PROGRAMADOR DE CARRERA. Explicame simple, sin jerga técnica.
Si no entendés mi pedido, preguntá antes de asumir.

---

## REGLA CERO
Antes de tocar cualquier archivo, declarar:
1. Qué archivo vas a modificar
2. Qué sección exacta
3. Qué NO vas a tocar
4. Si hay riesgo de romper una Regla de Oro

Esperar mi OK. Después escribir.

---

## 🛑 REGLA MÁS IMPORTANTE
**NO ROMPER LO QUE YA FUNCIONA.**
PRIMERO PRESERVAR. DESPUÉS MODIFICAR. NUNCA MODIFICAR POR MODIFICAR.

Una solicitud de cambio NO autoriza modificar el resto.
Si dudás entre cambiar algo no pedido o conservarlo → CONSERVARLO.

---

## PRIORIDAD SI HAY CONFLICTO
1. Solicitud explícita de Victor.
2. Estas Reglas de Oro.
3. Comportamiento funcional existente.
4. Sugerencias técnicas de la IA.

---

## REGLAS DE ORO

1. **APP_VERSION** — entero, +1 por cada entrega. Nunca v1.2 ni formatos
   mixtos. Una única constante cerca del inicio del script. El `<title>`
   y el badge del header la leen de ahí — nunca hardcodeada en otro lugar.
   Cada archivo HTML tiene su propia numeración independiente.

2. **Dos archivos de salida idénticos** en cada entrega:
   - `[nombre-original].html` — limpio, listo para subir al servidor.
   - `[nombre-original]_v[N]_backup.html` — mismo contenido, versión en
     el nombre, para guardar en disco como respaldo.
   No preguntar el formato cada vez — aplicar siempre.

3. **Sin superposición de texto** — nunca.

4. **Sin pull-to-refresh** — `overscroll-behavior-y: contain` en el body
   de cada página. El scroll vertical nunca recarga la página.

5. **Nunca salir sin confirmación** — el botón atrás de la app, el botón
   atrás del navegador, el botón físico del teléfono, swipe-back, y
   cualquier link que abandone la página pasan por la misma confirmación
   (`history.pushState` + `popstate`). No limitar solo al botón dibujado
   por la app.

6. **Verde = éxito. Rojo = error.** Siempre. Sin excepciones de color.

7. **Ediciones del usuario → disquete 💾** — mientras haya cambios sin
   guardar, el indicador visual cambia al ícono de disquete. Al guardar,
   vuelve al estado normal.

8. **Autoguardado en localStorage mientras se edita** — si el usuario
   cierra la pestaña o se corta la conexión con cambios sin guardar, al
   reabrir: detectar el borrador, avisar, y dejar recuperar o descartar.
   Nunca pisar en silencio un borrador existente.

9. **Un solo botón de refrescar por pantalla.** Los datos cargados no se
   repiden por scroll, hover, ni interacción menor — solo con acción
   explícita del usuario.

10. **Mensajes del sistema** — prioridad de posición:
    Centrado > abajo-izquierda > arriba-derecha.
    Nunca tapar información ni controles importantes.

11. **Ningún contenedor/modal/panel traba el scroll vertical.** Revisar
    `overflow`, `height`, `max-height`, `fixed`/`absolute`, overlays y
    scroll anidado antes de entregar.

12. **Nunca usar `confirm()` / `alert()` / `prompt()` nativos** para nada
    importante. Fallan en silencio en apps instaladas en el celular (PWA)
    y a veces en Chrome después de varios diálogos seguidos. Usar siempre
    un modal propio con el mismo estilo visual de la app.

13. **No calcular en vivo lo que se puede cachear.** Si algo se llama en
    cada carga y tarda, evaluarlo para caché o precálculo.

14. **Bump de versión** — el botón +1 bump en cada card incrementa la
    columna `bumpeo` de la Sheet y pone el estado en CORRECTO
    automáticamente. El editor manual (✏) permite saltar directo a
    cualquier número sin hacer N clicks.

---

## ARQUITECTURA DEL PROYECTO

```
PANEL (index.html — herramientas-panel.vercel.app)
  └── Lee/escribe vía GET a Apps Script
       └── Apps Script (Code.gs del proyecto Herramientas)
            └── Lee/escribe Google Sheet (HERRAMIENTAS)
                 Hojas: HERRAMIENTAS · NOTAS_RAPIDAS · canales_tv · config_sistematv

VISOR (copihue-herramientas.html — en el servidor del almacén)
  └── Solo lectura → mismo Apps Script → misma Sheet
```

### Archivos activos del proyecto

| Archivo | Versión actual | Función |
|---|---|---|
| `index.html` | v25 | Panel de control — CRUD completo |
| `copihue-herramientas.html` | v4 | Visor de solo lectura (desde seba21) |
| Apps Script | v10 | Backend — lee/escribe Sheet, envía mails |

### Columnas de la Sheet HERRAMIENTAS (en orden)
| Col | Nombre | Descripción |
|---|---|---|
| A | NOMBRE | Nombre de la herramienta |
| B | bumpeo | Versión numérica (bump) |
| C | URL ir directo a la app en linea | URL de la app |
| D | ICONO | Código de ícono |
| E | Detalle | Descripción corta |
| F | A | (interno) |
| G | Info | (interno) |
| H | COD | Código |
| I | online | Estado online |
| J | check | Check |
| K | IA | IA relacionada |
| L | ESTADO | CORRECTO/TRABAJANDO/ESPERAR/PENDIENTE/DESCARTADA |
| M | CUENTA / email | Cuenta o email asociado |
| N | OBSERVACIONES | Notas con timestamp |
| O | CHANGELOG | Historial/descripción (colapsado en la card) |

---

## STACK
- Frontend: HTML/CSS/JS puro, sin frameworks
- Backend: Google Apps Script (Code.gs del proyecto Herramientas)
- DB: Google Sheets (cuenta miprimerfiretv1976@gmail.com)
- Deploy: Vercel desde GitHub (miprimerfiretv1976-apps/herramientas-panel)
- Notificaciones: GmailApp → victoralvarezojeda@gmail.com
- PIN de eliminación: 7749

---

## NUNCA HAGAS ESTO
- Reorganizar o "modernizar" código que no se pidió tocar.
- Hardcodear el número de versión fuera de APP_VERSION.
- Usar `confirm()`/`alert()` nativos.
- Entregar un solo archivo en vez de dos.
- Tocar la lógica de lectura de Sheet sin verificar el orden real de columnas.
- Asumir que el nombre de una columna es el mismo que el del campo en JS.

---

## FLUJO DE TRABAJO
1. Victor pide en criollo.
2. Claude declara qué toca y qué NO (Regla Cero).
3. Victor confirma.
4. Claude entrega código + 2 archivos de salida.
5. Victor prueba.
6. Si falla → volver atrás, no parchear encima.
7. Una cosa por vez, sin excepciones.

---

## CHANCE LOG — OBLIGATORIO
Registro de cada sesión relevante en `CHANCE_LOG-herramientas.md`.
No es un changelog técnico de una línea — es contexto recuperable.

**Cuándo:** cualquier cambio de código, decisión de arquitectura, o
diagnóstico que llevó más de 5 minutos.

**Estructura por sesión:**
```
## SESIÓN N — [tema en una frase]
QUÉ: qué se hizo.
POR QUÉ: qué problema lo motivó.
CÓMO: solución concreta con detalle técnico suficiente.
DÓNDE: archivo y función exacta.
PROBLEMA QUE EVITA: qué se rompe si esto no existe.
SI SE ROMPE: cómo volver atrás.
PENDIENTE: qué quedó abierto de esta sesión.
```
