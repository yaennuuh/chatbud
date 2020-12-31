class TwitchTestPluginUI {
    isOn = false;

    constructor(private pluginHelper) {
        this.initialize();
    }

    initialize() {
        var button = document.getElementById('toggleButton');
        button.addEventListener('click', () => {
            this.isOn = !this.isOn;
            document.getElementById('toggleState').innerHTML = this.isOn + '';
        });

        var sendButton = document.getElementById('sendbutton');
        sendButton.addEventListener('click', () => {
            let api = this.pluginHelper.getOwnPluginApi();
            api.sendMessageToChatAsBot((<HTMLInputElement>document.getElementById('twitchmessage')).value);
        });
    }
}

module.exports = TwitchTestPluginUI;