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

  document.addEventListener('DOMContentLoaded', async function () {
    var root = document.getElementById('products-list-root');
    if (!root || !window.LaimpresionetaApi) return;

    var isAdmin = false;
    if (window.LaimpresionetaApi.getAccessToken()) {
      var me = await window.LaimpresionetaApi.me();
      isAdmin = me && Number(me.roleId) === 1;
    }

    try {
      var products = await window.LaimpresionetaApi.apiJson('GET', '/products');
      if (!products || !products.length) {
        root.innerHTML =
          '<div class="flex lg:w-1/2 mx-auto shadow-lg rounded-lg" id="alert"><p class="py-6 text-white text-center w-full">No hay productos disponibles.</p></div>';
        return;
      }

      root.innerHTML = products
        .map(function (p) {
          var admin =
            isAdmin &&
            '<div class="flex justify-evenly mx-auto py-4">' +
              '<a class="text-3xl text-yellow hover:text-green-600 ri-edit-line" href="/editproduct/' +
              p.id +
              '"></a>' +
              '<button type="button" class="text-3xl text-yellow hover:text-red-600 ri-delete-bin-2-line bg-transparent border-0 cursor-pointer jwt-del-product" data-id="' +
              p.id +
              '"></button>' +
              '</div>';
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
            '<button type="button" class="jwt-open-product mx-auto my-6 rounded-3xl bg-yellow px-8 py-1 text-2xl font-semibold text-violet hover:text-white hover:bg-violet">Detalles</button>' +
            '</div>' +
            (admin || '') +
            '</div></div>'
          );
        })
        .join('');

      var i = 0;
      products.forEach(function (p) {
        var b = root.querySelectorAll('.jwt-open-product')[i];
        i++;
        if (b) {
          b.addEventListener('click', function () {
            if (typeof showDetails === 'function') {
              showDetails(p.name, p.price, p.details, p.image, p.idCategory);
            }
          });
        }
      });

      root.querySelectorAll('.jwt-del-product').forEach(function (btn) {
        btn.addEventListener('click', async function () {
          var id = btn.getAttribute('data-id');
          if (!id || !confirm('¿Eliminar este producto?')) return;
          try {
            await window.LaimpresionetaApi.apiJson('DELETE', '/products/' + id);
            if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
              window.LaimpresionetaUi.toast('Producto eliminado', 'success');
            }
            window.location.reload();
          } catch (e) {
            if (e.status === 401) {
              window.LaimpresionetaApi.clearTokens();
              window.location.replace('/admin');
              return;
            }
            if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
              window.LaimpresionetaUi.toast(e.message || 'Error', 'error');
            }
          }
        });
      });
    } catch (e) {
      if (window.LaimpresionetaUi && window.LaimpresionetaUi.toast) {
        window.LaimpresionetaUi.toast(e.message || 'Error al cargar productos', 'error');
      }
    }
  });
})();
