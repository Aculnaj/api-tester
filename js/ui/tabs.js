/**
 * API Tester v2 - Tabs Module
 * Tab navigation for generation types
 */

const Tabs = {
    // Current active tab
    activeTab: 'text',

    // Tab elements
    tabButtons: null,
    tabPanels: null,

    /**
     * Initialize tabs system
     */
    init() {
        this.tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
        this.tabPanels = document.querySelectorAll('.tab-panel');

        // Get last active tab from storage
        this.activeTab = Storage.getLastTab();

        // Set up click handlers
        this.setupEventListeners();

        // Activate saved tab
        this.activateTab(this.activeTab);
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                if (tabName) {
                    this.activateTab(tabName);
                }
            });
        });
    },

    /**
     * Activate a tab
     * @param {string} tabName - Name of tab to activate
     */
    activateTab(tabName) {
        // Update buttons
        this.tabButtons.forEach(btn => {
            const isActive = btn.dataset.tab === tabName;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-selected', isActive.toString());
        });

        // Update panels
        this.tabPanels.forEach(panel => {
            const panelTab = panel.id.replace('panel-', '');
            const isActive = panelTab === tabName;
            panel.classList.toggle('is-active', isActive);
        });

        // Save active tab
        this.activeTab = tabName;
        Storage.setLastTab(tabName);

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('tabChange', {
            detail: { tab: tabName }
        }));
    },

    /**
     * Get current active tab
     * @returns {string} Active tab name
     */
    getActiveTab() {
        return this.activeTab;
    },

    /**
     * Check if a specific tab is active
     * @param {string} tabName - Tab name to check
     * @returns {boolean} Is active
     */
    isActive(tabName) {
        return this.activeTab === tabName;
    },

    /**
     * Switch to a specific tab
     * @param {string} tabName - Tab name to switch to
     */
    switchTab(tabName) {
        this.activateTab(tabName);
    }
};

// Make Tabs available globally
window.Tabs = Tabs;
