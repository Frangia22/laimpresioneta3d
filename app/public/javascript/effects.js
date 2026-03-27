const showPass = document.querySelector('#password');
const iconChange = document.querySelector('#iconChange');

if (showPass && iconChange) {
  iconChange.addEventListener('click', () => {
    if (showPass.type === 'password') {
      showPass.type = 'text';
      iconChange.classList.replace('ri-eye-line', 'ri-eye-off-line');
    } else {
      showPass.type = 'password';
      iconChange.classList.replace('ri-eye-off-line', 'ri-eye-line');
    }
  });
}

const closeAlert = document.getElementById('alert');
const btnCloseAlert = document.getElementById('closeAlert');
if (closeAlert && btnCloseAlert) {
  btnCloseAlert.addEventListener('click', () => {
    closeAlert.classList.add('hidden');
  });
}

function hideMessage() {
  const alert = document.getElementById('alert');
  if (alert) alert.classList.add('hidden');
}
