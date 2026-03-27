(function () {
  'use strict';

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderServices(list, isAdmin, root) {
    if (!list.length) {
      root.innerHTML =
        '<p class="text-center text-white w-full py-8">No hay servicios para mostrar.</p>';
      return;
    }
    root.innerHTML = list
      .map(function (s) {
        var admin =
          isAdmin &&
          '<div class="flex justify-evenly mx-auto my-4">' +
            '<a class="text-3xl text-yellow hover:text-green-600 ri-edit-line" href="/editservice/' +
            s.id +
            '" aria-label="Editar servicio"></a>' +
            '<button type="button" class="text-3xl text-yellow hover:text-red-600 ri-delete-bin-2-line bg-transparent border-0 cursor-pointer jwt-delete-service" data-id="' +
            s.id +
            '" aria-label="Eliminar servicio"></button>' +
            '</div>';
        return (
          '<div class="basis-1/4 my-6 rounded-xl">' +
          '<div class="flex-col bg-violet-500 py-12">' +
          '<img class="mx-auto w-14 mb-6" src="' +
          escapeHtml(s.iconService) +
          '" alt="">' +
          '<p class="w-3/4 mx-auto text-white">' +
          escapeHtml(s.details) +
          '</p>' +
          (admin || '') +
          '</div></div>'
        );
      })
      .join('');

    root.querySelectorAll('.jwt-delete-service').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-id');
        if (!id || !confirm('¿Eliminar este servicio?')) return;
        try {
          await window.LaimpresionetaApi.apiJson('DELETE', '/services/' + id);
          if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
            window.LaimpresionetaUi.toast('Servicio eliminado', 'success');
          }
          window.location.reload();
        } catch (e) {
          if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
            window.LaimpresionetaUi.toast(e.message || 'Error al eliminar', 'error');
          }
        }
      });
    });
  }

  function renderProducts(list, root) {
    if (!list.length) {
      root.innerHTML =
        '<div class="flex lg:w-1/2 mx-auto shadow-lg rounded-lg" id="alert">' +
        '<div class="bg-red-600 py-4 px-6 rounded-l-lg flex items-center"></div>' +
        '<div class="px-4 py-6 bg-white rounded-r-lg flex justify-between items-center w-full border border-l-transparent border-gray-200">' +
        '<div>Lo siento en este momento estamos renovando el stock, no tenemos productos para mostrar</div>' +
        '<button type="button" id="closeAlertHome"><svg xmlns="http://www.w3.org/2000/svg" class="fill-current text-gray-700" viewBox="0 0 16 16" width="20" height="20"><path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.59 0 010-1.06z"></path></svg></button>' +
        '</div></div>';
      var close = document.getElementById('closeAlertHome');
      if (close) {
        close.addEventListener('click', function () {
          document.getElementById('alert').classList.add('hidden');
        });
      }
      return;
    }
    root.innerHTML = list
      .map(function (p) {
        return (
          '<div class="basis-1/2 lg:basis-1/6 my-6 rounded-xl">' +
          '<div class="flex-col bg-violet-500 md:mx-6 lg:mx-auto">' +
          '<img class="rounded-t-xl w-full h-44 object-contain bg-white" src="' +
          escapeHtml(p.image) +
          '" alt="' +
          escapeHtml(p.name) +
          '">' +
          '<div class="py-4 text-center h-64 lg:flex lg:flex-col lg:justify-around">' +
          '<h2 class="text-2xl text-center p-2 text-white">' +
          escapeHtml(p.name) +
          '</h2>' +
          '<h3 class="text-2xl text-center py-2 text-yellow">$ ' +
          escapeHtml(String(p.price)) +
          '</h3>' +
          '<button type="button" class="jwt-open-product mx-auto my-6 rounded-3xl bg-yellow px-8 py-1 text-2xl font-semibold text-violet hover:text-white hover:bg-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500">Detalles</button>' +
          '</div></div></div>'
        );
      })
      .join('');

    var idx = 0;
    list.forEach(function (p) {
      var wrap = root.querySelectorAll('.jwt-open-product')[idx];
      idx++;
      if (!wrap) return;
      wrap.addEventListener('click', function () {
        if (typeof showDetails === 'function') {
          showDetails(p.name, p.price, p.details, p.image, p.idCategory);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', async function () {
    var sRoot = document.getElementById('home-services-root');
    var pRoot = document.getElementById('home-products-root');
    if (!sRoot || !pRoot || !window.LaimpresionetaApi) return;

    try {
      var services = await window.LaimpresionetaApi.apiJson('GET', '/services');
      var products = await window.LaimpresionetaApi.apiJson('GET', '/products');
      var isAdmin = false;
      if (window.LaimpresionetaApi.getAccessToken()) {
        var me = await window.LaimpresionetaApi.me();
        isAdmin = me && Number(me.roleId) === 1;
      }
      renderServices((services || []).slice(0, 3), isAdmin, sRoot);
      renderProducts((products || []).slice(0, 4), pRoot);
    } catch (e) {
      if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
        window.LaimpresionetaUi.toast(e.message || 'Error al cargar la portada', 'error');
      }
    }
  });
})();
