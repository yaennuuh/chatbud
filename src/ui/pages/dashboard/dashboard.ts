class CoreDashboardPageUI {

    shadowRoot;
    corePageHelper;

    constructor(shadowRoot, corePageHelper) {
        this.shadowRoot = shadowRoot;
        this.corePageHelper = corePageHelper;
        this.initialize();
    }

    initialize() {
        console.log('dashboard loaded');
    }
}

module.exports = CoreDashboardPageUI;