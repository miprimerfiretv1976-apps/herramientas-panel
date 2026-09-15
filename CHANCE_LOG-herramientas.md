# CHANCE LOG — Panel Herramientas (herramientas-panel.vercel.app)

Registro descriptivo de cada sesión de desarrollo.
Propósito: reconstruir decisiones, documentar errores blindados, dejar
contexto para futuras IAs o para Victor mismo en 3 meses.

---

## RESUMEN OPERATIVO — Estado al 14/09/2026

### Qué es este proyecto
Panel de control personal para gestionar ~35 herramientas/apps propias.
Reemplazó una hoja de cálculo manual. Todo vive en una Google Sheet
conectada a un Apps Script propio, con deploy en Vercel.

### Qué puede hacer el panel hoy
- Leer todas las herramientas desde Google Sheet en tiempo real
- Filtrar por estado (trabajando / correcto / esperar / pendiente / descartada)
- Buscar por nombre, descripción o ícono
- **Bump de versión**: +1 con un click, o editor manual para saltar a cualquier número
- **Estado**: cambiar desde la card → se guarda en la Sheet
- **Observaciones**: agregar nota con timestamp argentino, o editar todo desde modal
- **Changelog/Descripción**: campo separado, colapsado por defecto, con `<br>` automático después de cada fecha
- **Email**: editar la cuenta asociada
- **Abrir app**: botón visual grande con URL de la app
- **Nota rápida**: enviar mail a victoralvarezojeda@gmail.com + guardar en hoja NOTAS_RAPIDAS
- **Agregar herramienta**: modal completo, se agrega al final de la Sheet
- **Eliminar**: con PIN 7749, abre pestaña de confirmación

### Versiones actuales
| Archivo | Versión |
|---|---|
| index.html (panel) | v25 |
| copihue-herramientas.html (visor) | v4 |
| Apps Script | v10 |

---

## SESIÓN 1 — Creación del panel desde cero

QUÉ: se construyó el panel de herramientas completo partiendo de una
Google Sheet existente del almacén Copihue.

POR QUÉ: Victor quería un lugar separado del sistema del almacén para
registrar y gestionar sus apps personales sin agrandar el code.gs del
almacén.

CÓMO: página HTML única con fetch a Google Sheets vía gviz/tq (sin
autenticación, Sheet pública). Apps Script propio para escritura.
Deploy en Vercel desde repo GitHub nuevo
(miprimerfiretv1976-apps/herramientas-panel).

DÓNDE: index.html (desde v1), Apps Script nuevo.

PROBLEMA QUE EVITA: mezclar lógica personal con el sistema del almacén.

SI SE ROMPE: el panel es independiente — no afecta ninguna otra app.

PENDIENTE: ninguno.

---

## SESIÓN 2 — Conexión con Google Sheet real + columnas

QUÉ: se alinearon las columnas del panel con la Sheet real de Victor
(que difería de la planilla de ejemplo).

POR QUÉ: la Sheet real tenía columnas con nombres distintos (`bumpeo`
en vez de `VER`, `URL ir directo a la app en linea` en vez de `URL`,
`Detalle` en vez de `DESCRIPCION`) y en orden diferente al esperado.

CÓMO: se actualizó el mapeo de columnas en el JS del panel (índices
fijos por posición: col 0=NOMBRE, 1=bumpeo, 2=URL, 3=ICONO, 4=Detalle,
11=ESTADO, 12=CUENTA, 13=OBSERVACIONES). Apps Script v7 actualizado para
buscar `bumpeo` si no encuentra `VER`.

DÓNDE: index.html (sección loadSheet), apps_script_v7.js (updateRow,
getHerramientas).

PROBLEMA QUE EVITA: que el bump de versión no guardara (buscaba columna
VER que no existía).

SI SE ROMPE: verificar el orden real de columnas en la Sheet con
`python3 -c "from openpyxl import load_workbook..."`.

PENDIENTE: ninguno.

---

## SESIÓN 3 — Bump de versión + editor manual

QUÉ: botón +1 bump en cada card que incrementa la columna `bumpeo` y
pone estado CORRECTO. Editor manual (✏) para saltar directo a cualquier
número sin hacer N clicks.

POR QUÉ: Victor trabaja con versiones altas (v300+) — hacer 300 clicks
no era viable.

CÓMO: botón +1 llama a `bumpVersion(idx)` que hace dos callScript
(campo `ver` y campo `estado`). El ✏ reemplaza el span de versión por un
input editable inline — Enter guarda, Escape cancela.

DÓNDE: index.html — funciones `bumpVersion`, `editarVersion`, CSS
`.btn-bump`, `.ver-row`, `.ver-inp`.

PROBLEMA QUE EVITA: tener que abrir la Sheet para actualizar la versión.

SI SE ROMPE: verificar que la columna B de la Sheet sea `bumpeo` (o
`VER`) y que el Apps Script tenga el campo mapeado en `colMap`.

PENDIENTE: ninguno.

---

## SESIÓN 4 — Changelog / descripción colapsable

QUÉ: campo nuevo `CHANGELOG` (col O de la Sheet) — historial de cambios
por herramienta. Se muestra colapsado en la card, editable desde modal,
con `<br>` automático después de cada fecha `[dd/mm/yyyy hh:mm]`.

POR QUÉ: Victor quería un lugar para registrar qué se cambió en cada
app, separado de las observaciones. El campo puede crecer mucho →
colapsado por defecto para no romper el layout.

CÓMO: `formatChangelog(txt)` aplica regex para insertar `<br>` antes de
cada `[fecha]`. El toggle abre/cierra con clase CSS. Modal igual al de
observaciones. Apps Script v8 agrega `changelog` al colMap y a
getHerramientas.

DÓNDE: index.html — funciones `toggleChangelog`, `editarChangelog`,
`guardarChangelogModal`, `formatChangelog`. CSS `.changelog-*`.
apps_script_v8.js — colMap + getHerramientas.

PROBLEMA QUE EVITA: mezclar notas rápidas con historial técnico.

SI SE ROMPE: verificar que la col O de la Sheet se llame exactamente
`CHANGELOG` (mayúsculas).

PENDIENTE: agregar la columna CHANGELOG en la Sheet real de Victor
(si no está ya).

---

## SESIÓN 5 — Nota rápida por mail

QUÉ: botón 📧 en cada card — abre modal con el nombre de la app
pre-cargado, Victor escribe una idea o recordatorio, se envía a
victoralvarezojeda@gmail.com y se guarda en hoja NOTAS_RAPIDAS de
la misma Sheet.

POR QUÉ: Victor quería capturar ideas rápidas sin salir del panel,
que quedaran en su correo de uso diario.

CÓMO: Apps Script v9 agrega función `enviarNota` con `GmailApp.sendEmail`.
El panel llama con `fetch` real (sin `no-cors`) para leer la respuesta
y mostrar confirmación o error real. Se descubrió que `no-cors` daba
"enviado" falso siempre.

PROBLEMA ENCONTRADO: `mode: 'no-cors'` en fetch no permite leer la
respuesta — el panel siempre mostraba "enviado" aunque el script
fallara. Solución: fetch normal sin `no-cors` para la nota, con lectura
real del JSON de respuesta.

OTRO PROBLEMA: GmailApp requiere autorización explícita. No se puede
autorizar ejecutando la función directamente (lanza error de parámetro
null). Solución: crear función temporal `testMail()` que llame a
`GmailApp.sendEmail` sin parámetros, ejecutarla desde el editor para
que Google pida el permiso, aceptar, luego borrar la función temporal.

DÓNDE: apps_script_v10.js — función `enviarNota`, acción
`enviarNotaDirecta` en doGet. index.html — modal `modal-nota`,
funciones `abrirModalNota`, `cerrarModalNota`, `enviarNota`.

SI SE ROMPE: verificar que GmailApp esté autorizado (Servicios del
proyecto en Apps Script). Si no, repetir el paso de testMail().

PENDIENTE: ninguno — funcionando y confirmado por Victor.

---

## SESIÓN 6 — Aplicación del contrato de desarrollo

QUÉ: se adoptaron las Reglas de Oro del proyecto Almacén Copihue
(adaptadas) y se crearon `CLAUDE-herramientas.md` y
`CHANCE_LOG-herramientas.md` propios de este proyecto.

POR QUÉ: el panel creció lo suficiente como para necesitar reglas
formales y registro histórico propio.

CÓMO: se revisó el CLAUDE.md del almacén Copihue, se descartó staging
(proyecto pequeño, usuario único), se adoptaron todas las demás reglas,
se resolvieron colisiones con el contrato previo.

DÓNDE: documentos nuevos (este archivo y CLAUDE-herramientas.md).

PENDIENTE: aplicar Regla 8 (autoguardado localStorage) en próxima sesión
relevante — aún no implementada.

---

## PROBLEMAS ABIERTOS (14/09/2026)

1. **Regla 8 — autoguardado localStorage**: no implementada todavía.
   Cuando hay cambios en el modal de obs/changelog y se cierra la
   pestaña, se pierden. Prioridad: baja (los modales son rápidos).

2. **Columna CHANGELOG en Sheet real**: si Victor no la agregó aún,
   la col O está vacía/desalineada. Agregar encabezado `CHANGELOG`
   en la fila 1, col O de la Sheet HERRAMIENTAS.

3. **copihue-herramientas.html no muestra changelog**: el visor v4
   lee la Sheet pero no tiene sección de changelog todavía.

## PRÓXIMO PASO (al retomar)
Cualquier mejora puntual del panel — el proyecto está operativo al 100%.
