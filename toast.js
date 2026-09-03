/* Mensajes toast del módulo.

   Tres variantes según el resultado de la acción:
     'error'   rojo  #D9534F
     'success' verde #60BA7C
     'warning' ámbar #DAA125

   Entran deslizándose desde la esquina superior izquierda de la ventana
   hasta quedar a 50 px del borde superior e izquierdo, permanecen 4
   segundos y regresan por el mismo camino hasta salir de la vista. */

(function (global) {
  'use strict';

  var VISIBLE_MS = 4000;   /* tiempo de lectura */
  var SLIDE_MS = 450;      /* duración del deslizamiento, igual a la del CSS */

  var VARIANTS = { error: true, success: true, warning: true };

  var element = null;
  var hideTimer = null;
  var removeTimer = null;

  function ensureElement() {
    if (element && element.isConnected) { return element; }

    element = document.createElement('div');
    element.className = 'toast';
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', 'polite');
    document.body.appendChild(element);
    return element;
  }

  /**
   * Muestra un toast.
   * @param {string} message - texto a mostrar
   * @param {string} [kind] - 'error', 'success' o 'warning' (por omisión 'success')
   */
  function showToast(message, kind) {
    var variant = VARIANTS[kind] ? kind : 'success';
    var toast = ensureElement();

    clearTimeout(hideTimer);
    clearTimeout(removeTimer);

    toast.textContent = message;
    toast.className = 'toast toast--' + variant;

    /* Un fotograma de margen para que la transición arranque desde la
       posición oculta incluso cuando el toast acaba de crearse. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('toast--visible');
      });
    });

    hideTimer = setTimeout(function () {
      toast.classList.remove('toast--visible');

      /* Se retira del DOM cuando termina de salir de la vista */
      removeTimer = setTimeout(function () {
        if (toast.parentNode) { toast.parentNode.removeChild(toast); }
        if (element === toast) { element = null; }
      }, SLIDE_MS);
    }, VISIBLE_MS);
  }

  global.showToast = showToast;
})(window);
