import { BrowserWindow, ipcMain } from 'electron';
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

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow;

    private static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose() {
        // Dereference the window object. 
        Main.mainWindow = null;
    }

    private static onReady() {

        Main.mainWindow = new Main.BrowserWindow({
            width: 800,
            height: 600,
            frame: false,
            webPreferences: {
                nodeIntegration: true
            }
        });
        Main.mainWindow.setMenuBarVisibility(false);
        Main.mainWindow
            .loadURL('file://' + __dirname + '/ui/main.html');
        Main.mainWindow.on('closed', Main.onClose);
        Main.init();

        //Main.startBot();
    }

    static init() {
        console.log('triggers initialized');
        ipcMain.on('close-application', function (event, data) {
            console.log('triggered');
            Main.mainWindow.close();
        });
    };

    static startBot() {
        const connectorManager: IConnectorManager = new ConnectorManager();
        connectorManager.loadConnectors();
        const pluginManager: IPluginManager = new PluginManager();
        pluginManager.loadPlugins();
        const functionManager: IFunctionManager = FunctionManager.getInstance();
        functionManager.loadFunctions();
        const filterManager: IFilterManager = FilterManager.getInstance();
        filterManager.loadFilters();

        setTimeout(function () {
            CoreBot.getInstance().notifyNotifiableOnEventBusOut(new Event('whatever', new EventData("[#loop 2] something[#loop 2] nix[/#loop][/#loop][#if $username == $username]dfsdfsfds[#else]asd[/#if] matching wait [#wait 5] not matching [/#wait] [#wait 2] matching wait [/#wait] sdfdsf[#if user == zwei] zweites if [#else] zweites else [/#if]")));
        }, 5000);
    }

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        // we pass the Electron.App object and the  
        // Electron.BrowserWindow into this function 
        // so this class has no dependencies. This 
        // makes the code easier to write tests for 
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
    }
}