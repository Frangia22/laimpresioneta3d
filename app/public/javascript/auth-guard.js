(function () {
  'use strict';

  async function requireAuthPage() {
    var Api = window.LaimpresionetaApi;
    if (!Api || !Api.getAccessToken()) {
      window.location.replace('/admin');
      return null;
    }
    var profile = await Api.me();
    if (!profile) {
      Api.clearTokens();
      window.location.replace('/admin');
      return null;
    }
    return profile;
  }

  async function requireAdminPage() {
    var profile = await requireAuthPage();
    if (!profile) return null;
    if (Number(profile.roleId) !== 1) {
      if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
        window.LaimpresionetaUi.toast('No tenés permisos de administración', 'error');
      } else {
        alert('No tenés permisos de administración');
      }
      window.location.replace('/');
      return null;
    }
    return profile;
  }

  window.LaimpresionetaAuth = {
    requireAuthPage: requireAuthPage,
    requireAdminPage: requireAdminPage,
  };
})();
