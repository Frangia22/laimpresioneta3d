(function () {
  'use strict';

  function row(c) {
    return (
      '<tr class="border-b border-gray-200 hover:bg-gray-100">' +
      '<td class="py-3 px-6 text-left whitespace-nowrap"><span class="font-medium">' +
      String(c.name).replace(/</g, '&lt;') +
      '</span></td>' +
      '<td class="py-3 md:px-6 text-center">' +
      '<button type="button" class="text-purple-600 hover:scale-110 jwt-del-cat" data-id="' +
      c.id +
      '"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 inline"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>' +
      '</td></tr>'
    );
  }

  async function refreshTable(tbody, Api) {
    var cats = await Api.apiJson('GET', '/categories');
    if (!tbody || !Array.isArray(cats)) return;
    if (!cats.length) {
      tbody.innerHTML =
        '<tr><td colspan="2" class="py-6 text-center">Sin categorías</td></tr>';
      return;
    }
    tbody.innerHTML = cats.map(row).join('');
    tbody.querySelectorAll('.jwt-del-cat').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-id');
        if (!id || !confirm('¿Eliminar esta categoría?')) return;
        try {
          await Api.apiJson('DELETE', '/categories/' + id);
          if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
            window.LaimpresionetaUi.toast('Categoría eliminada', 'success');
          }
          await refreshTable(tbody, Api);
        } catch (e) {
          if (e.status === 401) {
            Api.clearTokens();
            window.location.replace('/admin');
            return;
          }
          if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
            window.LaimpresionetaUi.toast(e.message || 'No se pudo eliminar', 'error');
          }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', async function () {
    var tbody = document.getElementById('categories-tbody');
    var form = document.getElementById('add-category-form');
    if (!tbody || !form || !window.LaimpresionetaAuth || !window.LaimpresionetaApi) return;

    var admin = await window.LaimpresionetaAuth.requireAdminPage();
    if (!admin) return;

    var Api = window.LaimpresionetaApi;

    try {
      await refreshTable(tbody, Api);
    } catch (e) {
      if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
        window.LaimpresionetaUi.toast(e.message || 'Error al cargar categorías', 'error');
      }
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var name = document.getElementById('nombre-categoria').value.trim();
      if (!name) return;
      try {
        await Api.apiJson('POST', '/categories', { name: name });
        document.getElementById('nombre-categoria').value = '';
        if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
          window.LaimpresionetaUi.toast('Categoría creada', 'success');
        }
        await refreshTable(tbody, Api);
      } catch (err) {
        if (err.status === 401) {
          Api.clearTokens();
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
