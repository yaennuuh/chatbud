class TwitchConnectorUI {

    data;
    api;

    constructor(private connectorHelper) {
        this.initialize();
    }

    initialize = (): void => {
        this.data = this.connectorHelper.loadData();
        if(!this.data) {
            this.data = {
                autoConnect: false
            };
        }
        this.api = this.connectorHelper.getOwnConnectorApi();
        
        this.prepareListeners();
        this.prepareUIConnectedButtons();
        if (this.isConnected()) {
            this.loadStreamerInformations();
        }
    }

    prepareListeners = (): void => {
        document.getElementById("disconnectButton").addEventListener("click", this.disconnect);
        document.getElementById("connectButton").addEventListener("click", this.connect);
    }

    loadStreamerInformations = async (): Promise<void> => {
        let channel = await this.api.getMyChannel();
        this.showUserInformation(channel);
    }

    showUserInformation = async (channel: any): Promise<void> => {
        const broadcaster = await channel.getBroadcaster();
        const game = await channel.getGame();
        const follows = await this.api.getTotalFollows(broadcaster.id);
        document.getElementById("userinformation").style.display = "block";
        (<HTMLImageElement>document.getElementById("user-information-logo")).src = broadcaster.profilePictureUrl;
        document.getElementById("user-information-name").innerHTML = broadcaster.displayName;
        document.getElementById("user-information-description").innerHTML = broadcaster.description;
        document.getElementById("user-information-followers").innerHTML = follows;
        document.getElementById("user-information-views").innerHTML = broadcaster.views;
        document.getElementById("user-information-broadcaster-type").innerHTML = broadcaster.broadcasterType;
        console.log(JSON.stringify(game));
    }

    hideUserInformation = (): void => {
        document.getElementById("userinformation").style.display = "none";
    }

    connectedStateChanged = (): void => {
        this.data['autoConnect'] = this.isConnected();
        this.connectorHelper.saveData(this.data);
        this.prepareUIConnectedButtons();
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

    isConnected = (): boolean => {
        return this.api.isConnected();
    }

    connect = async (): Promise<void> => {
        await this.api.connect();
        this.loadStreamerInformations();
        this.connectedStateChanged();
    }

    disconnect = (): void => {
        this.api.disconnect();
        this.hideUserInformation();
        this.connectedStateChanged();
    }
}

module.exports = TwitchConnectorUI;