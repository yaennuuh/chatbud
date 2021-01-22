class CommandsManagerPluginUI {

    private _commandManagementHelper: any;
    private _currentCommand: any;
    private _availablePluginCommands: any[];

    constructor(private pluginHelper: any) {
        this._commandManagementHelper = this.pluginHelper.getCommandManagementHelper();
        this._populateTable();
        this._initializeOneTimeListeners();
        this._loadAvailableCommandsFromPlugins();
    }

    /**
     * Table
     */
    private _populateTable = async (): Promise<void> => {
        let commands = await this._getCommands();
        const table = this._getEmptyCommandsTable();

        let rowCounter = 0;
        commands.forEach((command) => {
            let row = table.insertRow();
            this._addRowToTable(row, rowCounter++, command);
        });
    }

    private _getEmptyCommandsTable = (): HTMLTableElement => {
        const table = <HTMLTableElement>document.getElementById("commands-table-body");
        table.innerHTML = '';
        return table;
    }

    private _addRowToTable = (row: any, rowCounter: number, command: any): void => {
        // Command name
        const commandName = row.insertCell();
        commandName.innerText = command.getCommand();

        // Number of active conditions
        const numberOfActiveConditions = row.insertCell();
        numberOfActiveConditions.innerText = command.getConditions().length;

        // Number of active actions
        const numberOfActiveActions = row.insertCell();
        numberOfActiveActions.innerText = command.getActions().length;

        // Show command description
        const commandDescription = row.insertCell();
        commandDescription.innerText = command.getDescription();

        // Show if command is active
        const isCommandActive = row.insertCell();
        isCommandActive.innerText = command.isActive();

        // Show settings
        const settings = row.insertCell();
        settings.appendChild(this._htmlToElement(`<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#commandEditModal" data-bs-document-id="${command.getDocumentId()}"><i class="bi bi-pencil"></i></button>`));

        // Delete button
        const deleteButton = this._htmlToElement(`<button class="btn btn-danger"><i class="bi bi-trash"></i></button>`);
        deleteButton.addEventListener('click', () => { this._deleteCommand(command.getDocumentId()); });
        settings.appendChild(deleteButton);
    }

    /**
     * Modal
     */
    private _initializeModalShowListener = (): void => {
        const commandEditModal = document.getElementById('commandEditModal');
        const _loadCurrentCommand = this._loadCurrentCommand;
        const _populateCommandEditModal = this._populateCommandEditModal;

        commandEditModal.addEventListener('show.bs.modal', async (event: any) => {
            const button = event.relatedTarget;
            const documentId = button.getAttribute('data-bs-document-id');
            await _loadCurrentCommand(documentId);
            _populateCommandEditModal();
        });
    }

    private _populateCommandEditModal = (): void => {
        const commandEditModal = document.getElementById('commandEditModal');
        const modalTitle = commandEditModal.querySelector('.modal-title');

        modalTitle.textContent = this._currentCommand.getDocumentId() ? 'Update command' : 'Create command';

        const inputCommand = <HTMLInputElement>commandEditModal.querySelector('.modal-body input#command-command');
        inputCommand.value = this._currentCommand.getCommand();

        this._clearCustomFieldsSection();

        this._populateActionsList();

        this._populateConditionsList();

        const el = commandEditModal.querySelector('.modal-footer #modal-button-save');
        const elClone = el.cloneNode(true);
        el.parentNode.replaceChild(elClone, el);


        // TODO: make save nice
        // Save
        const modalButtonSave = <HTMLButtonElement>commandEditModal.querySelector('.modal-footer #modal-button-save');

        modalButtonSave.addEventListener('click', async () => {
            // Command
            this._currentCommand.setCommand(inputCommand.value);

            // Custom Fields
            const customFields = commandEditModal.querySelectorAll(`#custom-fields-section [id$='wrapper']`);
            const customFieldList = [];
            customFields.forEach((customField) => {
                const field = <HTMLInputElement>customField.childNodes.item(3);

                const pluginId = field.getAttribute('data-bs-plugin-id');
                const fieldId = field.getAttribute('data-bs-field-id');

                const createdField = this._currentCommand.createNewField(fieldId, pluginId, field.value);
                customFieldList.push(createdField);
            });
            this._currentCommand.setFields(customFieldList);


            await this._commandManagementHelper.updateCommand(this._currentCommand);
            this._populateTable();
        });
    }

    private _clearCustomFieldsSection = (): void => {
        document.querySelector('.modal-body #custom-fields-section').innerHTML = '';
    }

    /**
     * Modal conditions
     */
    private _populateConditionsList = (): void => {
        const commandEditModal = document.getElementById('commandEditModal');
        const conditionsList = commandEditModal.querySelector('.modal-body #collapseConditions .list-group');
        conditionsList.innerHTML = '';

        this._availablePluginCommands.forEach(pluginCommand => {
            if (pluginCommand.command && pluginCommand.command.conditions) {
                pluginCommand.command.conditions.forEach(condition => {
                    this._addConditionToConditionsList(condition, pluginCommand);
                });
            }
        });
    }

    private _addConditionToConditionsList = (condition: any, pluginCommand: any): void => {
        const commandEditModal = document.getElementById('commandEditModal');
        const conditionsList = commandEditModal.querySelector('.modal-body #collapseConditions .list-group');

        let conditionListElement = this._htmlToElement('<li class="list-group-item"></li>');

        let conditionAlreadyExists = this._checkIfConditionAlreadyExists(condition.id, pluginCommand.plugin);

        let hasActionRequiringCommand = this._hasActionRequiredConditionByConditionId(condition.id, pluginCommand.plugin);

        let conditionCheckbox = <HTMLInputElement>this._htmlToElement(`<input data-bs-id="${pluginCommand.plugin}-${condition.id}" class="form-check-input me-1" type="checkbox">`);
        conditionCheckbox.disabled = hasActionRequiringCommand;
        conditionCheckbox.checked = hasActionRequiringCommand || conditionAlreadyExists;
        conditionCheckbox.onclick = () => {
            this._conditionCheckboxClicked(conditionCheckbox, condition, pluginCommand);
        };

        conditionListElement.appendChild(conditionCheckbox);
        conditionListElement.appendChild(this._htmlToElement(`${condition.name} (${pluginCommand.plugin})`));
        conditionsList.appendChild(conditionListElement);

        if (condition.fieldId && conditionAlreadyExists) {
            this._addCustomFieldWrapperIfNotExists(condition.fieldId, pluginCommand);
        }
    }

    private _conditionCheckboxClicked = (checkboxElement: HTMLInputElement, condition: any, pluginCommand: any): void => {
        const newDatabaseCondition = this._currentCommand.createNewCondition(condition.id, pluginCommand.plugin);
        if (checkboxElement.checked) {

            this._currentCommand.addCondition(newDatabaseCondition);

            if (condition.fieldId) {
                this._addCustomFieldWrapperIfNotExists(condition.fieldId, pluginCommand);
            }
        } else {
            // TODO: check if condition is still needed (because of action)
            this._currentCommand.removeCondition(newDatabaseCondition);

            if (condition.fieldId && !this._isCustomFieldStillNeeded(pluginCommand, condition.fieldId)) {
                let customFieldId = `custom-input-${pluginCommand.plugin}-${condition.fieldId}`;
                this._removeCustomField(customFieldId);
            }
        }
    }

    /**
     * Modal actions
     */
    private _populateActionsList = (): void => {
        const commandEditModal = document.getElementById('commandEditModal');
        const actionsList = commandEditModal.querySelector('.modal-body #collapseActions .list-group');
        actionsList.innerHTML = '';

        this._availablePluginCommands.forEach(pluginCommand => {
            if (pluginCommand.command && pluginCommand.command.actions) {
                pluginCommand.command.actions.forEach(action => {
                    this._addActionToActionsList(action, pluginCommand);
                });
            }
        });
    }

    private _addActionToActionsList = (action: any, pluginCommand: any): void => {
        const commandEditModal = document.getElementById('commandEditModal');
        const actionsList = commandEditModal.querySelector('.modal-body #collapseActions .list-group');

        let actionListElement = this._htmlToElement('<li class="list-group-item"></li>');

        let actionAlreadyExists = this._checkIfActionAlreadyExists(action.id, pluginCommand.plugin);

        let actionCheckbox = <HTMLInputElement>this._htmlToElement(`<input data-bs-id="${pluginCommand.plugin}-${action.id}" class="form-check-input me-1" type="checkbox">`);
        actionCheckbox.checked = actionAlreadyExists;
        actionCheckbox.onclick = () => {
            this._actionCheckboxClicked(actionCheckbox, action, pluginCommand);
        };

        actionListElement.appendChild(actionCheckbox);
        actionListElement.appendChild(this._htmlToElement(`${action.name} (${pluginCommand.plugin})`));
        actionsList.appendChild(actionListElement);

        if (action.fieldId && actionAlreadyExists) {
            this._addCustomFieldWrapperIfNotExists(action.fieldId, pluginCommand);
        }
    }

    private _actionCheckboxClicked = (checkboxElement: HTMLInputElement, action: any, pluginCommand: any): void => {
        const newDatabaseAction = this._currentCommand.createNewAction(action.id, pluginCommand.plugin, action.requiredConditions);
        if (checkboxElement.checked) {

            this._currentCommand.addAction(newDatabaseAction);

            if (action.fieldId) {
                this._addCustomFieldWrapperIfNotExists(action.fieldId, pluginCommand);
            }

            if (action.requiredConditions) {
                this._addAndDisableCondition(action, pluginCommand);
            }
        } else {
            this._currentCommand.removeAction(newDatabaseAction);

            this._removeAndEnableCondition(action, pluginCommand);

            if (action.fieldId && !this._isCustomFieldStillNeeded(pluginCommand, action.fieldId)) {
                let customFieldId = `custom-input-${pluginCommand.plugin}-${action.fieldId}`;
                this._removeCustomField(customFieldId);
            }
        }
    }


    /**
     * Modal custom fields
     */
    private _removeCustomField = (id: string): void => {
        const customFieldWrapper = document.querySelector(`.modal-body #custom-fields-section #${id}-wrapper`);
        if (customFieldWrapper) {
            customFieldWrapper.remove();
        }
    }

    private _isCustomFieldStillNeeded = (pluginCommand: any, fieldId: string): boolean => {
        const commandActions = this._currentCommand.getActions();
        let customFieldNeeded = commandActions ? !!commandActions.find(action => (action.getPluginId() === pluginCommand.plugin && this._hasCustomFieldOnCommandAction(pluginCommand, action, fieldId))) : false;

        if (customFieldNeeded) {
            return true;
        }

        const commandConditions = this._currentCommand.getConditions();
        customFieldNeeded = commandConditions ? !!commandConditions.find(condition => (condition.getPluginId() === pluginCommand.plugin && this._hasCustomFieldOnCommandCondition(pluginCommand, condition, fieldId))) : false;

        return customFieldNeeded;
    }

    private _hasCustomFieldOnCommandAction = (pluginCommand: any, action: any, fieldId: string): boolean => {
        let pluginActions = pluginCommand.command.actions;
        let pluginAction = pluginActions ? pluginActions.find((pluginAction) => (pluginAction.id === action.getId() && pluginAction.fieldId === fieldId)) : undefined;
        return !!pluginAction;
    }

    private _hasCustomFieldOnCommandCondition = (pluginCommand: any, action: any, fieldId: string): boolean => {
        let pluginConditions = pluginCommand.command.conditions;
        let pluginCondition = pluginConditions ? pluginConditions.find((pluginCondition) => (pluginCondition.id === action.getId() && pluginCondition.fieldId === fieldId)) : undefined;
        return !!pluginCondition;
    }

    private _addCustomFieldWrapperIfNotExists = (fieldId: string, pluginCommand: any): void => {
        const customField = pluginCommand.command.fields.find(field => field.id === fieldId);

        if (customField) {
            const customFieldId = `custom-input-${pluginCommand.plugin}-${fieldId}`;
            const customFieldWrapper = document.querySelector(`.modal-body #${customFieldId}-wrapper`);

            if (!customFieldWrapper) {
                const savedField = this._currentCommand.getFields().find((field) => field.getId() === fieldId && field.getPluginId() === pluginCommand.plugin);
                const fieldValue = savedField ? savedField.getValue() : '';
                this._addCustomFieldIfNotExists(customFieldId, customField.type, customField.label, fieldValue, pluginCommand.plugin, fieldId, customField.description);
            }
        }
    }

    private _addCustomFieldIfNotExists = (id: string, type: string, label: string, value: any, pluginId: string, fieldId: string, description?: string): void => {
        // TODO: add description as hover?
        const customFieldsSections = document.querySelector(`.modal-body #custom-fields-section`);

        const customField = this._htmlToElement(`
            <div id="${id}-wrapper">
                <label for="${id}" class="col-form-label">${label}</label>
                <input id="${id}" class="form-control" type="${type}" value="${value}" data-bs-plugin-id="${pluginId}" data-bs-field-id="${fieldId}">
            </div>
        `);

        customFieldsSections.appendChild(customField);
    }

    /**
     * Commands
     */
    private _deleteCommand = async (documentId: any): Promise<void> => {
        await this._commandManagementHelper.deleteCommand(documentId);
        this._populateTable();
    }

    private _getCommands = async (): Promise<any[]> => {
        return await this._commandManagementHelper.getAllCommands();
    }

    private _loadAvailableCommandsFromPlugins = async (): Promise<void> => {
        this._availablePluginCommands = await this._commandManagementHelper.getPluginCommands();
    }

    /**
     * Utils
     */
    private _htmlToElement = (html: string): Node => {
        const template = document.createElement('template');
        html = html.trim();
        template.innerHTML = html;
        return template.content.firstChild;
    }

    private _initializeOneTimeListeners = (): void => {
        document.getElementById('refresh-button').addEventListener('click', this._populateTable);
        this._initializeModalShowListener();
    }

    private _loadCurrentCommand = async (documentId: string): Promise<void> => {
        this._currentCommand = documentId ? (await this._getCommands()).find((command) => command.getDocumentId() === documentId) : this._commandManagementHelper.getEmptyCommand();
        console.log(this._currentCommand);
    }

    private _checkIfConditionAlreadyExists = (conditionId: string, pluginId: string): boolean => {
        return !!this._currentCommand.getConditions().find(condition => (condition.getId() === conditionId && condition.getPluginId() === pluginId))
    }

    private _checkIfActionAlreadyExists = (actionId: string, pluginId: string): boolean => {
        return !!this._currentCommand.getActions().find(action => (action.getId() === actionId && action.getPluginId() === pluginId))
    }

    private _hasActionRequiredConditionByConditionId = (conditionId: string, pluginId: string): boolean => {
        let hasActionRequiringCommand = false;
        this._currentCommand.getActions().forEach(action => {
            if (action.getPluginId() === pluginId) {
                action.getRequiredConditions().forEach(requiredConditionId => {
                    if (conditionId === requiredConditionId) {
                        hasActionRequiringCommand = true;
                    }
                });
            }
        });
        return hasActionRequiringCommand;
    }

    private _removeAndEnableCondition = (action: any, pluginCommand: any): void => {
        action.requiredConditions.forEach(requiredConditionId => {
            let anyoneNeedsTheCondition = false;
            this._currentCommand.getActions().forEach(commandAction => {
                if (commandAction.getPluginId() === pluginCommand.plugin && commandAction.getId() != action.id && commandAction.getRequiredConditions().includes(requiredConditionId)) {
                    anyoneNeedsTheCondition = true;
                }
            });

            if (!anyoneNeedsTheCondition) {
                const conditionCheckBox = <HTMLInputElement>document.querySelector(`input[data-bs-id="${pluginCommand.plugin}-${requiredConditionId}"]`);
                conditionCheckBox.disabled = false;
                conditionCheckBox.click();
            }
        });
    }

    private _addAndDisableCondition = (action: any, pluginCommand: any): void => {
        action.requiredConditions.forEach(requiredConditionId => {
            const conditionCheckBox = <HTMLInputElement>document.querySelector(`input[data-bs-id="${pluginCommand.plugin}-${requiredConditionId}"]`);
            if (!conditionCheckBox.disabled) {
                if (!conditionCheckBox.checked) {
                    conditionCheckBox.click();
                }
                conditionCheckBox.disabled = true;
            }
        });
    }


}

module.exports = CommandsManagerPluginUI;