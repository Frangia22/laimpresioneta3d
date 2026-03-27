(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', async function () {
    var form = document.getElementById('add-service-form');
    if (!form || !window.LaimpresionetaAuth || !window.LaimpresionetaApi) return;

    var admin = await window.LaimpresionetaAuth.requireAdminPage();
    if (!admin) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var payload = {
        name: document.getElementById('nombre').value.trim(),
        iconService: document.getElementById('iconService').value.trim(),
        details: document.getElementById('details').value.trim(),
      };
      try {
        await window.LaimpresionetaApi.apiJson('POST', '/services', payload);
        if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
          window.LaimpresionetaUi.toast('Servicio creado', 'success');
        }
        window.location.href = '/';
      } catch (err) {
        if (err.status === 401) {
          window.LaimpresionetaApi.clearTokens();
          window.location.replace('/admin');
          return;
        }
        if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
          window.LaimpresionetaUi.toast(err.message || 'Error al crear servicio', 'error');
        }
      }
    });
  });
})();
