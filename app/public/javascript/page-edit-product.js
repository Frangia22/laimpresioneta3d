(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', async function () {
    var form = document.getElementById('edit-product-form');
    if (!form || !window.__EDIT_PRODUCT_ID__ || !window.LaimpresionetaAuth || !window.LaimpresionetaApi) {
      return;
    }

    var admin = await window.LaimpresionetaAuth.requireAdminPage();
    if (!admin) return;

    var id = window.__EDIT_PRODUCT_ID__;
    var sel = document.getElementById('idCategory');

    try {
      var cats = await window.LaimpresionetaApi.apiJson('GET', '/categories');
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
      var p = await window.LaimpresionetaApi.apiJson('GET', '/products/' + id);
      document.getElementById('nombre').value = p.name || '';
      document.getElementById('price').value = p.price;
      document.getElementById('image').value = p.image || '';
      document.getElementById('details').value = p.details || '';
      var lp = document.getElementById('linkPago');
      if (lp) lp.value = p.linkPago || '';
      var od = document.getElementById('otherDetails');
      if (od) od.value = p.otherDetails || '';
      if (sel) sel.value = String(p.idCategory);
    } catch (e) {
      if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
        window.LaimpresionetaUi.toast(e.message || 'Error al cargar producto', 'error');
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
        await window.LaimpresionetaApi.apiJson('PUT', '/products/' + id, payload);
        if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
          window.LaimpresionetaUi.toast('Producto actualizado', 'success');
        }
        window.location.href = '/products';
      } catch (err) {
        if (err.status === 401) {
          window.LaimpresionetaApi.clearTokens();
          window.location.replace('/admin');
          return;
        }
        if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
          window.LaimpresionetaUi.toast(err.message || 'Error al guardar', 'error');
        }
      }
    });
  });
})();
