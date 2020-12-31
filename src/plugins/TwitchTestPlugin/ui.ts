class TwitchTestPluginUI {

    shadowRoot;
    pluginHelper;
    isOn = false;

    constructor(shadowRoot, pluginHelper) {
        this.shadowRoot = shadowRoot;
        this.pluginHelper = pluginHelper;
        this.initialize();
    }

    initialize() {
        var button = this.shadowRoot.getElementById('toggleButton');
        button.addEventListener('click', () => {
            this.isOn = !this.isOn;
            this.shadowRoot.getElementById('toggleState').innerHTML = this.isOn;
        });

        var sendButton = this.shadowRoot.getElementById('sendbutton');
        sendButton.addEventListener('click', () => {
            let api = this.pluginHelper.getOwnPluginApi();
            api.sendMessageToChatAsBot(this.shadowRoot.getElementById('twitchmessage').value);
        });
    }
}

module.exports = TwitchTestPluginUI;