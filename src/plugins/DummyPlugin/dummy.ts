class DummyPluginUI {

    shadowRoot;
    pluginHelper;

    constructor(shadowRoot, pluginHelper) {
        this.shadowRoot = shadowRoot;
        this.pluginHelper = pluginHelper;
        this.initialize();
    }

    initialize() {
        let api = this.pluginHelper.getOwnPluginApi();
        this.shadowRoot.getElementById("dummy").innerHTML = api.getDummy();
    }
}

module.exports = DummyPluginUI;