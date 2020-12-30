class DummyPluginApi {

    private plugin: any;

    constructor(plugin) {
        this.plugin = plugin;
    }

    getDummy() {
        return this.plugin.getDummy();
    }
}

module.exports = DummyPluginApi;