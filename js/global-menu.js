document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('global-nav-toggle');
  const dropdown = document.getElementById('global-nav-dropdown');

  if (!toggleBtn || !dropdown) return;

  // Toggle Menú
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  // Cerrar al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== toggleBtn) {
      dropdown.classList.remove('open');
    }
  });

  // Marcar la página actual
  const currentPath = window.location.pathname.split('/').pop();
  const navItems = dropdown.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPath) {
      item.classList.add('current-page');
    } else if (currentPath === '' && href === 'index.html') {
      // Si la URL es la raíz sin archivo (ej. /pages/)
      item.classList.add('current-page');
    }
  });
});
