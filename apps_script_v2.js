// COPIHUE HERRAMIENTAS - Apps Script Web App v2
// Pegar en: Extensiones → Apps Script → reemplazar todo → Guardar → Implementar nueva versión

const SHEET_NAME = 'HERRAMIENTAS';

function doGet(e) {
  // Si llaman con ?action=normalizar, normaliza todos los estados
  if (e && e.parameter && e.parameter.action === 'normalizar') {
    return normalizarEstados();
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', msg: 'Herramientas API v2 activa' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    if (action === 'update')  return updateRow(data);
    if (action === 'addObs')  return addObservacion(data);
    if (action === 'eliminar') return eliminarFila(data);
    return resp({ status: 'error', msg: 'Acción desconocida' });
  } catch (err) {
    return resp({ status: 'error', msg: err.toString() });
  }
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
    } else if (validos.includes(normalizado)) {
      // Ya está bien, no tocar
    }
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', msg: `${count} estados normalizados a mayúsculas` }))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateRow(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(h => h.toString().trim().toUpperCase());

  const colMap = {
    'version':       headers.indexOf('VERSION'),
    'estado':        headers.indexOf('ESTADO'),
    'observaciones': headers.indexOf('OBSERVACIONES'),
    'email':         headers.indexOf('CUENTA / EMAIL'),
    'vuelve':        headers.indexOf('VUELVE'),
  };

  const colIdx = colMap[data.campo.toLowerCase()];
  if (colIdx === -1 || colIdx === undefined) {
    return resp({ status: 'error', msg: 'Campo no encontrado: ' + data.campo });
  }

  // Normalizar estado a mayúsculas al guardar
  let valor = data.valor;
  if (data.campo.toLowerCase() === 'estado') {
    valor = valor.toString().toUpperCase();
  }

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

function resp(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
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
