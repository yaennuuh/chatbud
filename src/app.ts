import { app, BrowserWindow } from 'electron';
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
import { UserManagementHelper } from './core/utils/UserManagementHelper';

Main.main(app, BrowserWindow);

const globalAny: any = global;

const usermanagementHelper = UserManagementHelper.getInstance();
usermanagementHelper.addTwitchUser('1234', 'sirbarrex')
    .then(() => usermanagementHelper.getTwitchUserById('1234'))
    .then((data) => {
        console.log('found user: ', data.getUsername());
    })

// Globals
globalAny['pluginManager'] = PluginManager.getInstance();
globalAny['connectorManager'] = ConnectorManager.getInstance();
globalAny['coreHelper'] = CoreHelper.getInstance();

setTimeout(function () {
    const connectorManager: IConnectorManager = ConnectorManager.getInstance();
    connectorManager.loadConnectors();

    const pluginManager: IPluginManager = PluginManager.getInstance();
    pluginManager.loadPlugins();

    const functionManager: IFunctionManager = FunctionManager.getInstance();
    functionManager.loadFunctions();

    const filterManager: IFilterManager = FilterManager.getInstance();
    filterManager.loadFilters();
}, 5000);
