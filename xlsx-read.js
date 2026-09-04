/* Lector de archivos .xlsx en el navegador, sin dependencias.

   Un .xlsx es un ZIP con XML dentro. Aquí se localizan las entradas por
   su directorio central, se descomprimen con DecompressionStream y se
   interpreta la primera hoja. Devuelve las filas como texto. */

(function (global) {
  'use strict';

  var decoder = new TextDecoder();

  /* ---------- Lectura del ZIP ---------- */

  /* Localiza el fin del directorio central, que está al final del archivo */
  function findEndOfCentralDirectory(view, length) {
    var maximo = Math.min(length, 66000);   /* cabe el comentario más largo */

    for (var offset = length - 22; offset >= length - maximo && offset >= 0; offset--) {
      if (view.getUint32(offset, true) === 0x06054B50) { return offset; }
    }
    return -1;
  }

  /* Entradas del ZIP, indexadas por nombre */
  function readEntries(bytes) {
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var eocd = findEndOfCentralDirectory(view, bytes.byteLength);

    if (eocd === -1) { throw new Error('El archivo no es un .xlsx válido'); }

    var total = view.getUint16(eocd + 10, true);
    var offset = view.getUint32(eocd + 16, true);
    var entries = {};

    for (var i = 0; i < total; i++) {
      if (view.getUint32(offset, true) !== 0x02014B50) { break; }

      var method = view.getUint16(offset + 10, true);
      var compressedSize = view.getUint32(offset + 20, true);
      var nameLength = view.getUint16(offset + 28, true);
      var extraLength = view.getUint16(offset + 30, true);
      var commentLength = view.getUint16(offset + 32, true);
      var localOffset = view.getUint32(offset + 42, true);

      var name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));

      entries[name] = { method: method, size: compressedSize, localOffset: localOffset };
      offset += 46 + nameLength + extraLength + commentLength;
    }

    return { entries: entries, bytes: bytes, view: view };
  }

  /* Contenido de una entrada, ya descomprimido */
  function readEntry(zip, name) {
    var entry = zip.entries[name];
    if (!entry) { return Promise.resolve(null); }

    /* Tras la cabecera local vienen el nombre y el campo extra */
    var nameLength = zip.view.getUint16(entry.localOffset + 26, true);
    var extraLength = zip.view.getUint16(entry.localOffset + 28, true);
    var start = entry.localOffset + 30 + nameLength + extraLength;
    var data = zip.bytes.subarray(start, start + entry.size);

    if (entry.method === 0) {                     /* sin compresión */
      return Promise.resolve(decoder.decode(data));
    }

    if (entry.method !== 8) {                     /* distinto de deflate */
      return Promise.reject(new Error('El archivo usa una compresión no admitida'));
    }

    var stream = new Blob([data]).stream()
      .pipeThrough(new DecompressionStream('deflate-raw'));

    return new Response(stream).text();
  }

  /* ---------- Interpretación de la hoja ---------- */

  /* "C" -> 2, "AB" -> 27 */
  function columnIndex(reference) {
    var letters = reference.replace(/\d+/g, '');
    var index = 0;

    for (var i = 0; i < letters.length; i++) {
      index = index * 26 + (letters.charCodeAt(i) - 64);
    }
    return index - 1;
  }

  function parseSharedStrings(xml) {
    if (!xml) { return []; }

    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    var items = doc.getElementsByTagName('si');
    var strings = [];

    for (var i = 0; i < items.length; i++) {
      /* El texto puede venir partido en varios fragmentos con formato */
      var partes = items[i].getElementsByTagName('t');
      var texto = '';

      for (var j = 0; j < partes.length; j++) { texto += partes[j].textContent; }
      strings.push(texto);
    }

    return strings;
  }

  function parseSheet(xml, strings) {
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    var rows = doc.getElementsByTagName('row');
    var salida = [];

    for (var r = 0; r < rows.length; r++) {
      var celdas = rows[r].getElementsByTagName('c');
      var fila = [];

      for (var c = 0; c < celdas.length; c++) {
        var celda = celdas[c];
        var referencia = celda.getAttribute('r') || '';
        var indice = referencia ? columnIndex(referencia) : c;
        var tipo = celda.getAttribute('t');
        var valor = '';

        if (tipo === 's') {
          var v = celda.getElementsByTagName('v')[0];
          valor = v ? (strings[Number(v.textContent)] || '') : '';
        } else if (tipo === 'inlineStr') {
          var t = celda.getElementsByTagName('t')[0];
          valor = t ? t.textContent : '';
        } else {
          var n = celda.getElementsByTagName('v')[0];
          valor = n ? n.textContent : '';
        }

        /* Las columnas omitidas en el XML quedan como cadena vacía */
        while (fila.length < indice) { fila.push(''); }
        fila[indice] = valor;
      }

      salida.push(fila);
    }

    return salida;
  }

  /**
   * Lee la primera hoja de un archivo .xlsx.
   * @param {File|Blob} file
   * @returns {Promise<Array<Array<string>>>} filas, incluida la de encabezados
   */
  function readXlsx(file) {
    return file.arrayBuffer().then(function (buffer) {
      var zip = readEntries(new Uint8Array(buffer));

      var hoja = zip.entries['xl/worksheets/sheet1.xml']
        ? 'xl/worksheets/sheet1.xml'
        : Object.keys(zip.entries).filter(function (nombre) {
            return nombre.indexOf('xl/worksheets/') === 0 && /\.xml$/.test(nombre);
          })[0];

      if (!hoja) { throw new Error('El archivo no contiene ninguna hoja'); }

      return Promise.all([
        readEntry(zip, hoja),
        readEntry(zip, 'xl/sharedStrings.xml')
      ]).then(function (partes) {
        return parseSheet(partes[0], parseSharedStrings(partes[1]));
      });
    });
  }

  global.readXlsx = readXlsx;
})(window);
