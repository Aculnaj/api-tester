/**
 * API Tester v2 - Sidebar Module
 * Sidebar navigation and mobile toggle
 */

const Sidebar = {
    // DOM elements
    sidebar: null,
    overlay: null,
    toggleBtn: null,

    // State
    isOpen: false,

    /**
     * Initialize sidebar
     */
    init() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebar-overlay');
        this.toggleBtn = document.getElementById('sidebar-toggle');

        this.setupEventListeners();
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Toggle button
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }

        // Overlay click to close
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Close on window resize if open on mobile
        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth > 1024 && this.isOpen) {
                this.close();
            }
        }, 200));
    },

    /**
     * Toggle sidebar
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Open sidebar
     */
    open() {
        if (this.sidebar) {
            this.sidebar.classList.add('is-open');
        }
        if (this.overlay) {
            this.overlay.classList.add('is-visible');
        }
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    },

    /**
     * Close sidebar
     */
    close() {
        if (this.sidebar) {
            this.sidebar.classList.remove('is-open');
        }
        if (this.overlay) {
            this.overlay.classList.remove('is-visible');
        }
        this.isOpen = false;
        document.body.style.overflow = '';
    }
};

// Make Sidebar available globally
window.Sidebar = Sidebar;
