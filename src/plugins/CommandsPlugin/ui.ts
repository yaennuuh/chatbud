import { Event } from "electron/main";

class CommandsPluginUI {
    data: any;

    constructor(private pluginHelper) {
        console.log('commands plugin started');
        this.data = this.pluginHelper.loadData();
        this.commandEditModalListener();
        this.fillListToView();
    }

    fillListToView = (): void => {
        const commandsTableBody = document.getElementById('commands-table-body');
        commandsTableBody.innerHTML = '';
        this.data.commands.forEach(command => {
            const trElement = document.createElement('tr');

            const commandElement = document.createElement('th');
            commandElement.setAttribute('scope', 'row');
            commandElement.innerHTML = command.command;
            trElement.appendChild(commandElement);

            this.addTdElementToElement(trElement, command['response']);
            this.addTdElementToElement(trElement, command['cost']);
            this.addTdElementToElement(trElement, command['global-cooldown']);
            this.addTdElementToElement(trElement, command['user-cooldown']);
            this.addTdElementToElement(trElement, command['enabled']);

            const editButton = document.createElement('button');

            editButton.setAttribute('type', 'button');
            editButton.setAttribute('class', 'btn btn-primary');
            editButton.setAttribute('data-bs-toggle', 'modal');
            editButton.setAttribute('data-bs-target', '#commandEditModal');
            editButton.setAttribute('data-bs-command', command.command);
            editButton.innerHTML = '<i class="bi bi-pencil-fill"></i>';

            const editTdElement = document.createElement('td');
            editTdElement.appendChild(editButton);
            trElement.appendChild(editTdElement);

            // add delete button

            commandsTableBody.appendChild(trElement);
        });
    }

    commandEditModalListener = (): void => {
        const commandEditModal = document.getElementById('commandEditModal');
        let getCommandFromList = this.getCommandFromList;
        let saveCommand = this.saveCommand;
        commandEditModal.addEventListener('show.bs.modal', (event: any) => {
            const button = event.relatedTarget;
            let isNewCommand = false;

            const commandName = button.getAttribute('data-bs-command');

            const modalTitle = commandEditModal.querySelector('.modal-title');
            const inputCommand = (<HTMLInputElement>commandEditModal.querySelector('#input-command'));
            const inputCost = (<HTMLInputElement>commandEditModal.querySelector('#input-cost'));
            const inputGlobalCooldown = (<HTMLInputElement>commandEditModal.querySelector('#input-global-cooldown'));
            const inputUserCooldown = (<HTMLInputElement>commandEditModal.querySelector('#input-user-cooldown'));
            const inputReponse = (<HTMLTextAreaElement>commandEditModal.querySelector('#input-response'));

            let command = getCommandFromList(commandName);

            if (command === undefined) {
                command = {};
                isNewCommand = true;
                modalTitle.textContent = "Create command";
                inputCommand.value = '';
                inputCost.value = '';
                inputGlobalCooldown.value = '';
                inputUserCooldown.value = '';
                inputReponse.value = '';
            } else {
                isNewCommand = false;
                modalTitle.textContent = 'Edit ' + command['command'];
                inputCommand.value = command['command'];
                inputCost.value = command['cost'];
                inputGlobalCooldown.value = command['global-cooldown'];
                inputUserCooldown.value = command['user-cooldown'];
                inputReponse.value = command['response'];
            }

            const saveButton = commandEditModal.querySelector('#command-edit-modal-save');

            let saveCommand = this.saveCommand;
            saveButton.addEventListener('click', () => {
                if (inputCommand.value && inputCommand.value.length) {
                    command['command'] = inputCommand.value;
                    command['cost'] = inputCost.value;
                    command['global-cooldown'] = inputGlobalCooldown.value;
                    command['user-cooldown'] = inputUserCooldown.value;
                    command['response'] = inputReponse.value;

                    var el = document.getElementById('command-edit-modal-save'), elClone = el.cloneNode(true);
                    el.parentNode.replaceChild(elClone, el);

                    saveCommand(command, isNewCommand);
                }
            });
        });
    }

    saveCommand = (command: any, isNewCommand: boolean): void => {
        if (!!isNewCommand) {
            let commands = this.data.commands;
            commands.push(command);
            this.data.commands = commands;
        }
        console.log('new command', this.data);
        this.pluginHelper.saveData(this.data);
        this.fillListToView();
    }

    addTdElementToElement = (element: any, childContent: any): void => {
        const commandElement = document.createElement('td');
        commandElement.innerHTML = childContent;
        element.appendChild(commandElement);
    }

    getCommandFromList = (commandName: string): any => {
        let matchedCommand = undefined;
        this.data.commands.forEach(command => {
            if (command && command.hasOwnProperty('command') && command['command'].normalize() === commandName.normalize()) {
                matchedCommand = command;
            }
        });
        return matchedCommand;
    }
}

module.exports = CommandsPluginUI;