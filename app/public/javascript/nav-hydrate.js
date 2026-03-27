(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', async function () {
    var Api = window.LaimpresionetaApi;
    if (!Api || !Api.getAccessToken()) return;

    var profile = null;
    try {
      profile = await Api.me();
    } catch (e) {
      return;
    }
    if (!profile) return;

    document.querySelectorAll('.jwt-user-name').forEach(function (el) {
      el.textContent = profile.name || '';
    });
    document.querySelectorAll('.jwt-nav-auth-only').forEach(function (el) {
      el.classList.remove('hidden');
    });
    if (Number(profile.roleId) === 1) {
      document.querySelectorAll('.jwt-nav-admin-only').forEach(function (el) {
        el.classList.remove('hidden');
      });
    }
  });
})();
