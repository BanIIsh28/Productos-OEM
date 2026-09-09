/* Productos OEM — datos de la vista y comportamiento */

(function () {
  'use strict';

  /* ---------- Definición de columnas ----------

     search   muestra el campo "Buscar" en el encabezado
     minChars caracteres mínimos para que el filtro se ejecute
     numeric  ordena por valor numérico en lugar de alfabético
     control  la celda contiene un control, no texto                   */

  var columns = [
    { label: 'Código', sortable: true, numeric: true, search: true },
    { label: 'Proveedor', sortable: true, search: true },
    { label: 'Tipo' },
    { label: 'Código externo', numeric: true, search: true },
    { label: 'Alcance' },
    { label: 'Empaque' },
    { label: 'Cantidad' },
    { label: 'Estatus', control: 'switch' },
    { label: 'Acciones', control: 'actions' }
  ];

  var COL_SKU = 0;
  var COL_PROVEEDOR = 1;
  var COL_TIPO = 2;
  var COL_ALCANCE = 4;
  var COL_ESTATUS = 7;

  /* ---------- Registros de ejemplo ---------- */

  var PROVEEDORES = [
    'Robert Bosch México', 'Denso Refacciones', 'Delphi Technologies', 'Valeo Service',
    'Gates de México', 'SKF Rodamientos', 'Monroe Amortiguadores', 'Moog Suspensiones',
    'ACDelco Distribuidor', 'Mahle Componentes', 'NGK Bujías', 'TRW Frenos',
    'Sachs Embragues', 'Timken Rodamientos', 'Dana Transmisiones', 'Brembo Frenos',
    'KYB Suspensión', 'Mann-Filter México', 'Hella Iluminación', 'Aisin Autopartes',
    'Autopartes del Norte', 'Refaccionaria Central', 'Grupo Refaccionario Bajío',
    'Partes Diésel Monterrey', 'Distribuidora Sáenz Autopartes', 'Refacciones El Águila',
    'Comercializadora Vega Motors', 'Importaciones Bravo Auto', 'Suministros Automotrices Lerma',
    'Refaccionaria La Curva', 'Autopartes Peninsular', 'Grupo Tecnomotriz',
    'Refacciones Industriales Torreón', 'Distribuidora Motriz del Pacífico',
    'Componentes Vallarta', 'Refaccionaria San Andrés', 'Autopartes Zaragoza',
    'Proveedora Mecánica Altamira', 'Refacciones Querétaro Express', 'Grupo Automotriz Robles'
  ];

  /* Catálogo de productos para la búsqueda por código.
     Los códigos se agrupan en familias de prefijo común, de modo que
     teclear tres dígitos devuelva un conjunto de coincidencias. */
  var FAMILIAS = [
    'Balata delantera cerámica', 'Balata trasera semimetálica', 'Filtro de aceite',
    'Filtro de aire', 'Filtro de cabina', 'Bujía de iridio', 'Amortiguador delantero',
    'Amortiguador trasero', 'Banda de distribución', 'Banda accesorios',
    'Bomba de agua', 'Disco de freno ventilado', 'Tambor de freno', 'Rótula inferior',
    'Terminal de dirección', 'Kit de clutch', 'Radiador de aluminio', 'Alternador',
    'Motor de arranque', 'Sensor de oxígeno', 'Bomba de gasolina', 'Junta de cabeza',
    'Retén de cigüeñal', 'Soporte de motor', 'Horquilla de suspensión',
    'Maza de rueda', 'Cilindro maestro de freno', 'Bobina de encendido',
    'Termostato', 'Válvula PCV'
  ];

  var APLICACIONES = [
    'Nissan Tsuru 1.6', 'Nissan Versa 1.6', 'Nissan March 1.6', 'VW Jetta A4',
    'VW Vento 1.6', 'VW Gol 1.6', 'Chevrolet Aveo 1.6', 'Chevrolet Spark 1.2',
    'Chevrolet Silverado 5.3', 'Ford Ranger 2.5', 'Ford Figo 1.5', 'Ford F-150 5.0',
    'Toyota Corolla 1.8', 'Toyota Hilux 2.7', 'Honda Civic 1.8', 'Honda CR-V 2.4',
    'Mazda 3 2.0', 'Mazda CX-5 2.5', 'Kia Rio 1.6', 'Hyundai Accent 1.6',
    'Renault Logan 1.6', 'Renault Duster 2.0', 'Seat Ibiza 1.6', 'Suzuki Swift 1.4',
    'Dodge Attitude 1.5', 'RAM 700 1.6', 'Jeep Compass 2.4', 'Peugeot 208 1.6',
    'Fiat Uno 1.4', 'Mitsubishi L200 2.4'
  ];

  /* Cada producto es { codigo, nombre }.

     El catálogo es siempre el mismo: los códigos se derivan de la
     posición del producto, no del azar, para que un archivo de carga
     preparado de antemano siga siendo válido en cualquier sesión. */
  var CATALOGO = (function buildCatalog() {
    var productos = [];

    FAMILIAS.forEach(function (familia, f) {
      /* Una familia por prefijo: 100xxxx, 101xxxx, ... */
      var prefijo = String(100 + f);

      APLICACIONES.forEach(function (aplicacion, i) {
        var sufijo = String(1000 + ((i * 293 + f * 37) % 9000));

        productos.push({
          codigo: prefijo + sufijo,
          nombre: familia + ' — ' + aplicacion
        });
      });
    });

    return productos;
  })();

  var TIPOS = ['GS1', 'No GS1'];

  /* ---------- Códigos externos (CF-51779 / ERB-51772) ----------

     El tipo lo afirma quien captura: nunca se deduce del patrón ni de
     la longitud del código. Si alguien declara "GS1" y el código no
     cumple la norma, es un error de captura que hay que reportar, no
     un motivo para reclasificar el registro en silencio como "No GS1".

     El código se maneja siempre como texto. No se convierte a número en
     ningún punto: hacerlo perdería los ceros a la izquierda y, con
     códigos largos, acabaría en notación científica. */

  var LONGITUDES_GTIN = [8, 12, 13, 14];

  /* Dígito verificador GS1: suma ponderada del cuerpo con pesos
     alternos 3 y 1, empezando con 3 en el dígito inmediatamente a la
     izquierda del verificador. No es Luhn, que alterna 2 y 1 y arrastra
     los productos de dos cifras. */
  function digitoVerificadorGs1(cuerpo) {
    var suma = 0;

    for (var i = 0; i < cuerpo.length; i++) {
      var digito = Number(cuerpo.charAt(cuerpo.length - 1 - i));
      suma += digito * (i % 2 === 0 ? 3 : 1);
    }

    return (10 - (suma % 10)) % 10;
  }

  /* Forma canónica de un GTIN: 14 posiciones, rellenando con ceros a la
     izquierda. Solo rellena, nunca recorta: "7501234567893" y
     "07501234567893" son el mismo código, mientras que
     "17501234567890" es otro —su primer dígito es el indicador de
     nivel de empaque—. */
  function normalizarGtin(codigo) {
    var valor = String(codigo === undefined || codigo === null ? '' : codigo).trim();

    while (valor.length < 14) { valor = '0' + valor; }
    return valor;
  }

  function textoCodigo(codigo) {
    return String(codigo === undefined || codigo === null ? '' : codigo).trim();
  }

  function rechazo(motivo, mensaje) {
    return { valido: false, motivo: motivo, mensaje: mensaje };
  }

  var CODIGO_ACEPTADO = { valido: true, motivo: null, mensaje: null };

  /**
   * Única validación del código externo del módulo. La usan el alta
   * manual —openEquivalenceModal— y la carga masiva —revisarFila—, de
   * modo que un código que una rechaza lo rechaza también la otra: el
   * algoritmo del dígito verificador vive solo aquí.
   *
   * @param {string} tipo - tipo declarado: 'GS1' o 'No GS1'
   * @param {string} codigo - lo capturado, siempre como texto
   * @returns {{ valido: boolean, motivo: string, mensaje: string }}
   *   'motivo' es una clave estable ('vacio', 'etiqueta', 'sscc',
   *   'no-digitos', 'longitud', 'verificador') por si algún día hace
   *   falta distinguir el caso sin comparar el mensaje.
   */
  function validarCodigoExterno(tipo, codigo) {
    var valor = textoCodigo(codigo);

    if (valor === '') { return rechazo('vacio', 'El código externo está vacío'); }

    /* Un código propietario no lleva dígito verificador.

       TODO: la normalización exacta de los códigos No GS1 está
       pendiente de confirmar con negocio —queda por revisar el anexo
       "Códigos propietarios (NO_GS1): normalización y casos de
       prueba"—. Hasta entonces solo se exige que no esté vacío: se
       trata como texto y no se valida nada más. */
    if (tipo !== 'GS1') { return CODIGO_ACEPTADO; }

    /* Etiqueta GS1-128 con identificadores de aplicación: "(01)7501..." */
    if (/[()]/.test(valor)) {
      return rechazo('etiqueta',
        'El código parece una etiqueta GS1-128 completa, captura solo el GTIN');
    }

    if (!/^\d+$/.test(valor)) {
      return rechazo('no-digitos', 'El código GS1 debe contener solo dígitos');
    }

    /* SSCC (AI 00): 18 dígitos que identifican una unidad logística,
       no un producto */
    if (valor.length === 18) {
      return rechazo('sscc', 'El código es un SSCC de 18 dígitos, captura solo el GTIN');
    }

    /* La misma cadena de la etiqueta sin paréntesis: el AI 01 seguido
       del GTIN y de más datos */
    if (valor.length > 14 && valor.slice(0, 2) === '01') {
      return rechazo('etiqueta',
        'El código parece una etiqueta GS1-128 completa, captura solo el GTIN');
    }

    if (LONGITUDES_GTIN.indexOf(valor.length) === -1) {
      return rechazo('longitud',
        'El código GS1 tiene una longitud inválida (se esperan 8, 12, 13 o 14 dígitos)');
    }

    if (digitoVerificadorGs1(valor.slice(0, -1)) !== Number(valor.slice(-1))) {
      return rechazo('verificador', 'El código GS1 tiene un dígito verificador inválido');
    }

    return CODIGO_ACEPTADO;
  }

  /* Valor con el que se guarda el código: el GTIN en su forma canónica
     cuando el tipo es GS1, y el texto tal cual cuando es propietario */
  function codigoCanonico(tipo, codigo) {
    var valor = textoCodigo(codigo);
    return tipo === 'GS1' ? normalizarGtin(valor) : valor;
  }

  var ALCANCES = ['Producto', 'Presentación'];

  /* ---------- Destino APYMSA (RD-MOD-01) ----------

     El destino de una equivalencia es código + alcance + nivel de empaque
     + cantidad. Un alcance de "Producto" apunta a la unidad suelta, de
     modo que su nivel y su cantidad son implícitos —Unidad y 1— y no
     los captura nadie; los niveles agrupados solo existen dentro de una
     "Presentación". */

  var NIVEL_UNIDAD = 'Unidad';
  var NIVELES_EMPAQUE = ['Inner', 'Caja máster', 'Pallet'];
  var CANTIDAD_UNIDAD = '1';

  /* El nivel de empaque que corresponde al alcance, cuando es implícito */
  function esAlcanceProducto(alcance) { return alcance === 'Producto'; }

  function nivelValido(nivel) { return NIVELES_EMPAQUE.indexOf(nivel) !== -1; }

  /* Cantidad admisible: entero decimal mayor o igual que 1. Descarta
     vacíos, decimales, negativos, el cero y lo no numérico. */
  function cantidadValida(texto) {
    var valor = String(texto === undefined || texto === null ? '' : texto).trim();
    return /^\d+$/.test(valor) && Number(valor) >= 1;
  }

  function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  /* Código de n dígitos, sin ceros a la izquierda */
  function randomCode(digits) {
    var code = String(randomInt(1, 9));
    for (var i = 1; i < digits; i++) { code += String(randomInt(0, 9)); }
    return code;
  }

  /* GTIN-14 con su dígito verificador correcto, en forma canónica. El
     primer dígito es el indicador de nivel de empaque. */
  function randomGtin() {
    var cuerpo = String(randomInt(0, 3));
    for (var i = 1; i < 13; i++) { cuerpo += String(randomInt(0, 9)); }
    return cuerpo + String(digitoVerificadorGs1(cuerpo));
  }

  /* Código propietario: no es un GTIN y no lleva verificador */
  var PREFIJOS_PROPIOS = ['AP', 'RF', 'MX', 'TC', 'NGK', 'DEN'];

  function randomCodigoPropio() {
    return pick(PREFIJOS_PROPIOS) + '-' + randomCode(6);
  }

  /* El código que corresponde a un tipo declarado */
  function randomCodigoDe(tipo) {
    return tipo === 'GS1' ? randomGtin() : randomCodigoPropio();
  }

  /* Cada fila es [código, proveedor, tipo, código externo, alcance, empaque,
     cantidad, activo]. El código corresponde a un producto del catálogo,
     de modo que al editar
     un registro se pueda resolver el nombre del producto. */
  var dataRows = (function buildRows() {
    var rows = [];
    var usados = {};

    while (rows.length < 182) {
      var producto = pick(CATALOGO);
      var sku = producto.codigo;
      if (usados[sku]) { continue; }
      usados[sku] = true;

      /* El destino se genera según la regla: la unidad suelta lleva
         Unidad y 1; una presentación, un nivel agrupado y su cantidad */
      var alcance = pick(ALCANCES);
      var producto = esAlcanceProducto(alcance);

      /* El código se genera según el tipo declarado: un GTIN válido si
         es GS1, un código propietario si no */
      var tipo = pick(TIPOS);

      rows.push([
        sku,
        pick(PROVEEDORES),
        tipo,
        randomCodigoDe(tipo),
        alcance,
        producto ? NIVEL_UNIDAD : pick(NIVELES_EMPAQUE),
        producto ? CANTIDAD_UNIDAD : String(randomInt(2, 20)),
        Math.random() < 0.7          /* la mayoría activos */
      ]);
    }
    return rows;
  })();

  /* ---------- Iconos ---------- */

  var SORT_SVG =
    '<svg width="7" height="11" viewBox="0 0 7 11" fill="rgb(255,255,255)">' +
    '<path class="sort-asc" d="M 3.5 0 L 6.531 4.5 L 0.469 4.5 L 3.5 0 Z" fill-rule="nonzero"></path>' +
    '<path class="sort-desc" d="M 3.5 11 L 6.531 6.5 L 0.469 6.5 L 3.5 11 Z" fill-rule="nonzero"></path></svg>';

  var CARET_FILTER_SVG =
    '<svg width="13" height="8" viewBox="0 0 13.301 7.657">' +
    '<path d="M0.4 7.6 L6.65 0.4 L12.9 7.6 Z" fill="rgb(0,0,0)"></path></svg>';

  var CARET_ROWS_SVG =
    '<svg width="8" height="5" viewBox="0 0 8.044 4.626" fill="rgb(0,0,0)">' +
    '<path d="M 0.177 0.177 C 0.413 -0.059 0.795 -0.059 1.031 0.177 L 4.022 3.168 L 7.013 0.177 ' +
    'C 7.249 -0.059 7.632 -0.059 7.867 0.177 C 8.103 0.413 8.103 0.795 7.867 1.031 L 4.449 4.449 ' +
    'C 4.213 4.685 3.831 4.685 3.595 4.449 L 0.177 1.031 C -0.059 0.795 -0.059 0.413 0.177 0.177 Z" ' +
    'fill-rule="nonzero"></path></svg>';

  var PENCIL_SVG =
    '<svg width="14" height="14" viewBox="0 0 16 16" fill="rgb(255,255,255)" aria-hidden="true">' +
    '<path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708z ' +
    'm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5 ' +
    'a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5 ' +
    'a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178 ' +
    'a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"></path></svg>';

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    return node;
  }

  /* ---------- Bitácora de cambios ----------

     Toda alta, edición, baja o reactivación de una equivalencia pasa
     por commitAlta, commitEdicion o commitEstatus. Son las únicas
     funciones del módulo que modifican los registros, así que ninguna
     de esas acciones puede ocurrir sin dejar su entrada en el
     historial: el rastro no depende de que quien llame se acuerde de
     anotarlo. */

  var CAMPOS = ['Código', 'Proveedor', 'Tipo', 'Código externo', 'Alcance',
                'Empaque', 'Cantidad', 'Estatus'];

  /* Identificadores del personal de operaciones: cinco dígitos como máximo */
  var USUARIOS = ['10345', '10412', '20877', '31056', '40923', '7218'];
  var USUARIO_SESION = USUARIOS[0];

  /* Entradas en orden cronológico; la vista las presenta al revés */
  var historial = [];

  function textoEstatus(activo) { return activo ? 'Activo' : 'Inactivo'; }

  /* Los ocho datos del registro en una línea, para el alta */
  function resumenRegistro(row) {
    return CAMPOS.map(function (campo, i) {
      return i === COL_ESTATUS ? textoEstatus(row[i]) : row[i];
    }).join(' · ');
  }

  function anotar(row, accion, campo, anterior, nuevo, cuando, usuario) {
    historial.push({
      fecha: cuando || new Date(),
      usuario: usuario || USUARIO_SESION,
      sku: row[COL_SKU],
      proveedor: row[COL_PROVEEDOR],
      accion: accion,
      campo: campo,
      anterior: anterior,
      nuevo: nuevo
    });
  }

  /* Alta: el registro entra al catálogo y queda anotado */
  function commitAlta(row, cuando, usuario) {
    dataRows.unshift(row);
    anotar(row, 'Alta', 'Registro completo', '', resumenRegistro(row), cuando, usuario);
  }

  /* Edición: una entrada por cada campo cuyo valor cambia.
     Devuelve cuántos cambiaron. */
  function commitEdicion(row, valores) {
    var cambios = 0;

    valores.forEach(function (nuevo, i) {
      var anterior = row[i];
      if (String(anterior) === String(nuevo)) { return; }

      row[i] = nuevo;
      anotar(row, 'Edición', CAMPOS[i], String(anterior), String(nuevo));
      cambios++;
    });

    return cambios;
  }

  /* Baja o reactivación, según el estatus al que pasa el registro */
  function commitEstatus(row, activo) {
    var anterior = row[COL_ESTATUS];
    row[COL_ESTATUS] = activo;
    anotar(row, activo ? 'Reactivación' : 'Baja', 'Estatus',
      textoEstatus(anterior), textoEstatus(activo));
  }

  /* Historial previo del catálogo: el alta de cada registro y algunos
     cambios posteriores, repartidos en los últimos meses. El valor
     nuevo de la última entrada de cada campo coincide con lo que la
     tabla muestra hoy. */
  (function seedHistorial() {
    var DIA = 86400000;
    var ahora = Date.now();

    dataRows.forEach(function (row) {
      var alta = ahora - randomInt(30, 150) * DIA - randomInt(0, DIA - 1);

      anotar(row, 'Alta', 'Registro completo', '', resumenRegistro(row),
        new Date(alta), pick(USUARIOS));

      /* Uno de cada cuatro registros recibió después un ajuste de datos */
      if (Math.random() < 0.25) {
        /* El nivel de empaque y la cantidad de un "Producto" son
           implícitos: nadie los captura, así que nadie los editó */
        var editables = esAlcanceProducto(row[COL_ALCANCE])
          ? [COL_PROVEEDOR, 3]
          : [COL_PROVEEDOR, 3, 5, 6];

        var indice = pick(editables);
        var previo = indice === COL_PROVEEDOR ? pick(PROVEEDORES)
          : indice === 3 ? randomCodigoDe(row[COL_TIPO])
          : indice === 5 ? pick(NIVELES_EMPAQUE)
          : String(randomInt(2, 20));

        if (String(previo) !== String(row[indice])) {
          anotar(row, 'Edición', CAMPOS[indice], previo, String(row[indice]),
            new Date(alta + randomInt(1, 20) * DIA), pick(USUARIOS));
        }
      }

      /* Y uno de cada seis, un cambio de estatus que dejó el actual */
      if (Math.random() < 0.17) {
        anotar(row, row[COL_ESTATUS] ? 'Reactivación' : 'Baja', 'Estatus',
          textoEstatus(!row[COL_ESTATUS]), textoEstatus(row[COL_ESTATUS]),
          new Date(alta + randomInt(21, 28) * DIA), pick(USUARIOS));
      }
    });

    historial.sort(function (a, b) { return a.fecha - b.fecha; });
  })();

  /* ---------- Filtros y orden ---------- */

  var MIN_CHARS = 3;

  var filters = {};
  var sort = { index: null, dir: 'asc' };

  /* Filtros superiores: 'applied' es lo que la tabla está mostrando y
     'pending' lo que el usuario ha elegido pero aún no ha aplicado. */
  var TODOS = 'Todos';
  var applied = { tipo: TODOS, alcance: TODOS, estatus: TODOS };
  var pending = { tipo: TODOS, alcance: TODOS, estatus: TODOS };

  function hasPendingChanges() {
    return pending.tipo !== applied.tipo ||
      pending.alcance !== applied.alcance ||
      pending.estatus !== applied.estatus;
  }

  /* El registro cumple los filtros superiores aplicados */
  function matchesApplied(cells) {
    if (applied.tipo !== TODOS && cells[COL_TIPO] !== applied.tipo) { return false; }
    if (applied.alcance !== TODOS && cells[COL_ALCANCE] !== applied.alcance) { return false; }
    if (applied.estatus !== TODOS) {
      var activo = applied.estatus === 'Activo';
      if (cells[COL_ESTATUS] !== activo) { return false; }
    }
    return true;
  }

  function minCharsFor(index) {
    return columns[index].minChars || MIN_CHARS;
  }

  /* Normaliza para comparar sin distinguir mayúsculas ni acentos */
  function normalize(text) {
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function filteredRows() {
    var active = Object.keys(filters);

    var rows = dataRows.filter(function (cells) {
      if (!matchesApplied(cells)) { return false; }
      return active.every(function (index) {
        return normalize(cells[index]).indexOf(filters[index]) !== -1;
      });
    });

    if (sort.index === null) { return rows; }

    var index = sort.index;
    var factor = sort.dir === 'asc' ? 1 : -1;

    return rows.sort(function (a, b) {
      if (columns[index].numeric) {
        return (Number(a[index]) - Number(b[index])) * factor;
      }
      return a[index].localeCompare(b[index], 'es', { sensitivity: 'base' }) * factor;
    });
  }

  /* ---------- Paginación ---------- */

  /* Números de página visibles a la vez, como en el diseño original */
  var PAGE_WINDOW = 4;

  var page = 1;
  var pageSize = 25;

  /* Registro recién agregado o editado, resaltado unos segundos */
  var resaltado = null;
  var resaltadoTimer = null;

  function totalPages() {
    return Math.max(1, Math.ceil(filteredRows().length / pageSize));
  }

  function pageRows() {
    var rows = filteredRows();
    var start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }

  function goToPage(target) {
    var last = totalPages();
    var next = Math.min(Math.max(target, 1), last);
    if (next === page) { return; }
    page = next;
    renderPagination();
    renderRows();
  }

  function pageButton(label, variant, title, onClick, disabled) {
    var btn = el('button', 'page-btn page-btn--' + variant);
    btn.type = 'button';
    btn.textContent = label;
    if (title) { btn.title = title; }

    if (disabled) {
      btn.disabled = true;
      /* La página actual conserva su gris; los extremos usan el de deshabilitado */
      if (variant !== 'grey') { btn.classList.add('page-btn--off'); }
    } else {
      btn.addEventListener('click', onClick);
    }
    return btn;
  }

  /* Dibuja la paginación en 'host': ventana de números que contiene la
     página en curso, puntos y salto a la última cuando quedan más,
     extremos deshabilitados y la página actual sin acción. La usan
     tanto la tabla del catálogo como la de la bitácora. */
  function paintPagination(host, actual, last, ir) {
    host.innerHTML = '';

    host.appendChild(pageButton('<', actual === 1 ? 'light' : 'navy', 'Página anterior',
      function () { ir(actual - 1); }, actual === 1));

    /* Ventana de números que siempre contiene la página actual */
    var start = Math.min(Math.max(actual - 1, 1), Math.max(last - PAGE_WINDOW + 1, 1));
    var end = Math.min(start + PAGE_WINDOW - 1, last);

    for (var n = start; n <= end; n++) {
      (function (number) {
        var active = number === actual;
        host.appendChild(pageButton(String(number), active ? 'grey' : 'navy',
          active ? 'Página actual' : 'Página ' + number,
          function () { ir(number); }, active));
      })(n);
    }

    /* Quedan páginas después de la ventana: puntos y salto a la última */
    if (end < last) {
      var dots = el('span', 'page-dots');
      dots.textContent = '...';
      host.appendChild(dots);

      host.appendChild(pageButton(String(last), 'navy', 'Ir a la última página',
        function () { ir(last); }, false));
    }

    host.appendChild(pageButton('>', 'navy', 'Página siguiente',
      function () { ir(actual + 1); }, actual === last));
  }

  function renderPagination() {
    var last = totalPages();

    /* La página actual puede quedar fuera de rango al filtrar */
    if (page > last) { page = last; }

    paintPagination(document.getElementById('pagination'), page, last, goToPage);
  }

  /* ---------- Celdas con control ---------- */

  /* Interruptor circular de Estatus, ligado al registro */
  function statusSwitch(row) {
    var btn = el('button', 'switch');
    btn.type = 'button';
    btn.setAttribute('role', 'switch');

    var knob = el('span', 'switch__knob');
    btn.appendChild(knob);

    function paint() {
      var activo = row[COL_ESTATUS];
      btn.classList.toggle('switch--on', activo);
      btn.setAttribute('aria-checked', String(activo));
      btn.title = activo ? 'Activo' : 'Inactivo';
      btn.setAttribute('aria-label', 'Estatus del código ' + row[COL_SKU] +
        ': ' + (activo ? 'activo' : 'inactivo'));
    }

    btn.addEventListener('click', function () {
      var activar = !row[COL_ESTATUS];

      confirmModal({
        title: activar ? 'Activar estatus' : 'Desactivar estatus',
        message: '¿Deseas ' + (activar ? 'activar' : 'desactivar') +
          ' el estatus de la equivalencia del código ' + row[COL_SKU] + '?',
        onAccept: function () {
          commitEstatus(row, activar);
          paint();
        }
      });
    });

    paint();
    return btn;
  }

  /* Botón de edición de la columna Acciones */
  function editButton(row) {
    var btn = el('button', 'icon-btn icon-btn--amber');
    btn.type = 'button';
    btn.title = 'Editar';
    btn.setAttribute('aria-label', 'Editar el código ' + row[COL_SKU]);
    btn.insertAdjacentHTML('beforeend', PENCIL_SVG);
    btn.addEventListener('click', function () { openEquivalenceModal(row); });
    return btn;
  }

  /* ---------- Tabla ---------- */

  function renderRows() {
    var host = document.getElementById('table');

    Array.prototype.forEach.call(host.querySelectorAll('.td, .td-empty'), function (node) {
      host.removeChild(node);
    });

    var rows = pageRows();

    if (rows.length === 0) {
      var empty = el('div', 'td-empty');
      var text = el('span');
      text.textContent = 'No se encontraron registros con los filtros aplicados';
      empty.appendChild(text);
      host.appendChild(empty);
      return;
    }

    rows.forEach(function (row, i) {
      var rowClass = i % 2 === 0 ? 'row--even' : 'row--odd';
      if (row === resaltado) { rowClass += ' row--new'; }

      columns.forEach(function (col, index) {
        var td = el('div', 'td ' + rowClass);

        if (col.control === 'switch') {
          td.appendChild(statusSwitch(row));
        } else if (col.control === 'actions') {
          td.appendChild(editButton(row));
        } else {
          var span = el('span');
          span.textContent = row[index];
          td.appendChild(span);
        }

        host.appendChild(td);
      });
    });
  }

  /* Aplica el filtro de una columna: se ejecuta con Enter y exige
     un mínimo de caracteres; el campo vacío retira su filtro. */
  function applyFilter(input, index) {
    var value = input.value.trim();

    if (value === '') {
      delete filters[index];
      input.classList.remove('th-search__input--invalid');
      page = 1;
      renderPagination();
      renderRows();
      return;
    }

    if (value.length < minCharsFor(index)) {
      input.classList.add('th-search__input--invalid');
      return;
    }

    input.classList.remove('th-search__input--invalid');
    filters[index] = normalize(value);
    page = 1;
    renderPagination();
    renderRows();
  }

  /* Alterna ascendente/descendente sobre la columna indicada */
  function toggleSort(index) {
    if (sort.index === index) {
      sort.dir = sort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      sort.index = index;
      sort.dir = 'asc';
    }
    updateSortIndicators();
    page = 1;
    renderPagination();
    renderRows();
  }

  function updateSortIndicators() {
    var headers = document.querySelectorAll('#table .th');
    Array.prototype.forEach.call(headers, function (th, index) {
      th.classList.remove('th--asc', 'th--desc');
      if (!th.classList.contains('th--sortable')) { return; }
      if (sort.index === index) {
        th.classList.add(sort.dir === 'asc' ? 'th--asc' : 'th--desc');
        th.setAttribute('aria-sort', sort.dir === 'asc' ? 'ascending' : 'descending');
      } else {
        th.setAttribute('aria-sort', 'none');
      }
    });
  }

  function renderTable() {
    var host = document.getElementById('table');

    columns.forEach(function (col, index) {
      var th = el('div', 'th');
      var inner = el('div', 'th__inner');
      var label = el('span');
      label.textContent = col.label;
      inner.appendChild(label);

      if (col.sortable) {
        inner.insertAdjacentHTML('beforeend', SORT_SVG);
        th.classList.add('th--sortable');
        th.tabIndex = 0;
        th.setAttribute('role', 'button');
        th.setAttribute('aria-sort', 'none');
        th.title = 'Ordenar por ' + col.label +
          (col.numeric ? ' (orden numérico)' : ' (orden alfabético)');

        th.addEventListener('click', function () { toggleSort(index); });
        th.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSort(index);
          }
        });
      }

      th.appendChild(inner);
      host.appendChild(th);
    });

    columns.forEach(function (col, index) {
      var box = el('div', 'th-search');

      if (col.search) {
        var input = el('input');
        input.type = 'text';
        input.placeholder = 'Buscar';
        input.title = 'Escribe al menos ' + minCharsFor(index) +
          (minCharsFor(index) === 1 ? ' carácter' : ' caracteres') +
          ' y pulsa Enter para filtrar por ' + col.label;
        input.setAttribute('aria-label', 'Filtrar por ' + col.label);

        input.addEventListener('keydown', function (event) {
          if (event.key === 'Enter') {
            event.preventDefault();
            applyFilter(input, index);
          }
        });

        /* Al vaciar el campo se retira su filtro sin necesidad de Enter */
        input.addEventListener('input', function () {
          input.classList.remove('th-search__input--invalid');
          if (input.value.trim() === '' && filters[index] !== undefined) {
            delete filters[index];
            page = 1;
            renderPagination();
            renderRows();
          }
        });

        box.appendChild(input);
      }

      host.appendChild(box);
    });

    renderRows();
  }

  /* ---------- Exportar a Excel ---------- */

  /* Ancho aproximado de cada columna en la hoja de cálculo */
  var SHEET_WIDTHS = [12, 32, 10, 20, 16, 14, 11, 11];

  /* El código externo se emite siempre como texto: es un código, no una
     cantidad, y como número perdería sus ceros a la izquierda */
  var SHEET_TEXT_COLUMNS = [3];

  function timestamp() {
    var now = new Date();
    function pad(n) { return String(n).padStart(2, '0'); }
    return now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) +
      '-' + pad(now.getHours()) + pad(now.getMinutes());
  }

  function download(blob, name) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* La hoja lleva las columnas de datos y el estatus como texto;
     "Acciones" no se exporta porque solo contiene un botón. */
  function sheetColumns() {
    return columns.filter(function (col) { return col.control !== 'actions'; });
  }

  function headerLabels() {
    return sheetColumns().map(function (col) { return col.label; });
  }

  function sheetRow(row) {
    return sheetColumns().map(function (col, index) {
      if (col.control === 'switch') { return row[index] ? 'Activo' : 'Inactivo'; }
      return row[index];
    });
  }

  /* Exporta lo que se está viendo: filtros y orden aplicados */
  function exportToExcel() {
    var rows = filteredRows();

    if (rows.length === 0) {
      showToast('No hay registros que exportar con los filtros aplicados', 'warning');
      return;
    }

    var name = 'Productos-OEM_' + timestamp() + '.xlsx';

    download(buildXlsx({
      sheetName: 'Productos OEM',
      headers: headerLabels(),
      rows: rows.map(sheetRow),
      widths: SHEET_WIDTHS,
      textColumns: SHEET_TEXT_COLUMNS
    }), name);

    showToast('Se descargó ' + name + ' con ' + rows.length +
      (rows.length === 1 ? ' registro' : ' registros'), 'success');
  }

  /* Plantilla de carga: encabezados y una fila de ejemplo */
  /* Plantilla: la fila de ejemplo pasa la propia verificación del
     módulo —código del catálogo, proveedor registrado, GTIN con dígito
     verificador correcto y destino conforme—, de modo que descargarla e
     importarla tal cual funcione sin retocar nada. */
  var TEMPLATE_ROW = [
    '1001000', 'Robert Bosch México', 'GS1', '07501234567893',
    'Presentación', 'Caja máster', '12', 'Activo'
  ];

  function downloadTemplate() {
    var name = 'Plantilla-Productos-OEM.xlsx';

    download(buildXlsx({
      sheetName: 'Plantilla',
      headers: headerLabels(),
      rows: [TEMPLATE_ROW],
      widths: SHEET_WIDTHS,
      textColumns: SHEET_TEXT_COLUMNS
    }), name);

    showToast('Se descargó ' + name + ' con los encabezados y una fila de ejemplo', 'success');
  }

  function bindExport() {
    document.getElementById('btnExportar')
      .addEventListener('click', exportToExcel);
    document.getElementById('btnPlantilla')
      .addEventListener('click', downloadTemplate);
  }

  /* ---------- Ventana de confirmación ---------- */

  /**
   * Ventana de texto: una pregunta o un aviso, con los mismos
   * márgenes y dimensiones que el formulario.
   * @param {Object} options - { title, message, accept, onAccept }
   */
  function confirmModal(options) {
    var body = el('div', 'modal-message');

    var text = el('p', 'modal-message__text');
    text.textContent = options.message;
    body.appendChild(text);

    openModal({
      title: options.title,
      body: body,
      buttons: [
        { label: 'Cancelar', variant: 'cancel' },
        {
          label: options.accept || 'Aceptar',
          variant: 'save',
          onClick: options.onAccept
        }
      ]
    });
  }

  /* ---------- Verificación del archivo por importar ---------- */

  var COLUMNAS_ARCHIVO = ['Código', 'Proveedor', 'Tipo', 'Código externo',
    'Alcance', 'Empaque', 'Cantidad', 'Estatus'];

  var ESTATUS = ['Activo', 'Inactivo'];

  /* ---------- Catálogo de incidencias (ERB-51775) ----------

     Cada incidencia lleva un código, un alias corto para el desglose y
     una severidad: 'ERROR' bloquea el archivo completo, 'INFORMACION'
     solo informa y deja continuar.

     TODO: el catálogo real de errores —con alias, severidad y
     corrección recomendada— vendrá de una fuente externa. Aquí va en
     línea y con valores razonables. Los códigos VAL-MAE-001/002 y
     VAL-UNI-001/003/004/005 son los de la historia; los de la familia
     VAL-CAM-* son una suposición consistente con el patrón, no una cita
     textual, y habrá que confirmarlos. */

  var INCIDENCIAS = {
    'VAL-MAE-001': {
      alias: 'El código no existe o está inactivo',
      severidad: 'ERROR',
      correccion: 'Verifica el código contra el catálogo de productos.'
    },
    'VAL-MAE-002': {
      alias: 'El proveedor no está registrado',
      severidad: 'ERROR',
      correccion: 'Da de alta al proveedor o corrige su nombre.'
    },
    'VAL-UNI-001': {
      alias: 'Duplicado exacto dentro del archivo',
      severidad: 'ERROR',
      correccion: 'Deja una sola fila con esa combinación y vuelve a cargar el archivo.'
    },
    'VAL-UNI-003': {
      alias: 'GTIN con destino incompatible',
      severidad: 'ERROR',
      correccion: 'Un mismo GTIN no puede apuntar a dos destinos distintos, ' +
        'sea cual sea el proveedor. Unifica el destino.'
    },
    'VAL-UNI-004': {
      alias: 'Código propietario con destino incompatible',
      severidad: 'ERROR',
      correccion: 'Un mismo código propietario del mismo proveedor no puede ' +
        'apuntar a dos destinos distintos. Unifica el destino.'
    },
    'VAL-UNI-005': {
      alias: 'Asociación inactiva en el catálogo',
      severidad: 'INFORMACION',
      correccion: 'La reactivación se hace desde la pantalla de baja y ' +
        'reactivación, no desde la carga masiva.'
    },
    /* TODO: códigos supuestos, pendientes de confirmar con la historia */
    'VAL-CAM-001': {
      alias: 'Campo obligatorio vacío',
      severidad: 'ERROR',
      correccion: 'Captura el dato que falta.'
    },
    'VAL-CAM-002': {
      alias: 'Valor no admitido para el campo',
      severidad: 'ERROR',
      correccion: 'Usa uno de los valores que admite la columna.'
    },
    'VAL-CAM-003': {
      alias: 'Código externo inválido para su tipo',
      severidad: 'ERROR',
      correccion: 'Corrige el código según la norma del tipo declarado.'
    },
    'VAL-CAM-004': {
      alias: 'Destino incompatible con el alcance',
      severidad: 'ERROR',
      correccion: 'Ajusta el nivel de empaque y la cantidad al alcance de la fila.'
    }
  };

  function severidadDe(codigo) {
    return INCIDENCIAS[codigo] ? INCIDENCIAS[codigo].severidad : 'ERROR';
  }

  function aliasDe(codigo, mensaje) {
    return INCIDENCIAS[codigo] ? INCIDENCIAS[codigo].alias : mensaje;
  }

  function correccionDe(codigo) {
    return INCIDENCIAS[codigo] ? INCIDENCIAS[codigo].correccion : '';
  }

  /* Códigos de resultado de fila y de validación del archivo */
  var RES_FIL_SIN_CAMBIO = 'RES-FIL-001';
  var RES_FIL_NUEVA = 'RES-FIL-002';
  var RES_FIL_CON_AVISO = 'RES-FIL-003';
  var RES_VAL_VALIDADA = 'RES-VAL-001';
  var RES_VAL_FALLIDA = 'RES-VAL-002';

  function existeProducto(codigo) {
    return CATALOGO.some(function (p) { return p.codigo === codigo; });
  }

  function existeProveedor(nombre) {
    return PROVEEDORES.some(function (p) { return normalize(p) === normalize(nombre); });
  }

  /* Revisa una fila del archivo por sí sola —formato, catálogos y la
     regla de destino— y devuelve sus incidencias. 'errores' las indexa
     por columna, para poder recuadrar la celda que falla; 'incidencias'
     las lista en orden, que es lo que consumen el desglose por código y
     la tabla de la previsualización. */
  function revisarFila(celdas) {
    var valores = COLUMNAS_ARCHIVO.map(function (_, i) {
      return String(celdas[i] === undefined || celdas[i] === null ? '' : celdas[i]).trim();
    });

    var errores = {};
    var incidencias = [];

    function fallo(indice, codigo, mensaje) {
      /* Una columna muestra el primer fallo que la afecta; la lista de
         incidencias sí recoge todos */
      if (!errores[indice]) { errores[indice] = { codigo: codigo, mensaje: mensaje }; }

      incidencias.push({
        codigo: codigo,
        mensaje: mensaje,
        severidad: severidadDe(codigo),
        columna: indice
      });
    }

    /* Código de producto */
    if (!valores[0]) {
      fallo(0, 'VAL-CAM-001', 'El código está vacío');
    } else if (!/^\d+$/.test(valores[0])) {
      fallo(0, 'VAL-CAM-002', 'El código debe ser numérico');
    } else if (!existeProducto(valores[0])) {
      fallo(0, 'VAL-MAE-001', 'El código no existe o está inactivo en el catálogo');
    }

    /* Proveedor */
    if (!valores[1]) {
      fallo(1, 'VAL-CAM-001', 'El proveedor está vacío');
    } else if (!existeProveedor(valores[1])) {
      fallo(1, 'VAL-MAE-002', 'El proveedor no está registrado');
    }

    /* Tipo */
    if (!valores[2]) {
      fallo(2, 'VAL-CAM-001', 'El tipo está vacío');
    } else if (TIPOS.indexOf(valores[2]) === -1) {
      fallo(2, 'VAL-CAM-002', 'El tipo debe ser GS1 o No GS1');
    }

    /* Código externo: se valida con la norma del tipo declarado en el
       archivo, igual que en el alta manual. Un código GS1 correcto se
       guarda en su forma canónica de 14 posiciones. */
    var revisionCodigo = validarCodigoExterno(valores[2], valores[3]);

    if (!revisionCodigo.valido) {
      fallo(3, 'VAL-CAM-003', revisionCodigo.mensaje);
    } else {
      /* Un GS1 correcto se guarda en su forma canónica; un código
         propietario, tal cual */
      valores[3] = codigoCanonico(valores[2], valores[3]);
    }

    /* Alcance */
    if (!valores[4]) {
      fallo(4, 'VAL-CAM-001', 'El alcance está vacío');
    } else if (ALCANCES.indexOf(valores[4]) === -1) {
      fallo(4, 'VAL-CAM-002', 'El alcance debe ser Producto o Presentación');
    }

    /* Nivel de empaque y cantidad: el destino depende del alcance.
       Con "Producto" ambos son implícitos, así que el archivo puede
       traerlos vacíos y se completan solos; con "Presentación" hay que
       declararlos. Sin un alcance utilizable la regla no se puede
       aplicar, y el error del alcance ya invalida la fila. */
    if (esAlcanceProducto(valores[4])) {
      if (!valores[5]) { valores[5] = NIVEL_UNIDAD; }
      if (!valores[6]) { valores[6] = CANTIDAD_UNIDAD; }

      if (valores[5] !== NIVEL_UNIDAD) {
        fallo(5, 'VAL-CAM-004', 'Con alcance Producto el empaque debe ser ' + NIVEL_UNIDAD);
      }
      if (valores[6] !== CANTIDAD_UNIDAD) {
        fallo(6, 'VAL-CAM-004', 'Con alcance Producto la cantidad debe ser ' + CANTIDAD_UNIDAD);
      }
    } else if (valores[4] === 'Presentación') {
      if (!valores[5]) {
        fallo(5, 'VAL-CAM-001', 'El empaque está vacío');
      } else if (!nivelValido(valores[5])) {
        fallo(5, 'VAL-CAM-004', 'Con alcance Presentación el empaque debe ser ' +
          NIVELES_EMPAQUE.join(', '));
      }

      if (!valores[6]) {
        fallo(6, 'VAL-CAM-001', 'La cantidad está vacía');
      } else if (!cantidadValida(valores[6])) {
        fallo(6, 'VAL-CAM-002', 'La cantidad debe ser un número entero mayor o igual a 1');
      }
    }

    /* Estatus */
    if (!valores[7]) {
      fallo(7, 'VAL-CAM-001', 'El estatus está vacío');
    } else if (ESTATUS.indexOf(valores[7]) === -1) {
      fallo(7, 'VAL-CAM-002', 'El estatus debe ser Activo o Inactivo');
    }

    return { valores: valores, errores: errores, incidencias: incidencias };
  }

  /* ---------- Identidad de una asociación ----------

     La comparación que usan tanto la clasificación de filas como las
     reglas de unicidad: proveedor + tipo + código externo normalizado +
     destino.

     NOTA DE ALCANCE: es la comparación simple. La clave canónica
     distinta por clase de RD-MOD-02, que agrupa varias filas GS1 en una
     sola equivalencia, es una pieza aparte y todavía no está aquí. */

  function destinoDe(alcance, empaque, cantidad) {
    return [alcance, empaque, cantidad].join('|');
  }

  function claveAsociacion(proveedor, tipo, codigoExterno, alcance, empaque, cantidad) {
    return [normalize(proveedor), tipo, codigoCanonico(tipo, codigoExterno),
      destinoDe(alcance, empaque, cantidad)].join('#');
  }

  function claveDeValores(v) {
    return claveAsociacion(v[1], v[2], v[3], v[4], v[5], v[6]);
  }

  function claveDeRegistro(row) {
    return claveAsociacion(row[1], row[COL_TIPO], row[3],
      row[COL_ALCANCE], row[5], row[6]);
  }

  /**
   * Clasifica una fila que ya pasó su revisión individual.
   * @returns {{ clase: string, resultado: string, codigo?: string, mensaje?: string }}
   *   'nueva'      RES-FIL-002: no existe en el catálogo. Sin incidencia.
   *   'sin_cambio' RES-FIL-001: la asociación exacta existe y está activa.
   *                Sin incidencia.
   *   'con_aviso'  RES-FIL-003: existe pero está inactiva. Incidencia
   *                informativa VAL-UNI-005, que no bloquea el archivo.
   */
  function clasificarFila(valores) {
    var clave = claveDeValores(valores);

    var existente = null;

    for (var i = 0; i < dataRows.length; i++) {
      if (claveDeRegistro(dataRows[i]) === clave) { existente = dataRows[i]; break; }
    }

    if (!existente) {
      return { clase: 'nueva', resultado: RES_FIL_NUEVA };
    }

    if (existente[COL_ESTATUS]) {
      return { clase: 'sin_cambio', resultado: RES_FIL_SIN_CAMBIO };
    }

    return {
      clase: 'con_aviso',
      resultado: RES_FIL_CON_AVISO,
      codigo: 'VAL-UNI-005',
      mensaje: 'La asociación ya existe en el catálogo y está inactiva'
    };
  }

  /* ---------- Reglas de unicidad dentro del archivo ----------

     Necesitan ver el archivo completo, no una fila por vez. Solo se
     aplican a las filas que pasaron su revisión individual: una fila con
     el tipo o el destino mal ya está rechazada, y compararla contra las
     demás daría incidencias sin sentido. */

  function agregarIncidencia(revision, codigo, mensaje, columna) {
    revision.incidencias.push({
      codigo: codigo,
      mensaje: mensaje,
      severidad: severidadDe(codigo),
      columna: columna === undefined ? null : columna
    });
  }

  /* Agrupa las revisiones por la clave que devuelve 'clave' y entrega
     los grupos con más de un integrante */
  function gruposRepetidos(revisiones, clave) {
    var grupos = {};

    revisiones.forEach(function (revision) {
      var k = clave(revision);
      if (k === null) { return; }
      if (!grupos[k]) { grupos[k] = []; }
      grupos[k].push(revision);
    });

    return Object.keys(grupos)
      .map(function (k) { return grupos[k]; })
      .filter(function (grupo) { return grupo.length > 1; });
  }

  function revisarUnicidad(revisiones) {
    var limpias = revisiones.filter(function (r) {
      return Object.keys(r.errores).length === 0;
    });

    /* VAL-UNI-001: la misma asociación repetida tal cual en el archivo */
    gruposRepetidos(limpias, function (r) { return claveDeValores(r.valores); })
      .forEach(function (grupo) {
        var lineas = grupo.map(function (r) { return r.linea; });

        grupo.forEach(function (revision) {
          agregarIncidencia(revision, 'VAL-UNI-001',
            'Fila duplicada dentro del archivo: coincide con la fila ' +
            lineas.filter(function (n) { return n !== revision.linea; }).join(', '));
        });
      });

    /* VAL-UNI-003: un mismo GTIN apuntando a destinos distintos. Se
       compara contra todo el archivo, sin importar el proveedor. */
    var gs1 = limpias.filter(function (r) { return r.valores[2] === 'GS1'; });

    gruposRepetidos(gs1, function (r) {
      return codigoCanonico('GS1', r.valores[3]);
    }).forEach(function (grupo) {
      marcarDestinosIncompatibles(grupo, 'VAL-UNI-003',
        'El GTIN aparece en el archivo con destinos distintos');
    });

    /* VAL-UNI-004: un mismo código propietario del mismo proveedor
       apuntando a destinos distintos. Con proveedores distintos no hay
       incidencia de ningún tipo, aunque el texto del código coincida y
       los destinos difieran (CF-51775-29). */
    var propios = limpias.filter(function (r) { return r.valores[2] === 'No GS1'; });

    gruposRepetidos(propios, function (r) {
      return normalize(r.valores[1]) + '#' + r.valores[3];
    }).forEach(function (grupo) {
      marcarDestinosIncompatibles(grupo, 'VAL-UNI-004',
        'El código propietario aparece en el archivo con destinos distintos ' +
        'para el mismo proveedor');
    });
  }

  /* Marca el grupo solo si sus integrantes no comparten el mismo destino */
  function marcarDestinosIncompatibles(grupo, codigo, mensaje) {
    var destinos = {};

    grupo.forEach(function (r) {
      destinos[destinoDe(r.valores[4], r.valores[5], r.valores[6])] = true;
    });

    if (Object.keys(destinos).length < 2) { return; }

    grupo.forEach(function (revision) {
      agregarIncidencia(revision, codigo, mensaje, 3);
    });
  }

  /* Convierte las filas del archivo en registros revisados y
     clasificados. Cada fila útil acaba con exactamente una clase. */
  function revisarArchivo(filas) {
    /* Se descarta la fila de encabezados y las completamente vacías */
    var cuerpo = filas.slice(1).filter(function (celdas) {
      return celdas.some(function (celda) {
        return String(celda === undefined ? '' : celda).trim() !== '';
      });
    });

    var revisiones = cuerpo.map(function (celdas, i) {
      var revision = revisarFila(celdas);
      revision.linea = i + 2;          /* número de fila en el archivo */
      return revision;
    });

    revisarUnicidad(revisiones);

    /* La clase se asigna al final: una fila con cualquier incidencia
       bloqueante es 'con_error'; el resto se compara contra el catálogo */
    revisiones.forEach(function (revision) {
      var bloqueada = revision.incidencias.some(function (inc) {
        return inc.severidad === 'ERROR';
      });

      if (bloqueada) {
        revision.clase = 'con_error';
        return;
      }

      var clasificacion = clasificarFila(revision.valores);

      revision.clase = clasificacion.clase;
      revision.resultado = clasificacion.resultado;

      if (clasificacion.codigo) {
        agregarIncidencia(revision, clasificacion.codigo, clasificacion.mensaje);
      }
    });

    return revisiones;
  }

  /* ---------- Ventana de previsualización ----------

     Solo se listan las filas con incidencia —con aviso o con error—.
     Las que no la tienen —nuevas y sin cambio— únicamente se cuentan en
     el encabezado, para que la tabla no obligue a buscar el problema
     entre cientos de filas correctas. */

  var CLASES_PREVIA = [
    { clase: 'nueva', etiqueta: 'Nuevas' },
    { clase: 'sin_cambio', etiqueta: 'Sin cambio' },
    { clase: 'con_aviso', etiqueta: 'Con aviso' },
    { clase: 'con_error', etiqueta: 'Con error' }
  ];

  /* Un renglón por código distinto, con las filas que afecta.
     Se ordena por número de filas descendente; a igualdad, ERROR antes
     que INFORMACION, y luego por código alfabéticamente. */
  function desglosePorCodigo(revisiones) {
    var porCodigo = {};

    revisiones.forEach(function (revision) {
      var vistos = {};

      revision.incidencias.forEach(function (inc) {
        /* Una fila cuenta una sola vez por código, aunque el mismo
           código la afecte en dos columnas */
        if (vistos[inc.codigo]) { return; }
        vistos[inc.codigo] = true;

        if (!porCodigo[inc.codigo]) {
          porCodigo[inc.codigo] = {
            codigo: inc.codigo,
            alias: aliasDe(inc.codigo, inc.mensaje),
            severidad: inc.severidad,
            filas: 0
          };
        }

        porCodigo[inc.codigo].filas++;
      });
    });

    var lista = Object.keys(porCodigo).map(function (k) { return porCodigo[k]; });

    var total = lista.reduce(function (suma, x) { return suma + x.filas; }, 0);

    lista.forEach(function (x) {
      x.porcentaje = total === 0 ? 0 : Math.round((x.filas / total) * 1000) / 10;
    });

    lista.sort(function (a, b) {
      if (a.filas !== b.filas) { return b.filas - a.filas; }
      if (a.severidad !== b.severidad) { return a.severidad === 'ERROR' ? -1 : 1; }
      return a.codigo.localeCompare(b.codigo);
    });

    return { lista: lista, total: total };
  }

  function openPreviewModal(revisiones, nombreArchivo) {
    function deClase(clase) {
      return revisiones.filter(function (r) { return r.clase === clase; });
    }

    var conError = deClase('con_error');
    var conAviso = deClase('con_aviso');

    /* Solo estas se listan; las demás se cuentan y nada más */
    var conIncidencia = revisiones.filter(function (r) {
      return r.clase === 'con_error' || r.clase === 'con_aviso';
    });

    var desglose = desglosePorCodigo(conIncidencia);

    var fallida = conError.length > 0;
    var estado = fallida ? RES_VAL_FALLIDA : RES_VAL_VALIDADA;

    var body = el('div', 'preview');

    /* ---- Encabezado: archivo, fecha, usuario y los contadores ---- */
    var resumen = el('div', 'preview__summary form-grid');

    var datos = [
      ['Archivo', nombreArchivo, 2],
      ['Fecha', fechaTexto(new Date()), 2],
      ['Usuario', USUARIO_SESION, 2],
      ['Filas útiles', String(revisiones.length), 2]
    ];

    CLASES_PREVIA.forEach(function (c) {
      datos.push([c.etiqueta, String(deClase(c.clase).length), 1]);
    });

    datos.forEach(function (dato) {
      var campo = textField(dato[0], dato[2], { value: dato[1], readOnly: true });
      campo._input.title = dato[1];
      resumen.appendChild(campo);
    });

    body.appendChild(resumen);

    /* ---- Estado de la validación, con su mensaje ---- */
    var aviso = el('p', 'preview__estado preview__estado--' +
      (fallida ? 'fallida' : (conAviso.length ? 'avisos' : 'limpia')));

    aviso.textContent = estado + ' · ' +
      (fallida
        ? 'VALIDACIÓN FALLIDA — ' + conError.length +
          (conError.length === 1 ? ' fila tiene' : ' filas tienen') +
          ' una incidencia bloqueante. Corrige el archivo y vuelve a intentar ' +
          'el proceso: no es posible cargar los registros mientras haya un solo error.'
        : (conAviso.length
            ? 'VALIDADA — Se detectaron ' + conAviso.length +
              (conAviso.length === 1 ? ' incidencia' : ' incidencias') +
              ', ninguna bloqueante. Puedes continuar con la carga.'
            : 'VALIDADA — No se detectaron incidencias en el archivo. ' +
              'Puedes continuar con la carga.'));

    body.appendChild(aviso);

    /* ---- Desglose por código, que filtra la tabla al pulsarlo ---- */
    var filtroCodigo = null;
    var desgloseTabla = null;

    if (desglose.lista.length) {
      desgloseTabla = el('div', 'breakdown');

      ['Código', 'Alias', 'Severidad', 'Filas', '%'].forEach(function (titulo) {
        var th = el('div', 'breakdown__th');
        th.textContent = titulo;
        desgloseTabla.appendChild(th);
      });

      desglose.lista.forEach(function (fila) {
        var celdas = [];

        [fila.codigo, fila.alias, fila.severidad, String(fila.filas),
         fila.porcentaje.toFixed(1) + ' %'
        ].forEach(function (valor, i) {
          var td = el('div', 'breakdown__td breakdown__td--' +
            (fila.severidad === 'ERROR' ? 'error' : 'info') +
            (i === 1 ? ' breakdown__td--alias' : ''));
          td.textContent = valor;
          desgloseTabla.appendChild(td);
          celdas.push(td);
        });

        /* Pulsar el renglón deja en la tabla solo las filas de ese
           código; volver a pulsarlo retira el filtro */
        celdas.forEach(function (td) {
          td.title = 'Mostrar solo las filas de ' + fila.codigo;
          td.addEventListener('click', function () {
            filtroCodigo = filtroCodigo === fila.codigo ? null : fila.codigo;
            pinta();
          });
        });

        fila._celdas = celdas;
      });

      body.appendChild(desgloseTabla);
    }

    /* ---- Tabla de incidencias ---- */
    var tabla = el('div', 'preview-table');

    ['Fila'].concat(COLUMNAS_ARCHIVO, ['Detalle']).forEach(function (titulo) {
      var th = el('div', 'preview-table__th');
      th.textContent = titulo;
      tabla.appendChild(th);
    });

    body.appendChild(tabla);

    function pinta() {
      Array.prototype.forEach.call(
        tabla.querySelectorAll('.preview-table__td, .preview-table__empty'),
        function (node) { tabla.removeChild(node); }
      );

      /* El renglón del desglose activo queda resaltado */
      desglose.lista.forEach(function (fila) {
        (fila._celdas || []).forEach(function (td) {
          td.classList.toggle('breakdown__td--activo', filtroCodigo === fila.codigo);
        });
      });

      var listadas = conIncidencia.filter(function (revision) {
        return !filtroCodigo || revision.incidencias.some(function (inc) {
          return inc.codigo === filtroCodigo;
        });
      });

      if (!listadas.length) {
        var vacio = el('div', 'preview-table__empty');
        vacio.textContent = filtroCodigo
          ? 'Ninguna fila con ese código'
          : 'Ninguna fila con incidencia: las ' + revisiones.length +
            ' filas útiles del archivo están correctas';
        tabla.appendChild(vacio);
        return;
      }

      listadas.forEach(function (revision, i) {
        var esError = revision.clase === 'con_error';

        var base = 'preview-table__td ' + (i % 2 === 0 ? 'row--even' : 'row--odd') +
          (esError ? ' preview-table__td--bad' : ' preview-table__td--warn');

        var linea = el('div', base);
        linea.textContent = revision.linea;
        tabla.appendChild(linea);

        revision.valores.forEach(function (valor, indice) {
          var falla = revision.errores[indice];

          var td = el('div', base + (falla ? ' preview-table__td--cell' : ''));
          td.textContent = valor === '' ? '—' : valor;
          if (falla) { td.title = falla.codigo + ' · ' + falla.mensaje; }
          tabla.appendChild(td);
        });

        /* El detalle nombra el código de cada incidencia y, en la
           ayuda, su corrección recomendada */
        var detalle = el('div', base + ' preview-table__td--detail' +
          (esError ? '' : ' preview-table__td--detail-warn'));

        var mostradas = revision.incidencias.filter(function (inc) {
          return !filtroCodigo || inc.codigo === filtroCodigo;
        });

        detalle.textContent = mostradas.map(function (inc) {
          return inc.codigo + ' · ' + inc.mensaje;
        }).join('. ');

        detalle.title = mostradas.map(function (inc) {
          return correccionDe(inc.codigo);
        }).filter(Boolean).join(' ');

        tabla.appendChild(detalle);
      });
    }

    pinta();

    /* ---- Pie ---- */
    var buttons = [{ label: fallida ? 'Cerrar' : 'Cancelar', variant: 'cancel' }];

    /* Un archivo con avisos sigue siendo válido: lo que bloquea es el
       error, no la incidencia */
    if (!fallida) {
      buttons.push({
        label: 'Continuar',
        variant: 'save',
        onClick: function () { importRows(revisiones); }
      });
    }

    openModal({
      title: 'Previsualización del archivo',
      body: body,
      wide: true,
      xwide: true,
      buttons: buttons
    });
  }

  /* Alta de los registros del archivo: solo entran las filas nuevas.
     Las que no cambian nada y las que traen aviso no tocan el catálogo
     ni dejan entrada en la bitácora. */
  function importRows(revisiones) {
    var nuevas = revisiones.filter(function (r) { return r.clase === 'nueva'; });
    var sinCambio = revisiones.filter(function (r) { return r.clase === 'sin_cambio'; });
    var conAviso = revisiones.filter(function (r) { return r.clase === 'con_aviso'; });

    /* Se insertan al principio, en el orden del archivo; cada una deja
       su entrada en la bitácora */
    nuevas.slice().reverse().forEach(function (revision) {
      var v = revision.valores;
      commitAlta([v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7] === 'Activo']);
    });

    sort.index = null;
    updateSortIndicators();
    page = 1;
    renderPagination();
    renderRows();

    var omitidas = [];
    if (sinCambio.length) { omitidas.push(sinCambio.length + ' sin cambio'); }
    if (conAviso.length) { omitidas.push(conAviso.length + ' con aviso'); }

    var cola = omitidas.length ? ' (' + omitidas.join(' y ') + ')' : '';

    if (!nuevas.length) {
      showToast('El archivo se aplicó sin cambios: ninguna fila era nueva' + cola,
        'warning');
      return;
    }

    showToast('Se aplicó el archivo: ' + nuevas.length +
      (nuevas.length === 1 ? ' equivalencia nueva' : ' equivalencias nuevas') + cola,
      'success');
  }

  /* ---------- Ventana de la bitácora ----------

     Consulta filtrable del historial. Los filtros son los mismos que
     los de la tabla del catálogo —uno por columna, con Enter y un
     mínimo de caracteres— y se combinan entre sí: un código y un usuario
     dejan solo los cambios de ese usuario sobre ese registro. */

  var LOG_COLUMNAS = [
    { label: 'Fecha y hora', key: 'fechaTexto', search: true, hint: 'dd/mm/aaaa hh:mm' },
    { label: 'Usuario', key: 'usuario', search: true },
    { label: 'Código', key: 'sku', search: true },
    { label: 'Proveedor', key: 'proveedor', search: true, text: true },
    { label: 'Acción', key: 'accion' },
    { label: 'Campo', key: 'campo' },
    { label: 'Valor anterior', key: 'anterior', text: true },
    { label: 'Valor nuevo', key: 'nuevo', text: true }
  ];

  /* Sobreviven al cierre de la ventana, para retomar la consulta */
  var logFilters = {};
  var logPage = 1;
  var logPageSize = 25;

  function dosDigitos(numero) { return (numero < 10 ? '0' : '') + numero; }

  function fechaTexto(fecha) {
    return dosDigitos(fecha.getDate()) + '/' + dosDigitos(fecha.getMonth() + 1) + '/' +
      fecha.getFullYear() + ' ' + dosDigitos(fecha.getHours()) + ':' +
      dosDigitos(fecha.getMinutes());
  }

  function valorLog(entrada, key) {
    return key === 'fechaTexto' ? fechaTexto(entrada.fecha) : String(entrada[key]);
  }

  /* Entradas que cumplen todos los filtros, de la más reciente a la más antigua */
  function logRows() {
    var activos = Object.keys(logFilters);

    return historial.filter(function (entrada) {
      return activos.every(function (indice) {
        return normalize(valorLog(entrada, LOG_COLUMNAS[indice].key))
          .indexOf(logFilters[indice]) !== -1;
      });
    }).reverse();
  }

  function openLogModal() {
    var body = el('div', 'preview');

    /* Fila superior: los datos del historial a la izquierda, con los
       mismos campos de solo lectura del resto de las ventanas, y la
       paginación al extremo opuesto */
    var cabecera = el('div', 'log-head');

    var campoTotal = textField('Entradas', 1,
      { value: String(historial.length), readOnly: true });
    var campoMostradas = textField('Mostradas', 1, { value: '0', readOnly: true });

    cabecera.appendChild(campoTotal);
    cabecera.appendChild(campoMostradas);

    var paginacion = el('div', 'pagination');
    cabecera.appendChild(paginacion);

    body.appendChild(cabecera);

    var tabla = el('div', 'preview-table log-table');

    LOG_COLUMNAS.forEach(function (col) {
      var th = el('div', 'preview-table__th');
      th.textContent = col.label;
      tabla.appendChild(th);
    });

    /* Fila de búsqueda por columna */
    LOG_COLUMNAS.forEach(function (col, indice) {
      var box = el('div', 'log-search');

      if (col.search) {
        var input = el('input');
        input.type = 'text';
        input.placeholder = 'Buscar';
        input.value = logFilters[indice] || '';
        input.title = 'Escribe al menos ' + MIN_CHARS + ' caracteres y pulsa Enter ' +
          'para filtrar por ' + col.label + (col.hint ? ' (' + col.hint + ')' : '');
        input.setAttribute('aria-label', 'Filtrar la bitácora por ' + col.label);

        input.addEventListener('keydown', function (event) {
          if (event.key !== 'Enter') { return; }
          event.preventDefault();

          var valor = input.value.trim();
          input.classList.remove('th-search__input--invalid');

          if (valor === '') {
            delete logFilters[indice];
            logPage = 1;
            pinta();
            return;
          }

          if (valor.length < MIN_CHARS) {
            input.classList.add('th-search__input--invalid');
            return;
          }

          logFilters[indice] = normalize(valor);
          logPage = 1;
          pinta();
        });

        /* Al vaciar el campo se retira su filtro sin necesidad de Enter */
        input.addEventListener('input', function () {
          input.classList.remove('th-search__input--invalid');
          if (input.value.trim() === '' && logFilters[indice] !== undefined) {
            delete logFilters[indice];
            logPage = 1;
            pinta();
          }
        });

        box.appendChild(input);
      }

      tabla.appendChild(box);
    });

    function pinta() {
      Array.prototype.forEach.call(
        tabla.querySelectorAll('.preview-table__td, .log-empty'),
        function (node) { tabla.removeChild(node); }
      );

      var entradas = logRows();
      campoMostradas._input.value = String(entradas.length);

      /* La página en curso puede quedar fuera de rango al filtrar o al
         cambiar el número de registros por página */
      var ultima = Math.max(1, Math.ceil(entradas.length / logPageSize));
      if (logPage > ultima) { logPage = ultima; }

      paintPagination(paginacion, logPage, ultima, function (destino) {
        var siguiente = Math.min(Math.max(destino, 1), ultima);
        if (siguiente === logPage) { return; }
        logPage = siguiente;
        pinta();
        tabla.scrollTop = 0;
      });

      if (!entradas.length) {
        var vacio = el('div', 'log-empty');
        vacio.textContent = 'No se encontraron entradas con los filtros aplicados';
        tabla.appendChild(vacio);
        return;
      }

      var inicio = (logPage - 1) * logPageSize;

      entradas.slice(inicio, inicio + logPageSize).forEach(function (entrada, i) {
        var base = 'preview-table__td ' + (i % 2 === 0 ? 'row--even' : 'row--odd');

        LOG_COLUMNAS.forEach(function (col) {
          var td = el('div', base + (col.text ? ' log-cell--text' : ''));
          var valor = valorLog(entrada, col.key);

          td.textContent = valor === '' ? '—' : valor;

          if (col.key === 'accion') {
            td.classList.add('log-cell--' + normalize(entrada.accion));
          } else if (col.key === 'anterior') {
            td.classList.add('log-cell--old');
          }

          tabla.appendChild(td);
        });
      });
    }

    body.appendChild(tabla);
    pinta();

    /* Registros por página, al lado izquierdo del pie */
    var pie = el('div', 'log-rows');

    var etiqueta = el('label');
    etiqueta.textContent = 'Registros por página:';
    pie.appendChild(etiqueta);

    var selRegistros = el('div', 'select select--rows select--up');
    selRegistros.setAttribute('data-options', '25|50|75|100');
    pie.appendChild(selRegistros);

    openModal({
      title: 'Bitácora de cambios',
      body: body,
      wide: true,
      xwide: true,
      aside: pie,
      buttons: [{ label: 'Cerrar', variant: 'cancel' }]
    });

    /* El desplegable se construye una vez la ventana está en el documento */
    buildSelect(selRegistros, CARET_ROWS_SVG, function (option) {
      logPageSize = Number(option);
      logPage = 1;
      pinta();
      tabla.scrollTop = 0;
    }, String(logPageSize));
  }

  /* ---------- Ventana de importación ---------- */

  function openImportModal() {
    var body = el('div', 'modal-message');

    var text = el('p', 'modal-message__text');
    text.textContent = 'Seleccione el documento que desee cargar.';
    body.appendChild(text);

    var picker = el('div', 'file-field');

    var input = el('input');
    input.type = 'file';
    input.accept = '.xlsx';
    input.setAttribute('aria-label', 'Archivo por cargar');
    picker.appendChild(input);

    body.appendChild(picker);

    var botonGuardar = null;

    input.addEventListener('change', function () {
      if (!botonGuardar) { return; }
      var elegido = input.files && input.files.length > 0;
      botonGuardar.disabled = !elegido;
      botonGuardar.title = elegido
        ? 'Cargar el archivo'
        : 'Elige un archivo para poder cargarlo';
    });

    function revisar() {
      var archivo = input.files && input.files[0];
      if (!archivo) { return false; }

      botonGuardar.disabled = true;
      botonGuardar.textContent = 'Revisando…';

      readXlsx(archivo).then(function (filas) {
        var revisiones = revisarArchivo(filas);

        if (revisiones.length === 0) {
          botonGuardar.disabled = false;
          botonGuardar.textContent = 'Guardar';
          showToast('El archivo no contiene registros', 'warning');
          return;
        }

        openPreviewModal(revisiones, archivo.name);
      }).catch(function (error) {
        botonGuardar.disabled = false;
        botonGuardar.textContent = 'Guardar';
        showToast('No se pudo leer el archivo: ' + error.message, 'error');
      });

      return false;   /* la ventana se sustituye al terminar la revisión */
    }

    var ventana = openModal({
      title: 'Importar archivo',
      body: body,
      buttons: [
        { label: 'Guardar', variant: 'save', onClick: revisar }
      ]
    });

    /* Guardar espera a que haya un archivo elegido */
    botonGuardar = ventana.element.querySelector('.btn--save');
    botonGuardar.disabled = true;
    botonGuardar.title = 'Elige un archivo para poder cargarlo';
  }

  /* ---------- Ventana de equivalencia ---------- */

  /* Caracteres mínimos para que una búsqueda del formulario devuelva
     sugerencias, y número de ellas visibles antes de desplazar */
  var SUGGEST_MIN_CHARS = 3;

  function field(label, span) {
    var wrapper = el('div', 'field' + (span > 1 ? ' field--span' + span : ''));
    var caption = el('label');
    caption.textContent = label;
    wrapper.appendChild(caption);
    return wrapper;
  }

  /* Campo de texto sencillo */
  function textField(label, span, options) {
    var opts = options || {};
    var wrapper = field(label, span);

    var input = el('input');
    input.type = 'text';
    if (opts.value != null) { input.value = opts.value; }
    if (opts.placeholder) { input.placeholder = opts.placeholder; }
    if (opts.readOnly) {
      input.readOnly = true;
      /* Ni se enfoca ni muestra cursor de texto: no da la impresión
         de ser editable */
      input.tabIndex = -1;
      input.addEventListener('mousedown', function (event) { event.preventDefault(); });
    }
    if (opts.digitsOnly) {
      input.inputMode = 'numeric';
      input.addEventListener('input', function () {
        var limpio = input.value.replace(/\D/g, '');
        if (limpio !== input.value) { input.value = limpio; }
      });
    }

    wrapper.appendChild(input);
    wrapper._input = input;
    return wrapper;
  }

  /* Campo de texto con sugerencias, presentadas como las de un select.
     search(texto) devuelve la lista de coincidencias y label(item) el
     texto de cada línea; onSelect recibe el elegido. */
  function suggestField(label, span, config) {
    var wrapper = field(label, span);
    wrapper.classList.add('suggest');

    var input = el('input');
    input.type = 'text';
    input.autocomplete = 'off';
    if (config.value) { input.value = config.value; }
    if (config.placeholder) { input.placeholder = config.placeholder; }
    if (config.digitsOnly) { input.inputMode = 'numeric'; }

    var menu = el('div', 'suggest__menu');
    menu.setAttribute('role', 'listbox');

    function close() {
      wrapper.classList.remove('suggest--open');
      menu.innerHTML = '';
    }

    function open(items) {
      menu.innerHTML = '';

      if (items.length === 0) {
        var vacio = el('div', 'suggest__empty');
        vacio.textContent = 'Sin coincidencias';
        menu.appendChild(vacio);
      } else {
        items.forEach(function (item) {
          var option = el('button', 'suggest__option');
          option.type = 'button';
          option.setAttribute('role', 'option');
          option.textContent = config.label(item);
          option.addEventListener('mousedown', function (event) {
            /* mousedown para que el campo no pierda antes el foco */
            event.preventDefault();
            config.onSelect(item);
            close();
          });
          menu.appendChild(option);
        });
      }

      wrapper.classList.add('suggest--open');
    }

    input.addEventListener('input', function () {
      if (config.digitsOnly) {
        var limpio = input.value.replace(/\D/g, '');
        if (limpio !== input.value) { input.value = limpio; }
      }

      var texto = input.value.trim();
      if (texto.length < SUGGEST_MIN_CHARS) { close(); return; }
      open(config.search(texto));
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && wrapper.classList.contains('suggest--open')) {
        event.stopPropagation();
        close();
      }
    });

    input.addEventListener('blur', close);

    wrapper.appendChild(input);
    wrapper.appendChild(menu);
    wrapper._input = input;
    return wrapper;
  }

  /* Campo con el desplegable propio del módulo */
  function selectField(label, span, options, onChange, selected) {
    var wrapper = field(label, span);

    var select = el('div', 'select');
    select.setAttribute('data-options', options.join('|'));

    wrapper.appendChild(select);

    /* El desplegable se construye una vez insertado en el documento */
    wrapper._initSelect = function () {
      buildSelect(select, CARET_FILTER_SVG, function () {
        if (onChange) { onChange(); }
      }, selected);
    };
    wrapper._value = function () {
      var span = select.querySelector('.select__trigger span');
      return span ? span.textContent : '';
    };

    /* Muestra un valor sin pasar por el desplegable */
    wrapper._display = function (texto) {
      if (select._setSelected) { select._setSelected(texto); }
    };

    /* Campo bloqueado: conserva su sitio y adopta el gris de solo
       lectura, para que se vea que el valor no se captura aquí */
    wrapper._lock = function (bloqueado) {
      var trigger = select.querySelector('.select__trigger');

      if (trigger) { trigger.disabled = !!bloqueado; }
      select.classList.toggle('select--locked', !!bloqueado);
      if (bloqueado && select._closeSelect) { select._closeSelect(); }
    };

    return wrapper;
  }

  /* Nombre del producto correspondiente a un código del catálogo */
  function productoDe(codigo) {
    var encontrado = CATALOGO.filter(function (p) { return p.codigo === codigo; })[0];
    return encontrado ? encontrado.nombre : '';
  }

  /**
   * Abre la ventana de equivalencia.
   * @param {Array} [registro] fila de la tabla a editar; sin ella, se
   *                           captura una equivalencia nueva
   */
  function openEquivalenceModal(registro) {
    var editando = !!registro;
    var body = el('div', 'form-grid');

    /* Fila 1: código de producto y su nombre */
    var nombreProducto = textField('Nombre del producto', 4, { readOnly: true });
    if (editando) { nombreProducto._input.value = productoDe(registro[COL_SKU]); }

    var sku = suggestField('Código', 2, {
      digitsOnly: true,
      placeholder: 'Código de producto',
      search: function (texto) {
        return CATALOGO.filter(function (p) {
          return p.codigo.indexOf(texto) !== -1;
        });
      },
      label: function (p) { return p.codigo + '  ' + p.nombre; },
      value: editando ? registro[COL_SKU] : '',
      onSelect: function (p) {
        sku._input.value = p.codigo;
        nombreProducto._input.value = p.nombre;
        tocados.sku = true;
        revisar();
      }
    });

    /* Fila 2: proveedor */
    var proveedor = suggestField('Proveedor', 6, {
      placeholder: 'Nombre del proveedor',
      search: function (texto) {
        var buscado = normalize(texto);
        return PROVEEDORES.filter(function (nombre) {
          return normalize(nombre).indexOf(buscado) !== -1;
        });
      },
      label: function (nombre) { return nombre; },
      value: editando ? registro[1] : '',
      onSelect: function (nombre) {
        proveedor._input.value = nombre;
        tocados.proveedor = true;
        revisar();
      }
    });

    /* Fila 3: el tipo y el código externo. Van juntos porque el tipo
       declarado decide con qué norma se valida el código. */
    var SIN_TIPO = '- Selecciona un tipo -';

    var tipo = selectField('Tipo', 2, [SIN_TIPO].concat(TIPOS),
      function () {
        tocados.tipo = true;
        tipoDeclarado = true;   /* deja de sugerirse: manda el usuario */
        revisar();
      },
      editando ? registro[COL_TIPO] : null);

    var codigoExterno = textField('Código externo', 4,
      editando ? { value: registro[3] } : null);

    /* Con un registro existente el tipo ya viene afirmado: no se
       sobrescribe con la sugerencia al reeditar el código */
    var tipoDeclarado = editando;

    /* Fila 3: el destino —alcance, nivel de empaque y cantidad— */
    var SIN_ALCANCE = '- Selecciona un alcance -';
    var SIN_EMPAQUE = '- Selecciona un empaque -';

    var alcance = selectField('Alcance', 2, [SIN_ALCANCE].concat(ALCANCES),
      function () {
        tocados.alcance = true;
        aplicarDestino();
        revisar();
      },
      editando ? registro[COL_ALCANCE] : null);

    var empaque = selectField('Empaque', 2, [SIN_EMPAQUE].concat(NIVELES_EMPAQUE),
      function () {
        tocados.empaque = true;
        recordado.empaque = empaque._value();
        revisar();
      });

    var cantidad = textField('Cantidad', 2, { digitsOnly: true });

    /* Lo último que capturó el usuario para el destino agrupado. Se
       conserva aparte porque al pasar a "Producto" los campos quedan
       fijos en Unidad y 1, y al volver a "Presentación" hay que
       devolverles lo que había en lugar de dejarlos en blanco. */
    var deProducto = editando && esAlcanceProducto(registro[COL_ALCANCE]);

    var recordado = {
      empaque: editando && !deProducto ? registro[5] : SIN_EMPAQUE,
      cantidad: editando && !deProducto ? registro[6] : ''
    };

    var campos = [sku, nombreProducto, proveedor, tipo, codigoExterno,
      alcance, empaque, cantidad];
    campos.forEach(function (campo) { body.appendChild(campo); });

    function esProducto() { return esAlcanceProducto(alcance._value()); }

    /* Revisión del código contra el tipo declarado, con la misma
       función que usa la carga masiva */
    function revisarCodigo() {
      return validarCodigoExterno(tipo._value(), codigoExterno._input.value);
    }

    /* Valor con el que se guardaría el código */
    function codigoAGuardar() {
      return codigoCanonico(tipo._value(), codigoExterno._input.value);
    }

    /* Valores con los que se guardaría el destino: implícitos cuando el
       alcance es "Producto", capturados cuando es "Presentación" */
    function destinoEfectivo() {
      return esProducto()
        ? { empaque: NIVEL_UNIDAD, cantidad: CANTIDAD_UNIDAD }
        : { empaque: empaque._value(), cantidad: cantidad._input.value.trim() };
    }

    /* Ajusta los dos campos del destino al alcance elegido. Con
       "Producto" muestran su valor implícito y quedan bloqueados; con
       "Presentación" recuperan lo capturado y vuelven a ser editables. */
    function aplicarDestino() {
      var fijo = esProducto();

      empaque._display(fijo ? NIVEL_UNIDAD : recordado.empaque);
      empaque._lock(fijo);

      cantidad._input.value = fijo ? CANTIDAD_UNIDAD : recordado.cantidad;
      cantidad._input.readOnly = fijo;

      if (fijo) {
        cantidad._input.tabIndex = -1;
      } else {
        cantidad._input.removeAttribute('tabindex');
      }

      /* Un campo bloqueado nunca se muestra en rojo */
      if (fijo) {
        marcar(empaque, false);
        marcar(cantidad, false);
      }
    }

    function marcar(campo, invalido) {
      var control = campo._input || campo.querySelector('.select__trigger');
      /* El segundo argumento ha de ser booleano: con undefined, toggle
         alterna la clase en lugar de fijarla */
      control.classList.toggle('input--invalid', !!invalido);
    }

    /* Validez de cada campo obligatorio */
    function estado() {
      var valorProveedor = proveedor._input.value.trim();

      return {
        sku: CATALOGO.some(function (p) { return p.codigo === sku._input.value.trim(); }),
        proveedor: PROVEEDORES.some(function (nombre) {
          return normalize(nombre) === normalize(valorProveedor);
        }),
        tipo: tipo._value() !== SIN_TIPO,
        /* El código se valida con la norma del tipo declarado */
        codigo: revisarCodigo().valido,
        alcance: alcance._value() !== SIN_ALCANCE,
        /* Con "Producto" el destino es implícito: no se le exige nada
           al usuario. Con "Presentación" hay que declararlo. */
        empaque: esProducto() || nivelValido(empaque._value()),
        cantidad: esProducto() || cantidadValida(cantidad._input.value)
      };
    }

    /* Campos que el usuario ya ha tocado: solo esos se marcan en rojo,
       para no abrir la ventana con todo el formulario resaltado */
    var tocados = {};

    function revisar() {
      var v = estado();

      /* Un campo válido deja de estar marcado; uno tocado e inválido
         se resalta también en reposo */
      marcar(sku, tocados.sku && !v.sku);
      marcar(proveedor, tocados.proveedor && !v.proveedor);
      marcar(tipo, tocados.tipo && !v.tipo);
      marcar(codigoExterno, tocados.codigo && !v.codigo);
      marcar(alcance, tocados.alcance && !v.alcance);
      marcar(empaque, tocados.empaque && !v.empaque);
      marcar(cantidad, tocados.cantidad && !v.cantidad);

      var completo = Object.keys(v).every(function (clave) { return v[clave]; });

      /* Al editar no hay nada que guardar si no se ha cambiado nada. El
         destino se compara por el valor con que se guardaría, no por lo
         que muestran los campos: con "Producto" son Unidad y 1. */
      var destino = destinoEfectivo();

      var conCambios = !editando || [
        sku._input.value.trim() !== registro[COL_SKU],
        normalize(proveedor._input.value.trim()) !== normalize(registro[1]),
        tipo._value() !== registro[COL_TIPO],
        codigoAGuardar() !== registro[3],
        alcance._value() !== registro[COL_ALCANCE],
        destino.empaque !== registro[5],
        destino.cantidad !== registro[6]
      ].some(Boolean);

      if (botonGuardar) {
        botonGuardar.disabled = !completo || !conCambios;
        botonGuardar.title = !completo
          ? 'Captura todos los campos para poder guardar'
          : (conCambios ? 'Guardar los cambios' : 'Modifica algún dato para poder guardar');
      }
    }

    /* Marca el campo como tocado en cuanto se escribe o se abandona */
    function vigilar(campo, clave) {
      var input = campo._input;

      input.addEventListener('input', function () {
        if (input.value.trim() !== '') { tocados[clave] = true; }
        revisar();
      });

      input.addEventListener('blur', function () {
        tocados[clave] = true;
        revisar();
      });
    }

    var botonGuardar = null;

    /* Sugerencia por el aspecto del código, nada más: se usa para
       preseleccionar el tipo mientras nadie lo haya declarado. El valor
       que se guarda es siempre el que quede elegido en el campo. */
    function tipoSugerido(codigo) {
      return /^\d{8}$|^\d{12,14}$/.test(codigo) ? 'GS1' : 'No GS1';
    }

    function guardar() {
      var destino = destinoEfectivo();

      var valores = {
        sku: sku._input.value.trim(),
        producto: nombreProducto._input.value.trim(),
        proveedor: proveedor._input.value.trim(),
        tipo: tipo._value(),
        codigo: codigoAGuardar(),
        alcance: alcance._value(),
        empaque: destino.empaque,
        cantidad: destino.cantidad
      };

      /* El código y el proveedor deben corresponder a un registro existente */
      var producto = CATALOGO.filter(function (p) {
        return p.codigo === valores.sku;
      })[0];

      var proveedorValido = PROVEEDORES.some(function (nombre) {
        return normalize(nombre) === normalize(valores.proveedor);
      });

      /* El destino solo se exige cuando el alcance es "Presentación":
         con "Producto" ya viene resuelto en Unidad y 1 */
      var fijo = esProducto();
      var empaqueValido = fijo || nivelValido(valores.empaque);
      var cantidadOk = fijo || cantidadValida(valores.cantidad);

      /* 'faltantes' son los campos sin capturar; 'problemas', los que
         traen algo que no cumple su regla y merecen un mensaje propio */
      var faltantes = [];
      var problemas = [];

      var revisionCodigo = revisarCodigo();
      var codigoVacio = revisionCodigo.motivo === 'vacio';

      if (!producto) { faltantes.push('Código'); }
      if (!proveedorValido) { faltantes.push('Proveedor'); }
      if (valores.tipo === SIN_TIPO) { faltantes.push('Tipo'); }
      if (valores.alcance === SIN_ALCANCE) { faltantes.push('Alcance'); }
      if (!empaqueValido) { faltantes.push('Nivel de empaque'); }
      if (!cantidadOk && valores.cantidad === '') { faltantes.push('Cantidad'); }

      if (codigoVacio) {
        faltantes.push('Código externo');
      } else if (!revisionCodigo.valido) {
        problemas.push(revisionCodigo.mensaje);
      }

      if (!cantidadOk && valores.cantidad !== '') {
        problemas.push('La cantidad debe ser un número entero mayor o igual a 1');
      }

      marcar(sku, !producto);
      marcar(proveedor, !proveedorValido);
      marcar(tipo, valores.tipo === SIN_TIPO);
      marcar(codigoExterno, !revisionCodigo.valido);
      marcar(alcance, valores.alcance === SIN_ALCANCE);
      marcar(empaque, !empaqueValido);
      marcar(cantidad, !cantidadOk);

      if (faltantes.length || problemas.length) {
        var partes = [];

        if (faltantes.length) {
          partes.push(faltantes.length === 1
            ? 'Falta capturar ' + faltantes[0]
            : 'Faltan datos por capturar: ' + faltantes.join(', '));
        }

        partes = partes.concat(problemas);

        showToast(partes.join('. '), 'error');
        return false;   /* la ventana permanece abierta */
      }

      /* Se guarda el nombre tal como aparece en el catálogo */
      var proveedorCatalogo = PROVEEDORES.filter(function (nombre) {
        return normalize(nombre) === normalize(valores.proveedor);
      })[0];

      if (editando) {
        updateEquivalence(registro, [
          valores.sku,
          proveedorCatalogo,
          valores.tipo,
          valores.codigo,
          valores.alcance,
          valores.empaque,
          valores.cantidad,
          registro[COL_ESTATUS]   /* el estatus se cambia desde la tabla */
        ]);
      } else {
        addEquivalence([
          valores.sku,
          proveedorCatalogo,
          valores.tipo,
          valores.codigo,
          valores.alcance,
          valores.empaque,
          valores.cantidad,
          true            /* los registros nuevos entran activos */
        ]);
      }

      return true;
    }

    var ventana = openModal({
      title: editando ? 'Editar equivalencia' : 'Agregar equivalencia',
      body: body,
      buttons: [
        { label: 'Cancelar', variant: 'cancel' },
        { label: 'Guardar', variant: 'save', onClick: guardar }
      ]
    });

    campos.forEach(function (campo) {
      if (campo._initSelect) { campo._initSelect(); }
    });

    /* Guardar permanece deshabilitado hasta que el formulario esté completo */
    botonGuardar = ventana.element.querySelector('.btn--save');

    vigilar(sku, 'sku');
    vigilar(proveedor, 'proveedor');
    vigilar(codigoExterno, 'codigo');
    vigilar(cantidad, 'cantidad');

    /* Mientras nadie haya declarado el tipo, escribir el código lo
       preselecciona. En cuanto el usuario lo elige a mano deja de
       sugerirse, y en todo caso el valor guardado es el del campo. */
    codigoExterno._input.addEventListener('input', function () {
      if (tipoDeclarado) { return; }

      var capturado = codigoExterno._input.value.trim();
      /* Sin código no hay nada que sugerir: el tipo sigue por declarar */
      var sugerido = capturado === '' ? SIN_TIPO : tipoSugerido(capturado);

      if (tipo._value() !== sugerido) { tipo._display(sugerido); }
      revisar();
    });

    /* Lo capturado en cantidad se recuerda para cuando el alcance
       vuelva a "Presentación" */
    cantidad._input.addEventListener('input', function () {
      if (!cantidad._input.readOnly) { recordado.cantidad = cantidad._input.value; }
    });

    /* El estado del destino se fija ya con los desplegables construidos */
    aplicarDestino();
    revisar();
    sku._input.focus();
  }

  /* Añade la equivalencia a la tabla y la deja a la vista */
  function addEquivalence(row) {
    commitAlta(row);
    resaltado = row;

    /* Se retira el orden para que el registro quede al principio */
    sort.index = null;
    updateSortIndicators();

    page = 1;
    renderPagination();
    renderRows();

    var visible = filteredRows().indexOf(row) !== -1;

    showToast(visible
      ? 'Se agregó la equivalencia del código ' + row[COL_SKU]
      : 'Se agregó la equivalencia del código ' + row[COL_SKU] +
        ', aunque no se muestra con los filtros aplicados', visible ? 'success' : 'warning');

    /* El resaltado dura lo mismo que el aviso */
    clearTimeout(resaltadoTimer);
    resaltadoTimer = setTimeout(function () {
      resaltado = null;
      renderRows();
    }, 4000);
  }

  /* Sustituye los datos del registro y lo deja a la vista */
  function updateEquivalence(registro, valores) {
    commitEdicion(registro, valores);

    resaltado = registro;
    renderPagination();
    renderRows();

    var visible = filteredRows().indexOf(registro) !== -1;

    showToast(visible
      ? 'Se actualizó la equivalencia del código ' + registro[COL_SKU]
      : 'Se actualizó la equivalencia del código ' + registro[COL_SKU] +
        ', aunque ya no se muestra con los filtros aplicados', visible ? 'success' : 'warning');

    clearTimeout(resaltadoTimer);
    resaltadoTimer = setTimeout(function () {
      resaltado = null;
      renderRows();
    }, 4000);
  }

  /* ---------- Filtros superiores ---------- */

  function updateFilterButton() {
    var btn = document.getElementById('btnFiltrar');
    var pendiente = hasPendingChanges();

    btn.disabled = !pendiente;
    btn.title = pendiente
      ? 'Aplicar los filtros seleccionados'
      : 'Cambia algún filtro para poder aplicarlo';
  }

  function applyTopFilters() {
    if (!hasPendingChanges()) { return; }

    applied.tipo = pending.tipo;
    applied.alcance = pending.alcance;
    applied.estatus = pending.estatus;

    page = 1;
    renderPagination();
    renderRows();
    updateFilterButton();
  }

  function bindFilters() {
    document.getElementById('btnFiltrar')
      .addEventListener('click', applyTopFilters);
    /* Se envuelve para que el evento del clic no llegue como registro */
    document.getElementById('btnEquivalencia')
      .addEventListener('click', function () { openEquivalenceModal(); });
    document.getElementById('btnImportar')
      .addEventListener('click', openImportModal);
    document.getElementById('btnBitacora')
      .addEventListener('click', openLogModal);
  }

  /* ---------- Selects interactivos ---------- */

  function buildSelect(root, caretSvg, onSelect, initial) {
    var options = root.getAttribute('data-options').split('|');
    var selected = initial ? Math.max(options.indexOf(initial), 0) : 0;

    var trigger = el('button', 'select__trigger');
    trigger.type = 'button';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    var value = el('span');
    value.textContent = options[selected];
    trigger.appendChild(value);
    trigger.insertAdjacentHTML('beforeend', caretSvg);

    var menu = el('div', 'select__menu');
    menu.setAttribute('role', 'listbox');

    options.forEach(function (option, index) {
      var item = el('button', 'select__option');
      item.type = 'button';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(index === selected));
      item.textContent = option;
      item.addEventListener('click', function () {
        selected = index;
        value.textContent = option;
        Array.prototype.forEach.call(menu.children, function (child, i) {
          child.setAttribute('aria-selected', String(i === selected));
        });
        close();
        if (onSelect) { onSelect(option, index); }
      });
      menu.appendChild(item);
    });

    function open() {
      closeAll();
      root.classList.add('select--open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      root.classList.remove('select--open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', function (event) {
      event.stopPropagation();
      if (root.classList.contains('select--open')) { close(); } else { open(); }
    });

    /* Fija lo mostrado en el disparador. Admite un valor ajeno a la
       lista, para los casos en que el dato viene impuesto y no se elige. */
    root._setSelected = function (option) {
      var index = options.indexOf(option);

      value.textContent = option;
      if (index !== -1) { selected = index; }

      Array.prototype.forEach.call(menu.children, function (child, i) {
        child.setAttribute('aria-selected', String(index !== -1 && i === index));
      });
    };

    root.appendChild(trigger);
    root.appendChild(menu);
    root._closeSelect = close;
  }

  function closeAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.select'), function (node) {
      if (node._closeSelect) { node._closeSelect(); }
    });
  }

  function renderSelects() {
    /* Los filtros superiores solo anotan la elección; se aplica con "Filtrar" */
    buildSelect(document.getElementById('selTipo'), CARET_FILTER_SVG, function (option) {
      pending.tipo = option;
      updateFilterButton();
    });

    buildSelect(document.getElementById('selAlcance'), CARET_FILTER_SVG, function (option) {
      pending.alcance = option;
      updateFilterButton();
    });

    buildSelect(document.getElementById('selEstatus'), CARET_FILTER_SVG, function (option) {
      pending.estatus = option;
      updateFilterButton();
    });
    /* El número de registros por página redefine la paginación */
    buildSelect(document.getElementById('selRows'), CARET_ROWS_SVG, function (option) {
      pageSize = Number(option);
      page = 1;
      renderPagination();
      renderRows();
    });

    document.addEventListener('click', closeAll);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { closeAll(); }
    });
  }

  renderPagination();
  bindExport();
  bindFilters();
  renderTable();
  renderSelects();
})();
