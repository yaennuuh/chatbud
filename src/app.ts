// import { app, BrowserWindow } from 'electron';
// import Main from './main';

import { CoreBot } from "./core/CoreBot";
import { IEvent } from "./core/events/IEvent";
import { IEventData } from "./core/events/IEventData";
import { IPluginManager } from "./core/plugins/IPluginManager";
import { PluginManager } from "./core/plugins/PluginManager";

class CustomEvent implements IEvent {
    type: string;
    data: IEventData;

    constructor(type: string, data: IEventData) {
        this.type = type;
        this.data = data;
    } 
}

class CustomEventData implements IEventData {
    message:string;
    constructor(message: string) {
        this.message = message;
    }
}

const pluginManager: IPluginManager = new PluginManager();
pluginManager.loadConnectors();
pluginManager.loadPlugins();

const coreBot = CoreBot.getInstance();
coreBot.notifyPluginsOnEventBusIn(
    new CustomEvent(
        'core-custom',
        new CustomEventData("one thing to custom"))
);

coreBot.notifyPluginsOnEventBusIn(
    new CustomEvent(
        'core-special',
        new CustomEventData("oh its for special"))
);

//Main.main(app, BrowserWindow);