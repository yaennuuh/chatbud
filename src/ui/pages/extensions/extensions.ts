import * as fs from 'fs';
import { glob } from 'glob';
import * as _ from 'lodash';
import * as YAML from 'yaml';

class CoreExtensionsPageUI {

    pluginsPath: string;
    functionsPath: string;
    filtersPath: string;
    pluginConfigFiles;

    constructor(private coreHelper) {
        this.initialize();
    }

    initialize() {
        this.pluginsPath =  this.coreHelper.getResourcesPath('plugins');
        this.functionsPath = this.coreHelper.getResourcesPath('functions');
        this.filtersPath =  this.coreHelper.getResourcesPath('filters');
        this.loadPluginList();
        this.loadFunctionsList();
        this.loadFiltersList();
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

    addNewPlugin = () => {}
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

    addNewFunction = () => {}
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

    addNewFilter = () => {}
    deleteFilter = (identifier: string) => {
        fs.rmdirSync(this.filtersPath + '/' + identifier, { recursive: true });
    }

    /**
     * Table
     */
     private _populateTable = async (tableName: string, itemList: any[]): Promise<void> => {
         console.log('itemList', itemList);
        const table = this._getEmptyTable(tableName);

        itemList.forEach((item) => {
            let row = table.insertRow();
            this._addRowToTable(tableName, row, item.identifier, item.name);
        });
    }

    private _getEmptyTable = (tableName: string): HTMLTableElement => {
        const table = <HTMLTableElement>document.getElementById(tableName+"-table-body");
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
    private _htmlToElement = (html: string): Node => {
        const template = document.createElement('template');
        html = html.trim();
        template.innerHTML = html;
        return template.content.firstChild;
    }

    private _deleteExtension = (table: string, identifier: string) => {
        switch(table) {
            case 'plugins':
                this.deletePlugin(identifier);
            case 'functions':
                this.deleteFunction(identifier);
            case 'filters':
                this.deleteFilter(identifier);
        }
    }
}

module.exports = CoreExtensionsPageUI;