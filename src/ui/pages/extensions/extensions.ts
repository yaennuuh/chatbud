import * as fs from 'fs';
import { glob } from 'glob';
import * as _ from 'lodash';
import * as YAML from 'yaml';
import extract from 'extract-zip';

class CoreExtensionsPageUI {

    pluginsPath: string;
    functionsPath: string;
    filtersPath: string;
    pluginConfigFiles;

    constructor(private coreHelper) {
        this.initialize();
    }

    initialize() {
        this.pluginsPath = this.coreHelper.getResourcesPath('plugins');
        this.functionsPath = this.coreHelper.getResourcesPath('functions');
        this.filtersPath = this.coreHelper.getResourcesPath('filters');
        this.loadPluginList();
        this.loadFunctionsList();
        this.loadFiltersList();
        this.addEventListeners();
    }

    /**
     * Plugins
     */

    loadPluginList = () => {
        const pluginConfigFiles: string[] = glob.sync(this.pluginsPath + "/**/config.yaml", null);
        const pluginConfigs = _.map(pluginConfigFiles, (configPath) => {
            if (fs.existsSync(configPath)) {
                const file = fs.readFileSync(configPath, 'utf8')
                return YAML.parse(file);
            }
        });
        this._populateTable('plugins', pluginConfigs.flatMap(config => {
            return {
                identifier: config['name'],
                name: config['display-name']
            };
        }));
    }

    deletePlugin = (identifier: string) => {
        fs.rmdirSync(this.pluginsPath + '/' + identifier, { recursive: true });
    }

    /**
     * Functions
     */

    loadFunctionsList = () => {
        this._populateTable('functions', fs.readdirSync(this.functionsPath).flatMap(name => {
            return {
                identifier: name,
                name: name
            };
        }));
    }

    deleteFunction = (identifier: string) => {
        fs.rmdirSync(this.functionsPath + '/' + identifier, { recursive: true });
    }

    /**
     * Filters
     */

    loadFiltersList = () => {
        this._populateTable('filters', fs.readdirSync(this.filtersPath).flatMap(name => {
            return {
                identifier: name,
                name: name
            };
        }));
    }

    deleteFilter = (identifier: string) => {
        fs.rmdirSync(this.filtersPath + '/' + identifier, { recursive: true });
    }

    /**
     * Table
     */
    private _populateTable = async (tableName: string, itemList: any[]): Promise<void> => {
        const table = this._getEmptyTable(tableName);

        itemList.forEach((item) => {
            let row = table.insertRow();
            this._addRowToTable(tableName, row, item.identifier, item.name);
        });
    }

    private _getEmptyTable = (tableName: string): HTMLTableElement => {
        const table = <HTMLTableElement>document.getElementById(tableName + "-table-body");
        table.innerHTML = '';
        return table;
    }

    private _addRowToTable = (table: string, row: any, identifier: string, name: string): void => {
        // Delete button
        const deleteCell = row.insertCell();
        deleteCell.style.width = '50px';
        const deleteButton = this._htmlToElement(`<button class="ml-3 btn btn-danger btn-sm"><i class="bi bi-trash"></i></button>`);
        deleteButton.addEventListener('click', () => { this._deleteExtension(table, identifier); });
        deleteCell.appendChild(deleteButton);

        // Name
        const nameCell = row.insertCell();
        nameCell.innerText = name;
    }

    /**
     * Utils
     */
    addEventListeners = () => {
        document.getElementById('upload-plugins-button').addEventListener('click', () => { this._uploadExtension('plugins'); });
        document.getElementById('upload-functions-button').addEventListener('click', () => { this._uploadExtension('functions'); });
        document.getElementById('upload-filters-button').addEventListener('click', () => { this._uploadExtension('filters'); });
    }
    private _htmlToElement = (html: string): Node => {
        const template = document.createElement('template');
        html = html.trim();
        template.innerHTML = html;
        return template.content.firstChild;
    }

    private _deleteExtension = (type: string, identifier: string) => {
        switch (type) {
            case 'plugins':
                this.deletePlugin(identifier);
            case 'functions':
                this.deleteFunction(identifier);
            case 'filters':
                this.deleteFilter(identifier);
        }
    }

    private _extractToFolder = async (source, folder) => {
        try {
            await extract(source.path, { dir: folder });
        } catch (err) {
            // handle any errors
        }
    }

    private _uploadExtension = (type: string) => {
        let input = document.createElement('input');
        input.id = 'upload-' + type;
        input.type = 'file';
        input.onchange = _ => {
            // you can use this method to get file and perform respective operations
            let files = Array.from(input.files);
            files.forEach(file => {
                switch (type) {
                    case 'plugins':
                        this._extractToFolder(file, this.pluginsPath);
                        break;
                    case 'functions':
                        this._extractToFolder(file, this.functionsPath);
                        break;
                    case 'filters':
                        this._extractToFolder(file, this.filtersPath);
                        break;
                }
            });
        };
        input.click();
    }
}

module.exports = CoreExtensionsPageUI;