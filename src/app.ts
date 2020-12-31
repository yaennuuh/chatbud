import { app, BrowserWindow, ipcMain } from 'electron';
import Main from './main';

import { IPluginManager } from './core/plugins/IPluginManager';
import { PluginManager } from './core/plugins/PluginManager';
import * as _ from 'lodash';
import { CoreBot } from './core/CoreBot';
import { Event } from './core/events/Event';
import { EventData } from './core/events/EventData';
import { IConnectorManager } from './core/connectors/IConnectorManager';
import { ConnectorManager } from './core/connectors/ConnectorManager';
import { IFunctionManager } from './core/functions/IFunctionManager';
import { FunctionManager } from './core/functions/FunctionManager';
import { IFilterManager } from './core/filters/IFilterManager';
import { FilterManager } from './core/filters/FilterManager';
import { PluginHelper } from './core/plugins/PluginHelper';

Main.main(app, BrowserWindow);

const globalAny: any = global;

ipcMain.on('get-plugin-helper', (event, arg) => {
    globalAny[arg[0]] = new PluginHelper(arg[1]);
    event.returnValue = true;
});

// Globals
globalAny['anything'] = PluginHelper;

setTimeout(function () {
    const connectorManager: IConnectorManager = new ConnectorManager();
    connectorManager.loadConnectors();

    const pluginManager = PluginManager.getInstance();
    pluginManager.loadPlugins();

    const functionManager: IFunctionManager = FunctionManager.getInstance();
    functionManager.loadFunctions();

    const filterManager: IFilterManager = FilterManager.getInstance();
    filterManager.loadFilters();
}, 5000);
