(function () {
  'use strict';

  function ensureHost() {
    var el = document.getElementById('laimpr-toast-host');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'laimpr-toast-host';
    el.setAttribute('aria-live', 'polite');
    el.style.cssText =
      'position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:min(420px,calc(100vw - 32px));pointer-events:none;';
    document.body.appendChild(el);
    return el;
  }

  function toast(message, type) {
    type = type || 'error';
    var host = ensureHost();
    var card = document.createElement('div');
    card.style.cssText =
      'pointer-events:auto;padding:12px 14px;border-radius:12px;font-size:14px;line-height:1.35;box-shadow:0 10px 30px rgba(0,0,0,.18);';
    if (type === 'success') {
      card.style.background = '#dcfce7';
      card.style.color = '#14532d';
    } else if (type === 'info') {
      card.style.background = '#e0e7ff';
      card.style.color = '#312e81';
    } else {
      card.style.background = '#fee2e2';
      card.style.color = '#7f1d1d';
    }
    card.textContent = message;
    host.appendChild(card);
    window.setTimeout(function () {
      card.remove();
    }, 5000);
  }

  window.LaimpresionetaUi = {
    toast: toast,
  };
})();
