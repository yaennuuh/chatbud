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

    loadPluginList = () => {
        const pluginConfigFiles: string[] = glob.sync(this.pluginsPath + "/**/config.yaml", null);
        const pluginConfigs = _.map(pluginConfigFiles, (configPath) => {
            if (fs.existsSync(configPath)) {
                const file = fs.readFileSync(configPath, 'utf8')
                return YAML.parse(file)['display-name'];
            }
        });
        this._populateTable('plugins', pluginConfigs);
    }

    loadFunctionsList = () => {
        this._populateTable('functions', fs.readdirSync(this.functionsPath));
    }

    loadFiltersList = () => {
        this._populateTable('filters', fs.readdirSync(this.filtersPath));
    }

    /**
     * Table
     */
     private _populateTable = async (tableName: string, itemList: string[]): Promise<void> => {
         console.log('itemList', itemList);
        const table = this._getEmptyTable(tableName);

        itemList.forEach((item) => {
            let row = table.insertRow();
            this._addRowToTable(row, item);
        });
    }

    private _getEmptyTable = (tableName: string): HTMLTableElement => {
        const table = <HTMLTableElement>document.getElementById(tableName+"-table-body");
        table.innerHTML = '';
        return table;
    }

    private _addRowToTable = (row: any, name: string): void => {

        // Name
        const nameCell = row.insertCell();
        nameCell.innerText = name;

        // Delete button
        /*const deleteButton = this._htmlToElement(`<button class="ml-3 btn btn-danger btn-sm"><i class="bi bi-trash"></i></button>`);
        deleteButton.addEventListener('click', () => { this._deleteState(state['_id']); });
        settings.appendChild(deleteButton);*/
    }
}

module.exports = CoreExtensionsPageUI;