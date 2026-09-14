// COPIHUE HERRAMIENTAS + CANALES TV - Apps Script Web App v9
// v9: enviarNota — guarda en NOTAS_RAPIDAS y manda mail a victoralvarezojeda@gmail.com

const SHEET_NAME = 'HERRAMIENTAS';
const SHEET_CANALES = 'canales_tv';

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'getHerramientas') return getHerramientas();
  if (e && e.parameter && e.parameter.action === 'canales') return getCanales();
  if (e && e.parameter && e.parameter.action === 'getPin') return getPin();
  if (e && e.parameter && e.parameter.action === 'normalizar') return normalizarEstados();
  if (e && e.parameter && e.parameter.data) {
    try {
      const data = JSON.parse(e.parameter.data);
      const action = data.action;
      if (action === 'update')   return updateRow(data);
      if (action === 'addObs')   return addObservacion(data);
      if (action === 'eliminar') return eliminarFilaHtml(data);
      if (action === 'agregar')  return agregarFila(data);
      if (action === 'enviarNota') return enviarNota(data);
    } catch(err) {
      return resp({ status: 'error', msg: err.toString() });
    }
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', msg: 'API v9 activa' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    if (action === 'update')   return updateRow(data);
    if (action === 'addObs')   return addObservacion(data);
    if (action === 'eliminar') return eliminarFila(data);
    if (action === 'agregar')  return agregarFila(data);
    return resp({ status: 'error', msg: 'Acción desconocida' });
  } catch (err) {
    return resp({ status: 'error', msg: err.toString() });
  }
}

function getHerramientas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(h => h.toString().trim().toUpperCase());

  const col = {
    nombre:        headers.indexOf('NOMBRE'),
    ver:           headers.indexOf('VER') >= 0 ? headers.indexOf('VER') : headers.indexOf('BUMPEO'),
    url:           headers.indexOf('URL') >= 0 ? headers.indexOf('URL') : headers.findIndex(h => h.startsWith('URL')),
    icono:         headers.indexOf('ICONO'),
    descripcion:   headers.indexOf('DESCRIPCION') >= 0 ? headers.indexOf('DESCRIPCION') : headers.indexOf('DETALLE'),
    vuelve:        headers.indexOf('VUELVE'),
    estado:        headers.indexOf('ESTADO'),
    cuenta:        headers.indexOf('CUENTA / EMAIL'),
    observaciones: headers.indexOf('OBSERVACIONES'),
    changelog:     headers.indexOf('CHANGELOG'),
  };

  const herramientas = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const nombre = row[col.nombre];
    if (!nombre || !nombre.toString().trim()) continue;
    herramientas.push({
      nombre:        nombre.toString().trim(),
      version:       col.ver >= 0 && row[col.ver] !== '' ? row[col.ver].toString().trim() : '',
      url:           col.url >= 0 ? (row[col.url] || '').toString().trim() : '',
      icono:         col.icono >= 0 ? (row[col.icono] || '').toString().trim() : '',
      descripcion:   col.descripcion >= 0 ? (row[col.descripcion] || '').toString().trim() : '',
      vuelve:        col.vuelve >= 0 ? (row[col.vuelve] || '').toString().trim() : '',
      estado:        col.estado >= 0 ? (row[col.estado] || '').toString().trim().toUpperCase() : '',
      cuenta:        col.cuenta >= 0 ? (row[col.cuenta] || '').toString().trim() : '',
      observaciones: col.observaciones >= 0 ? (row[col.observaciones] || '').toString().trim() : '',
      changelog:     col.changelog >= 0 ? (row[col.changelog] || '').toString().trim() : '',
    });
  }
  return resp({ status: 'ok', herramientas: herramientas });
}

function getCanales() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_CANALES);
  const rows = sheet.getDataRange().getValues();
  const canales = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    canales.push({
      nombre:     row[0].toString().trim(),
      url_stream: row[1].toString().trim(),
      url_icono:  row[2].toString().trim(),
      categoria:  row[3].toString().trim()
    });
  }
  return resp({ status: 'ok', canales: canales });
}

function normalizarEstados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(h => h.toString().trim().toUpperCase());
  const estadoCol = headers.indexOf('ESTADO');
  if (estadoCol === -1) return resp({ status: 'error', msg: 'Columna ESTADO no encontrada' });
  const validos = ['TRABAJANDO', 'CORRECTO', 'ESPERAR', 'PENDIENTE', 'DESCARTADA'];
  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const val = rows[i][estadoCol];
    if (!val) continue;
    const normalizado = val.toString().trim().toUpperCase();
    if (validos.includes(normalizado) && normalizado !== val.toString()) {
      sheet.getRange(i + 1, estadoCol + 1).setValue(normalizado);
      count++;
    }
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', msg: count + ' estados normalizados' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateRow(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(h => h.toString().trim().toUpperCase());

  const verCol = headers.indexOf('VER') >= 0 ? headers.indexOf('VER') : headers.indexOf('BUMPEO');
  const colMap = {
    'ver':           verCol,
    'version':       verCol,
    'bumpeo':        verCol,
    'estado':        headers.indexOf('ESTADO'),
    'observaciones': headers.indexOf('OBSERVACIONES'),
    'email':         headers.indexOf('CUENTA / EMAIL'),
    'vuelve':        headers.indexOf('VUELVE'),
    'changelog':     headers.indexOf('CHANGELOG'),
  };

  const colIdx = colMap[data.campo.toLowerCase()];
  if (colIdx === -1 || colIdx === undefined) {
    return resp({ status: 'error', msg: 'Campo no encontrado: ' + data.campo });
  }

  let valor = data.valor;
  if (data.campo.toLowerCase() === 'estado') valor = valor.toString().toUpperCase();
  if (['ver','version','bumpeo'].includes(data.campo.toLowerCase())) valor = parseInt(valor) || 0;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().trim() === data.nombre.trim()) {
      sheet.getRange(i + 1, colIdx + 1).setValue(valor);
      return resp({ status: 'ok', msg: 'Actualizado', fila: i + 1 });
    }
  }
  return resp({ status: 'error', msg: 'Herramienta no encontrada: ' + data.nombre });
}

function addObservacion(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(h => h.toString().trim().toUpperCase());
  const obsCol = headers.indexOf('OBSERVACIONES');
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().trim() === data.nombre.trim()) {
      const actual = rows[i][obsCol] ? rows[i][obsCol].toString() : '';
      const ts = Utilities.formatDate(new Date(), 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy HH:mm');
      const nuevo = actual ? actual + ' · [' + ts + '] ' + data.obs : '[' + ts + '] ' + data.obs;
      sheet.getRange(i + 1, obsCol + 1).setValue(nuevo);
      return resp({ status: 'ok', msg: 'Observacion guardada' });
    }
  }
  return resp({ status: 'error', msg: 'No encontrada: ' + data.nombre });
}

function eliminarFila(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString().trim() === data.nombre.trim()) {
      sheet.deleteRow(i + 1);
      return resp({ status: 'ok', msg: 'Fila eliminada: ' + data.nombre });
    }
  }
  return resp({ status: 'error', msg: 'No encontrada: ' + data.nombre });
}

function eliminarFilaHtml(data) {
  const result = eliminarFila(data);
  const parsed = JSON.parse(result.getContent());
  if (parsed.status === 'ok') {
    return respHtml('✅ Eliminada', '"' + data.nombre + '" fue eliminada correctamente.', '#3dd68c');
  }
  return respHtml('❌ Error', parsed.msg, '#f04a4a');
}

function respHtml(titulo, msg, color) {
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f1117;font-family:sans-serif;}' +
    '.box{text-align:center;padding:2rem;}h2{color:' + color + ';margin-bottom:.5rem;font-size:24px;}' +
    'p{color:#7a8099;font-size:14px;margin-bottom:1.5rem;}.c{color:#3e4460;font-size:12px;}</style>' +
    '<script>setTimeout(function(){document.querySelector(".c").textContent="Podés cerrar esta pestaña.";},1000);</script></head>' +
    '<body><div class="box"><h2>' + titulo + '</h2><p>' + msg + '</p><div class="c">Cerrando…</div></div></body></html>';
  return HtmlService.createHtmlOutput(html);
}

function agregarFila(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const h = headers.map(x => x.toString().trim().toUpperCase());
  const t = data.tool;
  const newRow = new Array(sheet.getLastColumn()).fill('');
  const set = (col, val) => { const i = h.indexOf(col); if (i >= 0) newRow[i] = val || ''; };
  set('NOMBRE', t.nombre);
  if (h.indexOf('VER') >= 0) set('VER', parseInt(t.version) || 1);
  else set('BUMPEO', parseInt(t.version) || 1);
  set('URL', t.url);
  set('ICONO', t.icono);
  set('DESCRIPCION', t.descripcion);
  set('CUENTA / EMAIL', t.cuenta);
  set('OBSERVACIONES', t.observaciones);
  set('CHANGELOG', t.changelog || '');
  set('ESTADO', 'CORRECTO');
  sheet.appendRow(newRow);
  return resp({ status: 'ok', msg: 'Herramienta agregada: ' + t.nombre });
}

function getPin() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('config_sistematv');
  const pin = sheet.getRange('B1').getValue().toString().trim();
  return resp({ status: 'ok', pin: pin });
}

function enviarNota(data) {
  const DESTINO = 'victoralvarezojeda@gmail.com';
  const ss      = SpreadsheetApp.getActiveSpreadsheet();

  // Guardar en hoja NOTAS_RAPIDAS
  let sh = ss.getSheetByName('NOTAS_RAPIDAS');
  if (!sh) {
    sh = ss.insertSheet('NOTAS_RAPIDAS');
    sh.getRange(1,1,1,4).setValues([['FECHA','APP','VERSIÓN','NOTA']]);
    sh.getRange(1,1,1,4).setFontWeight('bold').setBackground('#1a1d26').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 140);
    sh.setColumnWidth(2, 200);
    sh.setColumnWidth(3, 80);
    sh.setColumnWidth(4, 400);
  }

  const tz    = 'America/Argentina/Buenos_Aires';
  const ahora = new Date();
  const fecha = Utilities.formatDate(ahora, tz, 'dd/MM/yyyy HH:mm');
  const app   = String(data.app     || '').trim();
  const ver   = String(data.version || '').trim();
  const nota  = String(data.nota    || '').trim();

  sh.appendRow([fecha, app, ver, nota]);

  // Enviar mail
  const asunto = '🛠 Herramientas' + (app ? ' · ' + app : '') + (ver ? ' v' + ver : '') + ' — Nota rápida';
  const cuerpo = 
    'Nota rápida registrada desde el panel de Herramientas.

' +
    '📌 App: ' + (app || '—') + (ver ? ' (v' + ver + ')' : '') + '
' +
    '🕐 Fecha: ' + fecha + '

' +
    '📝 Nota:
' + nota + '

' +
    '---
Guardado en hoja NOTAS_RAPIDAS de tu planilla.';

  try {
    GmailApp.sendEmail(DESTINO, asunto, cuerpo);
    return resp({ status: 'ok', msg: 'Nota enviada a ' + DESTINO });
  } catch(e) {
    return resp({ status: 'error', msg: 'Mail falló: ' + e.toString() });
  }
}


function resp(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
