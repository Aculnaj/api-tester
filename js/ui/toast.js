/**
 * API Tester v2 - Toast Module
 * Toast notification system
 */

const Toast = {
    // Container element
    container: null,

    // Toast types
    TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },

    // Default duration
    DEFAULT_DURATION: 4000,

    /**
     * Initialize toast system
     */
    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    /**
     * Show a toast notification
     * @param {Object} options - Toast options
     * @param {string} options.type - Toast type (success, error, warning, info)
     * @param {string} options.title - Toast title
     * @param {string} options.message - Toast message
     * @param {number} options.duration - Duration in ms (0 for persistent)
     * @returns {HTMLElement} Toast element
     */
    show({ type = 'info', title = '', message = '', duration = this.DEFAULT_DURATION }) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${icon}
            </svg>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${Utils.escapeHtml(title)}</div>` : ''}
                ${message ? `<div class="toast-message">${Utils.escapeHtml(message)}</div>` : ''}
            </div>
            <button class="toast-close" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.dismiss(toast));

        // Add to container
        this.container.appendChild(toast);

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }

        return toast;
    },

    /**
     * Get icon SVG path for toast type
     * @param {string} type - Toast type
     * @returns {string} SVG path
     */
    getIcon(type) {
        switch (type) {
            case 'success':
                return '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
            case 'error':
                return '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>';
            case 'warning':
                return '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>';
            case 'info':
            default:
                return '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>';
        }
    },

    /**
     * Dismiss a toast
     * @param {HTMLElement} toast - Toast element to dismiss
     */
    dismiss(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.add('is-leaving');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 200);
    },

    /**
     * Dismiss all toasts
     */
    dismissAll() {
        const toasts = this.container.querySelectorAll('.toast');
        toasts.forEach(toast => this.dismiss(toast));
    },

    /**
     * Show success toast
     * @param {string} message - Message
     * @param {string} title - Title (optional)
     */
    success(message, title = 'Success') {
        return this.show({ type: 'success', title, message });
    },

    /**
     * Show error toast
     * @param {string} message - Message
     * @param {string} title - Title (optional)
     */
    error(message, title = 'Error') {
        return this.show({ type: 'error', title, message, duration: 6000 });
    },

    /**
     * Show warning toast
     * @param {string} message - Message
     * @param {string} title - Title (optional)
     */
    warning(message, title = 'Warning') {
        return this.show({ type: 'warning', title, message });
    },

    /**
     * Show info toast
     * @param {string} message - Message
     * @param {string} title - Title (optional)
     */
    info(message, title = 'Info') {
        return this.show({ type: 'info', title, message });
    }
};

// Make Toast available globally
window.Toast = Toast;
