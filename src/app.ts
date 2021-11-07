import { app, BrowserWindow, ipcMain } from 'electron';
import Main from './main';

import * as _ from 'lodash';

import { IConnectorManager } from './core/connectors/IConnectorManager';
import { ConnectorManager } from './core/connectors/ConnectorManager';
import { IFunctionManager } from './core/functions/IFunctionManager';
import { FunctionManager } from './core/functions/FunctionManager';
import { IFilterManager } from './core/filters/IFilterManager';
import { FilterManager } from './core/filters/FilterManager';
import { IPluginManager } from './core/plugins/IPluginManager';
import { PluginManager } from './core/plugins/PluginManager';
import { CoreHelper } from './core/CoreHelper';

Main.main(app, BrowserWindow);

const globalAny: any = global;

// Globals
globalAny['pluginManager'] = PluginManager.getInstance();
globalAny['connectorManager'] = ConnectorManager.getInstance();
globalAny['coreHelper'] = CoreHelper.getInstance();

const loadAllConnectors = () => {
    const connectorManager: IConnectorManager = ConnectorManager.getInstance();
    connectorManager.loadConnectors();
}

const loadAll = () => {
    const pluginManager: IPluginManager = PluginManager.getInstance();
    pluginManager.unloadAllPlugins();
    pluginManager.loadCorePlugins();
    pluginManager.loadPlugins();

    const functionManager: IFunctionManager = FunctionManager.getInstance();
    functionManager.unloadFunctions();
    functionManager.loadFunctions();

    const filterManager: IFilterManager = FilterManager.getInstance();
    filterManager.unloadFilters();
    filterManager.loadFilters();

    Main.mainWindow.loadURL('file://' + __dirname + '/ui/main.html');
}

ipcMain.on('reload-application', loadAll);

setTimeout(() => {
    if (Main.mainWindow.webContents.getURL().indexOf('loading.html') != -1) {
        loadAllConnectors();
        loadAll();
    }
}, 1000);
