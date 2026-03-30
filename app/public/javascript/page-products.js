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
          '<div id="alert" class="max-w-lg mx-auto rounded-2xl bg-violet px-6 py-10 shadow-xl ring-1 ring-white/15 text-center">' +
          '<p class="text-yellow font-bold text-lg mb-2">Sin productos por ahora</p>' +
          '<p class="text-white/95 text-sm leading-relaxed">Estamos renovando el catálogo. Volvé pronto o contactanos por WhatsApp desde el inicio.</p>' +
          '</div>';
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
            '<div class="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 my-4 px-2">' +
            '<article class="flex flex-col overflow-hidden rounded-2xl bg-violet-500 shadow-xl ring-1 ring-black/15 transition-shadow duration-200 hover:shadow-2xl hover:ring-yellow/25 md:mx-0 lg:mx-auto h-full">' +
            '<div class="aspect-[4/3] w-full bg-white flex items-center justify-center p-2">' +
            '<img class="max-h-full w-full object-contain" src="' +
            escapeHtml(p.image) +
            '" alt="' +
            escapeHtml(p.name) +
            '">' +
            '</div>' +
            '<div class="flex flex-col gap-3 px-4 pb-5 pt-4 text-center flex-1">' +
            '<h3 class="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2 min-h-[2.75rem]">' +
            escapeHtml(p.name) +
            '</h3>' +
            '<p class="text-2xl sm:text-3xl font-black text-yellow tracking-tight">' +
            '$ ' +
            escapeHtml(String(p.price)) +
            '</p>' +
            '<button type="button" class="jwt-open-product mt-auto w-full sm:w-auto mx-auto rounded-xl bg-yellow px-6 py-3 text-base sm:text-lg font-bold text-violet hover:bg-[#390097] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow transition-colors duration-150">Ver detalles</button>' +
            '</div>' +
            (admin || '') +
            '</article></div>'
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
