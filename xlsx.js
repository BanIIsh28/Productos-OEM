/* Generador mínimo de archivos .xlsx (Office Open XML) sin dependencias.
   Un .xlsx es un ZIP con varios XML; aquí se empaquetan sin compresión
   (método "store"), que Excel y LibreOffice abren sin problema. */

(function (global) {
  'use strict';

  /* ---------- Utilidades de bytes ---------- */

  var encoder = new TextEncoder();

  function crc32(bytes) {
    var table = crc32.table;
    if (!table) {
      table = crc32.table = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) {
          c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[n] = c >>> 0;
      }
    }
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xFF];
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  /* Fecha y hora en el formato MS-DOS que usan las entradas ZIP */
  function dosDateTime(date) {
    return {
      time: (date.getHours() << 11) | (date.getMinutes() << 5) | (Math.floor(date.getSeconds() / 2)),
      date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
    };
  }

  /* ---------- Empaquetado ZIP ---------- */

  function zip(files) {
    var stamp = dosDateTime(new Date());
    var entries = [];
    var localSize = 0;
    var centralSize = 0;

    files.forEach(function (file) {
      var name = encoder.encode(file.name);
      var data = encoder.encode(file.content);
      entries.push({ name: name, data: data, crc: crc32(data), offset: localSize });
      localSize += 30 + name.length + data.length;
      centralSize += 46 + name.length;
    });

    var out = new Uint8Array(localSize + centralSize + 22);
    var view = new DataView(out.buffer);
    var pos = 0;

    function u16(value) { view.setUint16(pos, value, true); pos += 2; }
    function u32(value) { view.setUint32(pos, value, true); pos += 4; }
    function bytes(value) { out.set(value, pos); pos += value.length; }

    entries.forEach(function (entry) {
      u32(0x04034B50);            /* firma de cabecera local */
      u16(20);                    /* versión necesaria */
      u16(0x0800);                /* nombres en UTF-8 */
      u16(0);                     /* sin compresión */
      u16(stamp.time);
      u16(stamp.date);
      u32(entry.crc);
      u32(entry.data.length);     /* tamaño comprimido */
      u32(entry.data.length);     /* tamaño original */
      u16(entry.name.length);
      u16(0);                     /* sin campo extra */
      bytes(entry.name);
      bytes(entry.data);
    });

    var centralOffset = pos;

    entries.forEach(function (entry) {
      u32(0x02014B50);            /* firma de directorio central */
      u16(20);                    /* versión de creación */
      u16(20);                    /* versión necesaria */
      u16(0x0800);
      u16(0);
      u16(stamp.time);
      u16(stamp.date);
      u32(entry.crc);
      u32(entry.data.length);
      u32(entry.data.length);
      u16(entry.name.length);
      u16(0);                     /* extra */
      u16(0);                     /* comentario */
      u16(0);                     /* disco inicial */
      u16(0);                     /* atributos internos */
      u32(0);                     /* atributos externos */
      u32(entry.offset);
      bytes(entry.name);
    });

    var centralLength = pos - centralOffset;

    u32(0x06054B50);              /* fin del directorio central */
    u16(0);                       /* número de disco */
    u16(0);                       /* disco del directorio central */
    u16(entries.length);
    u16(entries.length);
    u32(centralLength);
    u32(centralOffset);
    u16(0);                       /* comentario */

    return new Blob([out], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  /* ---------- Contenido del libro ---------- */

  function escapeXml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Índice de columna a letra: 0 -> A, 26 -> AA */
  function columnLetter(index) {
    var letter = '';
    var n = index;
    do {
      letter = String.fromCharCode(65 + (n % 26)) + letter;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return letter;
  }

  function cell(reference, value, styleId) {
    var style = styleId ? ' s="' + styleId + '"' : '';
    if (typeof value === 'number' && isFinite(value)) {
      return '<c r="' + reference + '"' + style + '><v>' + value + '</v></c>';
    }
    return '<c r="' + reference + '"' + style + ' t="inlineStr"><is><t xml:space="preserve">' +
      escapeXml(value) + '</t></is></c>';
  }

  function sheetXml(headers, rows, widths) {
    var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';

    if (widths && widths.length) {
      xml += '<cols>';
      widths.forEach(function (width, i) {
        xml += '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + width + '" customWidth="1"/>';
      });
      xml += '</cols>';
    }

    xml += '<sheetData><row r="1">';
    headers.forEach(function (header, i) {
      xml += cell(columnLetter(i) + '1', header, 1);
    });
    xml += '</row>';

    rows.forEach(function (cells, r) {
      var rowNumber = r + 2;
      xml += '<row r="' + rowNumber + '">';
      cells.forEach(function (value, i) {
        /* Los valores puramente numéricos se escriben como número */
        var numeric = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
        xml += cell(columnLetter(i) + rowNumber, numeric, 0);
      });
      xml += '</row>';
    });

    xml += '</sheetData></worksheet>';
    return xml;
  }

  var STYLES_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<fonts count="2">' +
    '<font><sz val="11"/><color theme="1"/><name val="Calibri"/></font>' +
    '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>' +
    '</fonts>' +
    '<fills count="3">' +
    '<fill><patternFill patternType="none"/></fill>' +
    '<fill><patternFill patternType="gray125"/></fill>' +
    /* Azul corporativo del encabezado de la tabla: rgb(0, 75, 131) */
    '<fill><patternFill patternType="solid"><fgColor rgb="FF004B83"/><bgColor indexed="64"/></patternFill></fill>' +
    '</fills>' +
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="2">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" ' +
    'applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' +
    '</cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    '</styleSheet>';

  /**
   * Construye un Blob .xlsx de una sola hoja.
   * @param {Object} options - { sheetName, headers, rows, widths }
   */
  function buildXlsx(options) {
    var sheetName = escapeXml(options.sheetName || 'Hoja1').slice(0, 31);

    return zip([
      {
        name: '[Content_Types].xml',
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
          '<Default Extension="xml" ContentType="application/xml"/>' +
          '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
          '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
          '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
          '</Types>'
      },
      {
        name: '_rels/.rels',
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
          '</Relationships>'
      },
      {
        name: 'xl/workbook.xml',
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
          'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
          '<sheets><sheet name="' + sheetName + '" sheetId="1" r:id="rId1"/></sheets>' +
          '</workbook>'
      },
      {
        name: 'xl/_rels/workbook.xml.rels',
        content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
          '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
          '</Relationships>'
      },
      { name: 'xl/styles.xml', content: STYLES_XML },
      {
        name: 'xl/worksheets/sheet1.xml',
        content: sheetXml(options.headers || [], options.rows || [], options.widths)
      }
    ]);
  }

  global.buildXlsx = buildXlsx;
})(window);
