class DummyPluginUI {

    constructor(private pluginHelper) {
        this.initialize();
    }

    initialize() {
        let api = this.pluginHelper.getOwnPluginApi();
        document.getElementById("dummy").innerHTML = api.getDummy();
    }
}

module.exports = DummyPluginUI;