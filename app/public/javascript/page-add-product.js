(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', async function () {
    var form = document.getElementById('add-product-form');
    if (!form || !window.LaimpresionetaAuth || !window.LaimpresionetaApi) return;

    var admin = await window.LaimpresionetaAuth.requireAdminPage();
    if (!admin) return;

    try {
      var cats = await window.LaimpresionetaApi.apiJson('GET', '/categories');
      var sel = document.getElementById('idCategory');
      if (sel && Array.isArray(cats)) {
        sel.innerHTML = cats
          .map(function (c) {
            return (
              '<option value="' +
              c.id +
              '">' +
              String(c.name).replace(/</g, '&lt;') +
              '</option>'
            );
          })
          .join('');
      }
    } catch (e) {
      if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
        window.LaimpresionetaUi.toast(e.message || 'No se pudieron cargar categorías', 'error');
      }
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var lp = document.getElementById('linkPago');
      var od = document.getElementById('otherDetails');
      var payload = {
        name: document.getElementById('nombre').value.trim(),
        price: parseInt(document.getElementById('price').value, 10),
        image: document.getElementById('image').value.trim(),
        details: document.getElementById('details').value.trim(),
        linkPago: lp && lp.value ? lp.value.trim() : '',
        otherDetails: od && od.value ? od.value.trim() : null,
        idCategory: parseInt(document.getElementById('idCategory').value, 10),
      };
      try {
        await window.LaimpresionetaApi.apiJson('POST', '/products', payload);
        if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
          window.LaimpresionetaUi.toast('Producto creado', 'success');
        }
        window.location.href = '/products';
      } catch (err) {
        if (err.status === 401) {
          window.LaimpresionetaApi.clearTokens();
          window.location.replace('/admin');
          return;
        }
        if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
          window.LaimpresionetaUi.toast(err.message || 'Error al crear', 'error');
        }
      }
    });
  });
})();
