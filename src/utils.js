// Функция для отображения ошибок
export function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${sanitizeInput(message)}`;
    errorElement.style.display = 'block';
}

export function showSuccess(message) {
    const successElement = document.getElementById('success');
    successElement.innerHTML = `<i class="fas fa-check-circle"></i> ${sanitizeInput(message)}`;
    successElement.style.display = 'block';
}

// Защита от XSS
export function sanitizeInput(input) {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
