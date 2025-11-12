// ============================================
// DARK MODE TOGGLE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) return;
    
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Appliquer le thème sauvegardé
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.textContent = '☀️';
    }

    // Toggle du thème
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        if (themeIcon) {
            themeIcon.textContent = isDark ? '☀️' : '🌙';
        }
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
});
