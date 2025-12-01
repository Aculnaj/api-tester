/**
 * API Tester v2 - Theme Module
 * Theme management (light/dark/system)
 */

const Theme = {
    // Theme constants
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark',
        SYSTEM: 'system'
    },

    // Current theme
    currentTheme: 'dark',

    // Media query for system preference
    mediaQuery: null,

    /**
     * Initialize theme system
     */
    init() {
        // Get saved theme or default to dark
        this.currentTheme = Storage.getTheme();
        
        // Set up system preference listener
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaQuery.addEventListener('change', this.handleSystemChange.bind(this));
        
        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Set up toggle buttons
        this.setupToggleButtons();
    },

    /**
     * Apply theme to document
     * @param {string} theme - Theme name
     */
    applyTheme(theme) {
        let effectiveTheme = theme;
        
        // If system theme, determine based on preference
        if (theme === this.THEMES.SYSTEM) {
            effectiveTheme = this.getSystemTheme();
        }
        
        // Apply to document
        document.documentElement.setAttribute('data-theme', effectiveTheme);
        
        // Update toggle buttons
        this.updateToggleButtons(theme);
        
        // Save preference
        Storage.setTheme(theme);
        this.currentTheme = theme;
    },

    /**
     * Get system preferred theme
     * @returns {string} 'light' or 'dark'
     */
    getSystemTheme() {
        return this.mediaQuery && this.mediaQuery.matches ? this.THEMES.DARK : this.THEMES.LIGHT;
    },

    /**
     * Handle system preference change
     * @param {MediaQueryListEvent} e - Media query event
     */
    handleSystemChange(e) {
        if (this.currentTheme === this.THEMES.SYSTEM) {
            const effectiveTheme = e.matches ? this.THEMES.DARK : this.THEMES.LIGHT;
            document.documentElement.setAttribute('data-theme', effectiveTheme);
        }
    },

    /**
     * Set up theme toggle buttons
     */
    setupToggleButtons() {
        const buttons = document.querySelectorAll('.theme-toggle-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                if (theme) {
                    this.applyTheme(theme);
                }
            });
        });
    },

    /**
     * Update toggle button states
     * @param {string} activeTheme - Currently active theme
     */
    updateToggleButtons(activeTheme) {
        const buttons = document.querySelectorAll('.theme-toggle-btn');
        
        buttons.forEach(btn => {
            const isActive = btn.dataset.theme === activeTheme;
            btn.classList.toggle('is-active', isActive);
        });
    },

    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const newTheme = this.currentTheme === this.THEMES.DARK 
            ? this.THEMES.LIGHT 
            : this.THEMES.DARK;
        this.applyTheme(newTheme);
    },

    /**
     * Get current effective theme
     * @returns {string} Current effective theme ('light' or 'dark')
     */
    getEffectiveTheme() {
        if (this.currentTheme === this.THEMES.SYSTEM) {
            return this.getSystemTheme();
        }
        return this.currentTheme;
    }
};

// Make Theme available globally
window.Theme = Theme;
