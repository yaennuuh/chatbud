class DummyPluginUI {

    shadowRoot;

    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
        this.initialize();
    }

    initialize() {
        console.log('dummy');
    }
}

module.exports = DummyPluginUI;