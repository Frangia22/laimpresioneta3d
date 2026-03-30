(function (global) {
  'use strict';

  function getConfig() {
    return global.LAIMPRESIONETA_CONFIG || {
      whatsappPhone: '3385436246',
      email: '',
      instagramUrl: '',
      whatsappDefaultText: 'Hola, quiero consultar por un trabajo en impresión 3D / grabado láser.',
    };
  }

  function digitsOnlyPhone(phone) {
    return String(phone || '').replace(/\D/g, '');
  }

  function buildWhatsAppUrl(message) {
    var cfg = getConfig();
    var phone = digitsOnlyPhone(cfg.whatsappPhone);
    var text = message != null && message !== '' ? message : cfg.whatsappDefaultText || '';
    return (
      'https://api.whatsapp.com/send?phone=' +
      encodeURIComponent(phone) +
      '&text=' +
      encodeURIComponent(text)
    );
  }

  function isSafeImageSrc(src) {
    if (src == null || typeof src !== 'string') return false;
    var s = src.trim();
    if (!s) return false;
    if (s.indexOf('/') === 0) return true;
    if (s.indexOf('https://') === 0 || s.indexOf('http://') === 0) return true;
    return false;
  }

  var lastFocusElement = null;
  var boundKeydown = null;

  function onModalKeydown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      hideDetails();
    }
  }

  function getModalEls() {
    var modal = document.getElementById('productModal');
    var panel = modal ? modal.querySelector('[data-product-modal-panel]') : null;
    var closeBtn = document.getElementById('productModalClose');
    return { modal: modal, panel: panel, closeBtn: closeBtn };
  }

  function showDetails(name, price, details, image, idCategory) {
    var els = getModalEls();
    var modal = els.modal;
    if (!modal) return;

    var productName = document.getElementById('productName');
    var productPrice = document.getElementById('productPrice');
    var productImage = document.getElementById('productImage');
    var productDescription = document.getElementById('productDescription');
    var category = document.getElementById('textBtn');
    var outOfStock = document.getElementById('textBtnOutOfStock');

    lastFocusElement = document.activeElement;

    if (productName) productName.textContent = name;
    if (productPrice) productPrice.textContent = '$ ' + price;

    if (productImage) {
      if (isSafeImageSrc(image)) {
        productImage.setAttribute('src', image);
      } else {
        productImage.removeAttribute('src');
      }
      productImage.setAttribute('alt', name || 'Imagen del producto');
    }

    if (productDescription) {
      productDescription.innerHTML = '';
      var raw = details == null ? '' : String(details);
      var segments = raw.split(';');
      var nonEmpty = segments
        .map(function (s) {
          return s.trim();
        })
        .filter(function (s) {
          return s.length > 0;
        });

      if (nonEmpty.length === 0) {
        var li0 = document.createElement('li');
        var span0 = document.createElement('span');
        span0.className = 'mr-1 flex items-start gap-1';
        var icon0 = document.createElement('i');
        icon0.className =
          'ri-arrow-right-double-line text-yellow text-2xl text-deep-purple-accent-400 shrink-0';
        var t0 = document.createElement('span');
        t0.textContent = 'No fueron especificadas';
        span0.appendChild(icon0);
        span0.appendChild(t0);
        li0.appendChild(span0);
        productDescription.appendChild(li0);
      } else {
        nonEmpty.forEach(function (detail) {
          var listItem = document.createElement('li');
          var span = document.createElement('span');
          span.className = 'mr-1 flex items-start gap-1';
          var icon = document.createElement('i');
          icon.className =
            'ri-arrow-right-double-line text-yellow text-2xl text-deep-purple-accent-400 shrink-0';
          var textSpan = document.createElement('span');
          textSpan.textContent = detail;
          span.appendChild(icon);
          span.appendChild(textSpan);
          listItem.appendChild(span);
          productDescription.appendChild(listItem);
        });
      }
    }

    if (category && outOfStock) {
      if (Number(idCategory) === 2) {
        category.classList.add('hidden');
        category.removeAttribute('href');
        outOfStock.classList.remove('hidden');
      } else {
        outOfStock.classList.add('hidden');
        category.classList.remove('hidden');
        category.textContent = 'Comprar';
        category.classList.remove('bg-red-400');
        category.classList.add('bg-yellow');
        var buyMsg =
          'Hola, quiero el siguiente producto: *' + String(name) + '*';
        category.setAttribute('href', buildWhatsAppUrl(buyMsg));
        category.setAttribute('rel', 'noopener noreferrer');
        category.setAttribute('target', '_blank');
      }
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (!boundKeydown) {
      boundKeydown = onModalKeydown;
      document.addEventListener('keydown', boundKeydown);
    }

    var closeBtn = els.closeBtn;
    if (closeBtn && typeof closeBtn.focus === 'function') {
      closeBtn.focus();
    }
  }

  function hideDetails() {
    var els = getModalEls();
    var modal = els.modal;
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.style.overflow = '';

    if (boundKeydown) {
      document.removeEventListener('keydown', boundKeydown);
      boundKeydown = null;
    }

    if (lastFocusElement && typeof lastFocusElement.focus === 'function') {
      try {
        lastFocusElement.focus();
      } catch (e) {
        /* ignore */
      }
    }
    lastFocusElement = null;
  }

  function bindModalUiOnce() {
    var els = getModalEls();
    var modal = els.modal;
    var panel = els.panel;
    var closeBtn = els.closeBtn;
    if (!modal || modal.getAttribute('data-modal-bound') === 'true') return;
    modal.setAttribute('data-modal-bound', 'true');

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        hideDetails();
      });
    }

    modal.addEventListener('click', function (e) {
      if (panel && !panel.contains(e.target)) {
        hideDetails();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindModalUiOnce);
  } else {
    bindModalUiOnce();
  }

  global.showDetails = showDetails;
  global.hideDetails = hideDetails;
})(typeof window !== 'undefined' ? window : this);
