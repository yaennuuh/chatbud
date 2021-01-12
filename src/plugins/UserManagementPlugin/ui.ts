class UserManagementPluginUI {
    data: any;

    constructor(private pluginHelper) {
        this.data = this.pluginHelper.loadData();
    }
}

module.exports = UserManagementPluginUI;