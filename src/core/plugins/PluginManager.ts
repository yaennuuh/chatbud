import { glob } from 'glob';
import * as _ from 'lodash';
import { CoreBot } from '../CoreBot';
import { EventTypeEnum, getEventTypeList } from '../events/EventTypeEnum';
import { IEventType } from '../events/IEventType';
import { IPluginManager } from './IPluginManager';

export class PluginManager implements IPluginManager {
    loadCorePlugins(): void {
        throw new Error("Method not implemented.");
    }
    loadCustomPlugins(): void {
        const files: string[] = glob.sync(__dirname + "/../../plugins/**/*.js", null);
        _.each(files, (file) => {
            const CustomPlugin = require(file);
            const customPluginInstance = new CustomPlugin();
            const eventTypesToRegister: EventTypeEnum[] = customPluginInstance.register(EventTypeEnum);
            const eventTypeList: IEventType[] = getEventTypeList(eventTypesToRegister);
            CoreBot.getInstance().registerPluginToEventBusIn(customPluginInstance, eventTypeList);
        });
    }
}