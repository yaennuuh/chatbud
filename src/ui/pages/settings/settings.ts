class CoreSettingsPageUI {

    shadowRoot;
    corePageHelper;

    constructor(shadowRoot, corePageHelper) {
        this.shadowRoot = shadowRoot;
        this.corePageHelper = corePageHelper;
        this.initialize();
    }

    initialize() {
        console.log('settings loaded');
    }
}

module.exports = CoreSettingsPageUI;