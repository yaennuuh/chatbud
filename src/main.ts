import { BrowserWindow } from 'electron';
import { IPluginManager } from './core/plugins/IPluginManager';
import { PluginManager } from './core/plugins/PluginManager';
import * as _ from 'lodash';
import { CoreBot } from './core/CoreBot';
import { Event } from './core/events/Event';
import { EventData } from './core/events/EventData';

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow;
    static list: string[] = [
        "wait",
        "if"
    ];

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
        /*Main.mainWindow = new Main.BrowserWindow({ width: 800, height: 600 });
        Main.mainWindow
            .loadURL('file://' + __dirname + '/index.html');
        Main.mainWindow.on('closed', Main.onClose);

        Main.startBot();*/
        //let packages = CoreBot.getInstance().packaginator("[#if user == hallo]dfsdfsfds[#else]asd[/#if] matching wait [#wait 5] not matching [/#wait] [#wait 2] matching wait [/#wait] sdfdsf[#if user == zwei] zweites if [#else] zweites else [/#if]",["wait", "if", "loop"]);
        CoreBot.getInstance().notifyNotifiableOnEventBusOut(new Event('whatever', new EventData("[#loop 2] something[#loop 2] nix[/#loop][/#loop][#if user == hallo]dfsdfsfds[#else]asd[/#if] matching wait [#wait 5] not matching [/#wait] [#wait 2] matching wait [/#wait] sdfdsf[#if user == zwei] zweites if [#else] zweites else [/#if]")));
        
    }

    static startBot() {
        const pluginManager: IPluginManager = new PluginManager();
        pluginManager.loadConnectors();
        pluginManager.loadPlugins();
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