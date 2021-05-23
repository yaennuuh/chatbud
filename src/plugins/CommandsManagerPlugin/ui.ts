import { CommandType } from "../../core/utils/entities/CommandTypeEnum";
import * as _ from 'lodash';

class CommandsManagerPluginUI {

    private _commandManagementHelper: any;
    private _currentCommand: any;
    private _availablePluginCommands: any[];
    private window: any = window;

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

        commands.forEach((command) => {
            let row = table.insertRow();
            this._addRowToTable(row, command);
        });
    }

    private _getEmptyCommandsTable = (): HTMLTableElement => {
        const table = <HTMLTableElement>document.getElementById("commands-table-body");
        table.innerHTML = '';
        return table;
    }

    private _addRowToTable = (row: any, command: any): void => {

        // Show if command is active
        const isCommandActive = row.insertCell();
        isCommandActive.innerHTML = command.isActive() ? `<i class="bi bi-eye-fill"></i>` : `<i class="bi bi-eye-slash-fill"></i>`;

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

        // Show command type
        const commandType = row.insertCell();
        commandType.innerHTML = CommandType[command.getCommandType()];

        // Show settings
        const settings = row.insertCell();
        settings.appendChild(this._htmlToElement(`<button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#commandEditModal" data-bs-document-id="${command.getDocumentId()}"><i class="bi bi-pencil"></i></button>`));

        // Delete button
        const deleteButton = this._htmlToElement(`<button class="ml-3 btn btn-danger btn-sm"><i class="bi bi-trash"></i></button>`);
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

    private _populateCommandEditModal = async (): Promise<void> => {
        const commandEditModal: any = document.getElementById('commandEditModal');
        const modalTitle = commandEditModal.querySelector('.modal-title');

        modalTitle.textContent = this._currentCommand.getDocumentId() ? 'Update command' : 'Create command';

        commandEditModal.querySelector('#formError').innerText = '';

        const inputActive = <HTMLInputElement>commandEditModal.querySelector('.modal-body input#command-active');
        inputActive.checked = this._currentCommand.isActive();

        const inputCommandType = <HTMLSelectElement>commandEditModal.querySelector('.modal-body select#command-type');
        inputCommandType.innerHTML = '';
        _.each(CommandType, (value, key) => {
            let commandTypeOption = document.createElement('option');
            commandTypeOption.text = value;
            commandTypeOption.value = key;
            if (key === this._currentCommand.getCommandType()) {
                commandTypeOption.selected = true;
            }
            inputCommandType.add(commandTypeOption);
        });

        let inputCommand = undefined;

        inputCommand = await this._populateCommandCommandField(inputCommandType.selectedOptions[0].text);

        inputCommandType.addEventListener('change', async (event: any) => {
            inputCommand = await this._populateCommandCommandField(inputCommandType.selectedOptions[0].text);
        });

        this._clearCustomFieldsSection();

        this._populateActionsList();

        this._populateConditionsList();

        const el = commandEditModal.querySelector('.modal-footer #modal-button-save');
        const elClone = el.cloneNode(true);
        el.parentNode.replaceChild(elClone, el);

        // Save
        const modalButtonSave = <HTMLButtonElement>commandEditModal.querySelector('.modal-footer #modal-button-save');

        modalButtonSave.addEventListener('click', async () => {

            // check if fields are set
            const form = <HTMLFormElement>commandEditModal.querySelector('#commands-manager-form');
            if (form.checkValidity()) {
                // Command
                this._currentCommand.setCommand(inputCommand ? inputCommand.value: inputCommandType.selectedOptions[0].text);

                // Active
                this._currentCommand.setIsActive(inputActive.checked);

                // Type
                this._currentCommand.setCommandType(inputCommandType.value);

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
                this.window.jQuery('#commandEditModal').modal('hide');
            } else {
                commandEditModal.querySelector('#formError').innerText = 'Es wurden nicht alle Felder korrekt ausgefüllt!';
            }
        });
    }

    private _clearCustomFieldsSection = (): void => {
        document.querySelector('.modal-body #custom-fields-section').innerHTML = '';
    }

    private _clearCommandTypeCommandSection = (): void => {
        document.querySelector('.modal-body #command-type-command-section').innerHTML = '';
    }

    private _populateCommandCommandField = async (commandType: string): Promise<void> => {
        this._clearCommandTypeCommandSection();
        let inputCommand;
        let commandTypeCommandSection = <HTMLElement> document.querySelector('.modal-body #command-type-command-section');

        let labelField = document.createElement('label');
        labelField.setAttribute('for', 'command-command');
        labelField.setAttribute('class', 'col-form-label');
        
        switch (commandType) {
            case CommandType.COMMAND:
                labelField.innerHTML = CommandType.COMMAND;
                inputCommand = <HTMLInputElement> document.createElement('input');
                inputCommand.setAttribute('type', 'text');
                inputCommand.setAttribute('class', 'form-control');
                inputCommand.setAttribute('id', 'command-command');
                inputCommand.required = true;
                if (this._currentCommand.getCommandType() === 'COMMAND') {
                    inputCommand.value = this._currentCommand.getCommand();
                }
                break;
            case CommandType.CHANNEL_POINT:
                labelField.innerHTML = CommandType.CHANNEL_POINT;
                inputCommand = <HTMLSelectElement> document.createElement('select');
                inputCommand.setAttribute('class', 'form-select');
                inputCommand.required = true;
                const twitchConnectorApi = this.pluginHelper.getConnectorApiByName('TwitchConnector');
                const channelPointsRewards = await twitchConnectorApi.getChannelPointsRewards();
                _.each(channelPointsRewards, (channelPoint) => {
                    let channelPointOption = document.createElement('option');
                    channelPointOption.text = channelPoint;
                    channelPointOption.value = channelPoint;
                    if (this._currentCommand.getCommandType() === 'CHANNEL_POINT' && channelPoint === this._currentCommand.getCommand()) {
                        channelPointOption.selected = true;
                    }
                    inputCommand.add(channelPointOption);
                });
                break;
        }

        if (inputCommand != undefined) {
            commandTypeCommandSection.appendChild(labelField);
            commandTypeCommandSection.appendChild(inputCommand);
        }
        return inputCommand;
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
        const newDatabaseCondition = this._currentCommand.createNewCondition(condition.id, pluginCommand.plugin, condition.functionName, condition.fieldId);
        if (checkboxElement.checked) {

            this._currentCommand.addCondition(newDatabaseCondition);

            if (condition.fieldId) {
                this._addCustomFieldWrapperIfNotExists(condition.fieldId, pluginCommand);
            }
        } else {
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
        const newDatabaseAction = this._currentCommand.createNewAction(action.id, pluginCommand.plugin, action.functionName, action.fieldId, action.requiredConditions);
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
                this._addCustomFieldIfNotExists(customField, fieldValue, pluginCommand.plugin, fieldId);
            }
        }
    }

    private _addCustomFieldIfNotExists = async (customField: any, value: any, pluginId: string, fieldId: string): Promise<void> => {
        // TODO: add description as hover?
        const customFieldsSections = document.querySelector(`.modal-body #custom-fields-section`);
        let customFieldId = `custom-input-${pluginId}-${fieldId}`;
        let fieldToAdd;
        
        switch (customField.type) {
            case 'text':
                fieldToAdd = this._htmlToElement(`
                    <div id="${customFieldId}-wrapper" class="col-6">
                        <label for="${customFieldId}" class="col-form-label">${customField.label}</label>
                        <input id="${customFieldId}" class="form-control" type="text" value="${value}" data-bs-plugin-id="${pluginId}" data-bs-field-id="${fieldId}" required>
                    </div>
                `);
                break;
            case 'selectbox':
                let selectboxHTML = `<div id="${customFieldId}-wrapper" class="col-6">
                <label for="${customFieldId}" class="col-form-label">${customField.label}</label>
                <select id="${customFieldId}" class="form-select" aria-label="${customField.label}" data-bs-plugin-id="${pluginId}" data-bs-field-id="${fieldId}" required>`;
                
                const pluginApi = this.pluginHelper.pluginApiByName(pluginId);
                const selectboxData = await pluginApi[customField.dataFunction]();
                selectboxData.forEach(data => {
                    selectboxHTML += `<option value="${data}"`;
                    if (value && data === value) {
                        selectboxHTML += ` selected`;
                    }
                    selectboxHTML += `>${data}</option>`;
                });
                
                selectboxHTML += `</select></div>`;
                fieldToAdd = this._htmlToElement(selectboxHTML);
                break;
        }

        customFieldsSections.appendChild(fieldToAdd);
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
            if (action.getPluginId() === pluginId && !!action.getRequiredConditions()) {
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
        if (!!action.requiredConditions) {
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
    }

    private _addAndDisableCondition = (action: any, pluginCommand: any): void => {
        if (!!action.requiredConditions) {
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
}

module.exports = CommandsManagerPluginUI;