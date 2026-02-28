// NexoPro — Toast Notification (centralizado, UX adultos mayores)
let toastTimeout = null;

export function showToast(message, type = '') {
    // Remove existing toast
    let toast = document.querySelector('.toast');
    if (toast) {
        clearTimeout(toastTimeout);
        toast.remove();
    }

    toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Message text
    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;
    msgSpan.style.flex = '1';
    toast.appendChild(msgSpan);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '✕';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.onclick = () => {
        clearTimeout(toastTimeout);
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    };
    toast.appendChild(closeBtn);

    document.body.appendChild(toast);

    // Show with animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto-hide after 5 seconds (was 3s — too fast for elderly users)
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}
