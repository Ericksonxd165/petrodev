// Mostrar el número de cédula del usuario
function showUserCedula() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      document.getElementById('user-cedula').textContent = user.cedula;
    }
  }
  
  // Manejar el cierre de sesión
  async function logout() {
    const response = await fetch('/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  
    const result = await response.json();
    if (response.ok) {
      localStorage.removeItem('user');
      window.location.href = '/index.html';
    } else {
      alert(result.message);
    }
  }
  
  // Redirigir al dashboard si la sesión está activa
  function redirectToDashboardIfLoggedIn() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      window.location.href = '/dashboard.html';
    }
  }