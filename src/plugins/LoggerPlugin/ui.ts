import * as fs from "fs";

class LoggerPluginUI {

    constructor(private pluginHelper) {
        this.logfileViewModalListener();
        this.fillListToView();
    }

    fillListToView = (): void => {
        const logFilesPath = `${__dirname}/../../logs/`;

        if(fs.existsSync(logFilesPath)) {
            const logfileTableBody = document.getElementById('logfile-table-body');
            logfileTableBody.innerHTML = '';

            fs.readdir(logFilesPath, (err, files) => {
                files.forEach(fileName => {
                    const file = `${logFilesPath}${fileName}`;
                    const trElement = document.createElement('tr');
                    const commandElement = document.createElement('th');

                    commandElement.setAttribute('scope', 'row');
                    commandElement.innerHTML = fileName;
                    trElement.appendChild(commandElement);

                    this.addTdElementToElement(trElement, `${fs.statSync(file).size} Bytes`);

                    const editButton = document.createElement('button');
                    editButton.setAttribute('type', 'button');
                    editButton.setAttribute('id', 'loggerfile-view-modal');
                    editButton.setAttribute('class', 'btn btn-primary');
                    editButton.setAttribute('data-bs-toggle', 'modal');
                    editButton.setAttribute('data-bs-target', '#logfileViewModal');
                    editButton.setAttribute('data-bs-command', file);
                    editButton.innerHTML = '<i class="bi bi-eye-fill"></i>';

                    const deleteButton = document.createElement('button');
                    deleteButton.setAttribute('type', 'button');
                    deleteButton.setAttribute('class', 'btn btn-primary');
                    deleteButton.setAttribute('data-bs-command', file);
                    deleteButton.innerHTML = '<i class="bi bi-trash-fill"></i>';

                    const editTdElement = document.createElement('td');
                    editTdElement.appendChild(editButton);
                    editTdElement.appendChild(deleteButton);
                    trElement.appendChild(editTdElement);

                    logfileTableBody.appendChild(trElement);
                });
            });
        }
    }

    addTdElementToElement = (element: any, childContent: any): void => {
        const commandElement = document.createElement('td');
        commandElement.innerHTML = childContent;
        element.appendChild(commandElement);
    }

    logfileViewModalListener = (): void => {
        const logfileViewModal = document.getElementById('logfileViewModal');

        logfileViewModal.addEventListener('show.bs.modal', (event: any) => {

            var el = document.getElementById('loggerfile-view-modal'), elClone = el.cloneNode(true);
            el.parentNode.replaceChild(elClone, el);

            const button = event.relatedTarget;
            const file = button.getAttribute('data-bs-command');
            const modalTitle = logfileViewModal.querySelector('.modal-title');
            modalTitle.textContent = file.substr(file.lastIndexOf("/")+1, file.length);

            document.getElementById('modal-body').textContent = fs.readFileSync(`${file}`,'utf8');
        });
    }

}

module.exports = LoggerPluginUI;
