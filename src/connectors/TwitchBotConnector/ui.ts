class TwitchBotConnectorUI {

    data;
    api;

    constructor(private connectorHelper) {
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
        document.getElementById('twitchbotform').addEventListener('submit', this.saveToFile);
        document.getElementById("disconnectButton").addEventListener("click", this.disconnect);
        document.getElementById("connectButton").addEventListener("click", this.connect);
    }

    prepareUIForm = (): void => {
        const formElement: any = document.getElementById('twitchbotform');
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
        (<HTMLInputElement>document.getElementById("twitchbotUsername")).value = this.data['username'];
        (<HTMLInputElement>document.getElementById("twitchbotAuthKey")).value = this.data['authkey'];
        (<HTMLInputElement>document.getElementById("twitchbotChannel")).value = this.data['channel'];
    }

    connectedStateChanged = (): void => {
        this.data['autoConnect'] = this.isConnected();
        this.connectorHelper.saveData(this.data);
        this.prepareUIConnectedButtons();
        this.prepareUIForm();
    }

    prepareUIConnectedButtons = (): void => {
        if (this.isConnected()) {
            document.getElementById("disconnectButton").removeAttribute("disabled");
            document.getElementById("connectButton").setAttribute("disabled", "true");
        } else {
            document.getElementById("connectButton").removeAttribute("disabled");
            document.getElementById("disconnectButton").setAttribute("disabled", "true");
        }
    }

    saveToFile = (event: any): void => {
        this.data['username'] = (<HTMLInputElement>document.getElementById("twitchbotUsername")).value;
        this.data['authkey'] = (<HTMLInputElement>document.getElementById("twitchbotAuthKey")).value;
        this.data['channel'] = (<HTMLInputElement>document.getElementById("twitchbotChannel")).value;

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