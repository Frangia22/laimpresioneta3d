(function () {
  'use strict';

  function rowHtml(u) {
    var roleLabel = Number(u.roleId) === 1 ? 'Admin' : 'User';
    var statusLabel = u.status === false ? 'Activo' : 'Inactivo';
    var statusClass =
      u.status === false ? 'bg-green-200 text-green-600' : 'bg-red-200 text-red-600';
    return (
      '<tr class="border-b border-gray-200 hover:bg-gray-100">' +
      '<td class="py-3 px-6 text-left whitespace-nowrap hidden lg:block">' +
      '<div class="flex items-center"><span class="font-medium">' +
      escapeHtml(u.name) +
      '</span></div></td>' +
      '<td class="py-3 md:px-6 text-left">' +
      '<div class="flex items-center"><span class="mx-auto md:m-0">' +
      escapeHtml(u.email) +
      '</span></div></td>' +
      '<td class="py-3 px-6 text-center hidden lg:block">' +
      roleLabel +
      '</td>' +
      '<td class="py-3 md:px-6 text-center"><span class="' +
      statusClass +
      ' py-1 px-3 rounded-full text-xs">' +
      statusLabel +
      '</span></td>' +
      '<td class="py-3 md:px-6 text-center text-xs text-gray-400">Solo lectura (API v1)</td>' +
      '</tr>'
    );
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', async function () {
    var host = document.getElementById('dashboard-users-tbody');
    if (!host || !window.LaimpresionetaAuth || !window.LaimpresionetaApi) return;

    var admin = await window.LaimpresionetaAuth.requireAdminPage();
    if (!admin) return;

    try {
      var users = await window.LaimpresionetaApi.apiJson('GET', '/users');
      if (!Array.isArray(users) || users.length === 0) {
        host.innerHTML =
          '<tr><td colspan="5" class="py-6 text-center text-gray-500">No hay usuarios</td></tr>';
        return;
      }
      host.innerHTML = users.map(rowHtml).join('');
    } catch (e) {
      if (e.status === 401) {
        window.LaimpresionetaApi.clearTokens();
        window.location.replace('/admin');
        return;
      }
      if (e.status === 403) {
        if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
          window.LaimpresionetaUi.toast('No autorizado a listar usuarios', 'error');
        }
        window.location.replace('/');
        return;
      }
      if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
        window.LaimpresionetaUi.toast(e.message || 'Error al cargar usuarios', 'error');
      }
    }
  });
})();
