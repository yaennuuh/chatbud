class CommandsManagerPluginUI {
    _window: any = window;

    commands: any[];
    commandManagementHelper: any;
    toastList: any[];

    constructor(private pluginHelper: any) {
        this.commandManagementHelper = this.pluginHelper.getCommandManagementHelper();
        this.commands = [];
        this.init();
    }
    init = async (): Promise<void> => {
        await this.loadData();

        //console.log(this._window.bootstrap);
        document.getElementById('refresh-button').addEventListener('click', this.loadData);
    }

    loadData = async (): Promise<void> => {
        this.commands = await this.commandManagementHelper.getAllCommands();
        this.populateTable();
        this._addEditModalListener();
    }

    private _addEditModalListener = (): void => {
        var commandEditModal = document.getElementById('commandEditModal');
        let _prepareModalCommand = this._prepareModalCommand;

        commandEditModal.addEventListener('show.bs.modal', function (event: any) {
            const button = event.relatedTarget;
            const documentId = button.getAttribute('data-bs-command');
            _prepareModalCommand(documentId);
        })
    }

    private _prepareModalCommand = (documentId: string) => {
        var commandEditModal = document.getElementById('commandEditModal');
        let command: any = this.commandManagementHelper.getEmptyCommand(documentId);
        var modalTitle = commandEditModal.querySelector('.modal-title');

        if (documentId) {
            modalTitle.textContent = 'Update command';
            this.commands.forEach((item: any) => {
                if (item.getDocumentId() == documentId) {
                    command.setDocumentId(item.getDocumentId());
                    command.setCommand(item.getCommand());
                    command.setActions(item.getActions());
                    command.setConditions(item.getConditions());
                    command.setDescription(item.getDescription());
                    command.setIsActive(item.isActive());
                }
            });
        } else {
            modalTitle.textContent = 'Create command';
        }

        this._fillModalData(command);
    }

    private _fillModalData = (command: any): void => {

        var commandEditModal = document.getElementById('commandEditModal');
        let loadData = this.loadData;

        // Fill command input
        var modalInputCommand = <HTMLInputElement>commandEditModal.querySelector('.modal-body input#command-command');
        modalInputCommand.value = command.getCommand();

        let el = commandEditModal.querySelector('.modal-footer #modal-button-save'), elClone = el.cloneNode(true);
        el.parentNode.replaceChild(elClone, el);

        // Save action
        var modalButtonSave = <HTMLButtonElement>commandEditModal.querySelector('.modal-footer #modal-button-save');

        modalButtonSave.addEventListener('click', async () => {
            command.setCommand(modalInputCommand.value);
            await this.commandManagementHelper.updateCommand(command);
            loadData();
        });
    }

    deleteCommand = async (documentId: string) => {
        await this.commandManagementHelper.deleteCommand(documentId);
        this.loadData();
    }

    populateTable = () => {
        const table = <HTMLTableElement>document.getElementById("commands-table-body");
        table.innerHTML = '';
        this.commands.forEach(item => {
            let row = table.insertRow();

            let command = row.insertCell(0);
            command.innerText = item.getCommand();

            let conditions = row.insertCell(1);

            if (item.getConditions()) {
                conditions.innerText = item.getConditions().length.toString();
            }

            let actions = row.insertCell(2);

            if (item.getActions()) {
                actions.innerText = item.getActions().length.toString();
            }

            let description = row.insertCell(3);
            description.innerText = item.getDescription();

            let isActive = row.insertCell(4);
            isActive.innerHTML = item.isActive() + '';

            let settings = row.insertCell(5);

            // Edit button
            let editCommandButton = document.createElement("button");
            editCommandButton.type = "button";
            editCommandButton.classList.add("btn");
            editCommandButton.classList.add("btn-primary");

            let editCommandToggleAttribute = document.createAttribute('data-bs-toggle');
            editCommandToggleAttribute.value = 'modal';

            let editCommandTargetAttribute = document.createAttribute('data-bs-target');
            editCommandTargetAttribute.value = '#commandEditModal';

            let editCommandCommandAttribute = document.createAttribute('data-bs-command');
            editCommandCommandAttribute.value = item.getDocumentId();

            editCommandButton.setAttributeNode(editCommandToggleAttribute);
            editCommandButton.setAttributeNode(editCommandTargetAttribute);
            editCommandButton.setAttributeNode(editCommandCommandAttribute);

            let editIcon = document.createElement("i");
            editIcon.classList.add('bi');
            editIcon.classList.add('bi-pencil');

            editCommandButton.appendChild(editIcon);

            settings.appendChild(editCommandButton);

            // Delete button
            let deleteCommandButton = document.createElement("button");
            deleteCommandButton.type = "button";
            deleteCommandButton.classList.add("btn");
            deleteCommandButton.classList.add("btn-danger");

            let deleteIcon = document.createElement("i");
            deleteIcon.classList.add('bi');
            deleteIcon.classList.add('bi-trash');

            deleteCommandButton.addEventListener('click', () => {
                this.deleteCommand(item.getDocumentId())
            });

            deleteCommandButton.appendChild(deleteIcon);

            settings.appendChild(deleteCommandButton);
        });
    }
}

module.exports = CommandsManagerPluginUI;