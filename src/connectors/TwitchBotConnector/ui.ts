class TwitchBotConnectorUI {

    shadowRoot;
    pluginHelper;

    constructor(shadowRoot, pluginHelper) {
        this.shadowRoot = shadowRoot;
        this.pluginHelper = pluginHelper;
        this.initialize();
    }

    initialize() {
    }
}

module.exports = TwitchBotConnectorUI;