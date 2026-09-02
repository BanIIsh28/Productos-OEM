/* Productos OEM — datos y comportamiento de la interfaz */

(function () {
  'use strict';

  var NAVY = 'rgb(0,75,131)';

  var menuItems = [
    { label: 'Parámetros Surtido HH', arrow: true },
    { label: 'Parámetros Almacén W', arrow: false },
    { label: 'Parámetros Solicitudes Traspaso', arrow: false },
    { label: 'Cambio Físico', arrow: true },
    { label: 'Múltiplos de Surtido', arrow: false },
    { label: 'Correos', arrow: false },
    { label: 'Categorías Token', arrow: false },
    { label: 'Solicitudes Token', arrow: false },
    { label: 'Log de Stocks Fijos', arrow: false },
    { label: 'Retail', arrow: false },
    { label: 'Control de Inventarios', arrow: false },
    { label: 'Envíos Paqueterías', arrow: true },
    { label: 'Configurar Productos', arrow: false },
    { label: 'Fecha Caducidad CS', arrow: false }
  ];

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
    { label: 'Sucursal ID', sortable: true },
    { label: 'Nombre sucursal', sortable: true },
    { label: 'Dirección', sortable: true },
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

  var ARROW_SVG =
    '<svg width="11" height="6" viewBox="0 0 11 6" fill="rgb(255,255,255)">' +
    '<path d="M 0.55 6 L 10.451 6 C 10.551 6 10.649 5.98 10.735 5.942 C 10.82 5.904 10.89 5.85 10.937 5.785 ' +
    'C 10.983 5.72 11.005 5.648 10.999 5.575 C 10.993 5.502 10.96 5.431 10.903 5.371 L 5.953 0.162 ' +
    'C 5.748 -0.054 5.254 -0.054 5.048 0.162 L 0.098 5.371 C 0.041 5.431 0.007 5.502 0.001 5.575 ' +
    'C -0.005 5.648 0.016 5.721 0.063 5.785 C 0.109 5.85 0.179 5.905 0.265 5.942 C 0.351 5.98 0.45 6 0.55 6 Z" ' +
    'fill-rule="nonzero"></path></svg>';

  var SORT_SVG =
    '<svg width="7" height="11" viewBox="0 0 7 11" fill="rgb(255,255,255)">' +
    '<path d="M 3.5 0 L 6.531 4.5 L 0.469 4.5 L 3.5 0 Z" fill-rule="nonzero"></path>' +
    '<path d="M 3.5 11 L 6.531 6.5 L 0.469 6.5 L 3.5 11 Z" fill-rule="nonzero"></path></svg>';

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

  /* ---------- Menú lateral ---------- */

  function renderMenu() {
    var host = document.getElementById('menuItems');
    menuItems.forEach(function (item) {
      var row = el('div', 'nav-item');
      var label = el('span');
      label.textContent = item.label;
      row.appendChild(label);
      if (item.arrow) { row.insertAdjacentHTML('beforeend', ARROW_SVG); }
      host.appendChild(row);
    });
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

  function renderTable() {
    var host = document.getElementById('table');

    columns.forEach(function (col) {
      var th = el('div', 'th');
      var inner = el('div', 'th__inner');
      var label = el('span');
      label.textContent = col.label;
      inner.appendChild(label);
      if (col.sortable) { inner.insertAdjacentHTML('beforeend', SORT_SVG); }
      th.appendChild(inner);
      host.appendChild(th);
    });

    searchCells.forEach(function (cell) {
      var box = el('div', 'th-search');
      if (cell.hasSearch) {
        var input = el('input');
        input.type = 'text';
        input.placeholder = 'Buscar';
        box.appendChild(input);
      }
      host.appendChild(box);
    });

    dataRows.forEach(function (cells, i) {
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

  renderMenu();
  renderPagination();
  renderTable();
  renderSelects();
})();
