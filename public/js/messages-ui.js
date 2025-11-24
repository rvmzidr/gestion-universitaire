document.addEventListener('DOMContentLoaded', () => {
    const historyContainer = document.querySelector('[data-message-list]');
    if (historyContainer) {
        historyContainer.scrollTop = historyContainer.scrollHeight;
    }

    const forms = document.querySelectorAll('[data-message-form], .contact-form');
    forms.forEach((form) => {
        form.addEventListener('submit', () => {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.dataset.originalText = submitButton.textContent;
                submitButton.textContent = 'Envoi...';
            }
        });
    });
});
