class TwitchBotConnectorUI {

    shadowRoot;
    connectorHelper;

    constructor(shadowRoot, connectorHelper) {
        this.shadowRoot = shadowRoot;
        this.connectorHelper = connectorHelper;
        this.initialize();
    }

    initialize() {
    }
}

module.exports = TwitchBotConnectorUI;