/* Ventanas modales del módulo.

   Se superponen a toda la vista sobre un fondo negro al 50% de opacidad
   y quedan centradas horizontalmente y algo por encima del centro
   vertical. Se cierran con la X o con Escape; pulsar el fondo no las
   cierra, para no perder lo capturado por descuido. */

(function (global) {
  'use strict';

  var CLOSE_SVG =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="rgb(255,255,255)" aria-hidden="true">' +
    '<path d="M1.6 0.2 L8 6.6 L14.4 0.2 L15.8 1.6 L9.4 8 L15.8 14.4 L14.4 15.8 L8 9.4 ' +
    'L1.6 15.8 L0.2 14.4 L6.6 8 L0.2 1.6 Z"></path></svg>';

  var abierto = null;

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    return node;
  }

  /**
   * Abre una ventana modal.
   * @param {Object} options
   *   title   {string}  texto de la cabecera
   *   body    {Node}    contenido del cuerpo
   *   buttons {Array}   [{ label, variant, onClick }]; 'variant' es
   *                     'cancel' o 'save'. Devolver false en onClick
   *                     mantiene la ventana abierta.
   *   onClose {Function} se ejecuta al cerrar
   * @returns {{ close: Function, element: Node }}
   */
  function openModal(options) {
    if (abierto) { abierto.close(); }

    var previouslyFocused = document.activeElement;

    var overlay = el('div', 'modal-overlay');

    var modal = el('div', 'modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.tabIndex = -1;

    /* Cabecera */
    var header = el('div', 'modal__header');

    var title = el('h2', 'modal__title');
    title.textContent = options.title || '';
    header.appendChild(title);

    var closeBtn = el('button', 'modal__close');
    closeBtn.type = 'button';
    closeBtn.title = 'Cerrar';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.insertAdjacentHTML('beforeend', CLOSE_SVG);
    closeBtn.addEventListener('click', close);
    header.appendChild(closeBtn);

    modal.appendChild(header);

    /* Cuerpo */
    var body = el('div', 'modal__body');
    if (options.body) { body.appendChild(options.body); }
    modal.appendChild(body);

    /* Pie con los botones */
    if (options.buttons && options.buttons.length) {
      var footer = el('div', 'modal__footer');

      options.buttons.forEach(function (spec) {
        var btn = el('button', 'btn btn--' + (spec.variant || 'cancel'));
        btn.type = 'button';
        btn.textContent = spec.label;
        btn.addEventListener('click', function () {
          if (spec.onClick && spec.onClick() === false) { return; }
          close();
        });
        footer.appendChild(btn);
      });

      modal.appendChild(footer);
    }

    overlay.appendChild(modal);

    function onKeydown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      }
    }

    function close() {
      document.removeEventListener('keydown', onKeydown, true);
      if (overlay.parentNode) { overlay.parentNode.removeChild(overlay); }
      if (abierto && abierto.element === overlay) { abierto = null; }
      if (previouslyFocused && previouslyFocused.focus) { previouslyFocused.focus(); }
      if (options.onClose) { options.onClose(); }
    }

    document.addEventListener('keydown', onKeydown, true);
    document.body.appendChild(overlay);
    modal.focus();

    abierto = { close: close, element: overlay };
    return abierto;
  }

  global.openModal = openModal;
})(window);
