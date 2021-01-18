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
        await this.loadCommands();

        //console.log(this._window.bootstrap);
        document.getElementById('refresh-button').addEventListener('click', this.loadData);
    }

    loadCommands = async (): Promise<void> => {
        await this.loadData();
        this._addEditModalListener();
    }

    loadData = async (): Promise<void> => {
        this.commands = await this.commandManagementHelper.getAllCommands();
        this.populateTable();
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

        let pluginCommands = this._loadAllPluginCommands();

        this._fillModalData(command, pluginCommands);
    }

    private _loadAllPluginCommands = (): any[] => {
        return this.commandManagementHelper.getPluginCommands();
    }

    private _fillModalData = (command: any, pluginCommands: any): void => {

        var commandEditModal = document.getElementById('commandEditModal');
        let loadCommands = this.loadCommands;

        // Fill command input
        var modalInputCommand = <HTMLInputElement>commandEditModal.querySelector('.modal-body input#command-command');
        modalInputCommand.value = command.getCommand();

        // Conditions
        this._prepareModalSelectConditions(commandEditModal, pluginCommands);


        let el = commandEditModal.querySelector('.modal-footer #modal-button-save'), elClone = el.cloneNode(true);
        el.parentNode.replaceChild(elClone, el);

        // Save action
        var modalButtonSave = <HTMLButtonElement>commandEditModal.querySelector('.modal-footer #modal-button-save');

        modalButtonSave.addEventListener('click', async () => {
            command.setCommand(modalInputCommand.value);
            await this.commandManagementHelper.updateCommand(command);
            loadCommands();
        });
    }

    private _prepareModalSelectConditions = (commandEditModal: any, pluginCommands: any): void => {
        let el = commandEditModal.querySelector('.modal-body #button-add-condition'), elClone = el.cloneNode(true);
        el.parentNode.replaceChild(elClone, el);

        var modalButtonAddCondition = <HTMLButtonElement>commandEditModal.querySelector('.modal-body #button-add-condition');

        var modalSelectCondition = <HTMLSelectElement>commandEditModal.querySelector('.modal-body #select-condition');

        pluginCommands.forEach(pluginCommand => {
            if (pluginCommand.command && pluginCommand.command.conditions) {
                pluginCommand.command.conditions.forEach(condition => {
                    let conditionOption = document.createElement('option');
                    conditionOption.value = `${pluginCommand.plugin}-${condition.id}`;
                    conditionOption.text = condition.name;
                    modalSelectCondition.options.add(conditionOption);
                });
            }
        });

        modalButtonAddCondition.addEventListener('click', function () {
            if (modalSelectCondition.options[modalSelectCondition.selectedIndex]) {
                // <li class="list-group-item">Cras justo odio</li>
                let conditionsList = commandEditModal.querySelector('.modal-body #conditions-list');
                let conditionListElement = document.createElement('li');
                conditionListElement.classList.add('list-group-item');
                conditionListElement.innerText = modalSelectCondition.options[modalSelectCondition.selectedIndex].value;
                conditionsList.appendChild(conditionListElement);
                modalSelectCondition.options.remove(modalSelectCondition.selectedIndex);

                // check if and add related fields to UI in plugin section

                /* 
                    <ul class="list-group">
                        <li class="list-group-item">
                            <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                            Cras justo odio
                        </li>
                        <li class="list-group-item">
                            <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                            Dapibus ac facilisis in
                        </li>
                        <li class="list-group-item">
                            <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                            Morbi leo risus
                        </li>
                        <li class="list-group-item">
                            <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                            Porta ac consectetur ac
                        </li>
                        <li class="list-group-item">
                            <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                            Vestibulum at eros
                        </li>
                    </ul>
                */
            }
        });
    }

    deleteCommand = async (documentId: string) => {
        await this.commandManagementHelper.deleteCommand(documentId);
        this.loadCommands();
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