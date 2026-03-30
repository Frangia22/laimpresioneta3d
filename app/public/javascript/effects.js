(function () {
  function initPasswordToggle() {
    var showPass = document.querySelector('#password');
    var iconChange = document.querySelector('#iconChange');
    if (!showPass || !iconChange) return;
    iconChange.addEventListener('click', function () {
      if (showPass.type === 'password') {
        showPass.type = 'text';
        iconChange.classList.replace('ri-eye-line', 'ri-eye-off-line');
        iconChange.setAttribute('aria-pressed', 'true');
      } else {
        showPass.type = 'password';
        iconChange.classList.replace('ri-eye-off-line', 'ri-eye-line');
        iconChange.setAttribute('aria-pressed', 'false');
      }
    });
  }

  function initAlertClose() {
    var closeAlert = document.getElementById('alert');
    var btnCloseAlert = document.getElementById('closeAlert');
    if (closeAlert && btnCloseAlert) {
      btnCloseAlert.addEventListener('click', function () {
        closeAlert.classList.add('hidden');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initPasswordToggle();
      initAlertClose();
    });
  } else {
    initPasswordToggle();
    initAlertClose();
  }
})();

function hideMessage() {
  var alert = document.getElementById('alert');
  if (alert) alert.classList.add('hidden');
}
