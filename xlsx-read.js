/* Lector de archivos .xlsx en el navegador, sin dependencias.

   Un .xlsx es un ZIP con XML dentro. Aquí se localizan las entradas por
   su directorio central, se descomprimen con DecompressionStream y se
   interpreta la hoja que se pida POR SU NOMBRE VISIBLE, no por su
   posición: el nombre vive en xl/workbook.xml y se resuelve al archivo
   físico a través de xl/_rels/workbook.xml.rels.

   Devuelve las filas como texto y, en paralelo, qué celdas son fórmulas
   —las que el XML guarda con un elemento <f>—, dato que no se puede
   deducir del valor y que hace falta para rechazarlas. */

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

  /* Devuelve { filas, formulas }: dos arreglos paralelos, con el texto
     de cada celda y con si esa celda es una fórmula. */
  function parseSheet(xml, strings) {
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    var rows = doc.getElementsByTagName('row');
    var filas = [];
    var formulas = [];

    for (var r = 0; r < rows.length; r++) {
      var celdas = rows[r].getElementsByTagName('c');
      var fila = [];
      var esFormula = [];

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

        /* Una celda calculada guarda su fórmula en <f>, además del
           último valor conocido en <v>. Un texto que empiece por "=" no
           lleva <f> y por tanto no es fórmula. */
        var formula = celda.getElementsByTagName('f').length > 0;

        /* Las columnas omitidas en el XML quedan como cadena vacía */
        while (fila.length < indice) { fila.push(''); esFormula.push(false); }
        fila[indice] = valor;
        esFormula[indice] = formula;
      }

      filas.push(fila);
      formulas.push(esFormula);
    }

    return { filas: filas, formulas: formulas };
  }

  /* ---------- Hojas por su nombre visible ---------- */

  /* Relaciona cada r:id con el archivo físico al que apunta */
  function parseRelaciones(xml) {
    var mapa = {};
    if (!xml) { return mapa; }

    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    var items = doc.getElementsByTagName('Relationship');

    for (var i = 0; i < items.length; i++) {
      var destino = items[i].getAttribute('Target') || '';

      /* Los destinos vienen relativos a xl/ o como ruta absoluta del paquete */
      if (destino.charAt(0) === '/') {
        destino = destino.replace(/^\//, '');
      } else if (destino.indexOf('xl/') !== 0) {
        destino = 'xl/' + destino;
      }

      mapa[items[i].getAttribute('Id')] = destino;
    }

    return mapa;
  }

  /* Nombre visible de cada hoja y el archivo que le corresponde */
  function parseHojas(xml, relaciones) {
    var hojas = [];
    if (!xml) { return hojas; }

    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    var items = doc.getElementsByTagName('sheet');

    for (var i = 0; i < items.length; i++) {
      /* El atributo lleva el prefijo del espacio de nombres de relaciones */
      var id = items[i].getAttribute('r:id') ||
        items[i].getAttributeNS(
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');

      hojas.push({
        nombre: items[i].getAttribute('name') || '',
        archivo: relaciones[id] || null
      });
    }

    return hojas;
  }

  /**
   * Lee de un .xlsx la hoja que se pida por su nombre visible.
   *
   * @param {File|Blob} file
   * @param {string} nombreHoja - nombre exacto de la hoja buscada
   * @returns {Promise<{ encontrada: boolean, hojas: string[],
   *                     filas: Array<Array<string>>,
   *                     formulas: Array<Array<boolean>> }>}
   *   'hojas' lista los nombres que sí trae el archivo, para poder decir
   *   qué se encontró en su lugar. Si la hoja no está, 'filas' y
   *   'formulas' vienen vacías: no se adivina otra.
   */
  function readXlsx(file, nombreHoja) {
    return file.arrayBuffer().then(function (buffer) {
      var zip = readEntries(new Uint8Array(buffer));

      return Promise.all([
        readEntry(zip, 'xl/workbook.xml'),
        readEntry(zip, 'xl/_rels/workbook.xml.rels')
      ]).then(function (partes) {
        var hojas = parseHojas(partes[0], parseRelaciones(partes[1]));
        var nombres = hojas.map(function (h) { return h.nombre; });

        var buscada = hojas.filter(function (h) {
          return h.nombre === nombreHoja && h.archivo && zip.entries[h.archivo];
        })[0];

        if (!buscada) {
          return { encontrada: false, hojas: nombres, filas: [], formulas: [] };
        }

        return Promise.all([
          readEntry(zip, buscada.archivo),
          readEntry(zip, 'xl/sharedStrings.xml')
        ]).then(function (contenido) {
          var hoja = parseSheet(contenido[0], parseSharedStrings(contenido[1]));

          return {
            encontrada: true,
            hojas: nombres,
            filas: hoja.filas,
            formulas: hoja.formulas
          };
        });
      });
    });
  }

  global.readXlsx = readXlsx;
})(window);
