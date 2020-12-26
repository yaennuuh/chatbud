// import { app, BrowserWindow } from 'electron';
// import Main from './main';
/*
import { EventInBus } from "./core/busses/EventInBus";

class BotPlugin implements IPlugin {
    execute(event: IEvent): void {
        console.log(event.type.name, event.data.message);
    }
}

class CustomEventType implements IEventType {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

class CustomEventData implements IEventData {
    message:string;
    constructor(message: string) {
        this.message = message;
    }
}



const customEventType = new CustomEventType("custom");
const customEventData = new CustomEventData("Hallo Custom");
const customEvent = new CustomEvent(customEventType, customEventData);

const customEventTypeTwo = new CustomEventType("custom2");
const customEventDataTwo = new CustomEventData("Ich bin auch da");
const customEventTwo = new CustomEvent(customEventTypeTwo, customEventDataTwo);


const bus = new EventInBus();
bus.subscribe(new BotPlugin(), [customEventType]);
bus.subscribe(new BotPlugin(), [customEventType, customEventTypeTwo]);

bus.notify(customEvent);
bus.notify(customEventTwo);*/

import { CoreBot } from "./core/CoreBot";
import { EventTypeEnum, getEventType } from "./core/events/EventTypeEnum";
import { IEvent } from "./core/events/IEvent";
import { IEventData } from "./core/events/IEventData";
import { IEventType } from "./core/events/IEventType";
import { IPluginManager } from "./core/plugins/IPluginManager";
import { PluginManager } from "./core/plugins/PluginManager";

class CustomEvent implements IEvent {
    type: IEventType;
    data: IEventData;

    constructor(type: IEventType, data: IEventData) {
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
pluginManager.loadCustomPlugins();

const coreBot = CoreBot.getInstance();
coreBot.notifyPluginsOnEventBusIn(
    new CustomEvent(
        getEventType(EventTypeEnum.CUSTOM),
        new CustomEventData("one thing to custom"))
);

coreBot.notifyPluginsOnEventBusIn(
    new CustomEvent(
        getEventType(EventTypeEnum.SPECIAL),
        new CustomEventData("oh its for special"))
);

//Main.main(app, BrowserWindow);