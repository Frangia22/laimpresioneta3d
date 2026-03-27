(function () {
  'use strict';

  var BASE = '/api/v1';
  var KEY_ACCESS = 'laimpr_access_token';
  var KEY_REFRESH = 'laimpr_refresh_token';

  function getAccessToken() {
    return sessionStorage.getItem(KEY_ACCESS);
  }

  function getRefreshToken() {
    return sessionStorage.getItem(KEY_REFRESH);
  }

  function setTokens(accessToken, refreshToken) {
    sessionStorage.setItem(KEY_ACCESS, accessToken);
    if (refreshToken) {
      sessionStorage.setItem(KEY_REFRESH, refreshToken);
    }
  }

  function clearTokens() {
    sessionStorage.removeItem(KEY_ACCESS);
    sessionStorage.removeItem(KEY_REFRESH);
  }

  async function refreshTokensOnce() {
    var r = getRefreshToken();
    if (!r) return false;
    var res = await fetch(BASE + '/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: r }),
    });
    if (!res.ok) return false;
    var data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  }

  async function apiFetch(path, options, retryFlags) {
    retryFlags = retryFlags || { retried: false };
    var headers = Object.assign({}, (options && options.headers) || {});
    var token = getAccessToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    if (options && options.body != null && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    var res = await fetch(BASE + path, Object.assign({}, options, { headers: headers }));
    if (res.status === 401 && !retryFlags.retried && getRefreshToken()) {
      var ok = await refreshTokensOnce();
      if (ok) {
        retryFlags.retried = true;
        return apiFetch(path, options, retryFlags);
      }
    }
    return res;
  }

  function parseBody(text) {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (e) {
      return { message: text };
    }
  }

  async function apiJson(method, path, body) {
    var opts = {};
    if (method) {
      opts.method = method;
    }
    if (body !== undefined && body !== null) {
      opts.body = JSON.stringify(body);
    }
    var res = await apiFetch(path, opts);
    var text = await res.text();
    var data = parseBody(text);
    if (!res.ok) {
      var msg =
        (data && (data.message || data.error)) ||
        ('Error HTTP ' + res.status);
      var err = new Error(msg);
      err.status = res.status;
      err.code = data && data.code;
      err.details = data && data.details;
      throw err;
    }
    return data;
  }

  async function login(email, password) {
    var res = await fetch(BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password }),
    });
    var text = await res.text();
    var data = parseBody(text);
    if (!res.ok) {
      var msg = (data && data.message) || 'No se pudo iniciar sesión';
      var err = new Error(msg);
      err.status = res.status;
      err.code = data && data.code;
      throw err;
    }
    setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async function logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      /* stateless */
    }
    clearTokens();
  }

  async function me() {
    if (!getAccessToken()) return null;
    try {
      return await apiJson('GET', '/users/me');
    } catch (e) {
      if (e.status === 401 || e.status === 403) return null;
      throw e;
    }
  }

  window.LaimpresionetaApi = {
    base: BASE,
    KEY_ACCESS: KEY_ACCESS,
    KEY_REFRESH: KEY_REFRESH,
    getAccessToken: getAccessToken,
    setTokens: setTokens,
    clearTokens: clearTokens,
    apiFetch: apiFetch,
    apiJson: apiJson,
    login: login,
    logout: logout,
    me: me,
  };
})();
