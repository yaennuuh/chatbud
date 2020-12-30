class DummyPluginUI {

    shadowRoot;
    pluginHelper;

    constructor(shadowRoot, pluginHelper) {
        this.shadowRoot = shadowRoot;
        this.pluginHelper = pluginHelper;
        this.initialize();
    }

    initialize() {
        console.log(this.pluginHelper.loadData());
    }
}

module.exports = DummyPluginUI;