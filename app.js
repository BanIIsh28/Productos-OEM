/* Productos OEM — datos de la vista y comportamiento */

(function () {
  'use strict';

  /* ---------- Definición de columnas ----------

     search   muestra el campo "Buscar" en el encabezado
     minChars caracteres mínimos para que el filtro se ejecute
     numeric  ordena por valor numérico en lugar de alfabético
     control  la celda contiene un control, no texto                   */

  var columns = [
    { label: 'SKU', sortable: true, numeric: true, search: true },
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

  /* Cada producto es { codigo, nombre } */
  var CATALOGO = (function buildCatalog() {
    var productos = [];
    var usados = {};

    FAMILIAS.forEach(function (familia, f) {
      /* Una familia por prefijo: 100xxxx, 101xxxx, ... */
      var prefijo = String(100 + f);

      APLICACIONES.forEach(function (aplicacion) {
        var codigo;
        do {
          codigo = prefijo + randomCode(4);
        } while (usados[codigo]);
        usados[codigo] = true;

        productos.push({ codigo: codigo, nombre: familia + ' — ' + aplicacion });
      });
    });

    return productos;
  })();

  var TIPOS = ['GS1', 'No GS1'];
  var ALCANCES = ['Producto', 'Presentación'];

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

  /* Cada fila es [SKU, proveedor, tipo, código, alcance, empaque, cantidad, activo] */
  var dataRows = (function buildRows() {
    var rows = [];
    var usados = {};

    while (rows.length < 182) {
      var sku = randomCode(7);
      if (usados[sku]) { continue; }
      usados[sku] = true;

      rows.push([
        sku,
        pick(PROVEEDORES),
        pick(TIPOS),
        randomCode(12),
        pick(ALCANCES),
        String(randomInt(1, 20)),
        String(randomInt(1, 20)),
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

  function renderPagination() {
    var host = document.getElementById('pagination');
    var last = totalPages();

    /* La página actual puede quedar fuera de rango al filtrar */
    if (page > last) { page = last; }

    host.innerHTML = '';

    host.appendChild(pageButton('<', page === 1 ? 'light' : 'navy', 'Página anterior', function () {
      goToPage(page - 1);
    }, page === 1));

    /* Ventana de números que siempre contiene la página actual */
    var start = Math.min(Math.max(page - 1, 1), Math.max(last - PAGE_WINDOW + 1, 1));
    var end = Math.min(start + PAGE_WINDOW - 1, last);

    for (var n = start; n <= end; n++) {
      (function (number) {
        var active = number === page;
        host.appendChild(pageButton(String(number), active ? 'grey' : 'navy',
          active ? 'Página actual' : 'Página ' + number,
          function () { goToPage(number); }, active));
      })(n);
    }

    /* Quedan páginas después de la ventana: puntos y salto a la última */
    if (end < last) {
      var dots = el('span', 'page-dots');
      dots.textContent = '...';
      host.appendChild(dots);

      host.appendChild(pageButton(String(last), 'navy', 'Ir a la última página',
        function () { goToPage(last); }, false));
    }

    host.appendChild(pageButton('>', 'navy', 'Página siguiente', function () {
      goToPage(page + 1);
    }, page === last));
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
      btn.setAttribute('aria-label', 'Estatus del SKU ' + row[COL_SKU] +
        ': ' + (activo ? 'activo' : 'inactivo'));
    }

    btn.addEventListener('click', function () {
      row[COL_ESTATUS] = !row[COL_ESTATUS];
      paint();
    });

    paint();
    return btn;
  }

  /* Botón de edición de la columna Acciones */
  function editButton(row) {
    var btn = el('button', 'icon-btn icon-btn--amber');
    btn.type = 'button';
    btn.title = 'Editar';
    btn.setAttribute('aria-label', 'Editar el SKU ' + row[COL_SKU]);
    btn.insertAdjacentHTML('beforeend', PENCIL_SVG);
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
  var SHEET_WIDTHS = [12, 32, 10, 18, 16, 11, 11, 11];

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
      widths: SHEET_WIDTHS
    }), name);

    showToast('Se descargó ' + name + ' con ' + rows.length +
      (rows.length === 1 ? ' registro' : ' registros'), 'success');
  }

  /* Plantilla de carga: encabezados y una fila de ejemplo */
  var TEMPLATE_ROW = [
    '1234567', 'Nombre del proveedor', 'GS1', '123456789012', 'Producto', '5', '10', 'Activo'
  ];

  function downloadTemplate() {
    var name = 'Plantilla-Productos-OEM.xlsx';

    download(buildXlsx({
      sheetName: 'Plantilla',
      headers: headerLabels(),
      rows: [TEMPLATE_ROW],
      widths: SHEET_WIDTHS
    }), name);

    showToast('Se descargó ' + name + ' con los encabezados y una fila de ejemplo', 'success');
  }

  function bindExport() {
    document.getElementById('btnExportar')
      .addEventListener('click', exportToExcel);
    document.getElementById('btnPlantilla')
      .addEventListener('click', downloadTemplate);
  }

  /* ---------- Ventana de equivalencia ---------- */

  /* Caracteres mínimos para que una búsqueda del formulario devuelva
     sugerencias, y número de ellas visibles antes de desplazar */
  var SUGGEST_MIN_CHARS = 3;

  function field(label, span) {
    var wrapper = el('div', 'field' + (span ? ' field--span' + span : ''));
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
    if (opts.placeholder) { input.placeholder = opts.placeholder; }
    if (opts.readOnly) { input.readOnly = true; }
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
  function selectField(label, span, options) {
    var wrapper = field(label, span);

    var select = el('div', 'select');
    select.setAttribute('data-options', options.join('|'));

    wrapper.appendChild(select);

    /* El desplegable se construye una vez insertado en el documento */
    wrapper._initSelect = function () { buildSelect(select, CARET_FILTER_SVG); };
    return wrapper;
  }

  function openEquivalenceModal() {
    var body = el('div', 'form-grid');

    /* Fila 1: código de producto y su nombre */
    var nombreProducto = textField('Nombre del producto', 4, { readOnly: true });

    var sku = suggestField('SKU', 2, {
      digitsOnly: true,
      placeholder: 'Código',
      search: function (texto) {
        return CATALOGO.filter(function (p) {
          return p.codigo.indexOf(texto) !== -1;
        });
      },
      label: function (p) { return p.codigo + '  ' + p.nombre; },
      onSelect: function (p) {
        sku._input.value = p.codigo;
        nombreProducto._input.value = p.nombre;
      }
    });

    /* Fila 2: proveedor y código externo */
    var proveedor = suggestField('Proveedor', 3, {
      placeholder: 'Nombre del proveedor',
      search: function (texto) {
        var buscado = normalize(texto);
        return PROVEEDORES.filter(function (nombre) {
          return normalize(nombre).indexOf(buscado) !== -1;
        });
      },
      label: function (nombre) { return nombre; },
      onSelect: function (nombre) { proveedor._input.value = nombre; }
    });

    var codigoExterno = textField('Código externo', 3);

    /* Fila 3: alcance, empaque y cantidad */
    var alcance = selectField('Alcance', 2, ['- Selecciona un alcance -'].concat(ALCANCES));
    var empaque = textField('Empaque', 2);
    var cantidad = textField('Cantidad', 2);

    var campos = [sku, nombreProducto, proveedor, codigoExterno, alcance, empaque, cantidad];
    campos.forEach(function (campo) { body.appendChild(campo); });

    openModal({
      title: 'Agregar equivalencia',
      body: body,
      buttons: [
        { label: 'Cancelar', variant: 'cancel' },
        { label: 'Guardar', variant: 'save' }
      ]
    });

    campos.forEach(function (campo) {
      if (campo._initSelect) { campo._initSelect(); }
    });

    sku._input.focus();
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
    document.getElementById('btnEquivalencia')
      .addEventListener('click', openEquivalenceModal);
  }

  /* ---------- Selects interactivos ---------- */

  function buildSelect(root, caretSvg, onSelect) {
    var options = root.getAttribute('data-options').split('|');
    var selected = 0;

    var trigger = el('button', 'select__trigger');
    trigger.type = 'button';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    var value = el('span');
    value.textContent = options[0];
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
