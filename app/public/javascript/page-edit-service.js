(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', async function () {
    var form = document.getElementById('edit-service-form');
    if (!form || !window.__EDIT_SERVICE_ID__ || !window.LaimpresionetaAuth || !window.LaimpresionetaApi) {
      return;
    }

    var admin = await window.LaimpresionetaAuth.requireAdminPage();
    if (!admin) return;

    var id = window.__EDIT_SERVICE_ID__;

    try {
      var s = await window.LaimpresionetaApi.apiJson('GET', '/services/' + id);
      document.getElementById('nombre').value = s.name || '';
      document.getElementById('iconService').value = s.iconService || '';
      document.getElementById('details').value = s.details || '';
    } catch (e) {
      if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
        window.LaimpresionetaUi.toast(e.message || 'Error al cargar servicio', 'error');
      }
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var payload = {
        name: document.getElementById('nombre').value.trim(),
        iconService: document.getElementById('iconService').value.trim(),
        details: document.getElementById('details').value.trim(),
      };
      try {
        await window.LaimpresionetaApi.apiJson('PUT', '/services/' + id, payload);
        if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
          window.LaimpresionetaUi.toast('Servicio actualizado', 'success');
        }
        window.location.href = '/';
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
