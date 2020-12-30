class TwitchTestPluginUI {

    shadowRoot;
    isOn = false;

    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
        this.initialize();
    }

    initialize() {
        var button = this.shadowRoot.getElementById('toggleButton');
        button.addEventListener('click', () => {
            this.isOn = !this.isOn;
            this.shadowRoot.getElementById('toggleState').innerHTML = this.isOn;
        });
    }
}

module.exports = TwitchTestPluginUI;