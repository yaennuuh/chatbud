class CoreSettingsPageUI {
    configuration: any;

    constructor(private coreHelper) {
        this.initialize();
    }

    initialize() {
        // Load data
        this.configuration = this.coreHelper.loadData();

        if (!this.configuration) {
            this.configuration = {};
        }

        // Replace node to get rid of listeners
        var el = document.getElementById('settings-save-button'), elClone = el.cloneNode(true);
        el.parentNode.replaceChild(elClone, el);

        // Fill input and add listeners
        if (this.configuration && this.configuration['resources-path']) {
            (<HTMLInputElement>document.getElementById('input-resources-path')).value = this.configuration['resources-path'];
        }

        document.getElementById('settings-save-button').addEventListener('click', () => {
            this.configuration['resources-path'] = (<HTMLInputElement>document.getElementById('input-resources-path')).value;
            this.coreHelper.saveData(this.configuration);
        });
    }
}

module.exports = CoreSettingsPageUI;