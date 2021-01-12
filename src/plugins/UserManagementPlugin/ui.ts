import { UserManagementHelper } from '../../core/utils/UserManagementHelper';
import { PluginHelper } from '../../core/plugins/PluginHelper';
import moment from 'moment';
class UserManagementPluginUI {
    data: PluginHelper;
    userManagementHelper: UserManagementHelper;

    constructor(private pluginHelper: PluginHelper) {
        this.data = this.pluginHelper.loadData();
        this.userManagementHelper = this.pluginHelper.getUserManagementHelper();
        this.fillListToView();

        document.getElementById('refresh-button').addEventListener('click', this.refresh);
    }

    refresh = (): void => {
        this.fillListToView();
    }

    fillListToView = async (): Promise<void> => {
        const commandsTableBody = document.getElementById('twitchuser-table-body');
        commandsTableBody.innerHTML = '';
        const twitchUsers = await this.userManagementHelper.getAllTwitchUsers()
        twitchUsers.forEach(twitchUser => {
            const trElement = document.createElement('tr');

            this.addTdElementToElement(trElement, twitchUser.getUserId());
            this.addTdElementToElement(trElement, twitchUser.getUsername());
            this.addTdElementToElement(trElement, moment(twitchUser.getFirstSeen()).format("dddd, MMMM Do YYYY, HH:mm:ss"));
            this.addTdElementToElement(trElement, moment(twitchUser.getLastSeen()).format("dddd, MMMM Do YYYY, HH:mm:ss"));

            commandsTableBody.appendChild(trElement);
        });
    }

    addTdElementToElement = (element: any, childContent: any): void => {
        const commandElement = document.createElement('td');
        commandElement.innerHTML = childContent;
        element.appendChild(commandElement);
    }
}

module.exports = UserManagementPluginUI;