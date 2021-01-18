class CommandsManagerPluginUI {
    _window: any = window;

    commands: any[];
    commandManagementHelper: any;
    toastList: any[];
    temporaryCommand: any;

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

    private _prepareModalCommand = async (documentId: string) => {
        var commandEditModal = document.getElementById('commandEditModal');
        this.temporaryCommand = this.commandManagementHelper.getEmptyCommand(documentId);
        var modalTitle = commandEditModal.querySelector('.modal-title');

        if (documentId) {
            modalTitle.textContent = 'Update command';
            this.commands.forEach((item: any) => {
                if (item.getDocumentId() == documentId) {
                    this.temporaryCommand.setDocumentId(item.getDocumentId());
                    this.temporaryCommand.setCommand(item.getCommand());
                    this.temporaryCommand.setActions(item.getActions());
                    this.temporaryCommand.setConditions(item.getConditions());
                    this.temporaryCommand.setFields(item.getFields());
                    this.temporaryCommand.setDescription(item.getDescription());
                    this.temporaryCommand.setIsActive(item.isActive());
                }
            });
        } else {
            modalTitle.textContent = 'Create command';
        }

        let pluginCommands = await this._loadAllPluginCommands();

        this._fillModalData(pluginCommands);
    }

    private _loadAllPluginCommands = async (): Promise<any[]> => {
        return this.commandManagementHelper.getPluginCommands();
    }

    private _fillModalData = (pluginCommands: any): void => {
        var commandEditModal = document.getElementById('commandEditModal');
        let loadData = this.loadData;

        // Fill command input
        var modalInputCommand = <HTMLInputElement>commandEditModal.querySelector('.modal-body input#command-command');
        modalInputCommand.value = this.temporaryCommand.getCommand();

        // Clear custom fields section
        let el = commandEditModal.querySelector('.modal-body #custom-fields-section');
        let elClone = el.cloneNode(false);
        el.parentNode.replaceChild(elClone, el);

        // Conditions
        this._prepareModalSelectConditions(commandEditModal, pluginCommands);


        el = commandEditModal.querySelector('.modal-footer #modal-button-save');
        elClone = el.cloneNode(true);
        el.parentNode.replaceChild(elClone, el);

        // Save action
        var modalButtonSave = <HTMLButtonElement>commandEditModal.querySelector('.modal-footer #modal-button-save');

        modalButtonSave.addEventListener('click', async () => {
            // Command
            this.temporaryCommand.setCommand(modalInputCommand.value);

            // Custom Fields
            let customFields = commandEditModal.querySelectorAll(`#custom-fields-section [id$='wrapper']`);
            let customFieldList = [];
            customFields.forEach((customField) => {
                let field = <HTMLInputElement>customField.childNodes.item(1);

                let pluginId = field.getAttribute('data-bs-plugin-id');
                let fieldId = field.getAttribute('data-bs-field-id');


                let createdField = this.temporaryCommand.createNewField(fieldId, pluginId, field.value);
                customFieldList.push(createdField);
            });
            this.temporaryCommand.setFields(customFieldList);


            await this.commandManagementHelper.updateCommand(this.temporaryCommand);
            loadData();
        });
    }

    private conditionCheckboxClicked = (input: HTMLInputElement, condition: any, plugin: any): void => {
        if (input.checked) {

            // TODO: check if condition is already used
            let newDatabaseCondition = this.temporaryCommand.createNewCondition(condition.id, plugin.plugin)
            this.temporaryCommand.addCondition(newDatabaseCondition);

            if (condition.fieldId) {
                this._addCustomFieldWrapper(condition, plugin);
            }
        } else {
            // check if condition is still needed
            let newDatabaseCondition = this.temporaryCommand.createNewCondition(condition.id, plugin.plugin)
            this.temporaryCommand.removeCondition(newDatabaseCondition);

            if (condition.fieldId) {
                // TODO: check if field still needed

                let customFieldId = `custom-input-${plugin.plugin}-${condition.fieldId}`;
                this.removeCustomField(customFieldId);
            }
        }
    }

    private _addCustomFieldWrapper = (condition: any, pluginCommand: any): void => {
        let customField = pluginCommand.command.fields.find(field => field.id === condition.fieldId);
        let customFieldId = `custom-input-${pluginCommand.plugin}-${condition.fieldId}`;
        var customFieldWrapper = document.querySelector(`.modal-body #${customFieldId}-wrapper`);
        var savedField = this.temporaryCommand.getFields().find((field) => field.getId() === condition.fieldId && field.getPluginId() === pluginCommand.plugin);
        let fieldValue = savedField ? savedField.getValue() : '';
        if (!customFieldWrapper) {
            this.addCustomField(customFieldId, customField.type, customField.label, fieldValue, pluginCommand.plugin, condition.fieldId, customField.description);
        }
    }

    private removeCustomField = (id: string): void => {
        var customFieldWrapper = document.querySelector(`.modal-body #custom-fields-section #${id}-wrapper`);
        customFieldWrapper.remove();
    }

    private addCustomField = (id: string, type: string, label: string, value: any, pluginId: string, fieldId: string, description?: string): void => {
        let customFieldWrapper = document.createElement('div');
        customFieldWrapper.id = `${id}-wrapper`;

        let customLableElement = document.createElement('label');
        customLableElement.setAttribute("for", id);
        customLableElement.classList.add("col-form-label");
        customLableElement.innerText = label;

        customFieldWrapper.appendChild(customLableElement);

        let customInputElement = document.createElement('input');
        customInputElement.type = type;
        customInputElement.classList.add('form-control');
        customInputElement.id = id;
        customInputElement.value = value;

        customInputElement.setAttribute('data-bs-plugin-id', pluginId);
        customInputElement.setAttribute('data-bs-field-id', fieldId);

        customFieldWrapper.appendChild(customInputElement);

        var customFieldsSections = document.querySelector(`.modal-body #custom-fields-section`);
        customFieldsSections.appendChild(customFieldWrapper);
    }

    private _prepareModalSelectConditions = (commandEditModal: any, pluginCommands: any): void => {
        let conditionsList = commandEditModal.querySelector('.modal-body #accordionConditionsActions .list-group');

        // clear condition list
        conditionsList.innerHTML = '';

        pluginCommands.forEach(pluginCommand => {
            if (pluginCommand.command && pluginCommand.command.conditions) {
                pluginCommand.command.conditions.forEach(condition => {
                    this.addConditionToConditionsList(condition, conditionsList, pluginCommand);
                });
            }
        });
    }

    private addConditionToConditionsList = (condition: any, conditionsList: any, pluginCommand: any): void => {

        let conditionListElement = document.createElement('li');
        conditionListElement.classList.add('list-group-item');

        let conditionAlreadyExists = !!this.temporaryCommand.getConditions().find(condition => (condition.getId() === condition.id && condition.getPluginId() === pluginCommand.plugin));

        let conditionListElementInput = document.createElement('input');
        conditionListElementInput.classList.add('form-check-input');
        conditionListElementInput.type = 'checkbox';
        conditionListElementInput.id = `${pluginCommand.plugin}-${condition.id}`;
        conditionListElementInput.checked = conditionAlreadyExists;
        conditionListElementInput.onclick = () => {
            this.conditionCheckboxClicked(conditionListElementInput, condition, pluginCommand);
        };

        let conditionListElementText = document.createElement('span');
        conditionListElementText.innerHTML = `&nbsp;${condition.name} (${pluginCommand.plugin})`;

        conditionListElement.appendChild(conditionListElementInput);
        conditionListElement.appendChild(conditionListElementText);
        conditionsList.appendChild(conditionListElement);

        // add field
        if (condition.fieldId && !!this.temporaryCommand.getFields().find((field) => field.getId() === condition.fieldId && field.getPluginId() === pluginCommand.plugin)) {
            this._addCustomFieldWrapper(condition, pluginCommand);
        }
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