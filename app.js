/* Productos OEM — datos y comportamiento de la interfaz */

(function () {
  'use strict';

  var NAVY = 'rgb(0,75,131)';

  var pageButtons = [
    { label: '<', isBox: true, variant: 'light' },
    { label: '1', isBox: true, variant: 'grey' },
    { label: '2', isBox: true, variant: 'navy' },
    { label: '3', isBox: true, variant: 'navy' },
    { label: '4', isBox: true, variant: 'navy' },
    { label: '...', isDots: true },
    { label: '∞', isBox: true, variant: 'navy' },
    { label: '>', isBox: true, variant: 'navy' }
  ];

  var columns = [
    { label: 'Sucursal ID', sortable: true, numeric: true, minChars: 1 },
    { label: 'Nombre sucursal', sortable: true },
    { label: 'Dirección', sortable: false },
    { label: 'Región', sortable: true },
    { label: 'Centro asignado', sortable: false }
  ];

  var searchCells = [
    { hasSearch: true }, { hasSearch: true }, { hasSearch: true }, { hasSearch: true }, { hasSearch: false }
  ];

  var dataRows = [
    ['36', 'Ciudad Juárez La Raza', 'De la Raza 4159, Los Nogales. Juárez', 'Norte', 'CEDIS 1'],
    ['37', 'Tapachula', '17 A.C. OTE 14, Tapachula (Tapachula), Tapachula', 'Centro', 'CEDIS 1'],
    ['38', 'Tultitlan', 'Via José López Portillo 403 C, Los Reyes, Tultitlán', 'Sur', 'CEDIS 2'],
    ['39', 'Coatzazoalcos', 'Carretera Costera del Golfo 130, Las Américas, Coatzacoalcos', 'Centro', 'CEDIS 1'],
    ['40', 'Guadalupe', 'Av. Benito Juárez 100, Nuevo San Sebastián, Guadalupe', 'Jalisco', 'CEDIS 2'],
    ['42', 'Tijuana Centro', 'Agua Caliente 9944, Revolución, Tijuana', 'México', 'CEDIS 2']
  ];

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

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    return node;
  }

  /* ---------- Paginación ---------- */

  function renderPagination() {
    var host = document.getElementById('pagination');
    pageButtons.forEach(function (pg) {
      if (pg.isDots) {
        var dots = el('span', 'page-dots');
        dots.textContent = pg.label;
        host.appendChild(dots);
        return;
      }
      var btn = el('button', 'page-btn page-btn--' + pg.variant);
      btn.type = 'button';
      btn.textContent = pg.label;
      host.appendChild(btn);
    });
  }

  /* ---------- Tabla ---------- */

  var MIN_CHARS = 3;

  /* Columna y sentido del ordenamiento activo */
  var sort = { index: null, dir: 'asc' };

  function minCharsFor(index) {
    return columns[index].minChars || MIN_CHARS;
  }

  /* Filtro activo por índice de columna: { 0: "juarez", 3: "norte" } */
  var filters = {};

  /* Normaliza para comparar sin distinguir mayúsculas ni acentos */
  function normalize(text) {
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function filteredRows() {
    var active = Object.keys(filters);
    var rows = active.length === 0 ? dataRows.slice() : dataRows.filter(function (cells) {
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

  function renderRows() {
    var host = document.getElementById('table');

    Array.prototype.forEach.call(host.querySelectorAll('.td, .td-empty'), function (node) {
      host.removeChild(node);
    });

    var rows = filteredRows();

    if (rows.length === 0) {
      var empty = el('div', 'td-empty');
      var text = el('span');
      text.textContent = 'No se encontraron registros con los filtros aplicados';
      empty.appendChild(text);
      host.appendChild(empty);
      return;
    }

    rows.forEach(function (cells, i) {
      var rowClass = i % 2 === 0 ? 'row--even' : 'row--odd';
      cells.forEach(function (value) {
        var td = el('div', 'td ' + rowClass);
        var span = el('span');
        span.textContent = value;
        td.appendChild(span);
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
      renderRows();
      return;
    }

    if (value.length < minCharsFor(index)) {
      input.classList.add('th-search__input--invalid');
      return;
    }

    input.classList.remove('th-search__input--invalid');
    filters[index] = normalize(value);
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

    searchCells.forEach(function (cell, index) {
      var box = el('div', 'th-search');
      if (cell.hasSearch) {
        var input = el('input');
        input.type = 'text';
        input.placeholder = 'Buscar';
        input.title = 'Escribe al menos ' + MIN_CHARS +
          ' caracteres y pulsa Enter para filtrar por ' + columns[index].label;
        input.setAttribute('aria-label', 'Filtrar por ' + columns[index].label);

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
  var SHEET_WIDTHS = [12, 26, 52, 14, 18];

  function timestamp() {
    var now = new Date();
    function pad(n) { return String(n).padStart(2, '0'); }
    return now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) +
      '-' + pad(now.getHours()) + pad(now.getMinutes());
  }

  /* Dispara la descarga de un Blob con el nombre indicado */
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

  function headerLabels() {
    return columns.map(function (col) { return col.label; });
  }

  /* Exporta lo que se está viendo: filtros y orden aplicados */
  function exportToExcel() {
    var rows = filteredRows();

    if (rows.length === 0) {
      notify('No hay registros que exportar con los filtros aplicados', 'warn');
      return;
    }

    var name = 'Productos-OEM_' + timestamp() + '.xlsx';

    download(buildXlsx({
      sheetName: 'Productos OEM',
      headers: headerLabels(),
      rows: rows,
      widths: SHEET_WIDTHS
    }), name);

    notify('Se descargó ' + name + ' con ' + rows.length +
      (rows.length === 1 ? ' registro' : ' registros'), 'ok');
  }

  /* Plantilla de carga: encabezados y una fila de ejemplo */
  var TEMPLATE_ROW = [
    '99', 'Nombre de la sucursal', 'Calle y número, Colonia, Ciudad', 'Región', 'CEDIS 1'
  ];

  function downloadTemplate() {
    var name = 'Plantilla-Productos-OEM.xlsx';

    download(buildXlsx({
      sheetName: 'Plantilla',
      headers: headerLabels(),
      rows: [TEMPLATE_ROW],
      widths: SHEET_WIDTHS
    }), name);

    notify('Se descargó ' + name + ' con los encabezados y una fila de ejemplo', 'ok');
  }

  /* Aviso temporal en la esquina inferior derecha */
  var noticeTimer = null;

  function notify(message, kind) {
    var notice = document.getElementById('notice');
    if (!notice) {
      notice = el('div', 'notice');
      notice.id = 'notice';
      notice.setAttribute('role', 'status');
      document.body.appendChild(notice);
    }

    notice.textContent = message;
    notice.className = 'notice notice--visible' + (kind ? ' notice--' + kind : '');

    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(function () {
      notice.className = 'notice';
    }, 4000);
  }

  function bindExport() {
    document.getElementById('btnExportar')
      .addEventListener('click', exportToExcel);
    document.getElementById('btnPlantilla')
      .addEventListener('click', downloadTemplate);
  }

  /* ---------- Selects interactivos ---------- */

  function buildSelect(root, caretSvg) {
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
    buildSelect(document.getElementById('selSucursal'), CARET_FILTER_SVG);
    buildSelect(document.getElementById('selRegion'), CARET_FILTER_SVG);
    buildSelect(document.getElementById('selRows'), CARET_ROWS_SVG);

    document.addEventListener('click', closeAll);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { closeAll(); }
    });
  }

  renderPagination();
  bindExport();
  renderTable();
  renderSelects();
})();
