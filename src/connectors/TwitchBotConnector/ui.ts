class TwitchBotConnectorUI {

    data;
    api;

    constructor(private shadowRoot, private connectorHelper) {
        this.initialize();
    }

    initialize = (): void => {
        this.data = this.connectorHelper.loadData();
        this.api = this.connectorHelper.getOwnConnectorApi();
        this.prepareListeners();
        this.fillUIForm();
        this.prepareUIForm();
        this.prepareUIConnectedButtons();
    }

    prepareListeners = (): void => {
        this.shadowRoot.getElementById('twitchbotform').addEventListener('submit', this.saveToFile);
        this.shadowRoot.getElementById("disconnectButton").addEventListener("click", this.disconnect);
        this.shadowRoot.getElementById("connectButton").addEventListener("click", this.connect);
    }

    prepareUIForm = (): void => {
        const formElement = this.shadowRoot.getElementById('twitchbotform');
        const isConnected = this.isConnected();

        var elements = formElement.elements;
        for (var i = 0, len = elements.length; i < len; ++i) {
            elements[i].readOnly = isConnected;
            if (elements[i].type == 'submit') {
                if (isConnected) {
                    elements[i].setAttribute("disabled", "true");
                } else {
                    elements[i].removeAttribute("disabled");
                }
            }
        }
    }

    fillUIForm = (): void => {
        this.shadowRoot.getElementById("twitchbotUsername").value = this.data['username'];
        this.shadowRoot.getElementById("twitchbotAuthKey").value = this.data['authkey'];
        this.shadowRoot.getElementById("twitchbotChannel").value = this.data['channel'];
    }

    connectedStateChanged = (): void => {
        this.data['autoConnect'] = this.isConnected();
        this.connectorHelper.saveData(this.data);
        this.prepareUIConnectedButtons();
        this.prepareUIForm();
    }

    prepareUIConnectedButtons = (): void => {
        if (this.isConnected()) {
            this.shadowRoot.getElementById("disconnectButton").removeAttribute("disabled");
            this.shadowRoot.getElementById("connectButton").setAttribute("disabled", "true");
        } else {
            this.shadowRoot.getElementById("connectButton").removeAttribute("disabled");
            this.shadowRoot.getElementById("disconnectButton").setAttribute("disabled", "true");
        }
    }

    saveToFile = (event: any): void => {
        this.data['username'] = this.shadowRoot.getElementById("twitchbotUsername").value;
        this.data['authkey'] = this.shadowRoot.getElementById("twitchbotAuthKey").value;
        this.data['channel'] = this.shadowRoot.getElementById("twitchbotChannel").value;

        this.connectorHelper.saveData(this.data);
        event.preventDefault();
    }

    isConnected = (): boolean => {
        return this.api.isConnected();
    }

    connect = (): void => {
        this.api.connect();
        this.connectedStateChanged();
    }

    disconnect = (): void => {
        this.api.disconnect();
        this.connectedStateChanged();
    }
}

module.exports = TwitchBotConnectorUI;