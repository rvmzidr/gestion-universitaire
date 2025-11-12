// Script de test pour vérifier que le dark mode fonctionne
console.log('🎨 Test Dark Mode');
console.log('Theme toggle button:', document.getElementById('theme-toggle'));
console.log('Current theme:', localStorage.getItem('theme'));
console.log('Body has dark-mode class:', document.body.classList.contains('dark-mode'));
